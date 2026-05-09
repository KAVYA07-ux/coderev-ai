import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Comment from "@/models/Comment";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const review = await Review.findOne({ _id: id, userId: auth.userId }).lean();
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comments = await Comment.find({ reviewId: id }).sort({ lineNumber: 1 }).lean();

  return NextResponse.json({ ...(review as any), comments });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const review = await Review.findOneAndDelete({ _id: id, userId: auth.userId });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Comment.deleteMany({ reviewId: id });
  return NextResponse.json({ success: true });
}
