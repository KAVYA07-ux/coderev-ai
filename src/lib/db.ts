import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  // Fix DNS for local development on Windows (IPv6 DNS can't resolve MongoDB SRV)
  // Not needed on Vercel, but safe to call
  if (typeof window === "undefined") {
    try {
      const dns = require("dns");
      dns.setDefaultResultOrder("ipv4first");
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    } catch {}
  }

  if (!cached.promise || cached.rejected) {
    cached.rejected = false;
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    }).catch((err: any) => {
      console.error("MongoDB connection failed:", err.message);
      cached.promise = null;
      cached.rejected = true;
      (global as any).mongoose = cached;
      throw err;
    });
    (global as any).mongoose = cached;
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
