"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";

const LANGUAGES = ["javascript","typescript","python","java","c","cpp","go","rust","ruby","php","html","css","sql"];

interface ReviewData { summary: string; bugs: string[]; security: string[]; suggestions: string[]; fixedCode: string; }

export default function NewReview() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState<ReviewData | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);
  const router = useRouter();
  const streamRef = useRef("");

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => { if (r.status === 401) router.push("/login"); else return r.json(); }).then(u => { if (u) setUser(u); });
  }, [router]);

  const copyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReview = async () => {
    if (!code.trim()) return;
    setStreaming(true); setStreamText(""); setResult(null); streamRef.current = "";

    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    if (res.status === 429) { showToast("Rate limit exceeded. Max 10 reviews/hr.", "error"); setStreaming(false); return; }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      setResult(data.review); setReviewId(data.reviewId); setStreaming(false); return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) { setStreaming(false); return; }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.token) { streamRef.current += json.token; setStreamText(streamRef.current); }
          if (json.done) { setResult(json.review); setReviewId(json.reviewId); }
          if (json.error) { showToast("Error: " + json.error, "error"); }
        } catch {}
      }
    }
    setStreaming(false);
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="skeleton" style={{ width: 200, height: 20 }} />
    </div>
  );

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo">CodeRev AI</a>
          <div className="nav-links">
            <div className="nav-user">
              {user.avatar && <img src={user.avatar} alt="" className="nav-avatar" />}
              <span className="nav-username">{user.username}</span>
            </div>
          </div>
        </div>
      </nav>
      <div className="container review-page">
        <div className="editor-header">
          <h2>New Code Review</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button className="btn btn-primary" onClick={submitReview} disabled={streaming || !code.trim()}>
              {streaming ? "Reviewing..." : "Submit Review"}
            </button>
          </div>
        </div>
        <div className="editor-wrapper">
          <Editor height="400px" language={language} theme="vs-dark" value={code} onChange={v => setCode(v || "")}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 }, lineNumbers: "on" }} />
        </div>

        {streaming && (
          <div className="result-section">
            <h3 className="section-title">AI Reviewing...</h3>
            <div className="streaming-text">{streamText}<span className="streaming-cursor">▌</span></div>
          </div>
        )}

        {result && !streaming && (
          <div className="result-section">
            <div className="card result-card">
              <h3>📋 Summary</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{result.summary}</p>
            </div>
            {result.bugs?.length > 0 && (
              <div className="card result-card">
                <h3><span className="tag tag-red">Bugs</span></h3>
                <ul className="result-list">{result.bugs.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
            )}
            {result.security?.length > 0 && (
              <div className="card result-card">
                <h3><span className="tag tag-orange">Security</span></h3>
                <ul className="result-list">{result.security.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.suggestions?.length > 0 && (
              <div className="card result-card">
                <h3><span className="tag tag-blue">Suggestions</span></h3>
                <ul className="result-list">{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.fixedCode && (
              <div className="card result-card">
                <div className="code-block-header">
                  <h3>✅ Fixed Code</h3>
                  <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={() => copyCode(result.fixedCode)}>
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
                <pre style={{ background: "var(--bg)", padding: 16, borderRadius: 8, overflow: "auto", fontSize: "0.85rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>{result.fixedCode}</pre>
              </div>
            )}
            {reviewId && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <a href={`/review/${reviewId}`} className="btn btn-ghost">View Full Review →</a>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </>
  );
}
