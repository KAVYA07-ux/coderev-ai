"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const ReactDiffViewer = dynamic(() => import("react-diff-viewer-continued"), { ssr: false });

interface ReviewDetail {
  _id: string; code: string; language: string;
  review: { summary: string; bugs: string[]; security: string[]; suggestions: string[]; fixedCode: string };
  createdAt: string;
  comments: { _id: string; lineNumber: number; text: string; createdAt: string }[];
}

export default function ReviewDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ReviewDetail | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "diff">("overview");
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLine, setCommentLine] = useState(1);
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => { if (r.status === 401) router.push("/login"); else return r.json(); }).then(u => { if (u) setUser(u); });
    fetch(`/api/review/${id}`).then(r => r.json()).then(setData).catch(() => router.push("/dashboard"));
  }, [id, router]);

  const copyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteReview = async () => {
    await fetch(`/api/review/${id}`, { method: "DELETE" });
    showToast("Review deleted");
    router.push("/dashboard");
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/review/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineNumber: commentLine, text: commentText }),
    });
    if (res.ok) {
      const comment = await res.json();
      setData(d => d ? { ...d, comments: [...d.comments, comment] } : d);
      setCommentText("");
      showToast("Comment added");
    }
  };

  if (!data || !user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="skeleton" style={{ width: 300, height: 20 }} />
    </div>
  );

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo">CodeRev AI</a>
          <div className="nav-user">
            {user.avatar && <img src={user.avatar} alt="" className="nav-avatar" />}
            <span className="nav-username">{user.username}</span>
          </div>
        </div>
      </nav>
      <div className="container review-page">
        <div className="detail-header">
          <a href="/dashboard" className="detail-back">← Back to dashboard</a>
          <div className="detail-actions">
            <span className="tag tag-blue">{data.language}</span>
            <span className="review-date">{new Date(data.createdAt).toLocaleString()}</span>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>Delete</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button className={`btn ${tab === "overview" ? "btn-primary" : "btn-ghost"} btn-sm`} onClick={() => setTab("overview")}>Overview</button>
          <button className={`btn ${tab === "diff" ? "btn-primary" : "btn-ghost"} btn-sm`} onClick={() => setTab("diff")}>Diff View</button>
        </div>

        {tab === "overview" && (
          <>
            <div className="card result-card">
              <h3>📋 Summary</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{data.review.summary}</p>
            </div>

            <div className="detail-grid">
              {data.review.bugs?.length > 0 && (
                <div className="card result-card">
                  <h3><span className="tag tag-red">Bugs</span> ({data.review.bugs.length})</h3>
                  <ul className="result-list">{data.review.bugs.map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
              )}
              {data.review.security?.length > 0 && (
                <div className="card result-card">
                  <h3><span className="tag tag-orange">Security</span> ({data.review.security.length})</h3>
                  <ul className="result-list">{data.review.security.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}
            </div>

            {data.review.suggestions?.length > 0 && (
              <div className="card result-card">
                <h3><span className="tag tag-blue">Suggestions</span></h3>
                <ul className="result-list">{data.review.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}

            {data.review.fixedCode && (
              <div className="card result-card">
                <div className="code-block-header">
                  <h3>✅ Fixed Code</h3>
                  <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={() => copyCode(data.review.fixedCode)}>
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
                <pre style={{ background: "var(--bg)", padding: 16, borderRadius: 8, overflow: "auto", fontSize: "0.85rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>{data.review.fixedCode}</pre>
              </div>
            )}
          </>
        )}

        {tab === "diff" && data.review.fixedCode && (
          <div className="diff-container">
            <ReactDiffViewer oldValue={data.code} newValue={data.review.fixedCode} splitView={true} leftTitle="Original Code" rightTitle="AI-Suggested Fix" useDarkTheme={true} />
          </div>
        )}
        {tab === "diff" && !data.review.fixedCode && (
          <div className="card empty-state"><p>No code fix was suggested for this review.</p></div>
        )}

        {/* Comments Section */}
        <div className="comments-section">
          <h3 className="section-title">Comments ({data.comments?.length || 0})</h3>
          <div className="comment-form">
            <input type="number" min={1} value={commentLine} onChange={e => setCommentLine(Number(e.target.value))} style={{ width: 70, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }} placeholder="Line" />
            <input className="comment-input" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key === "Enter" && addComment()} />
            <button className="btn btn-primary btn-sm" onClick={addComment}>Add</button>
          </div>
          {data.comments?.length > 0 && (
            <div className="comment-list">
              {data.comments.map(c => (
                <div key={c._id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-line">Line {c.lineNumber}</span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Review</h3>
            <p>Are you sure? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={deleteReview}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </>
  );
}
