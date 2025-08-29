import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  dob: { type: Date, required: false },
  provider: { type: String, enum: ["email", "google"], default: "email" },
  googleId: { type: String, required: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
