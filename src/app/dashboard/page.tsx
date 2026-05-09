"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User { id: string; username: string; avatar: string; }
interface ReviewItem { _id: string; language: string; review: { summary: string }; createdAt: string; }
interface Stats { totalReviews: number; bugsFound: number; securityIssues: number; languages: number; }

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalReviews: 0, bugsFound: 0, securityIssues: 0, languages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(r => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then(u => { if (u) setUser(u); }).catch(() => router.push("/login"));

    fetch("/api/review").then(r => r.ok ? r.json() : []).then(data => {
      setReviews(data);
      // Calculate stats from reviews
      let bugs = 0, security = 0;
      const langs = new Set<string>();
      data.forEach((r: any) => {
        bugs += r.review?.bugs?.length || 0;
        security += r.review?.security?.length || 0;
        if (r.language) langs.add(r.language);
      });
      setStats({ totalReviews: data.length, bugsFound: bugs, securityIssues: security, languages: langs.size });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const filtered = reviews.filter(r => {
    const matchSearch = !search || r.review?.summary?.toLowerCase().includes(search.toLowerCase()) || r.language.toLowerCase().includes(search.toLowerCase());
    const matchLang = langFilter === "all" || r.language === langFilter;
    return matchSearch && matchLang;
  });

  const languages = [...new Set(reviews.map(r => r.language))];

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
            <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
          </div>
        </div>
      </nav>
      <div className="container dashboard">
        <div className="dash-header">
          <h1>Dashboard</h1>
          <a href="/review/new" className="btn btn-primary">+ New Review</a>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--accent)"}}>{stats.totalReviews}</div>
            <div className="stat-label">Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--red)"}}>{stats.bugsFound}</div>
            <div className="stat-label">Bugs Found</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--purple)"}}>{stats.securityIssues}</div>
            <div className="stat-label">Security Issues</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{color:"var(--blue)"}}>{stats.languages}</div>
            <div className="stat-label">Languages</div>
          </div>
        </div>

        <div className="search-bar">
          <input className="search-input" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={langFilter} onChange={e => setLangFilter(e.target.value)}>
            <option value="all">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="review-list">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:60,marginBottom:10}} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <h3>{reviews.length === 0 ? "No reviews yet" : "No matching reviews"}</h3>
            <p>{reviews.length === 0 ? "Submit your first code review to get started." : "Try a different search term."}</p>
            {reviews.length === 0 && <a href="/review/new" className="btn btn-primary" style={{ marginTop: 16 }}>Submit Code</a>}
          </div>
        ) : (
          <div className="review-list">
            {filtered.map(r => (
              <a key={r._id} href={`/review/${r._id}`} className="card card-glow review-item">
                <div className="review-meta">
                  <span className="tag tag-blue">{r.language}</span>
                  <span className="review-summary">{r.review?.summary || "Review"}</span>
                </div>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
