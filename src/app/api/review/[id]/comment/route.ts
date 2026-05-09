import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { lineNumber, text } = await req.json();

  if (!lineNumber || !text) {
    return NextResponse.json({ error: "lineNumber and text required" }, { status: 400 });
  }

  await connectDB();
  const comment = await Comment.create({
    reviewId: id,
    userId: auth.userId,
    lineNumber,
    text,
  });

  return NextResponse.json(comment, { status: 201 });
}
