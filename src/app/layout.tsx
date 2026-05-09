import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeRev AI — AI-Powered Code Review",
  description: "Submit code, get instant AI-powered reviews with bug detection, security analysis, and style suggestions. Built by Kavya Mehndiratta.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
