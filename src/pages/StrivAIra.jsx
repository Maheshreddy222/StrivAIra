import { useState, useRef, useEffect, useCallback } from "react";
import { sendToStrivAIra } from "./strivaira.service";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

// ─── Starter suggestions ──────────────────────────────────────────────────────
const SUGGESTIONS = [
{ icon: "🧩", text: "How do I crack a system design interview?" },

{ icon: "📋", text: "Review my resume structure" },

{ icon: "📚", text: "Best courses to learn React in 2025?" },

{ icon: "💬", text: "Answer 'Tell me about yourself' using STAR" },

{ icon: "📅", text: "Give me a 30-day interview prep roadmap" },

{ icon: "💼", text: "How do I negotiate a higher salary offer?" },
];

// ─── Lightweight Markdown renderer ───────────────────────────────────────────
function esc(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(raw) {
  if (!raw) return "";
  let t = raw
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const l = lang || "code";
      return `<div class="sa-code-block"><div class="sa-code-hdr"><span class="sa-code-lang">${l}</span><button class="sa-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.sa-code-block').querySelector('code').innerText).then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)})">Copy</button></div><pre><code>${esc(code.trimEnd())}</code></pre></div>`;
    })
    .replace(/`([^`\n]+)`/g, '<code class="sa-ic">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<p class="sa-h3">$1</p>')
    .replace(/^## (.+)$/gm,  '<p class="sa-h2">$1</p>')
    .replace(/^# (.+)$/gm,   '<p class="sa-h1">$1</p>')
    .replace(/^[-•] (.+)$/gm, '<li class="sa-li">$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li class="sa-oli">$1</li>')
    .replace(/^---$/gm, '<hr class="sa-hr">');

  t = t.replace(/((<li class="sa-li">[\s\S]*?<\/li>\n?)+)/g, '<ul class="sa-ul">$1</ul>');
  t = t.replace(/((<li class="sa-oli">[\s\S]*?<\/li>\n?)+)/g, '<ol class="sa-ol">$1</ol>');
  t = t.split(/\n\n+/).map(block => {
    if (/^<(ul|ol|div|p class|hr)/.test(block.trim())) return block;
    return `<p class="sa-p">${block.replace(/\n/g, "<br/>")}</p>`;
  }).join("");
  return t;
}

// ─── Animated Bot SVG Avatar ──────────────────────────────────────────────────
function BotAvatar({ isTyping, isRefusal }) {
  return (
    <div
      className={`bot-avatar-wrap ${isTyping ? "bot-typing" : ""}`}
      style={{
        width: 44, height: 44, flexShrink: 0, position: "relative",
      }}
    >
      <svg
        viewBox="0 0 44 44"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Outer glow ring */}
        <circle
          cx="22" cy="22" r="21"
          fill="none"
          stroke={isRefusal ? "rgba(248,113,113,0.5)" : "rgba(129,140,248,0.45)"}
          strokeWidth="1"
          className="bot-ring"
        />
        {/* Body */}
        <circle
          cx="22" cy="22" r="19"
          fill={isRefusal ? "url(#refusalGrad)" : "url(#botGrad)"}
        />
        <defs>
          <radialGradient id="botGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#312e81"/>
            <stop offset="100%" stopColor="#1e1b4b"/>
          </radialGradient>
          <radialGradient id="refusalGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#4c1d1d"/>
            <stop offset="100%" stopColor="#1a0a0a"/>
          </radialGradient>
        </defs>

        {/* Face — eyes */}
        <circle cx="16" cy="19" r="3" fill="rgba(255,255,255,0.9)" className="bot-eye-l"/>
        <circle cx="28" cy="19" r="3" fill="rgba(255,255,255,0.9)" className="bot-eye-r"/>
        {/* Pupils */}
        <circle cx="17" cy="19.5" r="1.4" fill={isRefusal ? "#f87171" : "#818cf8"} className="bot-pupil-l"/>
        <circle cx="29" cy="19.5" r="1.4" fill={isRefusal ? "#f87171" : "#818cf8"} className="bot-pupil-r"/>

        {/* Mouth — smile when normal, flat when refusal */}
        {isRefusal ? (
          <line x1="16" y1="28" x2="28" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        ) : (
          <path
            d="M16 27 Q22 32 28 27"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="bot-mouth"
          />
        )}

        {/* Antenna */}
        <line x1="22" y1="3" x2="22" y2="8" stroke={isRefusal ? "#f87171" : "#818cf8"} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="22" cy="2.5" r="1.8" fill={isRefusal ? "#f87171" : "#a5b4fc"} className="bot-antenna-dot"/>

        {/* Cheek blush */}
        {!isRefusal && (
          <>
            <ellipse cx="12" cy="25" rx="3" ry="1.8" fill="rgba(251,113,133,0.35)" className="bot-blush"/>
            <ellipse cx="32" cy="25" rx="3" ry="1.8" fill="rgba(251,113,133,0.35)" className="bot-blush"/>
          </>
        )}
      </svg>

      {/* Typing pulse ring */}
      {isTyping && (
        <span
          style={{
            position: "absolute", inset: -4,
            borderRadius: "50%",
            border: "2px solid rgba(129,140,248,0.5)",
            animation: "bot-pulse-ring 1s ease-out infinite",
          }}
        />
      )}
    </div>
  );
}

// ─── Human Avatar ─────────────────────────────────────────────────────────────
function HumanAvatar() {
  return (
    <div style={{ width: 44, height: 44, flexShrink: 0 }}>
      <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <circle cx="22" cy="22" r="21" fill="none" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
        <circle cx="22" cy="22" r="19" fill="url(#humanGrad)"/>
        <defs>
          <radialGradient id="humanGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1e3a5f"/>
            <stop offset="100%" stopColor="#0f2547"/>
          </radialGradient>
        </defs>
        {/* Head */}
        <circle cx="22" cy="17" r="7" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
        {/* Face */}
        <circle cx="22" cy="16" r="5" fill="rgba(254,215,170,0.85)"/>
        {/* Eyes */}
        <circle cx="20" cy="15" r="0.9" fill="#1e293b"/>
        <circle cx="24" cy="15" r="0.9" fill="#1e293b"/>
        {/* Smile */}
        <path d="M20 17.5 Q22 19 24 17.5" fill="none" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round"/>
        {/* Shoulders / body */}
        <ellipse cx="22" cy="32" rx="10" ry="7" fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.25)" strokeWidth="0.5"/>
        {/* Collar */}
        <path d="M18 26 L22 30 L26 26" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
      </svg>
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "6px 2px" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#818cf8",
          animation: `sa-bounce 1.2s ease-in-out ${i*0.18}s infinite`,
        }}/>
      ))}
    </div>
  );
}

// ─── Out-of-scope refusal bubble ──────────────────────────────────────────────
function RefusalBubble({ message }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.07)",
      border: "0.5px solid rgba(239,68,68,0.25)",
      borderRadius: "4px 18px 18px 18px",
      padding: "14px 18px",
      maxWidth: "80%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#dc2626",
          textTransform: "uppercase", letterSpacing: "0.08em",
          background: "rgba(239,68,68,0.12)", border: "0.5px solid rgba(239,68,68,0.25)",
          borderRadius: 6, padding: "2px 8px",
        }}>
          Out of scope
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 13.5, color: "#b91c1c", lineHeight: 1.65 }}>{message}</p>
      <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
        I can help with <span style={{ color: "#818cf8" }}>interview prep</span>,{" "}
        <span style={{ color: "#818cf8" }}>resume tips</span>,{" "}
        <span style={{ color: "#818cf8" }}>course recommendations</span>, and{" "}
        <span style={{ color: "#818cf8" }}>career guidance</span>. Try one of those!
      </p>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isLatest }) {
  const isBot = msg.role === "assistant";

  return (
    <div style={{
      display: "flex",
      flexDirection: isBot ? "row" : "row-reverse",
      alignItems: "flex-start",
      gap: 12,
      animation: isLatest ? "sa-msg-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
    }}>
      {/* Avatar */}
      {isBot
        ? <BotAvatar isRefusal={msg.isRefusal}/>
        : <HumanAvatar/>
      }

      {/* Content */}
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4,
        alignItems: isBot ? "flex-start" : "flex-end" }}>

        {/* Name label */}
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: isBot ? "#6366f1" : "#2563eb",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {isBot ? "StrivAIra" : "You"}
        </span>

        {/* Bubble */}
        {isBot && msg.isRefusal ? (
          <RefusalBubble message={msg.content}/>
        ) : isBot ? (
          <div style={{
            background: "#f1f5f9",
            border: "0.5px solid #e2e8f0",
            borderRadius: "4px 18px 18px 18px",
            padding: "14px 18px",
            fontSize: 14, lineHeight: 1.7, color: "#1e293b",
          }}>
            <div className="sa-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}/>
          </div>
        ) : (
          <div style={{
            background: "rgba(99,102,241,0.15)",
            border: "0.5px solid rgba(99,102,241,0.3)",
            borderRadius: "18px 4px 18px 18px",
            padding: "12px 16px",
            fontSize: 14, lineHeight: 1.65, color: "#1e293b",
          }}>
            <p style={{ margin: 0 }}>{msg.content}</p>
          </div>
        )}

        {/* Timestamp */}
        <span style={{ fontSize: 10.5, color: "#1e293b" }}>{msg.time}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StrivAIra() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showSugg, setShowSugg]   = useState(true);
  const [charCount, setCharCount] = useState(0);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const MAX       = 800;

  const ts = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Welcome message
  useEffect(() => {
    setTimeout(() => {
      setMessages([{
        role: "assistant", isRefusal: false, time: ts(), id: "welcome",
        content: "Hey! I'm **StrivAIra** ✦ — your dedicated career & interview coach inside PrepWise.\n\nI'm here to help you with:\n- **Interview preparation** (technical, behavioural, system design)\n- **Resume & cover letter** building and review\n- **Course recommendations** for any tech skill\n- **Career guidance** — roadmaps, salary negotiation, transitions\n\nWhat are we working on today?",
      }]);
    }, 350);
  }, []);

  const send = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    setInput(""); setCharCount(0); setShowSugg(false);
    const userMsg = { role: "user", content: q, time: ts(), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

    try {
      const { isRefusal, message } = await sendToStrivAIra(history, GROQ_API_KEY);
      setMessages(prev => [...prev, {
        role: "assistant", isRefusal, content: message,
        time: ts(), id: Date.now() + 1,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant", isRefusal: false, time: ts(), id: Date.now() + 1,
        content: `⚠️ Connection error: ${err.message}. Check your **VITE_GROQ_API_KEY** in \`.env\`.`,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [input, loading, messages]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([]); setShowSugg(true);
    setTimeout(() => setMessages([{
      role: "assistant", isRefusal: false, time: ts(), id: "reset",
      content: "Chat cleared! Ready to help again. What would you like to work on? ✦",
    }]), 150);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

        @keyframes sa-bounce {
          0%,60%,100% { transform: translateY(0); opacity:.4; }
          30%          { transform: translateY(-7px); opacity:1; }
        }
        @keyframes sa-msg-in {
          from { opacity:0; transform:translateY(14px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes bot-float {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes bot-giggle {
          0%,100% { transform: rotate(0deg) scale(1); }
          20%      { transform: rotate(-6deg) scale(1.05); }
          40%      { transform: rotate(6deg) scale(1.05); }
          60%      { transform: rotate(-4deg) scale(1.02); }
          80%      { transform: rotate(3deg) scale(1.02); }
        }
        @keyframes bot-pulse-ring {
          0%   { transform:scale(1); opacity:.8; }
          100% { transform:scale(1.55); opacity:0; }
        }
        @keyframes bot-eye-blink {
          0%,90%,100% { scaleY:1; }
          95%          { scaleY:0.1; }
        }
        @keyframes antenna-glow {
          0%,100% { r:1.8; opacity:.9; }
          50%      { r:2.8; opacity:1; }
        }
        @keyframes bot-ring-spin {
          from { stroke-dashoffset: 130; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes suggestion-pop {
          from { opacity:0; transform:scale(0.9) translateY(6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 14px rgba(99,102,241,0.25); }
          50%      { box-shadow: 0 0 28px rgba(99,102,241,0.5); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .sa-root * { box-sizing:border-box; }

        .bot-avatar-wrap { animation: bot-float 3.5s ease-in-out infinite; }
        .bot-typing      { animation: bot-giggle 0.6s ease-in-out infinite !important; }
        .bot-ring        { stroke-dasharray: 130; animation: bot-ring-spin 3s linear infinite; }
        .bot-antenna-dot { animation: antenna-glow 1.8s ease-in-out infinite; }
        .bot-blush       { animation: bot-float 2.2s ease-in-out infinite; }

        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }

        /* Markdown */
        .sa-md .sa-p  { margin:0 0 9px; }
        .sa-md .sa-p:last-child { margin-bottom:0; }
        .sa-md .sa-h1 { font-size:16px; font-weight:700; color:#f1f5f9; margin:14px 0 5px; }
        .sa-md .sa-h2 { font-size:14.5px; font-weight:700; color:#1e293b; margin:11px 0 4px; }
        .sa-md .sa-h3 { font-size:13.5px; font-weight:600; color:#cbd5e1; margin:9px 0 3px; }
        .sa-md .sa-ul { margin:5px 0 9px; padding-left:18px; }
        .sa-md .sa-ol { margin:5px 0 9px; padding-left:18px; }
        .sa-md .sa-li { margin-bottom:4px; line-height:1.65; }
        .sa-md .sa-oli{ margin-bottom:4px; line-height:1.65; }
        .sa-md .sa-hr { border:none; border-top:0.5px solid #e2e8f0; margin:10px 0; }
        .sa-md .sa-ic {
          background:rgba(99,102,241,0.14); border:0.5px solid rgba(99,102,241,0.25);
          border-radius:5px; padding:1px 6px; font-size:12.5px;
          font-family:'JetBrains Mono','Fira Code',monospace; color:#4338ca;
        }
        .sa-md strong { color:#1e293b; font-weight:600; }
        .sa-md em     { color:#94a3b8; font-style:italic; }

        .sa-code-block {
          background:#0d1117; border:0.5px solid #30363d;
          border-radius:12px; margin:10px 0; overflow:hidden;
        }
        .sa-code-hdr {
          display:flex; justify-content:space-between; align-items:center;
          padding:7px 14px; background:#161b22;
          border-bottom:0.5px solid #30363d;
        }
        .sa-code-lang { font-size:10.5px; font-weight:700; color:#6366f1; text-transform:uppercase; letter-spacing:.06em; }
        .sa-copy-btn  {
          font-size:11px; color:#475569; background:none;
          border:0.5px solid #cbd5e1; border-radius:6px;
          padding:2px 9px; cursor:pointer; font-family:inherit; transition:color .15s, border-color .15s;
        }
        .sa-copy-btn:hover { color:#4338ca; border-color:rgba(99,102,241,0.4); }
        .sa-code-block pre  { margin:0; padding:13px 16px; overflow-x:auto; }
        .sa-code-block code {
          font-family:'JetBrains Mono','Fira Code',monospace;
          font-size:12.5px; line-height:1.72; color:#e2e8f0;
        }

        .sugg-chip:hover {
          background:rgba(99,102,241,0.14) !important;
          border-color:rgba(99,102,241,0.38) !important;
          color:#4338ca !important;
          transform:translateY(-2px) !important;
        }
        .sugg-chip { transition:all .18s; }

        .send-btn:hover:not(:disabled) {
          transform:scale(1.07);
          box-shadow:0 8px 26px rgba(99,102,241,0.5) !important;
        }
        .send-btn { transition:all .18s; }

        .clr-btn:hover { background:rgba(239,68,68,0.1) !important; border-color:rgba(239,68,68,0.3) !important; color:#b91c1c !important; }
        .clr-btn { transition:all .18s; }
      `}</style>

      <div className="sa-root" style={{
        minHeight: "calc(100vh - 80px)",
        background: "#f8fafc",
        fontFamily: "'Sora', system-ui, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "24px 16px",
      }}>
        <div style={{
          width: "100%", maxWidth: 820,
          display: "flex", flexDirection: "column",
          height: "calc(100vh - 130px)",
          animation: "fade-up 0.45s ease both",
        }}>

          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 18, flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Logo — uses BotAvatar in a bigger form */}
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                animation: "glow-pulse 3s ease-in-out infinite, bot-float 3.5s ease-in-out infinite",
              }}>
                <BotAvatar isRefusal={false}/>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 2 }}>
                  <h1 style={{
                    fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em",
                    background: "linear-gradient(110deg, #a5b4fc 0%, #818cf8 45%, #c4b5fd 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>StrivAIra</h1>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "rgba(34,197,94,0.09)", border: "0.5px solid rgba(34,197,94,0.22)",
                    borderRadius: 100, padding: "2px 9px",
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
                      boxShadow: "0 0 6px #22c55e",
                      animation: "sa-bounce 1.8s ease-in-out infinite",
                    }}/>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4ade80" }}>Online</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>
                  Career · Interviews · Resume · Courses
                </p>
              </div>
            </div>

            <button onClick={clearChat} className="clr-btn" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#f8fafc", border: "0.5px solid #e2e8f0",
              borderRadius: 10, padding: "7px 14px",
              fontSize: 12, fontWeight: 500, color: "#334155",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
              </svg>
              Clear
            </button>
          </div>

          {/* ── Chat scroll area ── */}
          <div className="chat-scroll" style={{
            flex: 1, overflowY: "auto",
            background: "#f8fafc",
            border: "0.5px solid #e2e8f0",
            borderRadius: 22, padding: "22px 20px 12px",
            display: "flex", flexDirection: "column", gap: 20,
            marginBottom: 12,
          }}>

            {messages.map((msg, i) => (
              <MessageBubble key={msg.id || i} msg={msg} isLatest={i === messages.length - 1}/>
            ))}

            {/* Typing state */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <BotAvatar isTyping={true} isRefusal={false}/>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.06em", textTransform: "uppercase" }}>StrivAIra</span>
                  <div style={{
                    background: "#f1f5f9", border: "0.5px solid #e2e8f0",
                    borderRadius: "4px 18px 18px 18px", padding: "10px 18px",
                  }}>
                    <TypingDots/>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSugg && messages.length <= 1 && !loading && (
              <div style={{ paddingTop: 4 }}>
                <p style={{
                  fontSize: 11, color: "#1e293b", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px",
                }}>Try asking</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={s.text} className="sugg-chip" onClick={() => send(s.text)} style={{
                      background: "#f8fafc", border: "0.5px solid #e2e8f0",
                      borderRadius: 11, padding: "7px 13px",
                      fontSize: 12.5, color: "#475569", cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 6,
                      animation: `suggestion-pop 0.35s ${i * 0.06}s ease both`,
                    }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* ── Input bar ── */}
          <div style={{
            background: "#f8fafc",
            border: "0.5px solid #cbd5e1",
            borderRadius: 18, padding: "4px 6px 4px 16px",
            display: "flex", alignItems: "flex-end", gap: 10,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              placeholder="Ask about interviews, resume tips, courses, career paths…"
              onChange={e => {
                if (e.target.value.length <= MAX) {
                  setInput(e.target.value);
                  setCharCount(e.target.value.length);
                }
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
              }}
              onKeyDown={handleKey}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                resize: "none", fontSize: 13.5, color: "#1e293b",
                fontFamily: "inherit", lineHeight: 1.65, padding: "11px 0",
                maxHeight: 130, overflowY: "auto", caretColor: "#818cf8",
              }}
            />

            <div style={{
              display: "flex", flexDirection: "column", alignItems: "flex-end",
              gap: 4, paddingBottom: 6, flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, color: charCount > MAX * 0.85 ? "#f59e0b" : "#1e293b" }}>
                {charCount}/{MAX}
              </span>
              <button onClick={() => send()} disabled={!input.trim() || loading} className="send-btn" style={{
                width: 40, height: 40, borderRadius: "50%",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                  : "#e2e8f0",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: input.trim() && !loading ? "0 4px 18px rgba(99,102,241,0.35)" : "none",
                flexShrink: 0,
              }}>
                {loading
                  ? <span style={{
                      width: 15, height: 15, border: "2px solid #cbd5e1",
                      borderTopColor: "#4338ca", borderRadius: "50%",
                      display: "inline-block", animation: "spin .7s linear infinite",
                    }}/>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke={input.trim() ? "#fff" : "#1e293b"}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                }
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#1e293b", margin: "7px 0 0" }}>
            Enter to send · Shift+Enter for new line · Only career &amp; education topics answered
          </p>
        </div>
      </div>
    </>
  );
}