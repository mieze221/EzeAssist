import React, { useState } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const STUDY_TASKS = [
  { id: "summarize", label: "Summarize Notes", icon: "📝" },
  { id: "rewrite", label: "Rewrite for Clarity", icon: "✏️" },
  { id: "flashcards", label: "Generate Flashcards", icon: "🃏" },
  { id: "quiz", label: "Generate Quiz Questions", icon: "❓" },
  { id: "bullets", label: "Convert to Bullet Points", icon: "•" },
];

function App() {
  const [studyText, setStudyText] = useState("");
  const [selectedTask, setSelectedTask] = useState("summarize");
  const [studyResult, setStudyResult] = useState("");
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyError, setStudyError] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyResult = () => {
    if (!studyResult) return;
    navigator.clipboard.writeText(studyResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const runStudyTask = async (taskId) => {
    const text = (studyText || "").trim();
    if (!text) {
      setStudyError("Enter some notes or text first.");
      return;
    }
    setStudyError("");
    setStudyResult("");
    setStudyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, task: taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStudyResult("");
        setStudyError(data.detail || data.error || "Request failed");
        setStudyLoading(false);
        return;
      }
      setStudyResult(data.result || "");
    } catch (err) {
      setStudyResult("");
      setStudyError("Cannot reach backend. Is it running at " + API_BASE + "?");
    }
    setStudyLoading(false);
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-brand">
          {!logoError ? (
            <img
              src={`${process.env.PUBLIC_URL || ""}/logo.png`}
              alt="EzeAssist"
              className="navbar-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="navbar-brand-fallback">EzeAssist</span>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-glow hero-glow-1" />
          <span className="hero-glow hero-glow-2" />
          <span className="hero-glow hero-glow-3" />
          <div className="hero-waves" />
        </div>
        <div className="hero-content">
          <h1 className="hero-headline">Meet your study assistant.</h1>
          <p className="hero-text">
            Summarize notes, generate flashcards, and more so you can focus on what matters.
          </p>
          <div className="hero-ctas">
            <button
              type="button"
              className="btn hero-cta-primary"
              onClick={() => document.getElementById("study-tools")?.scrollIntoView({ behavior: "smooth" })}
            >
              Try Study Tools
            </button>
          </div>
        </div>
      </section>

      <div className="app-window" id="study-tools">
        <main className="main study-main">
          <section className="study-card">
            <label className="study-label">
              Paste your text
              <textarea
                className="study-textarea"
                rows={14}
                placeholder="Paste lecture notes, an article, or any text you want to summarize, rewrite, or turn into flashcards or quiz questions…"
                value={studyText}
                onChange={(e) => setStudyText(e.target.value)}
              />
            </label>
            <div className="study-controls">
              <label className="study-label">
                Task
                <select
                  className="study-select"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  disabled={studyLoading}
                >
                  {STUDY_TASKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn primary study-run-btn"
                onClick={() => runStudyTask(selectedTask)}
                disabled={studyLoading}
              >
                Run
              </button>
            </div>
            {studyLoading && (
              <div className="study-loading" aria-live="polite">
                <div className="study-spinner" aria-hidden="true" />
                <span className="study-status">Processing…</span>
              </div>
            )}
            {studyError && <p className="study-error">{studyError}</p>}
            {studyResult && (
              <div className="study-result">
                <div className="study-result-head">
                  <h3>Result</h3>
                  <button
                    type="button"
                    className="btn small study-copy-btn"
                    onClick={copyResult}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="study-result-text">{studyResult}</pre>
              </div>
            )}
          </section>
        </main>
      </div>

      <div className="trusted-by">
        <span className="trusted-by-label">Trusted by students and teams everywhere</span>
      </div>

      <footer className="footer">
        <span className="footer-brand">EzeAssist</span>
        <span className="footer-tagline">Study tools</span>
        <div className="footer-links">
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
