import { useState } from "react";
import { School, BookOpen, GraduationCap, ClipboardList, Search, Briefcase, Repeat, AlertTriangle, Compass, RotateCcw, X } from "lucide-react";

/* ═══════════════════════════════════════════════════
   CONFIG — Groq (same pattern as CareerRoadmap.jsx / strivaira.service.js)
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
      max_tokens: 1800,
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

/* ═══════════════════════════════════════════════════
   MULTI-LEVEL USER TYPES  (feature: multi-level user support)
═══════════════════════════════════════════════════ */
const USER_TYPES = [
  { id: "school", icon: School, label: "School Student" },
  { id: "diploma", icon: BookOpen, label: "Diploma Student" },
  { id: "fresher", icon: GraduationCap, label: "College Fresher" },
  { id: "final_year", icon: ClipboardList, label: "Final-Year Student" },
  { id: "job_seeker", icon: Search, label: "Job Seeker" },
  { id: "professional", icon: Briefcase, label: "Working Professional" },
  { id: "switcher", icon: Repeat, label: "Career Switcher" },
];

const isEarlyStage = (t) => ["school", "diploma", "fresher", "final_year"].includes(t);

/* Static baseline trend data — AI read for the recommended role is layered on top */
const TREND_BASELINE = [
  { role: "AI Engineer", demand: "Very High", growth: "Very High", risk: "Low" },
  { role: "Data Engineer", demand: "High", growth: "High", risk: "Low" },
  { role: "Cloud / DevOps Engineer", demand: "High", growth: "High", risk: "Low" },
  { role: "Full-Stack Developer", demand: "High", growth: "Stable", risk: "Medium" },
  { role: "Cybersecurity Analyst", demand: "Very High", growth: "High", risk: "Low" },
  { role: "Prompt / AI Product Engineer", demand: "Medium", growth: "Emerging", risk: "Medium" },
  { role: "Software Tester (Manual)", demand: "Medium", growth: "Stable", risk: "Medium" },
  { role: "Data Entry / Basic Support", demand: "Low", growth: "Declining", risk: "Very High" },
];

/* ═══════════════════════════════════════════════════
   PROMPTS
═══════════════════════════════════════════════════ */
const COMPASS_SYSTEM_PROMPT = `You are a career recommendation engine. Return ONLY valid JSON, no markdown fences, no preamble.

Schema:
{
  "recommendation": {
    "role": "string",
    "matchPercent": number,
    "explanation": "2-3 sentences, grounded in the specific inputs given, written directly to the user — this is the EXPLAINABLE AI layer, be concrete about which inputs drove the pick",
    "factors": ["short factor 1", "short factor 2", "short factor 3", "short factor 4"],
    "alternatives": [
      {"role":"string","matchPercent":number,"reason":"1 sentence"},
      {"role":"string","matchPercent":number,"reason":"1 sentence"}
    ]
  },
  "growthLadder": {
    "startingRole": "string",
    "stages": [
      {"title":"string","timeline":"e.g. 0-2 yrs","salaryRange":"realistic figure for the user's location/market","skillsRequired":"comma list, short","certifications":"comma list or empty string"}
    ]
  },
  "trendRead": {
    "role": "string (the recommended role)",
    "demand": "Low|Medium|High|Very High",
    "growth": "Declining|Stable|Emerging|High|Very High",
    "automationRisk": "Low|Medium|High|Very High",
    "fiveYearOutlook": "2 sentence honest outlook"
  }
}

Rules:
- growthLadder.stages: exactly 4 stages, ending near an executive/leadership title in the same field
- Be honest and specific, not generic. Ground every claim in the inputs provided.
- Currency: use INR if the location suggests India, else USD.`;

