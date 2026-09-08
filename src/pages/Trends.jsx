import { TrendingUp, TrendingDown, Users, ShieldAlert, ExternalLink, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════
   REAL, SOURCED DATA — not AI-generated. See sources list at
   the bottom of the page for where every figure comes from.
   Update this block periodically as new reports are published.
═══════════════════════════════════════════════════ */
const DATA_AS_OF = "August 2026";

const HEADLINE_STATS = [
  { value: "170M", label: "New jobs projected globally by 2030", source: "WEF Future of Jobs Report 2025" },
  { value: "92M", label: "Existing jobs projected to be displaced by 2030", source: "WEF Future of Jobs Report 2025" },
  { value: "+78M", label: "Net global job gain by 2030", source: "WEF Future of Jobs Report 2025" },
  { value: "39%", label: "Of current skill sets expected to change by 2030", source: "WEF Future of Jobs Report 2025" },
];

const SALARY_DEMAND = [
  { role: "AI / ML Engineer", low: "$134,000", mid: "$170,750", high: "$193,250", postingGrowth: "+163% YoY (AI/ML/data science postings)", risk: "Low" },
  { role: "Data Engineer", low: "$127,000", mid: "$156,250", high: "$180,750", postingGrowth: "Strong, tracks AI/data hiring", risk: "Low" },
  { role: "Data Scientist", low: "$121,750", mid: "$153,750", high: "$182,500", postingGrowth: "Strong, tracks AI/data hiring", risk: "Low" },
  { role: "Cybersecurity Engineer", low: "$118,500", mid: "$144,000", high: "$190,750", postingGrowth: "+124% YoY (security postings)", risk: "Low" },
  { role: "DevOps / Cloud Engineer", low: "$118,000", mid: "$145,750", high: "$173,750", postingGrowth: "12–17.9% projected growth (cloud specialties)", risk: "Low" },
  { role: "Software Engineer", low: "$109,250", mid: "—", high: "—", postingGrowth: "Steady, more competitive at entry level", risk: "Medium" },
  { role: "Administrative / Clerical / Data Entry", low: "—", mid: "—", high: "—", postingGrowth: "Declining", risk: "Very High" },
];

const FASTEST_GROWING = [
  { role: "AI Engineer", note: "Consistently the #1 fastest-growing tech role across LinkedIn and Robert Half data" },
  { role: "AI Implementation Consultant", note: "Helping organizations adopt AI tooling and workflows" },
  { role: "Data Center Technician", note: "Physical infrastructure buildout for AI compute demand" },
  { role: "Cloud Architect / Engineer", note: "Underpins nearly every other tech role's infrastructure" },
  { role: "Cybersecurity Analyst / Engineer", note: "Defending against increasingly AI-driven threats" },
  { role: "Site Reliability Engineer (SRE)", note: "Keeping AI-scale infrastructure reliable" },
];

const AUTOMATION_RISK_BY_SECTOR = [
  { sector: "Transportation & Storage", exposure: "52%", level: "Very High" },
  { sector: "Administrative / Clerical / Data Entry", exposure: "High", level: "Very High" },
  { sector: "Manufacturing (routine tasks)", exposure: "Moderate–High", level: "High" },
  { sector: "Financial Services (routine processing)", exposure: "Moderate", level: "Medium" },
  { sector: "Healthcare (direct care roles)", exposure: "Low", level: "Low" },
  { sector: "Education", exposure: "8%", level: "Low" },
];

const riskPillColor = (level) => {
  const l = (level || "").toLowerCase();
  if (l.includes("very high")) return { bg: "rgba(239,68,68,.1)", fg: "#dc2626" };
  if (l.includes("high")) return { bg: "rgba(245,158,11,.1)", fg: "#b45309" };
  if (l.includes("medium")) return { bg: "rgba(245,158,11,.1)", fg: "#b45309" };
  return { bg: "rgba(16,185,129,.1)", fg: "#16a34a" };
};

const SOURCES = [
  { name: "World Economic Forum — Future of Jobs Report 2025", url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/" },
  { name: "Robert Half — 2026 Technology Job Market: In-Demand Roles & Hiring Trends", url: "https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand" },
  { name: "TechRepublic — The 10 Tech Jobs Growing Fastest in 2026 (LinkedIn data)", url: "https://www.techrepublic.com/article/news-fastest-growing-tech-jobs-2026/" },
  { name: "PwC — Automation exposure by sector analysis", url: "https://piktochart.com/blog/how-many-jobs-will-ai-replace-by-2030/" },
  { name: "Nucamp — Most In-Demand Tech Jobs in 2026", url: "https://www.nucamp.co/blog/most-in-demand-tech-jobs-in-2026-roles-hiring-fast-why" },
];

/* ═══════════════════════════════════════════════════
   UI PRIMITIVES (light theme, consistent with rest of app)
═══════════════════════════════════════════════════ */
const card = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "26px 28px", marginBottom: 20 };

function RiskPill({ level }) {
  const c = riskPillColor(level);
  return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.fg, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>{level}</span>;
}

export default function Trends() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .tr-wrap *{ box-sizing:border-box; font-family:'Sora',sans-serif; }
        .tr-wrap table{ width:100%; border-collapse:collapse; font-size:13px; }
        .tr-wrap th{ text-align:left; color:#64748b; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.05em; padding:9px 10px; border-bottom:1px solid #e2e8f0; }
        .tr-wrap td{ padding:11px 10px; border-bottom:1px solid #f1f5f9; color:#334155; }
        .tr-source-link{ color:#4338ca; text-decoration:none; }
        .tr-source-link:hover{ text-decoration:underline; }
        @media (max-width: 640px) {
          .tr-headline-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          .tr-headline-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="tr-wrap" style={{ minHeight: "calc(100vh - 80px)", background: "#f8fafc", padding: "40px 24px 80px", color: "#0f172a" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 20, padding: "7px 18px", marginBottom: 16 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: ".12em" }}>Real Job Market Data · {DATA_AS_OF}</span>
            </div>
            <h1 style={{ fontSize: "clamp(26px,4.5vw,38px)", fontWeight: 800, letterSpacing: "-.03em", margin: "0 0 10px", background: "linear-gradient(135deg,#1e293b 20%,#4f46e5 60%,#9333ea 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Industry Trends
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Real, sourced numbers on demand, salary, and automation risk — not AI-generated estimates. Every figure below is cited at the bottom of the page.
            </p>
          </div>

          {/* Headline global stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }} className="tr-headline-grid">
            {HEADLINE_STATS.map((s, i) => (
              <div key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "18px 14px", textAlign: "center", boxShadow: "0 1px 3px rgba(15,23,42,.05)" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#4338ca" }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 6, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Salary & demand table */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <TrendingUp size={17} color="#4338ca" />
              <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, margin: 0 }}>Salary bands & hiring demand</p>
            </div>
            <p style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 16 }}>US market data, 2025–2026. Adjust expectations for your region.</p>
            <table>
              <thead><tr><th>Role</th><th>Low</th><th>Mid</th><th>High</th><th>Posting growth</th><th>Automation risk</th></tr></thead>
              <tbody>
                {SALARY_DEMAND.map((r) => (
                  <tr key={r.role}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{r.role}</td>
                    <td>{r.low}</td>
                    <td>{r.mid}</td>
                    <td>{r.high}</td>
                    <td style={{ fontSize: 12 }}>{r.postingGrowth}</td>
                    <td><RiskPill level={r.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fastest growing roles */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={17} color="#4338ca" />
              <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, margin: 0 }}>Fastest-growing roles right now</p>
            </div>
            {FASTEST_GROWING.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i < FASTEST_GROWING.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <span style={{ fontWeight: 600, fontSize: 13.5, color: "#0f172a", minWidth: 200 }}>{f.role}</span>
                <span style={{ fontSize: 12.5, color: "#64748b", textAlign: "right" }}>{f.note}</span>
              </div>
            ))}
          </div>

          {/* Automation risk by sector */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <ShieldAlert size={17} color="#dc2626" />
              <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, margin: 0 }}>Automation exposure by sector</p>
            </div>
            <p style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 16 }}>PwC analysis of 200,000+ workers across 29 OECD countries.</p>
            <table>
              <thead><tr><th>Sector</th><th>Exposure</th><th>Risk level</th></tr></thead>
              <tbody>
                {AUTOMATION_RISK_BY_SECTOR.map((r) => (
                  <tr key={r.sector}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{r.sector}</td>
                    <td>{r.exposure}</td>
                    <td><RiskPill level={r.level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sources */}
          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Users size={17} color="#4338ca" />
              <p style={{ fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, margin: 0 }}>Sources</p>
            </div>
            {SOURCES.map((s, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < SOURCES.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="tr-source-link" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  {s.name} <ExternalLink size={12} />
                </a>
              </div>
            ))}
            <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 14, fontStyle: "italic" }}>
              Figures are point-in-time snapshots from published reports as of {DATA_AS_OF} — labor markets shift, so treat these as directional, not exact.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
