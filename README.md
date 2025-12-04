# Developer Directory App - Round 2

A production-ready full-stack Developer Directory application with authentication, CRUD operations, search/filtering, sorting, pagination, and profile pages.

## 🚀 Features

### Authentication (Mandatory ✅)
- **Secure signup and login** with JWT tokens
- Password hashing using bcryptjs
- Protected routes - only authenticated users can access the directory
- All CRUD operations require authentication

### Developer Profile Pages (Mandatory ✅)
- Individual profile page for each developer (`/developers/:id`)
- Displays: Name, Role, Tech Stack (as tags), Experience, Description, Joining Date
- Clean, responsive profile layout

### Enhanced Developer Directory (Mandatory ✅)
- **Search**: Search developers by name or tech stack
- **Filters**: Filter by developer role (Frontend/Backend/Full-Stack)
- **Sorting**: Sort by experience (ascending/descending) or newest first
- **Pagination**: Paginated results with page navigation

### CRUD Operations (Mandatory ✅)
- **Create**: Add new developers with validation
- **Read**: View all developers with filters/search
- **Update**: Edit developer information
- **Delete**: Delete developers with confirmation prompt
- Input validation using Joi
- Authentication middleware protecting all routes

### UI/UX Enhancements (Mandatory ✅)
- Toast notifications for all actions (success/error)
- Loading indicators for API calls
- Fully responsive layout (mobile-first)
- Modern UI using Tailwind CSS
- Error handling and fallback states
- Delete confirmation modal

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite)
- **React Router DOM** - Routing and navigation
- **Tailwind CSS** - Styling
- **react-hot-toast** - Toast notifications
- **Context API** - Authentication state management

### Backend
- **Node.js** + **Express**
- **JWT** (jsonwebtoken) - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **CORS** - Cross-origin resource sharing
- **JSON file storage** - Simple persistent storage

## 📁 Project Structure

```
.
├── backend/
│   ├── server.js              # Main Express server
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── validation.js      # Joi validation schemas
│   ├── developers.json        # Developer data (auto-created)
│   ├── users.json             # User data (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main router component
│   │   ├── main.jsx           # Entry point
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx # Route protection wrapper
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Signup.jsx          # Signup page
│   │   │   ├── DeveloperDirectory.jsx # Main directory page
│   │   │   └── DeveloperProfile.jsx    # Individual profile page
│   │   └── index.css          # Tailwind styles
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000` (or the PORT environment variable).

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port).

### Environment Variables

#### Backend
Create a `.env` file in the `backend` directory (optional for local dev):
```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

#### Frontend
The frontend is configured to use the deployed backend URL. For local development, you can create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📡 API Endpoints

### Authentication
- **POST** `/api/auth/signup` - Create a new user account
  - Body: `{ name, email, password }`
  - Returns: `{ token, user }`

- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### Developers (All require authentication)
- **GET** `/api/developers` - Get all developers
  - Query params: `role`, `search`, `sort`, `page`, `limit`
  - Returns: `{ developers: [], pagination: {} }`

- **GET** `/api/developers/:id` - Get single developer
  - Returns: Developer object

- **POST** `/api/developers` - Create new developer
  - Body: `{ name, role, techStack, experience, description?, joiningDate? }`
  - Returns: Created developer object

- **PUT** `/api/developers/:id` - Update developer
  - Body: `{ name, role, techStack, experience, description?, joiningDate? }`
  - Returns: Updated developer object

- **DELETE** `/api/developers/:id` - Delete developer
  - Returns: `{ message: "Developer deleted successfully" }`

## 🔐 Authentication Flow

1. User signs up or logs in
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent in `Authorization: Bearer <token>` header for all API requests
5. Protected routes check for valid token
6. If token is invalid/expired, user is redirected to login

## 🚀 Deployment

### Backend (Render)
1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: `JWT_SECRET` (set a strong secret)
5. Deploy and copy the backend URL

### Frontend (Vercel)
1. Push code to GitHub
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: `VITE_API_BASE_URL` (your Render backend URL)
5. Deploy

## 📝 Notes

- All routes except `/api/auth/signup` and `/api/auth/login` require authentication
- Passwords are hashed using bcryptjs (10 rounds)
- JWT tokens expire after 7 days
- Data is stored in JSON files (can be easily migrated to MongoDB/PostgreSQL)
- CORS is enabled for all origins (configure appropriately for production)

## 🎯 Future Enhancements (Optional)

- [ ] Light/dark theme toggle
- [ ] Admin role with special permissions
- [ ] Developer analytics dashboard
- [ ] MongoDB Atlas or PostgreSQL integration
- [ ] Unit tests (Jest/Supertest)
- [ ] Photo upload functionality
- [ ] Email verification
- [ ] Password reset functionality

## 👤 Author

Built for Talrn.com Full Stack Internship Assessment - Round 2

## 📄 License

ISC
