const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');
const {
  validateSignup,
  validateLogin,
  validateDeveloper,
} = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;

// Paths to JSON data files
const DEVELOPERS_FILE = path.join(__dirname, 'developers.json');
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Initialize data files
function initDataFile(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue), 'utf-8');
  }
}

function readUsers() {
  initDataFile(USERS_FILE);
  const raw = fs.readFileSync(USERS_FILE, 'utf-8') || '[]';
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function readDevelopers() {
  initDataFile(DEVELOPERS_FILE);
  const raw = fs.readFileSync(DEVELOPERS_FILE, 'utf-8') || '[]';
  return JSON.parse(raw);
}

function writeDevelopers(developers) {
  fs.writeFileSync(DEVELOPERS_FILE, JSON.stringify(developers, null, 2), 'utf-8');
}

// ==================== AUTHENTICATION ROUTES ====================

// POST /api/auth/signup
app.post('/api/auth/signup', validateSignup, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = readUsers();

    // Check if user already exists
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// ==================== PROTECTED DEVELOPER ROUTES ====================

// GET /api/developers - list developers with search, filter, sort, pagination
app.get('/api/developers', authenticateToken, (req, res) => {
  try {
    const { role, search, sort, page = 1, limit = 10 } = req.query;
    let developers = readDevelopers();

    // Filter by role
    if (role && role !== 'All') {
      developers = developers.filter(
        (dev) => dev.role.toLowerCase() === String(role).toLowerCase()
      );
    }

    // Search by name or tech stack
    if (search) {
      const searchLower = String(search).toLowerCase();
      developers = developers.filter(
        (dev) =>
          dev.name.toLowerCase().includes(searchLower) ||
          dev.techStack.toLowerCase().includes(searchLower)
      );
    }

    // Sort by experience
    if (sort === 'experience-asc') {
      developers.sort((a, b) => a.experience - b.experience);
    } else if (sort === 'experience-desc') {
      developers.sort((a, b) => b.experience - a.experience);
    } else {
      // Default: newest first
      developers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedDevelopers = developers.slice(startIndex, endIndex);

    res.json({
      developers: paginatedDevelopers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(developers.length / limitNum),
        totalItems: developers.length,
        itemsPerPage: limitNum,
      },
    });
  } catch (err) {
    console.error('Error reading developers:', err);
    res.status(500).json({ message: 'Failed to load developers' });
  }
});

// GET /api/developers/:id - get single developer profile
app.get('/api/developers/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const developers = readDevelopers();
    const developer = developers.find((d) => d.id === id);

    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    res.json(developer);
  } catch (err) {
    console.error('Error reading developer:', err);
    res.status(500).json({ message: 'Failed to load developer' });
  }
});

// POST /api/developers - add a new developer
app.post('/api/developers', authenticateToken, validateDeveloper, (req, res) => {
  try {
    const { name, role, techStack, experience, description, joiningDate } = req.body;
    const developers = readDevelopers();

    const newDeveloper = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      techStack: techStack.trim(),
      experience: Number(experience),
      description: description ? description.trim() : '',
      joiningDate: joiningDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: req.user.userId,
    };

    developers.push(newDeveloper);
    writeDevelopers(developers);

    res.status(201).json(newDeveloper);
  } catch (err) {
    console.error('Error saving developer:', err);
    res.status(500).json({ message: 'Failed to save developer' });
  }
});

// PUT /api/developers/:id - update a developer
app.put('/api/developers/:id', authenticateToken, validateDeveloper, (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, techStack, experience, description, joiningDate } = req.body;
    const developers = readDevelopers();
    const index = developers.findIndex((d) => d.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    developers[index] = {
      ...developers[index],
      name: name.trim(),
      role,
      techStack: techStack.trim(),
      experience: Number(experience),
      description: description ? description.trim() : '',
      joiningDate: joiningDate || developers[index].joiningDate,
      updatedAt: new Date().toISOString(),
    };

    writeDevelopers(developers);
    res.json(developers[index]);
  } catch (err) {
    console.error('Error updating developer:', err);
    res.status(500).json({ message: 'Failed to update developer' });
  }
});

// DELETE /api/developers/:id - delete a developer
app.delete('/api/developers/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const developers = readDevelopers();
    const index = developers.findIndex((d) => d.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    developers.splice(index, 1);
    writeDevelopers(developers);

    res.json({ message: 'Developer deleted successfully' });
  } catch (err) {
    console.error('Error deleting developer:', err);
    res.status(500).json({ message: 'Failed to delete developer' });
  }
});

// Health check endpoint
app.get('/', (_req, res) => {
  res.send('Developer Directory API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