const SIMULATOR_SYSTEM_PROMPT = `Compare two careers head to head for someone deciding between them. Return ONLY valid JSON, no markdown fences.

Schema:
{
  "a": {"name":"string","attrs":{"Avg. starting salary":"string","Learning curve":"string","Job demand":"string","Work-life balance":"string","Promotion speed":"string","Core skills":"string"}},
  "b": {"name":"string","attrs":{"Avg. starting salary":"string","Learning curve":"string","Job demand":"string","Work-life balance":"string","Promotion speed":"string","Core skills":"string"}},
  "verdict": "2-3 sentence honest verdict with a clear condition — 'if you value X, pick A; if Y matters more, pick B'"
}`;

const buildCompassPrompt = (d) => `User stage: ${d.userTypeLabel}
Name: ${d.name || "unspecified"}
Background / academic stream: ${d.background || "unspecified"}
Years of experience: ${d.experience || "0"}
Interests / aptitude: ${d.interests.join(", ") || "unspecified"}
Skills, projects, or resume summary: ${d.skills || "none provided"}
Location / target market: ${d.location || "unspecified"}`;

/* ═══════════════════════════════════════════════════
   SMALL UI PRIMITIVES (visual language matches CareerRoadmap.jsx)
═══════════════════════════════════════════════════ */
function Pill({ children }) {
  return (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(99,102,241,.12)", color: "#4338ca", border: "1px solid rgba(99,102,241,.25)" }}>
      {children}
    </span>
  );
}

