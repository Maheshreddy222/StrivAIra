import { useState } from "react";
import { Brain, FileSearch, GitBranch, AlertTriangle, Github, Loader2 } from "lucide-react";

/* ═══════════════════════════════════════════════════
   GROQ CONFIG — same pattern as CareerCompass.jsx / CareerDigitalTwin.jsx
═══════════════════════════════════════════════════ */
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function callGroq(systemPrompt, userPrompt) {
  if (!GROQ_KEY) throw new Error("VITE_GROQ_API_KEY missing — add it to your .env file.");
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 1400,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `Groq error: ${res.status}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

/* Shared visual tokens (light theme, same as CareerCompass.jsx) */
const card = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "28px 30px" };
const inputStyle = { width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0f172a", outline: "none" };
const btnPrimary = { background: "linear-gradient(135deg,#4338ca,#7c3aed)", border: "none", borderRadius: 12, padding: "12px 26px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

function ErrorNote({ msg }) {
  if (!msg) return null;
  return <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} /> {msg}</p>;
}

/* ═══════════════════════════════════════════════════
   TAB 1 — INTEREST & PERSONALITY ANALYSIS
═══════════════════════════════════════════════════ */
const QUIZ_QUESTIONS = [
  { id: "q1", text: "When starting a new project, you'd rather...", options: ["Plan every step before starting", "Jump in and figure it out as you go"] },
  { id: "q2", text: "You get more energy from...", options: ["Deep focused solo work", "Working closely with a team"] },
  { id: "q3", text: "A task feels satisfying when it's...", options: ["Precise and logically correct", "Creative and open-ended"] },
  { id: "q4", text: "You'd rather be known for...", options: ["Being the most reliable person on the team", "Being the person with the boldest ideas"] },
  { id: "q5", text: "When something breaks, you...", options: ["Methodically trace the root cause", "Try a few quick fixes and see what sticks"] },
  { id: "q6", text: "You prefer feedback that is...", options: ["Direct and specific", "Encouraging and big-picture"] },
];

function PersonalityTab() {
  const [answers, setAnswers] = useState({});
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const interestOptions = ["Problem-solving", "Building things", "Data & numbers", "Design & UX", "People & communication", "Systems & logic", "Business strategy", "Teaching/mentoring"];
  const toggleInterest = (i) => setInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id]);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    const answerText = QUIZ_QUESTIONS.map((q) => `${q.text} → ${answers[q.id]}`).join("\n");
    const prompt = `Quiz answers:\n${answerText}\n\nSelected interests: ${interests.join(", ") || "none given"}\n\nRespond ONLY with JSON, no markdown fences:
{
  "workStyle": "2-3 sentence read on how this person naturally works best, grounded in their specific answers",
  "traits": ["short trait 1", "short trait 2", "short trait 3", "short trait 4"],
  "suggestedRoleTypes": ["role/field type 1", "role/field type 2", "role/field type 3"],
  "caveat": "1 sentence honest note that this is a lightweight signal, not a clinical assessment"
}`;
    try {
      const data = await callGroq("You are a career-oriented interest and work-style analyzer. Be specific and grounded, never generic astrology-style statements.", prompt);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 4 }}>6 quick questions</p>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>A lightweight read on how you work and what to weigh in a career choice — not a clinical personality test.</p>

      {QUIZ_QUESTIONS.map((q) => (
        <div key={q.id} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>{q.text}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {q.options.map((opt) => (
              <div
                key={opt}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                style={{
                  cursor: "pointer", fontSize: 12.5, padding: "8px 14px", borderRadius: 999,
                  background: answers[q.id] === opt ? "rgba(99,102,241,.14)" : "#f8fafc",
                  border: answers[q.id] === opt ? "1px solid #4338ca" : "1px solid #e2e8f0",
                  color: answers[q.id] === opt ? "#4338ca" : "#475569", fontWeight: answers[q.id] === opt ? 600 : 400,
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Field label="Interests (optional, sharpens the read)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {interestOptions.map((i) => (
            <div key={i} onClick={() => toggleInterest(i)} style={{ cursor: "pointer", fontSize: 12, padding: "6px 12px", borderRadius: 999, background: interests.includes(i) ? "rgba(99,102,241,.14)" : "#f8fafc", border: interests.includes(i) ? "1px solid #4338ca" : "1px solid #e2e8f0", color: interests.includes(i) ? "#4338ca" : "#64748b" }}>
              {i}
            </div>
          ))}
        </div>
      </Field>

      <button style={{ ...btnPrimary, opacity: allAnswered ? 1 : 0.5, cursor: allAnswered ? "pointer" : "not-allowed" }} disabled={!allAnswered || loading} onClick={analyze}>
        {loading ? "Analyzing…" : "Analyze my interests & style"}
      </button>
      <ErrorNote msg={error} />

      {result && (
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7 }}>{result.workStyle}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
            {(result.traits || []).map((t, i) => (
              <span key={i} style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 8, background: "rgba(99,102,241,.1)", color: "#4338ca", fontFamily: "'IBM Plex Mono', monospace" }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 16, marginBottom: 8 }}>Worth exploring</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", fontSize: 13.5, lineHeight: 1.8 }}>
            {(result.suggestedRoleTypes || []).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 14, fontStyle: "italic" }}>{result.caveat}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 2 — RESUME, LINKEDIN & GITHUB ANALYSIS
═══════════════════════════════════════════════════ */
async function fetchGithubProfile(username) {
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!userRes.ok) throw new Error(userRes.status === 404 ? "GitHub username not found." : `GitHub API error: ${userRes.status}`);
  const user = await userRes.json();
  const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=8`);
  const repos = reposRes.ok ? await reposRes.json() : [];
  return { user, repos };
}

