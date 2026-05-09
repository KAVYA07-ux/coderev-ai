import Link from "next/link";
import { getUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getUser();

  return (
    <div className="landing">
      <div className="landing-bg" />
      <nav className="nav">
        <div className="container nav-inner">
          <span className="nav-logo">CodeRev AI</span>
          <div className="nav-links">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard →</Link>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">Get Started</Link>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">⚡ AI-Powered Code Review</div>
        <h1>Ship Better Code,<br /><span>10x Faster</span></h1>
        <p>
          Paste your code, get instant AI-powered reviews with bug detection,
          security analysis, and auto-generated fixes. Powered by Llama 3.3.
        </p>
        <div className="hero-cta">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Login with GitHub
            </Link>
          )}
          <a href="#features" className="btn btn-ghost">See Features ↓</a>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{background:"var(--accent-glow)"}}>🐛</div>
            <h3>Bug Detection</h3>
            <p>Catches logic errors, null references, off-by-one errors, and race conditions in your code.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:"rgba(239,68,68,0.12)"}}>🔒</div>
            <h3>Security Analysis</h3>
            <p>Identifies XSS, SQL injection, insecure dependencies, and other vulnerabilities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:"rgba(59,130,246,0.12)"}}>⚡</div>
            <h3>Performance Tips</h3>
            <p>Spots N+1 queries, memory leaks, unnecessary re-renders, and slow algorithms.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:"rgba(34,197,94,0.12)"}}>✨</div>
            <h3>Auto-Fix Code</h3>
            <p>Generates corrected code with all fixes applied. One-click copy to clipboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:"rgba(168,85,247,0.12)"}}>📊</div>
            <h3>Diff View</h3>
            <p>Side-by-side comparison of your original code and the AI-suggested improvements.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{background:"rgba(249,115,22,0.12)"}}>🌊</div>
            <h3>Real-time Streaming</h3>
            <p>Watch the AI analyze your code in real-time with live streaming output.</p>
          </div>
        </div>
      </section>

      <div className="landing-footer">
        Developed by <strong>Kavya Mehndiratta</strong>
      </div>
    </div>
  );
}
