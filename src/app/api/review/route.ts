import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { reviewCode } from "@/lib/groq";
import { getCachedReview, setCachedReview, checkRateLimit } from "@/lib/cache";
import Review from "@/models/Review";
import User from "@/models/User";
import crypto from "crypto";

// POST — submit code for review (streaming SSE)
export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, language } = await req.json();
  if (!code || !language) {
    return NextResponse.json({ error: "Code and language required" }, { status: 400 });
  }

  // Rate limit
  if (!checkRateLimit(auth.userId)) {
    return NextResponse.json({ error: "Rate limit exceeded. Max 10 reviews/hr." }, { status: 429 });
  }

  // Check cache
  const cached = getCachedReview(code, language);
  if (cached) {
    const codeHash = crypto.createHash("sha256").update(code + language).digest("hex");
    await connectDB();
    const review = await Review.create({
      userId: auth.userId,
      code,
      language,
      codeHash,
      review: JSON.parse(cached),
      source: "manual",
    });
    await User.findByIdAndUpdate(auth.userId, { $inc: { reviewCount: 1 } });
    return NextResponse.json({ reviewId: review._id, cached: true, review: JSON.parse(cached) });
  }

  // Stream from Groq
  const stream = await reviewCode(code, language);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = "";

      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullText += content;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: content })}\n\n`));
        }

        // Parse and save
        let reviewData;
        try {
          const jsonMatch = fullText.match(/\{[\s\S]*\}/);
          reviewData = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: fullText, bugs: [], security: [], suggestions: [], fixedCode: "" };
        } catch {
          reviewData = { summary: fullText, bugs: [], security: [], suggestions: [], fixedCode: "" };
        }

        const codeHash = crypto.createHash("sha256").update(code + language).digest("hex");
        await connectDB();
        const saved = await Review.create({
          userId: auth.userId,
          code,
          language,
          codeHash,
          review: reviewData,
          source: "manual",
        });
        await User.findByIdAndUpdate(auth.userId, { $inc: { reviewCount: 1 } });
        setCachedReview(code, language, JSON.stringify(reviewData));

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, reviewId: saved._id, review: reviewData })}\n\n`));
      } catch (err: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// GET — list user's reviews
export async function GET() {
  const auth = await getUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const reviews = await Review.find({ userId: auth.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("language review.summary createdAt source")
    .lean();

  return NextResponse.json(reviews);
}
