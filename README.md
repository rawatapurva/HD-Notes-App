# 📝 HD Notes App

A **full-stack notes-taking application** with OTP-based authentication and Google Sign-In.  
Built with **React (Vite) + Express + MongoDB**, deployed on **Vercel (frontend)** and **Render (backend)**.  

---

## 🚀 Features
- ✨ Secure authentication via **Email OTP** and **Google Login**  
- 🗒️ Create, update, and delete personal notes  
- 🔐 JWT-based authentication & authorization  
- 📧 OTP emails sent via **Nodemailer**  
- 🌐 Fully deployed with:
  - Frontend → [Vercel](https://vercel.com/)  
  - Backend → [Render](https://render.com/)  
  - Database → MongoDB Atlas  

---

## 🛠️ Tech Stack
**Frontend**  
- React (Vite)  
- Tailwind CSS  
- Axios  

**Backend**  
- Express.js  
- MongoDB + Mongoose  
- Zod (validation)  
- Bcrypt (OTP security)  
- Google OAuth2  

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/your-username/HD-Notes-App.git
cd HD-Notes-App

Setup Backend (Server)
cd server
npm install


Create a .env file inside server/:

PORT=5001
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id


Run locally:

npm run dev


Server will run on:
👉 http://localhost:5001

3. Setup Frontend (Client)
cd client
npm install


Create .env inside client/:

VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id


Run locally:

npm run dev


Frontend will run on:
👉 http://localhost:5173

🌍 Deployment
Backend (Render)

Push changes to GitHub

Connect Render → New Web Service → pick server/

Add environment variables (same as .env)

Deploy → you’ll get a URL like:

https://hd-notes-app-xxxx.onrender.com

Frontend (Vercel)

Push changes to GitHub

Connect Vercel → pick client/

Add env variables in Vercel:

VITE_API_URL=https://hd-notes-app-xxxx.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id


Deploy → you’ll get a URL like:

https://hd-notes-app.vercel.app

🔑 Google OAuth Setup

Go to Google Cloud Console

Create OAuth2 credentials

Add Authorized JavaScript origins:

http://localhost:5173
https://hd-notes-app.vercel.app


Add Authorized redirect URIs:

http://localhost:5173
https://hd-notes-app.vercel.app


Copy the Client ID into your .env

✅ Health Check

Backend health endpoint → https://hd-notes-app-xxxx.onrender.com/health

Frontend → https://hd-notes-app.vercel.app

📡 API Endpoints (For Testing)
Auth

POST /auth/request-otp → Request signup OTP

POST /auth/signin-request-otp → Request login OTP

POST /auth/verify-otp → Verify signup OTP

POST /auth/signin-verify-otp → Verify login OTP

POST /auth/google → Google login (send idToken)

Notes

GET /notes → Get all user notes

POST /notes → Create new note

DELETE /notes/:id → Delete note

(All Notes endpoints require JWT token in Authorization: Bearer <token> header)
