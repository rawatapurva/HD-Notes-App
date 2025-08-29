import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();

const requestOtpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  dob: z.string().optional() // ISO (yyyy-mm-dd). Frontend enforces date input.
});

router.post("/request-otp", async (req, res) => {
  try {
    const { name, email, dob } = requestOtpSchema.parse(req.body);
    // Always allow requesting OTP; we will either create or login on verify step
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.deleteMany({ email });
    await Otp.create({ email, otpHash, expiresAt });
    await sendOtpEmail(email, code);
    return res.json({ message: "OTP sent. Check your inbox (or console in dev)." });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.issues[0].message });
    }
    console.error(e);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

const signInOtpSchema = z.object({
  email: z.string().email()
});

router.post("/signin-request-otp", async (req, res) => {
  try {
    const { email } = signInOtpSchema.parse(req.body);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found. Please sign up first." });
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otpHash, expiresAt });

    await sendOtpEmail(email, code);
    return res.json({ message: "OTP sent for sign-in." });

  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.issues[0].message });
    }
    console.error(e);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});


const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  name: z.string().min(2).optional(),
  dob: z.string().optional()
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, name, dob } = verifyOtpSchema.parse(req.body);
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ error: "OTP not requested or expired" });
    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: "OTP expired" });
    }
    // allow max 5 attempts
    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(429).json({ error: "Too many OTP attempts" });
    }
    const ok = await bcrypt.compare(otp, record.otpHash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }
    await Otp.deleteOne({ _id: record._id });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || "User",
        dob: dob ? new Date(dob) : null,
        provider: "email"
      });
    } else {
      // upsert missing profile data
      if (name && !user.name) user.name = name;
      if (dob && !user.dob) user.dob = new Date(dob);
      await user.save();
    }

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, dob: user.dob, provider: user.provider } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.issues[0].message });
    }
    console.error(e);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

const signInVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

router.post("/signin-verify-otp", async (req, res) => {
  try {
    const { email, otp } = signInVerifySchema.parse(req.body);

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ error: "OTP not requested or expired" });
    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(429).json({ error: "Too many OTP attempts" });
    }

    const ok = await bcrypt.compare(otp, record.otpHash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await Otp.deleteOne({ _id: record._id });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Account not found" });

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob, provider: user.provider }
    });

  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.issues[0].message });
    }
    console.error(e);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});


// Google Sign-in: frontend sends an ID token
router.post("/google", async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name || "Google User";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        provider: "google",
        googleId
      });
    } else if (user.provider !== "google" && !user.googleId) {
      // Allow linking
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, dob: user.dob, provider: user.provider } });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: "Google auth failed" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  return res.status(405).json({ error: "Use /notes/me via auth middleware" });
});

export default router;
