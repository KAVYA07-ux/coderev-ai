import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema({
  reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lineNumber: { type: Number, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

CommentSchema.index({ reviewId: 1, lineNumber: 1 });

export default models.Comment || mongoose.model("Comment", CommentSchema);
