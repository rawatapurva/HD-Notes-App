import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js";

dotenv.config();
const app = express();

const ORIGIN = process.env.CLIENT_ORIGIN || "*";

app.use(cors({
  origin: ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// health
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/notes", notesRouter);

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hd_notes";

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
