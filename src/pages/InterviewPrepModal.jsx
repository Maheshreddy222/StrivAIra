import { X, Mic, Briefcase, Clock, ChevronDown, Gauge } from "lucide-react";
import { useState } from "react";

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
];

const DURATIONS = ["10", "15", "20", "25", "30", "40", "45"];

const LEVELS = [
  {
    value: "Beginner",
    emoji: "🌱",
    desc: "Basic concepts & fundamentals",
    color: "#16a34a",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.35)",
    activeShadow: "rgba(52,211,153,0.2)",
  },
  {
    value: "Intermediate",
    emoji: "⚡",
    desc: "Real-world problem solving",
    color: "#2563eb",
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.35)",
    activeShadow: "rgba(96,165,250,0.2)",
  },
  {
    value: "Hard",
    emoji: "🔥",
    desc: "Complex scenarios & edge cases",
    color: "#b45309",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
    activeShadow: "rgba(245,158,11,0.2)",
  },
  {
    value: "Advanced",
    emoji: "💎",
    desc: "Expert-level deep dives",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
    activeShadow: "rgba(167,139,250,0.2)",
  },
];

const SelectField = ({ icon: Icon, label, value, onChange, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
      {label}
    </p>
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
        <Icon size={15} />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-slate-900/80 text-white pl-9 pr-9 py-3 rounded-xl
                   border border-slate-700/60 focus:border-indigo-500/70 focus:ring-2
                   focus:ring-indigo-500/20 outline-none transition-all text-sm cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
    </div>
  </div>
);

const TypeButton = ({ label, emoji, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: "#ffffff",
      color: active ? "#4338ca" : "#334155",
      border: `1px solid ${active ? "#6366f1" : "#cbd5e1"}`,
    }}
    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
  >
    <span className="mr-2">{emoji}</span>
    {label}
  </button>
);

const LevelCard = ({ level, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: "1 1 calc(50% - 6px)",
      minWidth: 0,
      padding: "10px 12px",
      borderRadius: 14,
      border: `1px solid ${active ? level.border : "#e5e7eb"}`,
      background: active ? level.bg : "#f8fafc",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.2s",
      boxShadow: active ? `0 0 18px ${level.activeShadow}` : "none",
    }}
  >
    <div style={{ fontSize: 18, marginBottom: 3 }}>{level.emoji}</div>
    <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? level.color : "#64748b" }}>
      {level.value}
    </div>
    <div style={{ fontSize: 10.5, color: active ? level.color + "aa" : "#475569", marginTop: 1 }}>
      {level.desc}
    </div>
  </button>
);

