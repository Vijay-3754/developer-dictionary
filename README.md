## Developer Directory App

This is a full-stack **Developer Directory** application built as a task for the Talrn.com full‑stack internship assessment.

It allows you to:

- **Add developers** with name, role, tech stack, and experience
- **View a list** of all developers in a clean, responsive UI
- **Filter/search** developers by **role** and **tech stack**
- Get **toast notifications** for success and error states

The stack:

- **Frontend**: React (Vite) + Tailwind CSS + react-hot-toast
- **Backend**: Node.js + Express
- **Storage**: JSON file (simple persistent storage)

---

### 1. Project Structure

- `backend` – Node.js / Express API
  - `server.js` – main server file with `/developers` endpoints
  - `developers.json` – JSON file used as a tiny data store (created automatically)
- `frontend` – React app (Vite + Tailwind)
  - `src/App.jsx` – main UI (form, list, filters, toasts)
  - `src/index.css` – Tailwind entry styles

---

### 2. Backend – Setup & Run

From the project root:

```bash
cd backend
npm install        # already done once by scaffolding, safe to re-run
npm run dev        # start server with nodemon on http://localhost:5000
```

Or without nodemon:

```bash
npm start
```

**Endpoints**

- **POST** `/developers`
  - Body (JSON):
    ```json
    {
      "name": "Jane Doe",
      "role": "Frontend",
      "techStack": "React, Tailwind, TypeScript",
      "experience": 2
    }
    ```
  - Validation:
    - All fields required
    - `experience` must be a non‑negative number

- **GET** `/developers`
  - Optional query parameters:
    - `role` – `Frontend` | `Backend` | `Full-Stack` | `All`
    - `tech` – substring to match against `techStack`
  - Example:
    - `/developers?role=Frontend&tech=react`

Data is stored in `backend/developers.json` as an array of developer objects.

---

### 3. Frontend – Setup & Run

From the project root:

```bash
cd frontend
npm install        # already run during scaffolding, safe to re-run
npm run dev        # starts Vite dev server (usually http://localhost:5173)
```

By default, the frontend expects the backend to run at:

```text
http://localhost:5000
```

To customize it (for production / hosting), create a `.env` file inside `frontend`:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

---

### 4. Features Implemented

- **React functional components + Hooks**
  - `useState`, `useEffect`, `useMemo` for state, loading, and computed filters
- **Form with validation**
  - Validates required fields and numeric experience
  - Inline error messages under each field
  - Blocks submit until errors are fixed, with error toast
- **Responsive, modern UI**
  - Tailwind utility classes
  - Mobile‑friendly layout (stacked on mobile, two‑column on desktop)
- **Search / Filter**
  - Role dropdown (`All / Frontend / Backend / Full‑Stack`)
  - Tech search input (filters by substring in tech stack)
- **Toasts**
  - `react-hot-toast` for success / error feedback
  - Used for:
    - Successful developer creation
    - Validation / network errors

---

### 5. How to Deploy

You can deploy **backend** and **frontend** to any free platform. Example approach:

- **Backend**:
  - Use services like Render, Railway, or Cyclic.
  - Steps (generic):
    1. Push this repo to GitHub.
    2. Create a new project on the platform, link the GitHub repo.
    3. Set the root for backend (or specify `backend` as the working directory).
    4. Set start command: `npm start`.
    5. After deploy, note the public backend URL (e.g. `https://your-api.onrender.com`).

- **Frontend**:
  - Use Vercel or Netlify.
  - Steps (generic):
    1. From the platform, create a new project and select this repo.
    2. Set the project root to `frontend`.
    3. Build command: `npm run build`
    4. Output directory: `dist`
    5. Add environment variable:  
       `VITE_API_BASE_URL=https://your-api.onrender.com`

Once deployed:

- Open the frontend URL (e.g. from Vercel/Netlify).
- Confirm you can:
  - Add a developer.
  - See them in the list.
  - Use role and tech filters.

Then send the **hosted URL**, your **contact details**, and **joining date availability** to:

`intern@talrn.com`

---

### 6. Notes for Reviewers

- Tech choices:
  - Tailwind for fast, responsive styling.
  - JSON file instead of a full DB for simplicity (can be swapped with MongoDB/SQLite easily).
- Code style:
  - Small, focused React component (`App.jsx`) with clear state separation.
  - Minimal Express server with clear responsibilities and basic error handling.


