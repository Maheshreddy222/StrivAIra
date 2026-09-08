import { useNavigate } from "react-router-dom";
import InterviewPrepModal from "./InterviewPrepModal";
import { useState } from "react";
import { Zap, Shield, BarChart2, ArrowRight } from "lucide-react";

const TAG_SKILLS = [
  { label: "React", color: "#0284c7", bg: "rgba(97,218,251,0.08)", border: "rgba(97,218,251,0.2)" },
  { label: "System Design", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  { label: "DSA", color: "#16a34a", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  { label: "Behavioural", color: "#b45309", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  { label: "SQL", color: "#db2777", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
  { label: "Node.js", color: "#16a34a", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.2)" },
];

const PILLS = [
  { icon: <Zap size={13} />, text: "AI-Powered Feedback" },
  { icon: <Shield size={13} />, text: "Real Interview Format" },
  { icon: <BarChart2 size={13} />, text: "Performance Report" },
];

const MockInterview = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleStart = (data) => {
    setOpen(false);
    navigate("/mock-interview/interview-prep", { state: data });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes float-tag {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.35; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .tag-float { animation: float-tag ease-in-out infinite; }
        .fade-up   { animation: fade-up 0.6s ease both; }

        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(99,102,241,0.4) !important; }
        .start-btn { transition: transform 0.2s, box-shadow 0.2s; }
      `}</style>

      <div
        className="w-screen min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12"
        style={{ background: "#f8fafc", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <div
          className="w-full max-w-7xl rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
            border: "1px solid #e2e8f0",
            boxShadow: "0 40px 100px rgba(15,23,42,0.12)",
            minHeight: "76vh",
          }}
        >
          {/* Background glows */}
          <div style={{
            position: "absolute", top: -120, left: -80, width: 500, height: 500,
            background: "radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -100, right: -80, width: 450, height: 450,
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          {/* Grid texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
            backgroundImage: "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-10 md:px-16 py-16 relative z-10 h-full">

            {/* ── LEFT ── */}
            <div className="space-y-7 fade-up">
              {/* Top label */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 100, padding: "5px 14px",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  AI Mock Interview
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: "clamp(34px, 4.5vw, 58px)",
                fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
                color: "#0f172a",
              }}>
                Get Interview‑Ready
                <span style={{
                  display: "block",
                  background: "linear-gradient(120deg, #818cf8 0%, #a78bfa 60%, #c4b5fd 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  with AI Practice
                </span>
                <span style={{ color: "#1e293b" }}>& Feedback</span>
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.75, maxWidth: 460 }}>
                Simulate real interviews for your target role. Get instant AI feedback,
                performance scores, and a downloadable report — so you walk in confident.
              </p>

              {/* Feature pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {PILLS.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#f1f5f9", border: "1px solid #e2e8f0",
                    borderRadius: 100, padding: "6px 14px",
                    fontSize: 12.5, fontWeight: 500, color: "#64748b",
                  }}>
                    <span style={{ color: "#818cf8" }}>{p.icon}</span>
                    {p.text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <button
                  onClick={() => setOpen(true)}
                  className="start-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    color: "#fff", border: "none", borderRadius: 14,
                    padding: "14px 28px", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", letterSpacing: 0.2,
                    boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
                  }}
                >
                  Start an Interview
                  <ArrowRight size={16} />
                </button>
                <p style={{ fontSize: 12.5, color: "#374151" }}>No signup required to demo</p>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380 }}>

              {/* Outer ring animation */}
              <div style={{
                position: "absolute",
                width: 360, height: 360,
                borderRadius: "50%",
                border: "1px solid rgba(99,102,241,0.12)",
                animation: "pulse-ring 3.5s ease-out infinite",
              }} />
              <div style={{
                position: "absolute",
                width: 360, height: 360,
                borderRadius: "50%",
                border: "1px solid rgba(99,102,241,0.08)",
                animation: "pulse-ring 3.5s 1.2s ease-out infinite",
              }} />

              {/* Decorative orbit ring */}
              <div style={{
                position: "absolute",
                width: 380, height: 380,
                borderRadius: "50%",
                border: "1px dashed rgba(99,102,241,0.15)",
                animation: "spin-slow 28s linear infinite",
              }} />

              {/* Skill tags orbiting */}
              {TAG_SKILLS.map((tag, i) => {
                const angle = (i / TAG_SKILLS.length) * 2 * Math.PI - Math.PI / 2;
                const r = 195;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                return (
                  <div
                    key={tag.label}
                    className="tag-float"
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                      animationDuration: `${3.5 + i * 0.4}s`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    <div style={{
                      background: tag.bg, border: `1px solid ${tag.border}`,
                      borderRadius: 10, padding: "6px 12px",
                      fontSize: 12, fontWeight: 700, color: tag.color,
                      whiteSpace: "nowrap",
                      backdropFilter: "blur(8px)",
                      boxShadow: `0 4px 16px ${tag.bg}`,
                    }}>
                      {tag.label}
                    </div>
                  </div>
                );
              })}

              {/* Center avatar */}
              <div style={{
                position: "relative", zIndex: 2,
                width: 220, height: 220,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(99,102,241,0.3)",
                boxShadow: "0 0 0 8px rgba(99,102,241,0.06), 0 24px 60px rgba(0,0,0,0.5)",
                background: "linear-gradient(145deg, #0f172a, #1e293b)",
              }}>
                <img
                  src="/image.png"
                  alt="AI Interviewer"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.15) translateY(8px)" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:64px">🤖</div>';
                  }}
                />
              </div>

              {/* Live badge */}
              <div style={{
                position: "absolute", bottom: "calc(50% - 128px)", right: "calc(50% - 138px)",
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 100, padding: "5px 12px",
                fontSize: 12, fontWeight: 600, color: "#16a34a",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#10b981", display: "inline-block",
                  boxShadow: "0 0 6px #10b981",
                  animation: "pulse-ring 1.5s ease-out infinite",
                }} />
                AI Online
              </div>
            </div>
          </div>
        </div>

        <InterviewPrepModal open={open} setOpen={setOpen} onStart={handleStart} />
      </div>
    </>
  );
};

export default MockInterview;

// import { useNavigate } from "react-router-dom";
// import InterviewPrepModal from "./InterviewPrepModal";
// import { useState } from "react";
// import { Zap, Shield, BarChart2, Code2, ArrowRight } from "lucide-react";

// const TAG_SKILLS = [
//   { label: "React", color: "#0284c7", bg: "rgba(97,218,251,0.08)", border: "rgba(97,218,251,0.2)" },
//   { label: "System Design", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
//   { label: "DSA", color: "#16a34a", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
//   { label: "Behavioural", color: "#b45309", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
//   { label: "SQL", color: "#db2777", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
//   { label: "Node.js", color: "#16a34a", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.2)" },
//   { label: "Coding", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
// ];

// const PILLS = [
//   { icon: <Zap size={13} />, text: "AI-Powered Feedback" },
//   { icon: <Shield size={13} />, text: "Real Interview Format" },
//   { icon: <Code2 size={13} />, text: "Coding Challenges" },
//   { icon: <BarChart2 size={13} />, text: "Performance Report" },
// ];

// const MockInterview = () => {
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);

//   const handleStart = (data) => {
//     setOpen(false);
//     navigate("/mock-interview/interview-prep", { state: data });
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

//         @keyframes float-tag {
//           0%, 100% { transform: translateY(0px); }
//           50%       { transform: translateY(-10px); }
//         }
//         @keyframes spin-slow {
//           from { transform: rotate(0deg); }
//           to   { transform: rotate(360deg); }
//         }
//         @keyframes fade-up {
//           from { opacity: 0; transform: translateY(20px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes pulse-ring {
//           0%   { transform: scale(1);   opacity: 0.35; }
//           100% { transform: scale(1.5); opacity: 0; }
//         }

//         .tag-float { animation: float-tag ease-in-out infinite; }
//         .fade-up   { animation: fade-up 0.6s ease both; }

//         .start-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(99,102,241,0.4) !important; }
//         .start-btn { transition: transform 0.2s, box-shadow 0.2s; }
//       `}</style>

//       <div
//         className="w-screen min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12"
//         style={{ background: "#f8fafc", fontFamily: "'DM Sans', system-ui, sans-serif" }}
//       >
//         <div
//           className="w-full max-w-7xl rounded-3xl overflow-hidden relative"
//           style={{
//             background: "linear-gradient(135deg, #080d1e 0%, #0a0e20 50%, #07080f 100%)",
//             border: "1px solid #e2e8f0",
//             boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
//             minHeight: "76vh",
//           }}
//         >
//           {/* Background glows */}
//           <div style={{
//             position: "absolute", top: -120, left: -80, width: 500, height: 500,
//             background: "radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 65%)",
//             pointerEvents: "none",
//           }} />
//           <div style={{
//             position: "absolute", bottom: -100, right: -80, width: 450, height: 450,
//             background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
//             pointerEvents: "none",
//           }} />

//           {/* Grid texture */}
//           <div style={{
//             position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
//             backgroundImage: "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
//             backgroundSize: "48px 48px",
//           }} />

//           <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-10 md:px-16 py-16 relative z-10 h-full">

//             {/* ── LEFT ── */}
//             <div className="space-y-7 fade-up">
//               {/* Top label */}
//               <div style={{
//                 display: "inline-flex", alignItems: "center", gap: 8,
//                 background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
//                 borderRadius: 100, padding: "5px 14px",
//               }}>
//                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
//                 <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", letterSpacing: "0.1em", textTransform: "uppercase" }}>
//                   AI Mock Interview
//                 </span>
//               </div>

//               {/* Headline */}
//               <h1 style={{
//                 fontSize: "clamp(34px, 4.5vw, 58px)",
//                 fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
//                 color: "#0f172a",
//               }}>
//                 Get Interview‑Ready
//                 <span style={{
//                   display: "block",
//                   background: "linear-gradient(120deg, #818cf8 0%, #a78bfa 60%, #c4b5fd 100%)",
//                   WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
//                 }}>
//                   with AI Practice
//                 </span>
//                 <span style={{ color: "#1e293b" }}>& Feedback</span>
//               </h1>

//               {/* Subtitle */}
//               <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.75, maxWidth: 460 }}>
//                 Simulate real interviews for your target role. Get instant AI feedback,
//                 performance scores, and a downloadable report — so you walk in confident.
//               </p>

//               {/* Feature pills */}
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
//                 {PILLS.map((p, i) => (
//                   <div key={i} style={{
//                     display: "flex", alignItems: "center", gap: 6,
//                     background: "#f1f5f9", border: "1px solid #e2e8f0",
//                     borderRadius: 100, padding: "6px 14px",
//                     fontSize: 12.5, fontWeight: 500, color: "#64748b",
//                   }}>
//                     <span style={{ color: "#818cf8" }}>{p.icon}</span>
//                     {p.text}
//                   </div>
//                 ))}
//               </div>

//               {/* Interview type quick-info */}
//               <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                 {[
//                   { emoji: "💻", label: "Technical", color: "#818cf8" },
//                   { emoji: "⌨️", label: "Coding", color: "#f59e0b" },
//                   { emoji: "🤝", label: "Behavioural", color: "#16a34a" },
//                 ].map((t) => (
//                   <div key={t.label} style={{
//                     display: "flex", alignItems: "center", gap: 6,
//                     background: "#f8fafc",
//                     border: "1px solid #e2e8f0",
//                     borderRadius: 10, padding: "6px 12px",
//                     fontSize: 12, fontWeight: 600, color: t.color,
//                   }}>
//                     <span>{t.emoji}</span> {t.label}
//                   </div>
//                 ))}
//               </div>

//               {/* CTA */}
//               <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
//                 <button
//                   onClick={() => setOpen(true)}
//                   className="start-btn"
//                   style={{
//                     display: "flex", alignItems: "center", gap: 9,
//                     background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
//                     color: "#fff", border: "none", borderRadius: 14,
//                     padding: "14px 28px", fontSize: 15, fontWeight: 700,
//                     cursor: "pointer", letterSpacing: 0.2,
//                     boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
//                   }}
//                 >
//                   Start an Interview
//                   <ArrowRight size={16} />
//                 </button>
//                 <p style={{ fontSize: 12.5, color: "#374151" }}>No signup required to demo</p>
//               </div>
//             </div>

//             {/* ── RIGHT ── */}
//             <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380 }}>

//               {/* Outer ring animations */}
//               <div style={{
//                 position: "absolute",
//                 width: 360, height: 360, borderRadius: "50%",
//                 border: "1px solid rgba(99,102,241,0.12)",
//                 animation: "pulse-ring 3.5s ease-out infinite",
//               }} />
//               <div style={{
//                 position: "absolute",
//                 width: 360, height: 360, borderRadius: "50%",
//                 border: "1px solid rgba(99,102,241,0.08)",
//                 animation: "pulse-ring 3.5s 1.2s ease-out infinite",
//               }} />

//               {/* Decorative orbit ring */}
//               <div style={{
//                 position: "absolute",
//                 width: 400, height: 400, borderRadius: "50%",
//                 border: "1px dashed rgba(99,102,241,0.15)",
//                 animation: "spin-slow 28s linear infinite",
//               }} />

//               {/* Skill tags orbiting */}
//               {TAG_SKILLS.map((tag, i) => {
//                 const angle = (i / TAG_SKILLS.length) * 2 * Math.PI - Math.PI / 2;
//                 const r = 205;
//                 const x = Math.cos(angle) * r;
//                 const y = Math.sin(angle) * r;
//                 return (
//                   <div
//                     key={tag.label}
//                     className="tag-float"
//                     style={{
//                       position: "absolute",
//                       left: `calc(50% + ${x}px)`,
//                       top: `calc(50% + ${y}px)`,
//                       transform: "translate(-50%, -50%)",
//                       animationDuration: `${3.5 + i * 0.4}s`,
//                       animationDelay: `${i * 0.3}s`,
//                     }}
//                   >
//                     <div style={{
//                       background: tag.bg, border: `1px solid ${tag.border}`,
//                       borderRadius: 10, padding: "6px 12px",
//                       fontSize: 12, fontWeight: 700, color: tag.color,
//                       whiteSpace: "nowrap",
//                       backdropFilter: "blur(8px)",
//                       boxShadow: `0 4px 16px ${tag.bg}`,
//                     }}>
//                       {tag.label}
//                     </div>
//                   </div>
//                 );
//               })}

//               {/* Center avatar */}
//               <div style={{
//                 position: "relative", zIndex: 2,
//                 width: 220, height: 220, borderRadius: "50%", overflow: "hidden",
//                 border: "2px solid rgba(99,102,241,0.3)",
//                 boxShadow: "0 0 0 8px rgba(99,102,241,0.06), 0 24px 60px rgba(0,0,0,0.5)",
//                 background: "linear-gradient(145deg, #0f172a, #1e293b)",
//               }}>
//                 <img
//                   src="/image.png"
//                   alt="AI Interviewer"
//                   style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.15) translateY(8px)" }}
//                   onError={(e) => {
//                     e.target.style.display = "none";
//                     e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:64px">🤖</div>';
//                   }}
//                 />
//               </div>

//               {/* Live badge */}
//               <div style={{
//                 position: "absolute", bottom: "calc(50% - 128px)", right: "calc(50% - 138px)",
//                 display: "flex", alignItems: "center", gap: 6,
//                 background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
//                 borderRadius: 100, padding: "5px 12px",
//                 fontSize: 12, fontWeight: 600, color: "#16a34a",
//               }}>
//                 <span style={{
//                   width: 6, height: 6, borderRadius: "50%",
//                   background: "#10b981", display: "inline-block",
//                   boxShadow: "0 0 6px #10b981",
//                   animation: "pulse-ring 1.5s ease-out infinite",
//                 }} />
//                 AI Online
//               </div>
//             </div>
//           </div>
//         </div>

//         <InterviewPrepModal open={open} setOpen={setOpen} onStart={handleStart} />
//       </div>
//     </>
//   );
// };

// export default MockInterview;