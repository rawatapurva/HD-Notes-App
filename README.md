# HD Notes — Full Stack (React + Express + MongoDB)

A minimal, production-ready note-taking app that matches the given sign-up design, supports **Email + OTP** and **Google** login, and uses **JWT** to authorize creating/deleting notes.

## Tech Stack
- Frontend: React (Vite) + TailwindCSS + `@react-oauth/google`
- Backend: Node.js (Express) + MongoDB (Mongoose) + Nodemailer + Zod
- Auth: Email OTP (via SMTP) + Google ID Token; server issues JWT

---

## 1) Quick Start (Local)

### Prereqs
- Node 18+
- MongoDB running locally or in the cloud (MongoDB Atlas)

### Clone & Install
```bash
cd server
cp .env.example .env
npm i

cd ../client
cp .env.example .env
npm i
```

### Configure ENV
- **Server** `.env`
  - `MONGO_URI` — your MongoDB connection string
  - `JWT_SECRET` — set to a long random string
  - `CLIENT_ORIGIN` — `http://localhost:5173`
  - SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) — for development, create a free **Mailtrap** inbox and paste creds. OTPs will still be logged to console if SMTP is missing.
  - `GOOGLE_CLIENT_ID` — from Google Cloud Console (Web client)

- **Client** `.env`
  - `VITE_API_URL=http://localhost:5000`
  - `VITE_GOOGLE_CLIENT_ID=<same as server>`

### Run
```bash
# Terminal A
cd server
npm run dev

# Terminal B
cd client
npm run dev
```

Open http://localhost:5173

---

## 2) Google OAuth Setup (ID Token)

1. Go to Google Cloud Console → Credentials → Create OAuth client ID → **Web application**.
2. Authorized JavaScript origins: `http://localhost:5173`
3. Get the **Client ID** and set it in both server and client `.env` files.
4. The frontend uses `@react-oauth/google` to get an ID token, which the backend verifies with `google-auth-library` and then issues its own JWT.

---

## 3) Email OTP Flow

- `/auth/request-otp`: accepts `{ name, email, dob }` and sends a 6-digit OTP (expires in 5 minutes).
- `/auth/verify-otp`: accepts `{ email, otp, name?, dob? }`; verifies the OTP, **creates or logs in** a user, and returns `{ token, user }`.

> In development, if SMTP is not configured, OTPs are logged to the server console.

---

## 4) Notes API (JWT-protected)

- `GET /notes` → list notes for current user
- `POST /notes` → create note `{ title, body? }`
- `DELETE /notes/:id` → delete note by id

Send `Authorization: Bearer <token>` header. Token is returned from OTP/Google endpoints.

---

## 5) Validation & Errors

- **Zod** validates inputs server-side; frontend shows user-friendly messages.
- Common errors surfaced:
  - Invalid email/name/OTP
  - Expired OTP or too many attempts
  - API/network failures

---

## 6) Responsive UI

- Built with Tailwind and designed to mirror the provided mock. Two-column layout on desktop, single column on mobile.

---

## 7) Deployment

### Backend (Render)
1. Push the repo to GitHub.
2. Create a **Render** Web Service from the server folder.
3. Set environment variables from `.env` (including MongoDB Atlas URI).
4. Specify `Build command: npm i` and `Start command: npm start`.
5. Add CORS `CLIENT_ORIGIN` to your frontend URL.

### Frontend (Vercel)
1. Import the `client` folder as a project.
2. Set `VITE_API_URL` to your Render backend URL and `VITE_GOOGLE_CLIENT_ID`.
3. Deploy.

---

## 8) Git Commit Checklist (per feature)

- :white_check_mark: Scaffold project
- :white_check_mark: Auth API (OTP)
- :white_check_mark: Google login
- :white_check_mark: JWT middleware
- :white_check_mark: Notes CRUD
- :white_check_mark: Responsive UI & validation
- :white_check_mark: Deployment configs
- :white_check_mark: README polish

---

## 9) Scripts

- **Server**: `npm run dev` (nodemon), `npm start`
- **Client**: `npm run dev`, `npm run build`, `npm run preview`

---

## 10) Troubleshooting

- OTP not received? Check server logs (OTP is printed) or Mailtrap inbox.
- 401 on notes? Ensure `Authorization: Bearer <token>` header is present and not expired.
- Google login fails? Verify correct `GOOGLE_CLIENT_ID` in both client and server.

Happy building!
