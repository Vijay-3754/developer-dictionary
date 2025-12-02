const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Path to JSON data file
const DATA_FILE = path.join(__dirname, 'developers.json');

app.use(cors());
app.use(express.json());

// Ensure data file exists
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readDevelopers() {
  initDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8') || '[]';
  return JSON.parse(raw);
}

function writeDevelopers(developers) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(developers, null, 2), 'utf-8');
}

// GET /developers - list developers with optional filters
app.get('/developers', (req, res) => {
  try {
    const { role, tech } = req.query;
    let developers = readDevelopers();

    if (role && role !== 'All') {
      developers = developers.filter(
        (dev) => dev.role.toLowerCase() === String(role).toLowerCase()
      );
    }

    if (tech) {
      const search = String(tech).toLowerCase();
      developers = developers.filter((dev) =>
        dev.techStack.toLowerCase().includes(search)
      );
    }

    res.json(developers);
  } catch (err) {
    console.error('Error reading developers:', err);
    res.status(500).json({ message: 'Failed to load developers' });
  }
});

// POST /developers - add a new developer
app.post('/developers', (req, res) => {
  try {
    const { name, role, techStack, experience } = req.body;

    if (!name || !role || !techStack || experience === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const experienceNum = Number(experience);
    if (Number.isNaN(experienceNum) || experienceNum < 0) {
      return res
        .status(400)
        .json({ message: 'Experience must be a non-negative number' });
    }

    const developers = readDevelopers();
    const newDeveloper = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      techStack: techStack.trim(),
      experience: experienceNum,
      createdAt: new Date().toISOString(),
    };

    developers.push(newDeveloper);
    writeDevelopers(developers);

    res.status(201).json(newDeveloper);
  } catch (err) {
    console.error('Error saving developer:', err);
    res.status(500).json({ message: 'Failed to save developer' });
  }
});

app.get('/', (_req, res) => {
  res.send('Developer Directory API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


