import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: String,
  avatar: String,
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || mongoose.model("User", UserSchema);