function riskPillColor(level) {
  const l = (level || "").toLowerCase();
  if (l.includes("very high")) return { bg: "rgba(239,68,68,.14)", fg: "#dc2626" };
  if (l.includes("high")) return { bg: "rgba(245,158,11,.14)", fg: "#b45309" };
  if (l.includes("medium")) return { bg: "rgba(245,158,11,.14)", fg: "#b45309" };
  if (l.includes("low")) return { bg: "rgba(34,197,94,.14)", fg: "#16a34a" };
  return { bg: "rgba(148,163,184,.14)", fg: "#64748b" };
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function CareerCompass() {
  const [stage, setStage] = useState("type"); // type -> form -> result
  const [userType, setUserType] = useState(null);
  const [form, setForm] = useState({ name: "", background: "", experience: "", interests: [], skills: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("overview");

  // Simulator state
  const [simA, setSimA] = useState("");
  const [simB, setSimB] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simError, setSimError] = useState(null);

  const toggleInterest = (val) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(val) ? f.interests.filter((i) => i !== val) : [...f.interests, val],
    }));

  const submitCompass = async () => {
    setLoading(true);
    setError(null);
    try {
      const userTypeLabel = USER_TYPES.find((t) => t.id === userType)?.label || "Unspecified";
      const prompt = buildCompassPrompt({ ...form, userTypeLabel });
      const data = await callGroq(COMPASS_SYSTEM_PROMPT, prompt);
      setResult(data);
      setStage("result");
      setTab("overview");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runSimulator = async () => {
    if (!simA.trim() || !simB.trim()) return;
    setSimLoading(true);
    setSimError(null);
    try {
      const data = await callGroq(SIMULATOR_SYSTEM_PROMPT, `Career A: ${simA}\nCareer B: ${simB}`);
      setSimResult(data);
    } catch (e) {
      setSimError(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  const reset = () => {
    setStage("type");
    setUserType(null);
    setForm({ name: "", background: "", experience: "", interests: [], skills: "", location: "" });
    setResult(null);
    setError(null);
    setSimResult(null);
    setSimA("");
    setSimB("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .cc-wrap *{box-sizing:border-box; font-family:'Sora',sans-serif}
        .cc-wrap input:focus,.cc-wrap textarea:focus{border-color:rgba(99,102,241,.6)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
        .cc-type-btn{transition:all .15s ease; cursor:pointer;}
        .cc-type-btn:hover{border-color:rgba(99,102,241,.4)!important; background:rgba(99,102,241,.08)!important}
        .cc-chip{transition:all .15s ease; cursor:pointer;}
        .cc-tab{transition:all .15s ease; cursor:pointer;}
        .cc-btn{transition:transform .15s, filter .15s}
        .cc-btn:hover{transform:translateY(-1px); filter:brightness(1.1)}
      `}</style>

      <div className="cc-wrap" style={{ minHeight: "calc(100vh - 80px)", background: "#f8fafc", padding: "40px 24px", color: "#0f172a" }}>
        <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,.06) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp .5s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 20, padding: "7px 18px", marginBottom: 18 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: ".12em" }}>Career Compass · Multi-Level Guidance</span>
            </div>
            <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 800, letterSpacing: "-.035em", margin: "0 0 12px", background: "linear-gradient(135deg,#1e293b 20%,#4f46e5 60%,#9333ea 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
              One tool, every career stage
            </h1>
            <p style={{ fontSize: 14.5, color: "#334155", maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
              Explainable recommendations, a growth ladder, industry trend reads, and a head-to-head simulator — adapted to where you're starting from.
            </p>
          </div>

          {/* STAGE: pick user type */}
          {stage === "type" && (
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "34px 36px", animation: "fadeUp .4s ease both" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Who's this for today?</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 22px" }}>This changes what we ask next and how we weigh your recommendation.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 10 }}>
                {USER_TYPES.map((t) => (
                  <div
                    key={t.id}
                    className="cc-type-btn"
                    onClick={() => setUserType(t.id)}
                    style={{
                      background: userType === t.id ? "rgba(99,102,241,.16)" : "#f8fafc",
                      border: userType === t.id ? "1px solid rgba(99,102,241,.5)" : "1px solid #e2e8f0",
                      borderRadius: 12, padding: "14px 12px",
                    }}
                  >
                    <div style={{ marginBottom: 8, color: userType === t.id ? "#4338ca" : "#4f46e5" }}><t.icon size={20} /></div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                  </div>
                ))}
              </div>
              <button
                className="cc-btn"
                disabled={!userType}
                onClick={() => setStage("form")}
                style={{
                  marginTop: 24, background: userType ? "linear-gradient(135deg,#4338ca,#7c3aed)" : "#e5e7eb",
                  border: "none", borderRadius: 14, padding: "13px 28px", fontSize: 14.5, fontWeight: 700,
                  color: userType ? "#fff" : "#334155", cursor: userType ? "pointer" : "not-allowed",
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STAGE: adaptive intake form */}
          {stage === "form" && (
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "34px 36px", animation: "fadeUp .4s ease both" }}>
              <Pill>{USER_TYPES.find((t) => t.id === userType)?.label}</Pill>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "14px 0 4px" }}>Tell us where you stand</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 22px" }}>
                {isEarlyStage(userType)
                  ? "No work history needed — we lean on interests, aptitude, and academic background."
                  : "We'll use your role and experience to project realistic next moves."}
              </p>

              <Field label="Name">
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aisha Rao" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label={isEarlyStage(userType) ? "Academic background / stream" : "Current or most recent role"}>
                  <input style={inputStyle} value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} placeholder={isEarlyStage(userType) ? "e.g. Mechanical Engineering, 3rd year" : "e.g. Mechanical Design Engineer, 2 yrs"} />
                </Field>
                <Field label="Years of experience">
                  <input style={inputStyle} type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="0" />
                </Field>
              </div>

              <Field label="Interests / aptitude">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Problem-solving", "Building things", "Data & numbers", "Design & UX", "People & communication", "Systems & logic", "Business strategy", "Teaching/mentoring"].map((i) => (
                    <div
                      key={i}
                      className="cc-chip"
                      onClick={() => toggleInterest(i)}
                      style={{
                        fontSize: 12.5, padding: "6px 12px", borderRadius: 999,
                        background: form.interests.includes(i) ? "rgba(99,102,241,.22)" : "#f1f5f9",
                        border: form.interests.includes(i) ? "1px solid rgba(99,102,241,.5)" : "1px solid #e2e8f0",
                        color: form.interests.includes(i) ? "#4338ca" : "#64748b",
                      }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </Field>

              <Field label="Skills, projects, or resume summary (optional — improves accuracy)">
                <textarea style={{ ...inputStyle, minHeight: 74, resize: "vertical" }} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Built a CNC toolpath optimizer in Python; solid in SolidWorks, basic Python..." />
              </Field>

              <Field label="Location / target market">
                <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Hyderabad, India · Remote · USA" />
              </Field>

              {error && <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} /> {error}</p>}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <button onClick={() => setStage("type")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                  ← Back
                </button>
                <button className="cc-btn" disabled={loading} onClick={submitCompass} style={{ background: "linear-gradient(135deg,#4338ca,#7c3aed)", border: "none", borderRadius: 14, padding: "13px 30px", fontSize: 14.5, fontWeight: 700, color: "#fff", cursor: loading ? "wait" : "pointer" }}>
                  {loading ? "Analyzing…" : (<><Compass size={16} style={{ marginRight: 6, verticalAlign: "-3px" }} />Generate my compass</>)}
                </button>
              </div>
            </div>
          )}

          {/* STAGE: results with tabs */}
          {stage === "result" && result && (
            <div style={{ animation: "fadeUp .4s ease both" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "rgba(255,255,255,.025)", borderRadius: 14, padding: 5, border: "1px solid #e5e7eb", flexWrap: "wrap" }}>
                {[
                  ["overview", "Recommendation"],
                  ["ladder", "Growth Ladder"],
                  ["trends", "Industry Trends"],
                  ["simulator", "Simulator"],
                ].map(([id, label]) => (
                  <div
                    key={id}
                    className="cc-tab"
                    onClick={() => setTab(id)}
                    style={{
                      flex: "1 1 auto", textAlign: "center", padding: "10px 8px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                      background: tab === id ? "rgba(99,102,241,.2)" : "transparent",
                      color: tab === id ? "#4338ca" : "#64748b",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {tab === "overview" && <OverviewTab rec={result.recommendation} />}
              {tab === "ladder" && <LadderTab ladder={result.growthLadder} />}
              {tab === "trends" && <TrendsTab trendRead={result.trendRead} />}
              {tab === "simulator" && (
                <SimulatorTab
                  simA={simA} setSimA={setSimA} simB={simB} setSimB={setSimB}
                  loading={simLoading} onRun={runSimulator} result={simResult} error={simError}
                />
              )}

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button onClick={reset} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 22px", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <RotateCcw size={14} /> Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   FIELD WRAPPER + SHARED STYLE
═══════════════════════════════════════════════════ */
const inputStyle = {
  width: "100%", background: "#f1f5f9", border: "1px solid #cbd5e1",
  borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b", outline: "none",
  transition: "border-color .2s, box-shadow .2s",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: OVERVIEW / EXPLAINABLE RECOMMENDATION
═══════════════════════════════════════════════════ */
function OverviewTab({ rec }) {
  if (!rec) return null;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "28px 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#4f46e5,#9333ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {rec.role}
        </h2>
        <Pill>{rec.matchPercent}% fit</Pill>
      </div>
      <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginTop: 14 }}>{rec.explanation}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {(rec.factors || []).map((f, i) => (
          <span key={i} style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 8, background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.25)", color: "#16a34a", fontFamily: "'IBM Plex Mono', monospace" }}>
            {f}
          </span>
        ))}
      </div>

      {(rec.alternatives || []).length > 0 && (
        <div style={{ marginTop: 26 }}>
          <p style={{ fontSize: 12, color: "#334155", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 10 }}>Also worth considering</p>
          {rec.alternatives.map((a, i) => (
            <div key={i} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 14 }}>{a.role}</strong>
                <span style={{ fontSize: 12, color: "#4f46e5" }}>{a.matchPercent}%</span>
              </div>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "6px 0 0" }}>{a.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: GROWTH LADDER
═══════════════════════════════════════════════════ */
function LadderTab({ ladder }) {
  if (!ladder) return null;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "28px 30px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 20px" }}>{ladder.startingRole} → executive track</h2>
      <div>
        {ladder.stages.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, paddingLeft: 24, marginLeft: 11, borderLeft: i === ladder.stages.length - 1 ? "2px solid transparent" : "2px solid #cbd5e1", position: "relative", paddingBottom: 22 }}>
            <div style={{ position: "absolute", left: -7, top: 2, width: 12, height: 12, borderRadius: "50%", background: "#4f46e5", border: "2px solid #f8fafc" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#64748b", margin: "4px 0 8px" }}>~{s.timeline} · {s.salaryRange}</div>
              <div style={{ fontSize: 12.5, color: "#64748b" }}>
                <strong>Needs:</strong> {s.skillsRequired} {s.certifications ? <> · <strong>Certs:</strong> {s.certifications}</> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: INDUSTRY TRENDS
═══════════════════════════════════════════════════ */
function TrendsTab({ trendRead }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "28px 30px" }}>
      {trendRead && (
        <div style={{ marginBottom: 24, background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#4f46e5", fontWeight: 700, margin: "0 0 8px" }}>AI read for {trendRead.role}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {[["Demand", trendRead.demand], ["Growth", trendRead.growth], ["Automation risk", trendRead.automationRisk]].map(([label, val]) => {
              const c = riskPillColor(val);
              return (
                <span key={label} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, background: c.bg, color: c.fg, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {label}: {val}
                </span>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: 0 }}>{trendRead.fiveYearOutlook}</p>
        </div>
      )}

      <p style={{ fontSize: 12, color: "#334155", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 10 }}>Baseline outlook — illustrative</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Career", "Demand", "Growth", "Automation risk"].map((h) => (
              <th key={h} style={{ textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TREND_BASELINE.map((r) => (
            <tr key={r.role}>
              <td style={{ padding: "10px", color: "#334155", borderBottom: "1px solid #e5e7eb" }}>{r.role}</td>
              {[r.demand, r.growth, r.risk].map((v, i) => {
                const c = riskPillColor(v);
                return (
                  <td key={i} style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: c.bg, color: c.fg, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB: SIMULATOR
═══════════════════════════════════════════════════ */
function SimulatorTab({ simA, setSimA, simB, setSimB, loading, onRun, result, error }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "28px 30px" }}>
      <p style={{ fontSize: 12, color: "#334155", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 14 }}>Compare two careers head to head</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <input style={inputStyle} value={simA} onChange={(e) => setSimA(e.target.value)} placeholder="Career A — e.g. AI Engineer" />
        <input style={inputStyle} value={simB} onChange={(e) => setSimB(e.target.value)} placeholder="Career B — e.g. Data Engineer" />
      </div>
      <button className="cc-btn" disabled={loading} onClick={onRun} style={{ background: "linear-gradient(135deg,#4338ca,#7c3aed)", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: loading ? "wait" : "pointer" }}>
        {loading ? "Comparing…" : "Compare"}
      </button>
      {error && <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} /> {error}</p>}

      {result && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[result.a, result.b].map((c, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#4338ca", margin: "0 0 10px" }}>{c.name}</h3>
                {Object.entries(c.attrs).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e5e7eb", fontSize: 12.5 }}>
                    <span style={{ color: "#64748b" }}>{k}</span>
                    <span style={{ color: "#1e293b", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 14, background: "rgba(99,102,241,.08)", borderLeft: "3px solid #4f46e5", borderRadius: 8, fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>
            <strong style={{ color: "#4338ca" }}>Bottom line: </strong>{result.verdict}
          </div>
        </div>
      )}
    </div>
  );
}
