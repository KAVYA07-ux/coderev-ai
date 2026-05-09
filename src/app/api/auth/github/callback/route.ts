import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createToken } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("GitHub token response:", JSON.stringify(tokenData));

    if (tokenData.error || !tokenData.access_token) {
      console.error("GitHub OAuth error:", tokenData.error, tokenData.error_description);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${tokenData.error || "auth_failed"}&desc=${encodeURIComponent(tokenData.error_description || "Unknown error")}`
      );
    }

    // Fetch user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const ghUser = await userRes.json();

    // Upsert user in MongoDB
    await connectDB();
    const user = await User.findOneAndUpdate(
      { githubId: String(ghUser.id) },
      {
        githubId: String(ghUser.id),
        username: ghUser.login,
        email: ghUser.email,
        avatar: ghUser.avatar_url,
      },
      { upsert: true, new: true }
    );

    // Create JWT
    const jwt = await createToken({ userId: user._id.toString(), username: user.username });

    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    response.cookies.set("token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error&desc=${encodeURIComponent(err.message)}`
    );
  }
}