function ResumeAnalysisTab() {
  const [resumeText, setResumeText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghData, setGhData] = useState(null);
  const [ghError, setGhError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const pullGithub = async () => {
    if (!githubUsername.trim()) return;
    setGhLoading(true);
    setGhError(null);
    try {
      const data = await fetchGithubProfile(githubUsername.trim());
      setGhData(data);
    } catch (e) {
      setGhError(e.message);
      setGhData(null);
    } finally {
      setGhLoading(false);
    }
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    const ghSummary = ghData
      ? `GitHub bio: ${ghData.user.bio || "none"}. Public repos: ${ghData.user.public_repos}. Followers: ${ghData.user.followers}. Recent repo names/languages: ${ghData.repos.map((r) => `${r.name} (${r.language || "n/a"})`).join(", ") || "none"}.`
      : "No GitHub data provided.";
    const prompt = `Resume / project summary (pasted by user):\n${resumeText || "none provided"}\n\nLinkedIn summary (pasted by user):\n${linkedinText || "none provided"}\n\nGitHub data (fetched live):\n${ghSummary}\n\nRespond ONLY with JSON, no markdown fences:
{
  "strengths": ["short strength 1 grounded in the input", "strength 2", "strength 3"],
  "extractedSkills": ["skill1","skill2","skill3","skill4","skill5"],
  "gaps": "1-2 sentences on what's missing or under-represented across these profiles",
  "recommendation": "2 sentence actionable recommendation on what to add/fix next"
}`;
    try {
      const data = await callGroq("You are a resume/profile analyzer for a career platform. Be concrete, cite specifics from the input, never generic.", prompt);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 4 }}>Three sources, one analysis</p>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
        GitHub is pulled live from its public API. LinkedIn has no public API to fetch from — paste your summary/experience section instead.
      </p>

      <Field label="Resume text or project summary">
        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text, or summarize your experience and projects…" />
      </Field>

      <Field label="LinkedIn summary (paste — no live fetch available)">
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={linkedinText} onChange={(e) => setLinkedinText(e.target.value)} placeholder="Paste your LinkedIn 'About' section or headline + experience…" />
      </Field>

      <Field label="GitHub username (fetched live, public data only)">
        <div style={{ display: "flex", gap: 8 }}>
          <input style={inputStyle} value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="e.g. octocat" />
          <button onClick={pullGithub} disabled={ghLoading} style={{ ...btnPrimary, padding: "10px 18px", fontSize: 13, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            {ghLoading ? <Loader2 size={14} className="spin" /> : <Github size={14} />} Pull
          </button>
        </div>
        <ErrorNote msg={ghError} />
        {ghData && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px" }}>
            <strong style={{ color: "#0f172a" }}>@{ghData.user.login}</strong> · {ghData.user.public_repos} public repos · {ghData.user.followers} followers
            {ghData.user.bio && <div style={{ marginTop: 4 }}>{ghData.user.bio}</div>}
          </div>
        )}
      </Field>

      <button style={btnPrimary} disabled={loading || (!resumeText && !linkedinText && !ghData)} onClick={analyze}>
        {loading ? "Analyzing…" : "Analyze my profiles"}
      </button>
      <ErrorNote msg={error} />

      {result && (
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 12, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Strengths</p>
          <ul style={{ margin: "0 0 16px", paddingLeft: 18, color: "#334155", fontSize: 13.5, lineHeight: 1.8 }}>
            {(result.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {(result.extractedSkills || []).map((s, i) => (
              <span key={i} style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 8, background: "rgba(16,185,129,.1)", color: "#16a34a", fontFamily: "'IBM Plex Mono', monospace" }}>{s}</span>
            ))}
          </div>
          <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, marginBottom: 10 }}><strong>Gaps:</strong> {result.gaps}</p>
          <div style={{ padding: 14, background: "rgba(99,102,241,.06)", borderLeft: "3px solid #4338ca", borderRadius: 8, fontSize: 13.5, color: "#334155", lineHeight: 1.65 }}>
            {result.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 3 — SKILL GAP ANALYSIS
═══════════════════════════════════════════════════ */
function SkillGapTab() {
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setError(null);
    const prompt = `Current skills: ${currentSkills || "beginner / minimal"}\nTarget role: ${targetRole}\n\nRespond ONLY with JSON, no markdown fences:
{
  "targetRole": "${targetRole}",
  "haveSkills": ["skill the user already has, relevant to this role", "..."],
  "gapSkills": [
    {"skill":"string","priority":"High|Medium|Low","why":"1 short sentence"}
  ],
  "readinessPercent": number (0-100, honest estimate based on overlap),
  "summary": "2 sentence honest summary of how close they are and what closes the gap fastest"
}`;
    try {
      const data = await callGroq("You are a skill-gap analyzer for a career platform. Be honest and specific, do not inflate readiness.", prompt);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = (p) => {
    const l = (p || "").toLowerCase();
    if (l === "high") return { bg: "rgba(239,68,68,.1)", fg: "#dc2626" };
    if (l === "medium") return { bg: "rgba(245,158,11,.1)", fg: "#b45309" };
    return { bg: "rgba(16,185,129,.1)", fg: "#16a34a" };
  };

  return (
    <div style={card}>
      <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 18 }}>Have vs. need, for one specific role</p>

      <Field label="Your current skills">
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} placeholder="e.g. Excel, basic SQL, Python fundamentals, Power BI" />
      </Field>
      <Field label="Target role">
        <input style={inputStyle} value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Data Analyst" />
      </Field>

      <button style={{ ...btnPrimary, opacity: targetRole.trim() ? 1 : 0.5, cursor: targetRole.trim() ? "pointer" : "not-allowed" }} disabled={loading || !targetRole.trim()} onClick={analyze}>
        {loading ? "Analyzing…" : "Find my skill gaps"}
      </button>
      <ErrorNote msg={error} />

      {result && (
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "#4338ca" }}>{result.readinessPercent}%</span>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>ready for {result.targetRole}</span>
          </div>
          <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, marginBottom: 18 }}>{result.summary}</p>

          {(result.haveSkills || []).length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>You already have</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {result.haveSkills.map((s, i) => (
                  <span key={i} style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 8, background: "rgba(16,185,129,.1)", color: "#16a34a", fontFamily: "'IBM Plex Mono', monospace" }}>{s}</span>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize: 12, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Gaps to close</p>
          {(result.gapSkills || []).map((g, i) => {
            const c = priorityColor(g.priority);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{g.skill}</span>
                  <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>{g.why}</p>
                </div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.fg, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>{g.priority}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function CareerAnalyzer() {
  const [tab, setTab] = useState("personality");

  const tabs = [
    { id: "personality", label: "Interest & Personality", icon: Brain },
    { id: "resume", label: "Resume / LinkedIn / GitHub", icon: FileSearch },
    { id: "gap", label: "Skill Gap", icon: GitBranch },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ca-wrap *{ box-sizing:border-box; font-family:'Sora',sans-serif; }
        .ca-tab{ transition: all .15s ease; cursor:pointer; }
        @keyframes spin{ from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .spin{ animation: spin 1s linear infinite; }
      `}</style>
      <div className="ca-wrap" style={{ minHeight: "calc(100vh - 80px)", background: "#f8fafc", padding: "40px 24px 80px", color: "#0f172a" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 20, padding: "7px 18px", marginBottom: 16 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: ".12em" }}>Career Analyzer</span>
            </div>
            <h1 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 800, letterSpacing: "-.03em", margin: "0 0 10px", background: "linear-gradient(135deg,#1e293b 20%,#4f46e5 60%,#9333ea 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Know where you actually stand
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Your work style, what your resume/GitHub actually show, and exactly what's missing for the role you want.
            </p>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 5, flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <div
                key={t.id}
                className="ca-tab"
                onClick={() => setTab(t.id)}
                style={{
                  flex: "1 1 auto", textAlign: "center", padding: "10px 8px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                  background: tab === t.id ? "rgba(99,102,241,.12)" : "transparent",
                  color: tab === t.id ? "#4338ca" : "#64748b",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <t.icon size={14} /> {t.label}
              </div>
            ))}
          </div>

          {tab === "personality" && <PersonalityTab />}
          {tab === "resume" && <ResumeAnalysisTab />}
          {tab === "gap" && <SkillGapTab />}
        </div>
      </div>
    </>
  );
}
