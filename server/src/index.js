import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js";

dotenv.config();
const app = express();

// ✅ Allow both local + vercel frontend
const allowedOrigins = [
  "http://localhost:5173",          // Local dev (Vite default)
  "https://hd-notes-app.vercel.app" // Your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

// routes
app.use("/auth", authRouter);
app.use("/notes", notesRouter);

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hd_notes";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