const InterviewPrepModal = ({ open, setOpen, onStart }) => {
  const [interviewType, setInterviewType] = useState("Technical");
  const [role, setRole] = useState("");
  const [duration, setDuration] = useState("10");
  const [level, setLevel] = useState("Intermediate");

  if (!open) return null;

  const canStart = role !== "";

  return (
    <>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-enter { animation: modal-in 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <div className="fixed inset-0 z-[999] flex items-center justify-center px-4"
           style={{ background: "rgba(2,4,12,0.82)", backdropFilter: "blur(10px)" }}>

        <div className="modal-enter w-full max-w-md relative"
             style={{
               background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
               border: "1px solid #1e293b",
               borderRadius: 24,
               boxShadow: "0 32px 80px rgba(15,23,42,0.18), 0 0 0 1px rgba(99,102,241,0.1)",
               padding: "32px 28px",
               maxHeight: "90vh",
               overflowY: "auto",
             }}>

          {/* Glow accent */}
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 240, height: 120,
            background: "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Close */}
          <button
  onClick={() => setOpen(false)}
  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
             rounded-full !bg-white !border !border-slate-200
             !text-slate-500 hover:!text-slate-900 hover:!bg-slate-100
             transition-all"
>
  <X size={18} strokeWidth={2.5} />
</button>

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30
                              flex items-center justify-center">
                <Mic size={15} className="text-indigo-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                PrepWise
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              Configure your Interview
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Tailor your mock session to match your target role.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-800 mb-7" />

          <div className="space-y-6">
            {/* Interview Type */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                Interview Type
              </p>
              <div className="flex gap-3">
                <TypeButton label="Technical"  active={interviewType === "Technical"} onClick={() => setInterviewType("Technical")} />
                <TypeButton label="Behavioural / HR"  active={interviewType === "Behavioural/HR"} onClick={() => setInterviewType("Behavioural/HR")} />
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3"
                 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Gauge size={12} style={{ display: "inline" }} />
                Difficulty Level
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LEVELS.map((l) => (
                  <LevelCard
                    key={l.value}
                    level={l}
                    active={level === l.value}
                    onClick={() => setLevel(l.value)}
                  />
                ))}
              </div>
            </div>

            {/* Role */}
            <SelectField icon={Briefcase} label="Target Role" value={role} onChange={setRole}>
              <option value="" disabled>Select your role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </SelectField>

            {/* Duration */}
            <SelectField icon={Clock} label="Session Duration" value={duration} onChange={setDuration}>
              {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
            </SelectField>

            {/* Summary chip */}
            {role && (
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/40
                              rounded-xl px-4 py-3 text-xs text-slate-400">
                <span className="text-slate-600">●</span>
                <span>
                  <span className="text-slate-300 font-medium">{interviewType}</span>
                  {" · "}<span className="text-slate-300 font-medium">{role}</span>
                  {" · "}<span className="text-slate-300 font-medium">{level}</span>
                  {" · "}<span className="text-slate-300 font-medium">{duration} min</span>
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => canStart && onStart({ interviewType, role, duration, level })}
              disabled={!canStart}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
              style={{
                background: canStart
                  ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
                  : "#e5e7eb",
                color: canStart ? "#fff" : "#475569",
                border: canStart ? "none" : "1px solid #e2e8f0",
                boxShadow: canStart ? "0 8px 24px rgba(99,102,241,0.35)" : "none",
                cursor: canStart ? "pointer" : "not-allowed",
              }}
            >
              {canStart ? "🚀 Start Interview" : "Select a role to continue"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewPrepModal;


// import { X, Mic, Briefcase, Clock, ChevronDown, Gauge } from "lucide-react";
// import { useState } from "react";

// const ROLES = [
//   "Software Engineer",
//   "Frontend Developer",
//   "Backend Developer",
//   "Full Stack Developer",
//   "Data Analyst",
// ];

// // Coding interviews are DSA-only
// const CODING_ROLES = ["DSA (Data Structures & Algorithms)"];

// const DURATIONS = ["10", "15", "20", "25", "30", "40", "45"];

// const LEVELS = [
//   {
//     value: "Beginner",
//     emoji: "🌱",
//     desc: "Basic concepts & fundamentals",
//     color: "#16a34a",
//     bg: "rgba(52,211,153,0.12)",
//     border: "rgba(52,211,153,0.35)",
//     activeShadow: "rgba(52,211,153,0.2)",
//   },
//   {
//     value: "Intermediate",
//     emoji: "⚡",
//     desc: "Real-world problem solving",
//     color: "#2563eb",
//     bg: "rgba(96,165,250,0.12)",
//     border: "rgba(96,165,250,0.35)",
//     activeShadow: "rgba(96,165,250,0.2)",
//   },
//   {
//     value: "Hard",
//     emoji: "🔥",
//     desc: "Complex scenarios & edge cases",
//     color: "#b45309",
//     bg: "rgba(245,158,11,0.12)",
//     border: "rgba(245,158,11,0.35)",
//     activeShadow: "rgba(245,158,11,0.2)",
//   },
//   {
//     value: "Advanced",
//     emoji: "💎",
//     desc: "Expert-level deep dives",
//     color: "#a78bfa",
//     bg: "rgba(167,139,250,0.12)",
//     border: "rgba(167,139,250,0.35)",
//     activeShadow: "rgba(167,139,250,0.2)",
//   },
// ];

// const INTERVIEW_TYPES = [
//   {
//     value: "Technical",
//     emoji: "💻",
//     desc: "System design, concepts, debugging",
//     color: "#818cf8",
//     bg: "rgba(99,102,241,0.1)",
//     border: "rgba(99,102,241,0.35)",
//     activeShadow: "rgba(99,102,241,0.15)",
//   },
//   {
//     value: "Coding",
//     emoji: "⌨️",
//     desc: "LeetCode-style DSA problems",
//     color: "#b45309",
//     bg: "rgba(245,158,11,0.1)",
//     border: "rgba(245,158,11,0.35)",
//     activeShadow: "rgba(245,158,11,0.15)",
//   },
//   {
//     value: "Behavioural/HR",
//     emoji: "🤝",
//     desc: "Situational & soft-skill questions",
//     color: "#16a34a",
//     bg: "rgba(52,211,153,0.1)",
//     border: "rgba(52,211,153,0.35)",
//     activeShadow: "rgba(52,211,153,0.15)",
//   },
// ];

// const CODING_LANGUAGES = [
//   { value: "cpp",    label: "C++",    emoji: "⚙️" },
//   { value: "python", label: "Python", emoji: "🐍" },
//   { value: "java",   label: "Java",   emoji: "☕" },
// ];

// /* ─── small helpers ─── */
// const SelectField = ({ icon: Icon, label, value, onChange, children }) => (
//   <div>
//     <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#475569", marginBottom: 8 }}>
//       {label}
//     </p>
//     <div style={{ position: "relative" }}>
//       <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}>
//         <Icon size={15} />
//       </div>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         style={{
//           width: "100%", appearance: "none",
//           background: "rgba(15,23,42,0.8)", color: "#0f172a",
//           paddingLeft: 38, paddingRight: 36, paddingTop: 12, paddingBottom: 12,
//           borderRadius: 12, border: "1px solid #e2e8f0",
//           outline: "none", fontSize: 13.5, cursor: "pointer",
//           transition: "border-color 0.2s",
//         }}
//         onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; }}
//         onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; }}
//       >
//         {children}
//       </select>
//       <ChevronDown size={13} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }} />
//     </div>
//   </div>
// );

// const TypeCard = ({ type, active, onClick }) => (
//   <button
//     onClick={onClick}
//     style={{
//       flex: "1 1 calc(33.33% - 8px)", minWidth: 0,
//       padding: "14px 12px", borderRadius: 16,
//       border: `1px solid ${active ? type.border : "#e5e7eb"}`,
//       background: active ? type.bg : "#f8fafc",
//       cursor: "pointer", textAlign: "left", transition: "all 0.2s",
//       boxShadow: active ? `0 0 20px ${type.activeShadow}` : "none",
//     }}
//   >
//     <div style={{ fontSize: 22, marginBottom: 6 }}>{type.emoji}</div>
//     <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, marginBottom: 4, color: active ? type.color : "#64748b" }}>
//       {type.value}
//     </div>
//     <div style={{ fontSize: 10.5, lineHeight: 1.5, color: active ? type.color + "99" : "#374151" }}>
//       {type.desc}
//     </div>
//   </button>
// );

// const LevelCard = ({ level, active, onClick }) => (
//   <button
//     onClick={onClick}
//     style={{
//       flex: "1 1 calc(50% - 6px)", minWidth: 0,
//       padding: "12px 14px", borderRadius: 14,
//       border: `1px solid ${active ? level.border : "#e5e7eb"}`,
//       background: active ? level.bg : "#f8fafc",
//       cursor: "pointer", textAlign: "left", transition: "all 0.2s",
//       boxShadow: active ? `0 0 20px ${level.activeShadow}` : "none",
//     }}
//   >
//     <div style={{ fontSize: 20, marginBottom: 4 }}>{level.emoji}</div>
//     <div style={{ fontSize: 13, fontWeight: 700, color: active ? level.color : "#64748b" }}>{level.value}</div>
//     <div style={{ fontSize: 11, color: active ? level.color + "aa" : "#475569", marginTop: 2 }}>{level.desc}</div>
//   </button>
// );

// const LangButton = ({ lang, active, onClick }) => (
//   <button
//     onClick={onClick}
//     style={{
//       flex: "1 1 0", padding: "11px 8px",
//       borderRadius: 12,
//       border: `1px solid ${active ? "rgba(245,158,11,0.5)" : "#e5e7eb"}`,
//       background: active ? "rgba(245,158,11,0.12)" : "#f8fafc",
//       cursor: "pointer", textAlign: "center", transition: "all 0.2s",
//       boxShadow: active ? "0 0 16px rgba(245,158,11,0.2)" : "none",
//     }}
//   >
//     <div style={{ fontSize: 18, marginBottom: 3 }}>{lang.emoji}</div>
//     <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? "#b45309" : "#64748b" }}>{lang.label}</div>
//   </button>
// );

// /* ─────────────────────────────────────────────
//    MAIN MODAL
// ───────────────────────────────────────────── */
// const InterviewPrepModal = ({ open, setOpen, onStart }) => {
//   const [interviewType, setInterviewType] = useState("Technical");
//   const [role, setRole]                   = useState("");
//   const [duration, setDuration]           = useState("10");
//   const [level, setLevel]                 = useState("Intermediate");
//   const [codingLang, setCodingLang]       = useState("cpp");

//   if (!open) return null;

//   const isCoding   = interviewType === "Coding";
//   const availableRoles = isCoding ? CODING_ROLES : ROLES;
//   const canStart   = role !== "";
//   const activeType = INTERVIEW_TYPES.find((t) => t.value === interviewType);

//   const handleTypeChange = (val) => {
//     setInterviewType(val);
//     setRole("");
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes modal-in {
//           from { opacity: 0; transform: translateY(20px) scale(0.96); }
//           to   { opacity: 1; transform: translateY(0)    scale(1); }
//         }
//         .modal-enter { animation: modal-in 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards; }

//         .prep-scroll::-webkit-scrollbar { width: 5px; }
//         .prep-scroll::-webkit-scrollbar-track { background: transparent; }
//         .prep-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }
//       `}</style>

//       <div
//         style={{
//           position: "fixed", inset: 0, zIndex: 999,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           padding: "16px",
//           background: "rgba(2,4,12,0.85)", backdropFilter: "blur(12px)",
//         }}
//       >
//         <div
//           className="modal-enter prep-scroll"
//           style={{
//             width: "100%",
//             maxWidth: 620,           /* ← wider modal */
//             maxHeight: "92vh",
//             overflowY: "auto",
//             position: "relative",
//             background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
//             border: "1px solid #e2e8f0",
//             borderRadius: 28,
//             boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.1)",
//             padding: "40px 36px",   /* ← more breathing room */
//           }}
//         >
//           {/* Glow accent */}
//           <div style={{
//             position: "absolute", top: -70, left: "50%", transform: "translateX(-50%)",
//             width: 300, height: 140,
//             background: `radial-gradient(ellipse, ${activeType?.bg ?? "rgba(99,102,241,0.22)"} 0%, transparent 70%)`,
//             pointerEvents: "none", transition: "background 0.4s",
//           }} />

//           {/* Close */}
//           <button
//             onClick={() => setOpen(false)}
//             style={{
//               position: "absolute", top: 18, right: 18,
//               width: 34, height: 34, borderRadius: "50%",
//               background: "#f1f5f9", border: "1px solid #cbd5e1",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               cursor: "pointer", color: "#64748b", transition: "all 0.2s",
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.background = "#cbd5e1"; e.currentTarget.style.color = "#0f172a"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
//           >
//             <X size={15} />
//           </button>

//           {/* Header */}
//           <div style={{ marginBottom: 28 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
//               <div style={{
//                 width: 36, height: 36, borderRadius: 12,
//                 background: activeType?.bg ?? "rgba(99,102,241,0.18)",
//                 border: `1px solid ${activeType?.border ?? "rgba(99,102,241,0.3)"}`,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 transition: "all 0.3s",
//               }}>
//                 <Mic size={16} style={{ color: activeType?.color ?? "#818cf8" }} />
//               </div>
//               <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: activeType?.color ?? "#4338ca", transition: "color 0.3s" }}>
//                 PrepWise
//               </span>
//             </div>
//             <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
//               Configure your Interview
//             </h2>
//             <p style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>
//               Tailor your mock session to match your target role.
//             </p>
//           </div>

//           <div style={{ width: "100%", height: 1, background: "#e5e7eb", marginBottom: 28 }} />

//           <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>

//             {/* ── Interview Type ── */}
//             <div>
//               <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#475569", marginBottom: 12 }}>
//                 Interview Type
//               </p>
//               <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                 {INTERVIEW_TYPES.map((t) => (
//                   <TypeCard key={t.value} type={t} active={interviewType === t.value} onClick={() => handleTypeChange(t.value)} />
//                 ))}
//               </div>

//               {isCoding && (
//                 <div style={{
//                   marginTop: 12,
//                   display: "flex", alignItems: "flex-start", gap: 10,
//                   background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
//                   borderRadius: 12, padding: "10px 14px",
//                   fontSize: 12, color: "#d97706", lineHeight: 1.6,
//                 }}>
//                   <span style={{ fontSize: 15, flexShrink: 0 }}>⌨️</span>
//                   <span>
//                     A <strong>code editor</strong> opens for each DSA problem. Write your solution and click{" "}
//                     <strong>Submit Code</strong> — the AI evaluates it and moves to the next question.
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* ── Coding Language (only for Coding type) ── */}
//             {isCoding && (
//               <div>
//                 <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#475569", marginBottom: 12 }}>
//                   Preferred Language
//                 </p>
//                 <div style={{ display: "flex", gap: 10 }}>
//                   {CODING_LANGUAGES.map((l) => (
//                     <LangButton key={l.value} lang={l} active={codingLang === l.value} onClick={() => setCodingLang(l.value)} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* ── Difficulty ── */}
//             <div>
//               <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#475569", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
//                 <Gauge size={12} /> Difficulty Level
//               </p>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
//                 {LEVELS.map((l) => (
//                   <LevelCard key={l.value} level={l} active={level === l.value} onClick={() => setLevel(l.value)} />
//                 ))}
//               </div>
//             </div>

//             {/* ── Role ── */}
//             <SelectField icon={Briefcase} label="Target Role" value={role} onChange={setRole}>
//               <option value="" disabled>Select your role…</option>
//               {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
//             </SelectField>

//             {/* ── Duration ── */}
//             <SelectField icon={Clock} label="Session Duration" value={duration} onChange={setDuration}>
//               {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
//             </SelectField>

//             {/* Summary chip */}
//             {role && (
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 8,
//                 background: "#f8fafc",
//                 border: `1px solid ${activeType?.border ?? "#e2e8f0"}`,
//                 borderRadius: 12, padding: "10px 16px",
//                 fontSize: 12.5, color: "#64748b",
//                 transition: "border-color 0.3s",
//               }}>
//                 <span style={{ color: activeType?.color ?? "#818cf8", fontSize: 8 }}>●</span>
//                 <span>
//                   <span style={{ color: "#1e293b", fontWeight: 600 }}>{interviewType}</span>
//                   {isCoding && <><span style={{ color: "#334155" }}>{" · "}</span><span style={{ color: "#1e293b", fontWeight: 600 }}>{CODING_LANGUAGES.find(l => l.value === codingLang)?.label}</span></>}
//                   <span style={{ color: "#334155" }}>{" · "}</span>
//                   <span style={{ color: "#1e293b", fontWeight: 600 }}>{role}</span>
//                   <span style={{ color: "#334155" }}>{" · "}</span>
//                   <span style={{ color: "#1e293b", fontWeight: 600 }}>{level}</span>
//                   <span style={{ color: "#334155" }}>{" · "}</span>
//                   <span style={{ color: "#1e293b", fontWeight: 600 }}>{duration} min</span>
//                 </span>
//               </div>
//             )}

//             {/* CTA */}
//             <button
//               onClick={() => canStart && onStart({ interviewType, role, duration, level, codingLang })}
//               disabled={!canStart}
//               style={{
//                 width: "100%", padding: "15px",
//                 borderRadius: 14, fontWeight: 800, fontSize: 14.5,
//                 letterSpacing: "0.02em", cursor: canStart ? "pointer" : "not-allowed",
//                 border: canStart ? "none" : "1px solid #e2e8f0",
//                 background: canStart
//                   ? isCoding
//                     ? "linear-gradient(135deg, #b45309 0%, #b45309 100%)"
//                     : interviewType === "Behavioural/HR"
//                     ? "linear-gradient(135deg, #059669 0%, #16a34a 100%)"
//                     : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
//                   : "#f1f5f9",
//                 color: canStart ? "#fff" : "#334155",
//                 boxShadow: canStart
//                   ? isCoding
//                     ? "0 10px 28px rgba(245,158,11,0.35)"
//                     : interviewType === "Behavioural/HR"
//                     ? "0 10px 28px rgba(52,211,153,0.3)"
//                     : "0 10px 28px rgba(99,102,241,0.4)"
//                   : "none",
//                 transition: "all 0.25s",
//               }}
//               onMouseEnter={(e) => { if (canStart) e.currentTarget.style.transform = "translateY(-2px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
//             >
//               {canStart
//                 ? isCoding
//                   ? `⌨️ Start Coding Interview · ${CODING_LANGUAGES.find(l => l.value === codingLang)?.label}`
//                   : interviewType === "Behavioural/HR"
//                   ? "🤝 Start Behavioural Interview"
//                   : "🚀 Start Technical Interview"
//                 : "Select a role to continue"}
//             </button>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default InterviewPrepModal;