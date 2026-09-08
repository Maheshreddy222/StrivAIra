import { useEffect, useState } from "react";
import { X, AlertTriangle, RotateCcw } from "lucide-react";

const STORAGE_KEY = "careerpilot_digital_twin_v1";

const DEFAULT_STATE = {
  targetRole: "",
  milestones: [
    { id: "m1", label: "Complete a foundational course in your target field", category: "Course", done: false },
    { id: "m2", label: "Finish a portfolio project you can show recruiters", category: "Project", done: false },
    { id: "m3", label: "Earn a relevant certification", category: "Certification", done: false },
    { id: "m4", label: "Gain 6 months of hands-on / internship experience", category: "Experience", done: false },
    { id: "m5", label: "Complete a mock technical interview", category: "Interview Prep", done: false },
    { id: "m6", label: "Complete a mock HR / behavioral interview", category: "Interview Prep", done: false },
    { id: "m7", label: "Get one project reviewed by a mentor or senior", category: "Feedback", done: false },
    { id: "m8", label: "Publish or share your work (GitHub, portfolio, LinkedIn)", category: "Visibility", done: false },
  ],
  log: [], // { id, text, date }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, milestones: parsed.milestones?.length ? parsed.milestones : DEFAULT_STATE.milestones };
  } catch {
    return DEFAULT_STATE;
  }
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function askGroq(prompt) {
  if (!GROQ_KEY) throw new Error("VITE_GROQ_API_KEY missing.");
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export default function CareerDigitalTwin() {
  const [state, setState] = useState(loadState);
  const [newMilestone, setNewMilestone] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [explainError, setExplainError] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const doneCount = state.milestones.filter((m) => m.done).length;
  const readiness = Math.round((doneCount / state.milestones.length) * 100);

  const toggle = (id) => {
    const wasIncomplete = state.milestones.find((m) => m.id === id && !m.done);
    setState((s) => {
      const milestones = s.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
      const log = wasIncomplete
        ? [{ id: Date.now(), text: `Completed: ${s.milestones.find((m) => m.id === id).label}`, date: new Date().toLocaleDateString() }, ...s.log].slice(0, 12)
        : s.log;
      return { ...s, milestones, log };
    });
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setState((s) => ({
      ...s,
      milestones: [...s.milestones, { id: `custom_${Date.now()}`, label: newMilestone.trim(), category: "Custom", done: false }],
    }));
    setNewMilestone("");
  };

  const removeMilestone = (id) => setState((s) => ({ ...s, milestones: s.milestones.filter((m) => m.id !== id) }));

  const explain = async () => {
    setExplaining(true);
    setExplainError(null);
    const done = state.milestones.filter((m) => m.done).map((m) => m.label);
    const pending = state.milestones.filter((m) => !m.done).map((m) => m.label);
    const prompt = `A user targeting the role "${state.targetRole || "a role they haven't specified yet"}" has completed: ${done.join("; ") || "nothing yet"}. Still pending: ${pending.join("; ") || "nothing"}. In 3 sentences, give an honest read on their placement readiness and name the single highest-leverage next step.`;
    try {
      const text = await askGroq(prompt);
      setExplanation(text);
    } catch (e) {
      setExplainError(e.message);
    } finally {
      setExplaining(false);
    }
  };

  const reset = () => {
    if (!confirm("Reset your Digital Twin? This clears all progress on this browser.")) return;
    setState(DEFAULT_STATE);
    setExplanation("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .dt-wrap *{ box-sizing:border-box; font-family:'Sora',sans-serif; }
        .dt-milestone{ transition: all .15s ease; }
        .dt-milestone:hover{ border-color: rgba(99,102,241,.35) !important; }
        .dt-btn{ transition: transform .15s, filter .15s; cursor:pointer; }
        .dt-btn:hover{ transform: translateY(-1px); filter: brightness(1.1); }
        @media (max-width:640px){ .dt-metric-grid{ grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div className="dt-wrap" style={{ minHeight: "calc(100vh - 80px)", background: "#f8fafc", padding: "40px 24px 80px", color: "#0f172a" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 20, padding: "7px 18px", marginBottom: 16 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: ".12em" }}>Career Digital Twin</span>
            </div>
            <h1 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 800, letterSpacing: "-.03em", margin: "0 0 10px", background: "linear-gradient(135deg,#1e293b 20%,#4f46e5 60%,#9333ea 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your evolving profile
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Check off milestones as you complete them — this stays saved on this browser, and your readiness score updates as you go.
            </p>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "24px 26px", marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Target role (optional, sharpens the AI read below)
            </label>
            <input
              value={state.targetRole}
              onChange={(e) => setState((s) => ({ ...s, targetRole: e.target.value }))}
              placeholder="e.g. Data Analyst"
              style={{ width: "100%", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b", outline: "none" }}
            />
          </div>

          <div className="dt-metric-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
            {[
              [`${readiness}%`, "Placement readiness"],
              [String(doneCount), "Milestones done"],
              [String(state.milestones.length - doneCount), "Still pending"],
            ].map(([num, lbl]) => (
              <div key={lbl} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 700, color: "#4f46e5" }}>{num}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'IBM Plex Mono',monospace" }}>{lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "24px 26px", marginBottom: 18 }}>
            <p style={{ fontSize: 12, color: "#334155", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 14 }}>Milestones</p>
            {state.milestones.map((m) => (
              <div
                key={m.id}
                className="dt-milestone"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                  opacity: m.done ? 0.55 : 1,
                }}
              >
                <input type="checkbox" checked={m.done} onChange={() => toggle(m.id)} style={{ accentColor: "#4f46e5", width: 16, height: 16, cursor: "pointer" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, textDecoration: m.done ? "line-through" : "none" }}>{m.label}</div>
                  <div style={{ fontSize: 10.5, color: "#4f46e5", marginTop: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{m.category}</div>
                </div>
                {m.category === "Custom" && (
                  <button onClick={() => removeMilestone(m.id)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><X size={15} /></button>
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                placeholder="Add your own milestone…"
                style={{ flex: 1, background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: "#1e293b", outline: "none" }}
              />
              <button className="dt-btn" onClick={addMilestone} style={{ background: "rgba(99,102,241,.16)", border: "1px solid rgba(99,102,241,.4)", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, color: "#4338ca" }}>
                Add
              </button>
            </div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "24px 26px", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <p style={{ fontSize: 12, color: "#334155", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, margin: 0 }}>AI read on your standing</p>
              <button className="dt-btn" onClick={explain} disabled={explaining} style={{ background: "linear-gradient(135deg,#4338ca,#7c3aed)", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 12.5, fontWeight: 700, color: "#fff" }}>
                {explaining ? "Thinking…" : "Explain my readiness"}
              </button>
            </div>
            {explainError && <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} /> {explainError}</p>}
            {explanation && (
              <div style={{ marginTop: 14, padding: 14, background: "rgba(99,102,241,.08)", borderLeft: "3px solid #4f46e5", borderRadius: 8, fontSize: 13.5, color: "#64748b", lineHeight: 1.65 }}>
                {explanation}
              </div>
            )}
          </div>

          {state.log.length > 0 && (
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "24px 26px", marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: "#334155", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginBottom: 12 }}>Recent activity</p>
              {state.log.map((l) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#64748b", padding: "6px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>{l.text}</span>
                  <span style={{ color: "#64748b", fontFamily: "'IBM Plex Mono',monospace" }}>{l.date}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <button onClick={reset} style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 18px", fontSize: 12.5, color: "#64748b", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <RotateCcw size={13} /> Reset my twin
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
