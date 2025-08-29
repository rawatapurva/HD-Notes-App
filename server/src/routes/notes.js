import express from "express";
import { z } from "zod";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const notes = await Note.find({ user: req.user._id || req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ notes });
});

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().max(5000).optional()
});

router.post("/", async (req, res) => {
  try {
    const { title, body } = createSchema.parse(req.body);
    const note = await Note.create({ user: req.user._id || req.user.id, title, body: body || "" });
    res.status(201).json({ note });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.issues[0].message });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, user: req.user._id || req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Invalid note id" });
  }
});

export default router;
