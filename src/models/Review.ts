import mongoose, { Schema, models } from "mongoose";

const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  codeHash: { type: String, required: true },
  review: {
    summary: String,
    bugs: [String],
    security: [String],
    suggestions: [String],
    fixedCode: String,
  },
  source: { type: String, enum: ["manual", "github-pr"], default: "manual" },
  prNumber: Number,
  repoName: String,
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ codeHash: 1 });

export default models.Review || mongoose.model("Review", ReviewSchema);
