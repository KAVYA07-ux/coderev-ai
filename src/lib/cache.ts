import crypto from "crypto";

// In-memory cache (Redis replacement)
const cache = new Map<string, { data: string; expiry: number }>();
const rateLimits = new Map<string, { count: number; expiry: number }>();

export function getCachedReview(code: string, language: string): string | null {
  const hash = crypto.createHash("sha256").update(code + language).digest("hex");
  const entry = cache.get(`review:${hash}`);
  if (entry && entry.expiry > Date.now()) return entry.data;
  if (entry) cache.delete(`review:${hash}`);
  return null;
}

export function setCachedReview(code: string, language: string, review: string) {
  const hash = crypto.createHash("sha256").update(code + language).digest("hex");
  cache.set(`review:${hash}`, {
    data: review,
    expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function checkRateLimit(userId: string): boolean {
  const key = `rate:${userId}`;
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || entry.expiry < now) {
    rateLimits.set(key, { count: 1, expiry: now + 3600 * 1000 });
    return true;
  }

  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}
