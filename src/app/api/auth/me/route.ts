import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const auth = await getUser();
  if (!auth) return NextResponse.json(null, { status: 401 });

  await connectDB();
  const user = await User.findById(auth.userId).lean();
  if (!user) return NextResponse.json(null, { status: 401 });

  return NextResponse.json({
    id: (user as any)._id,
    username: (user as any).username,
    avatar: (user as any).avatar,
  });
}
