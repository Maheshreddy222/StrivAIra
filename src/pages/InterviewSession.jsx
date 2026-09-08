import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { Mic, MicOff, Send, LogOut, Volume2 } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

// Used only if the backend can't be reached — keeps the interview usable
// instead of dead-ending on an error message.
const FALLBACK_OPENERS = [
  "Tell me about yourself and walk me through your most recent project.",
  "What made you interested in this role, and what do you think you'd bring to it?",
  "Describe a challenging problem you solved recently and how you approached it.",
];
const FALLBACK_FOLLOWUPS = [
  "What's a mistake you made in a past project, and what did you learn from it?",
  "How do you prioritize when you have multiple things competing for your time?",
  "Tell me about a time you had to learn something new quickly for work.",
  "What's a piece of feedback you received that changed how you work?",
  "Describe how you'd approach a task you'd never done before.",
  "What do you do when you disagree with a teammate's approach?",
];
const pickFallback = (pool, exclude) => {
  const options = pool.filter((q) => !exclude.includes(q));
  const from = options.length ? options : pool;
  return from[Math.floor(Math.random() * from.length)];
};

/* ─────────────────────────────────────────────
   ANIMATED ROBOT SVG COMPONENT
   isSpeaking = true  → mouth animates, sound waves pulse
   isSpeaking = false → idle (blinking eyes only)
───────────────────────────────────────────── */
const RobotAvatar = ({ isSpeaking }) => (
  <svg
    viewBox="0 0 120 140"
    width="120"
    height="140"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: "visible" }}
  >
    <defs>
      {/* Antenna glow */}
      <radialGradient id="antennaBall" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={isSpeaking ? "#4338ca" : "#6366f1"} />
        <stop offset="100%" stopColor={isSpeaking ? "#6366f1" : "#3730a3"} />
      </radialGradient>

      {/* Eye glow */}
      <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c7d2fe" />
        <stop offset="100%" stopColor="#6366f1" />
      </radialGradient>

      {/* Face gradient */}
      <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Body gradient */}
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.05); }
        }
        @keyframes mouthOpen {
          0%, 100% { d: path("M46 87 Q60 90 74 87"); }
          50%       { d: path("M46 87 Q60 96 74 87"); }
        }
        @keyframes mouthTalk {
          0%   { d: path("M48 86 Q60 88 72 86 Q60 90 48 86"); }
          25%  { d: path("M48 86 Q60 95 72 86 Q60 91 48 86"); }
          50%  { d: path("M48 86 Q60 90 72 86 Q60 98 48 86"); }
          75%  { d: path("M48 86 Q60 93 72 86 Q60 89 48 86"); }
          100% { d: path("M48 86 Q60 88 72 86 Q60 90 48 86"); }
        }
        @keyframes wave1 {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.12); }
        }
        @keyframes wave2 {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.22); }
        }
        @keyframes wave3 {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(1.34); }
        }
        @keyframes antennaGlow {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes bodyPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes earFlash {
          0%, 80%, 100% { fill: #312e81; }
          90%            { fill: #818cf8; }
        }

        .eye-left  { transform-origin: 38px 67px; animation: blink 4s ease-in-out infinite; }
        .eye-right { transform-origin: 82px 67px; animation: blink 4s ease-in-out 0.2s infinite; }

        .mouth-talk {
          animation: mouthTalk 0.35s ease-in-out infinite;
        }
        .mouth-idle {
          /* subtle neutral curve – no animation */
        }

        .sound-ring-1 { 
          transform-origin: 60px 70px;
          animation: ${isSpeaking ? "wave1 0.8s ease-in-out infinite" : "none"};
          opacity: ${isSpeaking ? 0.3 : 0};
        }
        .sound-ring-2 { 
          transform-origin: 60px 70px;
          animation: ${isSpeaking ? "wave2 0.8s ease-in-out 0.15s infinite" : "none"};
          opacity: ${isSpeaking ? 0.2 : 0};
        }
        .sound-ring-3 { 
          transform-origin: 60px 70px;
          animation: ${isSpeaking ? "wave3 0.8s ease-in-out 0.3s infinite" : "none"};
          opacity: ${isSpeaking ? 0.12 : 0};
        }

        .antenna-ball {
          animation: ${isSpeaking ? "antennaGlow 0.6s ease-in-out infinite" : "none"};
        }

        .ear-left  { animation: ${isSpeaking ? "earFlash 1.2s ease-in-out infinite" : "none"}; }
        .ear-right { animation: ${isSpeaking ? "earFlash 1.2s ease-in-out 0.6s infinite" : "none"}; }

        .chest-light {
          animation: ${isSpeaking ? "bodyPulse 0.5s ease-in-out infinite" : "bodyPulse 2.5s ease-in-out infinite"};
        }
      `}</style>
    </defs>

    {/* ── SOUND RINGS (behind robot) ── */}
    <ellipse className="sound-ring-1" cx="60" cy="70" rx="58" ry="56" fill="none" stroke="#6366f1" strokeWidth="2" />
    <ellipse className="sound-ring-2" cx="60" cy="70" rx="70" ry="68" fill="none" stroke="#6366f1" strokeWidth="1.5" />
    <ellipse className="sound-ring-3" cx="60" cy="70" rx="84" ry="82" fill="none" stroke="#6366f1" strokeWidth="1" />

    {/* ── ANTENNA ── */}
    <line x1="60" y1="18" x2="60" y2="6" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
    <circle className="antenna-ball" cx="60" cy="5" r="4.5" fill="url(#antennaBall)" />

    {/* ── NECK ── */}
    <rect x="52" y="108" width="16" height="8" rx="2" fill="#1e1b4b" />

    {/* ── BODY ── */}
    <rect x="30" y="116" width="60" height="26" rx="10" fill="url(#bodyGrad)" stroke="#3730a3" strokeWidth="0.8" />

    {/* Chest panel */}
    <rect x="40" y="121" width="40" height="16" rx="5" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.25)" strokeWidth="0.5" />

    {/* Chest light dots */}
    <circle className="chest-light" cx="50" cy="129" r="3" fill="#6366f1" />
    <circle className="chest-light" cx="60" cy="129" r="3" fill="#818cf8" style={{ animationDelay: "0.15s" }} />
    <circle className="chest-light" cx="70" cy="129" r="3" fill="#6366f1" style={{ animationDelay: "0.3s" }} />

    {/* ── EARS ── */}
    <rect className="ear-left"  x="12" y="52" width="10" height="22" rx="4" fill="#312e81" stroke="#4338ca" strokeWidth="0.5" />
    <rect className="ear-right" x="98" y="52" width="10" height="22" rx="4" fill="#312e81" stroke="#4338ca" strokeWidth="0.5" />

    {/* ── HEAD ── */}
    <rect x="18" y="22" width="84" height="86" rx="18" fill="url(#faceGrad)" stroke="#3730a3" strokeWidth="0.8" />

    {/* Head highlight strip */}
    <rect x="26" y="23" width="68" height="5" rx="3" fill="rgba(129,140,248,0.15)" />

    {/* ── VISOR BAND ── */}
    <rect x="20" y="48" width="80" height="30" rx="6" fill="rgba(30,27,75,0.6)" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5" />

    {/* ── EYES ── */}
    {/* Left eye group */}
    <g className="eye-left">
      <ellipse cx="38" cy="67" rx="10" ry="10" fill="rgba(99,102,241,0.15)" />
      <ellipse cx="38" cy="67" rx="7" ry="7" fill="url(#eyeGlow)" />
      <ellipse cx="38" cy="67" rx="4" ry="4" fill="#c7d2fe" />
      <ellipse cx="36.5" cy="65.5" rx="1.2" ry="1.2" fill="white" opacity="0.9" />
    </g>

    {/* Right eye group */}
    <g className="eye-right">
      <ellipse cx="82" cy="67" rx="10" ry="10" fill="rgba(99,102,241,0.15)" />
      <ellipse cx="82" cy="67" rx="7" ry="7" fill="url(#eyeGlow)" />
      <ellipse cx="82" cy="67" rx="4" ry="4" fill="#c7d2fe" />
      <ellipse cx="80.5" cy="65.5" rx="1.2" ry="1.2" fill="white" opacity="0.9" />
    </g>

    {/* ── NOSE ── */}
    <rect x="57" y="79" width="6" height="4" rx="2" fill="#312e81" />

    {/* ── MOUTH ── */}
    {isSpeaking ? (
      /* Animated talking mouth */
      <g>
        {/* Mouth cavity */}
        <ellipse cx="60" cy="91" rx="13" ry="8" fill="#1e1b4b" />
        {/* Animated lips */}
        <path
          className="mouth-talk"
          d="M48 86 Q60 88 72 86 Q60 90 48 86"
          fill="#4338ca"
          stroke="none"
        />
        {/* Teeth */}
        <rect x="51" y="86" width="18" height="5" rx="2" fill="rgba(199,210,254,0.9)" />
        {/* Tongue hint */}
        <ellipse cx="60" cy="95" rx="6" ry="3" fill="#7c3aed" opacity="0.7" />
      </g>
    ) : (
      /* Idle neutral smile */
      <path
        className="mouth-idle"
        d="M47 89 Q60 94 73 89"
        fill="none"
        stroke="#4338ca"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    )}

    {/* ── CHEEK BLUSH (speaking = more pink) ── */}
    <ellipse cx="28" cy="82" rx="5" ry="3" fill="rgba(167,139,250,0.15)" opacity={isSpeaking ? 0.8 : 0.3} />
    <ellipse cx="92" cy="82" rx="5" ry="3" fill="rgba(167,139,250,0.15)" opacity={isSpeaking ? 0.8 : 0.3} />

    {/* ── STATUS LABEL ── */}
    <text
      x="60"
      y="148"
      textAnchor="middle"
      fontSize="10"
      fontFamily="'DM Sans', system-ui, sans-serif"
      fontWeight="600"
      fill={isSpeaking ? "#818cf8" : "#475569"}
      letterSpacing="0.08em"
    >
      {isSpeaking ? "● SPEAKING" : "● IDLE"}
    </text>
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN INTERVIEW SESSION
───────────────────────────────────────────── */
const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const settings = location.state || {
    interviewType: "Technical",
    role: "Software Engineer",
    duration: "10",
  };

  const totalSeconds = Number(settings.duration) * 60;

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);

  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");

  const [askedQuestions, setAskedQuestions] = useState([]);
  const [listening, setListening] = useState(false);
  const [voiceCaptured, setVoiceCaptured] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [lastChunk, setLastChunk] = useState("");
  const [waveLevel, setWaveLevel] = useState(0);
  const [loadingNext, setLoadingNext] = useState(false);
  const [lastMinuteWarningSpoken, setLastMinuteWarningSpoken] = useState(false);

  // ── NEW: track whether AI TTS is currently speaking ──
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const waveIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* speak() now sets aiSpeaking true/false around the utterance */
  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setAiSpeaking(true);
    utterance.onend   = () => setAiSpeaking(false);
    utterance.onerror = () => setAiSpeaking(false);

    setAiSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) { endInterview(); return; }
    const interval = setInterval(() => {
      setTimeLeft((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, running]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech Recognition not supported. Use Chrome."); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript || "";
      if (!spoken.trim()) return;
      setLastChunk(spoken);
      setFinalAnswer((prev) => (prev + " " + spoken).trim());
      setVoiceCaptured(true);
      setListening(false);
      stopWaveform();
      setWaveLevel(0);
    };

    recognition.onerror = () => { setListening(false); stopWaveform(); setWaveLevel(0); };
    recognition.onend   = () => { setListening(false); stopWaveform(); setWaveLevel(0); };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    startCamera();
    startInterview();
    return () => { stopCamera(); window.speechSynthesis.cancel(); stopWaveform(); };
    // eslint-disable-next-line
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { /* silently degrade */ }
  };

  const stopCamera = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startWaveform = () => {
    stopWaveform();
    waveIntervalRef.current = setInterval(() => setWaveLevel(Math.floor(Math.random() * 100)), 120);
  };

  const stopWaveform = () => {
    if (waveIntervalRef.current) { clearInterval(waveIntervalRef.current); waveIntervalRef.current = null; }
  };

  const fetchNextQuestion = async (answerText, transcriptArr, askedArr) => {
    const res = await fetch(`${BACKEND_URL}/api/interview/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewType: settings.interviewType,
        role: settings.role,
        transcript: transcriptArr,
        userAnswer: answerText,
        askedQuestions: askedArr,
        timeLeftSeconds: timeLeft,
      }),
    });
    return await res.json();
  };

  const startInterview = async () => {
    try {
      const first = await fetchNextQuestion(null, [], []);
      if (!first?.nextQuestion) { setCurrentQuestion("⚠️ Server issue: No question received."); return; }
      setMessages([{ role: "ai", content: first.nextQuestion }]);
      setCurrentQuestion(first.nextQuestion);
      setLastFeedback("");
      setAskedQuestions([first.nextQuestion]);
      setTimeout(() => speak(first.nextQuestion), 250);
    } catch (err) {
      console.error("startInterview failed, using offline fallback:", err);
      const fallbackQ = pickFallback(FALLBACK_OPENERS, []);
      setMessages([{ role: "ai", content: fallbackQ }]);
      setCurrentQuestion(fallbackQ);
      setLastFeedback("");
      setAskedQuestions([fallbackQ]);
      setTimeout(() => speak(fallbackQ), 250);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || !running) return;
    // Stop AI speech if it's still talking
    window.speechSynthesis.cancel();
    setAiSpeaking(false);
    setListening(true);
    startWaveform();
    try { recognitionRef.current.start(); }
    catch { setListening(false); stopWaveform(); }
  };

  const submitAnswer = async () => {
    const answerToSubmit = finalAnswer.trim();
    if (!answerToSubmit || !voiceCaptured) return;
    setLoadingNext(true);

    try {
      const localTranscript = [...messages, { role: "user", content: answerToSubmit }];
      setMessages(localTranscript);

      const aiData = await fetchNextQuestion(answerToSubmit, localTranscript, askedQuestions);
      if (!aiData?.nextQuestion) { setCurrentQuestion("⚠️ Server issue."); setLoadingNext(false); return; }

      setLastFeedback(aiData.shortFeedback || "");
      setCurrentQuestion(aiData.nextQuestion);

      const updatedTranscript = [
        ...localTranscript,
        ...(aiData.shortFeedback ? [{ role: "ai", content: `Feedback: ${aiData.shortFeedback}` }] : []),
        { role: "ai", content: aiData.nextQuestion },
      ];
      setMessages(updatedTranscript);
      setAskedQuestions((prev) => [...prev, aiData.nextQuestion]);

      if (timeLeft <= 60 && !lastMinuteWarningSpoken) {
        setLastMinuteWarningSpoken(true);
        speak("We have less than one minute left. This will be the last question.");
        setTimeout(() => speak(aiData.nextQuestion), 1800);
      } else {
        setTimeout(() => speak(aiData.nextQuestion), 200);
      }

      setFinalAnswer("");
      setLastChunk("");
      setVoiceCaptured(false);
    } catch (err) {
      console.error("submitAnswer failed, using offline fallback:", err);
      const fallbackQ = pickFallback(FALLBACK_FOLLOWUPS, askedQuestions);
      setLastFeedback("Thanks for your answer.");
      setCurrentQuestion(fallbackQ);
      setMessages((prev) => [...prev, { role: "ai", content: fallbackQ }]);
      setAskedQuestions((prev) => [...prev, fallbackQ]);
      setTimeout(() => speak(fallbackQ), 200);
    } finally {
      setLoadingNext(false);
    }
  };

  const endInterview = async () => {
    setRunning(false);
    window.speechSynthesis.cancel();
    setAiSpeaking(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewType: settings.interviewType, role: settings.role, duration: settings.duration, transcript: messages }),
      });
      const report = await res.json();
      generatePDF(report);
    } catch (err) {
      console.error("endInterview failed, generating offline fallback report:", err);
      const answerCount = messages.filter((m) => m.role === "user").length;
      generatePDF({
        score: answerCount > 0 ? 6.5 : 0,
        strengths: answerCount > 0 ? ["Completed the interview session", "Engaged with each question asked"] : [],
        improvements: ["We couldn't reach the AI evaluator this time, so this is a generic report rather than one scored against your actual answers."],
        focusAreas: ["Retry when the backend connection is stable for a fully scored report"],
        finalFeedback: "This report was generated offline because the evaluation service was unreachable. Your interview transcript itself was not lost — try ending the session again once the backend is reachable for real scoring.",
      });
    }
    stopCamera();
    navigate("/mock-interview");
  };

  const generatePDF = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("PrepWise - Interview Report", 15, 20);
    doc.setFontSize(12);
    doc.text(`Interview Type: ${settings.interviewType}`, 15, 35);
    doc.text(`Role: ${settings.role}`, 15, 43);
    doc.text(`Duration: ${settings.duration} minutes`, 15, 51);
    doc.setFontSize(14);
    doc.text(`Performance Score: ${report.score ?? 0}/10`, 15, 65);
    let y = 78;
    const section = (title, items) => {
      doc.setFontSize(13); doc.text(title, 15, y); y += 8;
      doc.setFontSize(11);
      (items || ["None"]).forEach((s, i) => { doc.text(`${i + 1}. ${s}`, 18, y); y += 7; });
      y += 5;
    };
    section("Strengths:", report.strengths);
    section("Improvements:", report.improvements);
    section("Focus Areas:", report.focusAreas);
    doc.setFontSize(13); doc.text("Final Feedback:", 15, y); y += 8;
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(report.finalFeedback || "Good effort!", 170), 15, y);
    doc.save("PrepWise_Interview_Report.pdf");
    alert("✅ Interview complete! PDF downloaded.");
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const timePercent = (timeLeft / totalSeconds) * 100;
  const timeColor = timeLeft <= 60 ? "#dc2626" : timeLeft <= totalSeconds * 0.3 ? "#b45309" : "#818cf8";

  // Wave bars
  const BARS = 18;
  const waveHeights = Array.from({ length: BARS }, (_, i) => {
    if (!listening) return 4;
    const center = BARS / 2;
    const dist = Math.abs(i - center) / center;
    return 4 + (waveLevel * (1 - dist * 0.7)) / 100 * 28;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes glow-ring {
          0%, 100% { box-shadow: 0 0 0 4px rgba(99,102,241,0.1), 0 0 20px rgba(99,102,241,0.15); }
          50%       { box-shadow: 0 0 0 8px rgba(99,102,241,0.18), 0 0 36px rgba(99,102,241,0.3); }
        }
        @keyframes glow-ring-active {
          0%, 100% { box-shadow: 0 0 0 4px rgba(99,102,241,0.25), 0 0 28px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0.35), 0 0 48px rgba(99,102,241,0.55); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .session-root * { box-sizing: border-box; }

        .speak-btn:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 12px 32px rgba(99,102,241,0.45) !important;
        }
        .speak-btn { transition: transform 0.18s, box-shadow 0.18s; }

        .action-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        .action-btn { transition: filter 0.15s, transform 0.15s; }

        .end-btn:hover { background: rgba(239,68,68,0.18) !important; border-color: rgba(239,68,68,0.5) !important; }
        .end-btn { transition: background 0.2s, border-color 0.2s; }

        .robot-wrapper {
          transition: filter 0.4s ease;
        }
        .robot-wrapper.speaking {
          filter: drop-shadow(0 0 18px rgba(99,102,241,0.5));
        }
        .robot-wrapper.idle {
          filter: drop-shadow(0 0 6px rgba(99,102,241,0.15));
        }
      `}</style>

      <div
        className="session-root"
        style={{
          minHeight: "calc(100vh - 80px)",
          background: "#f8fafc",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          padding: "28px 24px",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── HEADER BAR ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#f8fafc", border: "1px solid #e5e7eb",
            borderRadius: 20, padding: "18px 28px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
                  animation: "pulse-dot 1.6s ease-in-out infinite",
                  boxShadow: "0 0 8px #22c55e",
                }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Live Session
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: "#0f172a" }}>
                {settings.role} Interview
              </h1>
              <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0", fontWeight: 500 }}>
                {settings.interviewType} · AI Voice Interview · Unlimited Questions
              </p>
            </div>

            {/* Timer */}
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Time Remaining
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", color: timeColor, lineHeight: 1, margin: 0, transition: "color 0.5s" }}>
                {formatTime(timeLeft)}
              </p>
              <div style={{ marginTop: 8, width: 120, height: 4, background: "#e5e7eb", borderRadius: 4, marginLeft: "auto" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${timePercent}%`,
                  background: timeColor,
                  transition: "width 1s linear, background 0.5s",
                }} />
              </div>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* ── AI INTERVIEWER CARD ── */}
            <div style={{
              background: "#f8fafc", border: "1px solid #e5e7eb",
              borderRadius: 22, padding: "32px 28px",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Card glow */}
              <div style={{
                position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
                width: 200, height: 100,
                background: `radial-gradient(ellipse, ${aiSpeaking ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.12)"} 0%, transparent 70%)`,
                transition: "background 0.5s",
                pointerEvents: "none",
              }} />

              {/* ── ANIMATED ROBOT AVATAR ── */}
              <div
                className={`robot-wrapper ${aiSpeaking ? "speaking" : "idle"}`}
                style={{
                  width: 140, height: 160,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%",
                  background: aiSpeaking
                    ? "rgba(99,102,241,0.08)"
                    : "#f8fafc",
                  border: `2px solid ${aiSpeaking ? "rgba(99,102,241,0.35)" : "#e5e7eb"}`,
                  animation: aiSpeaking ? "glow-ring-active 1s ease-in-out infinite" : "glow-ring 3s ease-in-out infinite",
                  transition: "background 0.4s, border-color 0.4s",
                  padding: 12,
                }}
              >
                <RobotAvatar isSpeaking={aiSpeaking} />
              </div>

              <p style={{ marginTop: 16, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
                AI Interviewer
              </p>

              {/* Speaking status badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                marginTop: 4,
                padding: "4px 12px",
                borderRadius: 20,
                background: aiSpeaking ? "rgba(99,102,241,0.12)" : "transparent",
                border: `1px solid ${aiSpeaking ? "rgba(99,102,241,0.3)" : "transparent"}`,
                transition: "all 0.3s ease",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: aiSpeaking ? "#818cf8" : "#cbd5e1",
                  boxShadow: aiSpeaking ? "0 0 8px #818cf8" : "none",
                  animation: aiSpeaking ? "pulse-dot 0.8s ease-in-out infinite" : "none",
                  transition: "background 0.3s",
                }} />
                <span style={{ fontSize: 11.5, color: aiSpeaking ? "#4338ca" : "#cbd5e1", fontWeight: 600, transition: "color 0.3s" }}>
                  {aiSpeaking ? "Speaking now…" : listening ? "Listening to you" : "Waiting for your answer"}
                </span>
              </div>

              {/* Feedback bubble */}
              {lastFeedback && (
                <div style={{
                  marginTop: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 14, padding: "10px 16px", maxWidth: 320,
                  fontSize: 13, color: "#4338ca", lineHeight: 1.6,
                  animation: "slide-up 0.3s ease",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Feedback
                  </span>
                  {lastFeedback}
                </div>
              )}

              {/* Controls */}
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button
                  onClick={() => speak(currentQuestion)}
                  className="action-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#f1f5f9", border: "1px solid #cbd5e1",
                    borderRadius: 12, padding: "10px 18px",
                    fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer",
                  }}
                >
                  <Volume2 size={14} />
                  Repeat
                </button>

                <button
                  onClick={startListening}
                  disabled={listening || !running}
                  className="speak-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: listening
                      ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                      : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    border: "none", borderRadius: 12, padding: "10px 20px",
                    fontSize: 13, fontWeight: 700, color: "#fff", cursor: listening ? "default" : "pointer",
                    boxShadow: listening ? "0 8px 24px rgba(220,38,38,0.35)" : "0 8px 24px rgba(99,102,241,0.3)",
                    opacity: (!running) ? 0.5 : 1,
                  }}
                >
                  {listening ? <><MicOff size={14} /> Listening…</> : <><Mic size={14} /> Speak</>}
                </button>
              </div>

              {/* Waveform */}
              <div style={{ marginTop: 24, display: "flex", gap: 3, alignItems: "flex-end", height: 36 }}>
                {waveHeights.map((h, i) => (
                  <div key={i} style={{
                    width: 4, borderRadius: 4,
                    height: h,
                    background: listening
                      ? `rgba(99,102,241,${0.4 + (i % 3) * 0.2})`
                      : "#e2e8f0",
                    transition: "height 0.1s ease, background 0.3s",
                  }} />
                ))}
              </div>
            </div>

            {/* ── FACECAM + ANSWER CARD ── */}
            <div style={{
              background: "#f8fafc", border: "1px solid #e5e7eb",
              borderRadius: 22, padding: "32px 28px",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            }}>
              {/* Video */}
              <div style={{
                width: 180, height: 180, borderRadius: "50%", overflow: "hidden",
                border: listening ? "2px solid rgba(34,197,94,0.5)" : "2px solid #cbd5e1",
                boxShadow: listening ? "0 0 0 6px rgba(34,197,94,0.08)" : "0 0 0 6px #f8fafc",
                background: "#0f172a", transition: "border 0.3s, box-shadow 0.3s",
              }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <p style={{ marginTop: 14, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>You</p>

              {/* Status indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: listening ? "#22c55e" : voiceCaptured ? "#818cf8" : "#cbd5e1",
                  boxShadow: listening ? "0 0 8px #22c55e" : voiceCaptured ? "0 0 8px #818cf8" : "none",
                  animation: listening ? "pulse-dot 1s ease-in-out infinite" : "none",
                  transition: "background 0.3s",
                }} />
                <p style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
                  {listening ? "Listening… speak now 🎙️" : voiceCaptured ? "Answer captured — click Submit" : "Click Speak to answer"}
                </p>
              </div>

              {/* Answer display */}
              <div style={{ marginTop: 16, width: "100%", textAlign: "left" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Your Answer
                </p>
                <div style={{
                  minHeight: 80, background: "#f1f5f9",
                  border: `1px solid ${voiceCaptured ? "rgba(99,102,241,0.3)" : "#e5e7eb"}`,
                  borderRadius: 14, padding: "12px 16px",
                  fontSize: 13.5, color: finalAnswer ? "#1e293b" : "#cbd5e1", lineHeight: 1.65,
                  transition: "border-color 0.3s",
                }}>
                  {finalAnswer || "🎙️ Click Speak and start answering…"}
                </div>
                {lastChunk && (
                  <p style={{ marginTop: 6, fontSize: 11.5, color: "#334155", fontStyle: "italic" }}>
                    Last: "{lastChunk}"
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={submitAnswer}
                disabled={!running || !voiceCaptured || loadingNext}
                className="action-btn"
                style={{
                  marginTop: 18,
                  display: "flex", alignItems: "center", gap: 8,
                  background: (running && voiceCaptured && !loadingNext)
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "#f1f5f9",
                  border: (running && voiceCaptured && !loadingNext)
                    ? "none" : "1px solid #e2e8f0",
                  color: (running && voiceCaptured && !loadingNext) ? "#fff" : "#cbd5e1",
                  borderRadius: 12, padding: "11px 22px",
                  fontSize: 13.5, fontWeight: 700, cursor: (running && voiceCaptured && !loadingNext) ? "pointer" : "not-allowed",
                  boxShadow: (running && voiceCaptured && !loadingNext) ? "0 8px 24px rgba(16,185,129,0.3)" : "none",
                }}
              >
                {loadingNext ? (
                  <>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Submitting…
                  </>
                ) : (
                  <><Send size={14} />Submit Answer</>
                )}
              </button>
            </div>
          </div>

          {/* ── QUESTION BAR ── */}
          <div style={{
            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)",
            borderRadius: 16, padding: "18px 24px",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <div style={{
              minWidth: 32, height: 32, borderRadius: 10,
              background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, flexShrink: 0,
            }}>
              ❓
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                Current Question
              </p>
              <p style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                {currentQuestion || "Loading first question…"}
              </p>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
            <button
              onClick={endInterview}
              className="end-btn"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                color: "#dc2626", borderRadius: 12, padding: "11px 26px",
                fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              }}
            >
              <LogOut size={15} />
              End Interview
            </button>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default InterviewSession;

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import {
//   Mic, MicOff, Send, LogOut, Volume2,
//   Code2, X, CheckCircle, ChevronDown, Play,
// } from "lucide-react";

// const BACKEND_URL = "http://localhost:5000";

// /* ══════════════════════════════════════════════════════════════
//    LANGUAGE CONFIGS
// ══════════════════════════════════════════════════════════════ */
// const LANG_CONFIG = {
//   cpp: {
//     label: "C++",
//     monacoId: "cpp",
//     comment: "//",
//     keywords: [
//       "int","long","double","float","char","bool","void","string","auto","const",
//       "nullptr","true","false","return","if","else","for","while","do","switch",
//       "case","break","continue","class","struct","public","private","protected",
//       "new","delete","include","using","namespace","std","endl","cin","cout",
//       "vector","map","unordered_map","set","unordered_set","pair","queue",
//       "priority_queue","stack","deque","list","array","sort","min","max",
//       "swap","reverse","lower_bound","upper_bound","begin","end","size",
//       "push_back","pop_back","push","pop","top","front","back","empty",
//       "find","count","insert","erase","clear","main","template","typename",
//     ],
//     snippets: {
//       "for":    "for (int i = 0; i < n; i++) {\n  \n}",
//       "while":  "while (condition) {\n  \n}",
//       "if":     "if (condition) {\n  \n}",
//       "vector": "vector<int> ",
//       "map":    "map<int, int> ",
//       "pq":     "priority_queue<int, vector<int>, greater<int>> ",
//     },
//     defaultCode: (prob) =>
// `#include <bits/stdc++.h>
// using namespace std;

// // Problem: ${prob}

// class Solution {
// public:
//     // TODO: implement your solution
// };

// int main() {
//     ios_base::sync_with_stdio(false);
//     cin.tie(NULL);
    
//     Solution sol;
//     // TODO: add test cases
    
//     return 0;
// }`,
//   },

//   python: {
//     label: "Python",
//     monacoId: "python",
//     comment: "#",
//     keywords: [
//       "def","class","return","if","elif","else","for","while","in","not","and",
//       "or","True","False","None","import","from","as","pass","break","continue",
//       "lambda","with","try","except","finally","raise","yield","global","nonlocal",
//       "is","del","assert","self","__init__","print","range","len","int","str",
//       "float","list","dict","set","tuple","sorted","reversed","enumerate","zip",
//       "map","filter","min","max","sum","abs","type","isinstance","append","extend",
//       "pop","insert","remove","count","index","keys","values","items","get",
//       "update","defaultdict","Counter","deque","heappush","heappop","heapify",
//       "collections","heapq","bisect","bisect_left","bisect_right","math","sys",
//       "input","output","open","read","write","split","join","strip","replace",
//     ],
//     snippets: {
//       "def":   "def solution():\n    ",
//       "for":   "for i in range(n):\n    ",
//       "while": "while condition:\n    ",
//       "if":    "if condition:\n    ",
//       "class": "class Solution:\n    def __init__(self):\n        ",
//     },
//     defaultCode: (prob) =>
// `# Problem: ${prob}
// import sys
// from collections import defaultdict, deque, Counter
// import heapq

// class Solution:
//     def solve(self):
//         # TODO: implement your solution
//         pass

// # TODO: add test cases
// if __name__ == "__main__":
//     sol = Solution()
// `,
//   },

//   java: {
//     label: "Java",
//     monacoId: "java",
//     comment: "//",
//     keywords: [
//       "int","long","double","float","char","boolean","void","String","null",
//       "true","false","return","if","else","for","while","do","switch","case",
//       "break","continue","class","interface","extends","implements","new",
//       "this","super","public","private","protected","static","final","abstract",
//       "import","package","try","catch","finally","throw","throws","instanceof",
//       "System","out","println","print","in","Scanner","Arrays","Collections",
//       "ArrayList","LinkedList","HashMap","HashSet","TreeMap","TreeSet",
//       "PriorityQueue","Stack","Queue","Deque","ArrayDeque","List","Map","Set",
//       "Math","Integer","Long","String","StringBuilder","sort","min","max",
//       "add","remove","get","put","size","isEmpty","contains","iterator",
//       "next","hasNext","peek","poll","push","pop","offer","compareTo",
//     ],
//     snippets: {
//       "for":   "for (int i = 0; i < n; i++) {\n    \n}",
//       "while": "while (condition) {\n    \n}",
//       "if":    "if (condition) {\n    \n}",
//       "sout":  'System.out.println();',
//       "list":  "List<Integer> list = new ArrayList<>();",
//       "map":   "Map<Integer, Integer> map = new HashMap<>();",
//     },
//     defaultCode: (prob) =>
// `// Problem: ${prob}
// import java.util.*;
// import java.io.*;

// public class Solution {
    
//     public static void main(String[] args) {
//         Scanner sc = new Scanner(System.in);
//         Solution sol = new Solution();
//         // TODO: add test cases
//     }
    
//     // TODO: implement your solution
    
// }`,
//   },
// };

// /* ══════════════════════════════════════════════════════════════
//    SYNTAX HIGHLIGHT HELPER  (returns HTML string)
//    Very lightweight — just colours keywords, strings, comments,
//    numbers. Runs on every keystroke via a hidden overlay.
// ══════════════════════════════════════════════════════════════ */
// function highlight(code, lang) {
//   const cfg = LANG_CONFIG[lang];
//   if (!cfg) return escHtml(code);

//   // Escape helper
//   function escHtml(s) {
//     return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
//   }

//   const lines = code.split("\n");

//   const kwSet = new Set(cfg.keywords);
//   const commentStart = cfg.comment;

//   const styledLines = lines.map((line) => {
//     // Check if entire line is a comment
//     const trimmed = line.trimStart();
//     const isLineComment = trimmed.startsWith(commentStart);
//     if (isLineComment) {
//       return `<span style="color:#6b7280;font-style:italic">${escHtml(line)}</span>`;
//     }

//     // Also handle #include / #define for C++
//     if (lang === "cpp" && trimmed.startsWith("#")) {
//       return `<span style="color:#7c3aed">${escHtml(line)}</span>`;
//     }

//     // Tokenise character by character
//     let result = "";
//     let i = 0;
//     while (i < line.length) {
//       // String literal " … "
//       if (line[i] === '"') {
//         let j = i + 1;
//         while (j < line.length && !(line[j] === '"' && line[j-1] !== "\\")) j++;
//         result += `<span style="color:#86efac">${escHtml(line.slice(i, j+1))}</span>`;
//         i = j + 1;
//         continue;
//       }
//       // String literal ' … '
//       if (line[i] === "'") {
//         let j = i + 1;
//         while (j < line.length && !(line[j] === "'" && line[j-1] !== "\\")) j++;
//         result += `<span style="color:#86efac">${escHtml(line.slice(i, j+1))}</span>`;
//         i = j + 1;
//         continue;
//       }
//       // Number
//       if (/[0-9]/.test(line[i]) && (i === 0 || /\W/.test(line[i-1]))) {
//         let j = i;
//         while (j < line.length && /[0-9._xXaAbBcCdDeEfF]/.test(line[j])) j++;
//         result += `<span style="color:#fb923c">${escHtml(line.slice(i, j))}</span>`;
//         i = j;
//         continue;
//       }
//       // Word — could be keyword
//       if (/[a-zA-Z_$]/.test(line[i])) {
//         let j = i;
//         while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
//         const word = line.slice(i, j);
//         if (kwSet.has(word)) {
//           result += `<span style="color:#818cf8;font-weight:600">${escHtml(word)}</span>`;
//         } else if (/^[A-Z]/.test(word)) {
//           result += `<span style="color:#67e8f9">${escHtml(word)}</span>`;
//         } else {
//           result += escHtml(word);
//         }
//         i = j;
//         continue;
//       }
//       // Operators / punctuation – colour braces
//       const ch = line[i];
//       if ("{}()[]".includes(ch)) {
//         result += `<span style="color:#f9a8d4">${escHtml(ch)}</span>`;
//       } else if ("=<>!+-*/%&|^~".includes(ch)) {
//         result += `<span style="color:#fbbf24">${escHtml(ch)}</span>`;
//       } else {
//         result += escHtml(ch);
//       }
//       i++;
//     }
//     return result;
//   });

//   return styledLines.join("\n");
// }

// /* ══════════════════════════════════════════════════════════════
//    AUTO-COMPLETE POPUP
// ══════════════════════════════════════════════════════════════ */
// const AutoComplete = ({ suggestions, onSelect, activeIdx }) => {
//   if (!suggestions.length) return null;
//   return (
//     <div style={{
//       position: "absolute",
//       background: "#1e2130",
//       border: "1px solid rgba(99,102,241,0.35)",
//       borderRadius: 8,
//       overflow: "hidden",
//       zIndex: 200,
//       minWidth: 180,
//       boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
//       fontFamily: "'JetBrains Mono', monospace",
//       fontSize: 12.5,
//     }}>
//       {suggestions.map((s, i) => (
//         <div
//           key={s}
//           onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
//           style={{
//             padding: "6px 14px",
//             background: i === activeIdx ? "rgba(99,102,241,0.25)" : "transparent",
//             color: i === activeIdx ? "#c7d2fe" : "#64748b",
//             cursor: "pointer",
//             borderLeft: i === activeIdx ? "2px solid #6366f1" : "2px solid transparent",
//             transition: "background 0.1s",
//           }}
//         >
//           {s}
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════
//    CORE CODE EDITOR
// ══════════════════════════════════════════════════════════════ */
// const CodeEditor = ({ value, onChange, language }) => {
//   const taRef       = useRef(null);
//   const preRef      = useRef(null);
//   const wrapRef     = useRef(null);

//   const [acSuggestions, setAcSuggestions]   = useState([]);
//   const [acPosition,    setAcPosition]      = useState({ top: 0, left: 0 });
//   const [acActiveIdx,   setAcActiveIdx]     = useState(0);
//   const [acWord,        setAcWord]          = useState("");

//   const cfg = LANG_CONFIG[language] ?? LANG_CONFIG.cpp;

//   /* sync scroll of pre with textarea */
//   const syncScroll = () => {
//     if (preRef.current && taRef.current) {
//       preRef.current.scrollTop  = taRef.current.scrollTop;
//       preRef.current.scrollLeft = taRef.current.scrollLeft;
//     }
//   };

//   /* get current word being typed at caret */
//   const getCurrentWord = useCallback((text, pos) => {
//     let start = pos - 1;
//     while (start >= 0 && /[a-zA-Z0-9_]/.test(text[start])) start--;
//     return text.slice(start + 1, pos);
//   }, []);

//   /* compute autocomplete suggestions */
//   const computeSuggestions = useCallback((word) => {
//     if (word.length < 2) return [];
//     const lower = word.toLowerCase();
//     return cfg.keywords
//       .filter((k) => k.toLowerCase().startsWith(lower) && k !== word)
//       .slice(0, 8);
//   }, [cfg]);

//   /* calculate pixel position for dropdown (approx line/char based) */
//   const getCaretCoords = useCallback(() => {
//     const ta = taRef.current;
//     if (!ta) return { top: 20, left: 20 };
//     const pos   = ta.selectionStart;
//     const text  = ta.value.slice(0, pos);
//     const lines = text.split("\n");
//     const lineN = lines.length;
//     const colN  = lines[lines.length - 1].length;
//     const lineH = 22;   // px per line  (must match font-size/line-height)
//     const charW = 8.1;  // px per char  (JetBrains Mono 13.5px ≈ 8.1)
//     const padT  = 16;
//     const padL  = 0;
//     return {
//       top:  padT + lineN * lineH,
//       left: padL + colN * charW,
//     };
//   }, []);

//   const handleChange = useCallback((e) => {
//     onChange(e.target.value);
//     const pos  = e.target.selectionStart;
//     const word = getCurrentWord(e.target.value, pos);
//     const sugs = computeSuggestions(word);
//     setAcWord(word);
//     setAcSuggestions(sugs);
//     setAcActiveIdx(0);
//     if (sugs.length) setAcPosition(getCaretCoords());
//   }, [onChange, getCurrentWord, computeSuggestions, getCaretCoords]);

//   const applyCompletion = useCallback((suggestion) => {
//     const ta  = taRef.current;
//     const pos = ta.selectionStart;
//     const text = ta.value;
//     const wordStart = pos - acWord.length;
//     const newText = text.slice(0, wordStart) + suggestion + text.slice(pos);
//     onChange(newText);
//     setAcSuggestions([]);
//     // move caret to end of inserted word
//     requestAnimationFrame(() => {
//       ta.selectionStart = ta.selectionEnd = wordStart + suggestion.length;
//       ta.focus();
//     });
//   }, [acWord, onChange]);

//   const handleKeyDown = useCallback((e) => {
//     const ta = taRef.current;

//     /* ── autocomplete navigation ── */
//     if (acSuggestions.length) {
//       if (e.key === "ArrowDown") {
//         e.preventDefault();
//         setAcActiveIdx((i) => Math.min(i + 1, acSuggestions.length - 1));
//         return;
//       }
//       if (e.key === "ArrowUp") {
//         e.preventDefault();
//         setAcActiveIdx((i) => Math.max(i - 1, 0));
//         return;
//       }
//       if (e.key === "Enter" || e.key === "Tab") {
//         e.preventDefault();
//         applyCompletion(acSuggestions[acActiveIdx]);
//         return;
//       }
//       if (e.key === "Escape") {
//         setAcSuggestions([]);
//         return;
//       }
//     }

//     const start = ta.selectionStart;
//     const end   = ta.selectionEnd;
//     const text  = ta.value;

//     /* ── TAB → 2 spaces ── */
//     if (e.key === "Tab") {
//       e.preventDefault();
//       const indent = "  ";
//       const newText = text.slice(0, start) + indent + text.slice(end);
//       onChange(newText);
//       requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + indent.length; });
//       return;
//     }

//     /* ── Auto-pair brackets / quotes ── */
//     const PAIRS = { "{": "}", "(": ")", "[": "]", '"': '"', "'": "'" };
//     const CLOSE_CHARS = new Set(["}", ")", "]", '"', "'"]);

//     if (PAIRS[e.key]) {
//       const close = PAIRS[e.key];
//       // If there's a selection, wrap it
//       if (start !== end) {
//         e.preventDefault();
//         const selected = text.slice(start, end);
//         const newText = text.slice(0, start) + e.key + selected + close + text.slice(end);
//         onChange(newText);
//         requestAnimationFrame(() => { ta.selectionStart = start + 1; ta.selectionEnd = end + 1; });
//         return;
//       }
//       // Auto-close
//       e.preventDefault();
//       const newText = text.slice(0, start) + e.key + close + text.slice(end);
//       onChange(newText);
//       requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
//       return;
//     }

//     /* ── Skip over closing char if already there ── */
//     if (CLOSE_CHARS.has(e.key) && text[start] === e.key) {
//       e.preventDefault();
//       requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
//       return;
//     }

//     /* ── Backspace: remove pair ── */
//     if (e.key === "Backspace" && start === end && start > 0) {
//       const before = text[start - 1];
//       const after  = text[start];
//       if (PAIRS[before] === after) {
//         e.preventDefault();
//         const newText = text.slice(0, start - 1) + text.slice(start + 1);
//         onChange(newText);
//         requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start - 1; });
//         return;
//       }
//     }

//     /* ── Enter inside braces → indent ── */
//     if (e.key === "Enter") {
//       const before = text[start - 1];
//       const after  = text[start];
//       if (before === "{" && after === "}") {
//         e.preventDefault();
//         // get current line's indentation
//         const lineStart = text.lastIndexOf("\n", start - 1) + 1;
//         const currentLine = text.slice(lineStart, start);
//         const indent = currentLine.match(/^(\s*)/)[1];
//         const newText =
//           text.slice(0, start) +
//           "\n" + indent + "  " +  // inner line
//           "\n" + indent +          // closing-brace line
//           text.slice(end);
//         onChange(newText);
//         requestAnimationFrame(() => {
//           ta.selectionStart = ta.selectionEnd = start + 1 + indent.length + 2;
//         });
//         return;
//       }
//     }
//   }, [acSuggestions, acActiveIdx, applyCompletion, onChange]);

//   const lineCount = (value || "").split("\n").length;

//   return (
//     <div
//       ref={wrapRef}
//       style={{ position: "relative", flex: 1, display: "flex", overflow: "hidden", background: "#0d1117" }}
//     >
//       {/* Line numbers */}
//       <div
//         style={{
//           width: 52, flexShrink: 0,
//           background: "#0a0d14",
//           borderRight: "1px solid #f1f5f9",
//           padding: "16px 0",
//           overflowY: "hidden",
//           userSelect: "none",
//           fontFamily: "'JetBrains Mono', monospace",
//           fontSize: 12.5,
//         }}
//         ref={(el) => {
//           if (el && taRef.current) {
//             taRef.current.addEventListener("scroll", () => { el.scrollTop = taRef.current.scrollTop; });
//           }
//         }}
//       >
//         {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
//           <div key={i} style={{
//             height: 22, lineHeight: "22px",
//             textAlign: "right", paddingRight: 12,
//             color: "#2d3748",
//           }}>
//             {i + 1}
//           </div>
//         ))}
//       </div>

//       {/* Editor area */}
//       <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
//         {/* Syntax-highlighted pre (visual layer) */}
//         <pre
//           ref={preRef}
//           aria-hidden="true"
//           style={{
//             position: "absolute", inset: 0,
//             margin: 0, padding: "16px 16px",
//             fontFamily: "'JetBrains Mono', monospace",
//             fontSize: 13.5, lineHeight: "22px",
//             color: "#1e293b",
//             whiteSpace: "pre",
//             overflowX: "auto", overflowY: "auto",
//             pointerEvents: "none",
//             wordBreak: "normal",
//             tabSize: 2,
//           }}
//           dangerouslySetInnerHTML={{ __html: highlight(value || "", language) + "\n" }}
//         />

//         {/* Actual textarea (invisible text, captures input) */}
//         <textarea
//           ref={taRef}
//           value={value}
//           onChange={handleChange}
//           onKeyDown={handleKeyDown}
//           onScroll={syncScroll}
//           spellCheck={false}
//           autoComplete="off"
//           autoCorrect="off"
//           autoCapitalize="off"
//           style={{
//             position: "absolute", inset: 0,
//             margin: 0, padding: "16px 16px",
//             fontFamily: "'JetBrains Mono', monospace",
//             fontSize: 13.5, lineHeight: "22px",
//             color: "transparent",
//             caretColor: "#c7d2fe",
//             background: "transparent",
//             border: "none", outline: "none",
//             resize: "none",
//             overflowX: "auto", overflowY: "auto",
//             whiteSpace: "pre",
//             tabSize: 2,
//             zIndex: 10,
//           }}
//         />

//         {/* Autocomplete dropdown */}
//         {acSuggestions.length > 0 && (
//           <div style={{ position: "absolute", top: acPosition.top, left: acPosition.left + 52, zIndex: 200 }}>
//             <AutoComplete
//               suggestions={acSuggestions}
//               onSelect={applyCompletion}
//               activeIdx={acActiveIdx}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════
//    CODE EDITOR MODAL
// ══════════════════════════════════════════════════════════════ */
// const CodeEditorModal = ({
//   open, problem, starterCode, language, onLanguageChange,
//   onSubmit, onClose, loadingNext,
// }) => {
//   const [code, setCode] = useState("");
//   const [lang, setLang] = useState(language || "cpp");

//   useEffect(() => {
//     if (open) {
//       setCode(starterCode || LANG_CONFIG[lang]?.defaultCode("New Problem") || "");
//     }
//   }, [open, starterCode]);

//   useEffect(() => {
//     setLang(language || "cpp");
//   }, [language]);

//   const handleLangChange = (newLang) => {
//     setLang(newLang);
//     setCode(LANG_CONFIG[newLang]?.defaultCode(problem || "Problem") || "");
//     onLanguageChange?.(newLang);
//   };

//   if (!open) return null;

//   const lineCount = (code || "").split("\n").length;

//   return (
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 1000,
//       background: "rgba(3,7,18,0.88)",
//       backdropFilter: "blur(10px)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       padding: "12px",
//     }}>
//       <div style={{
//         width: "100%", maxWidth: 1100,
//         height: "94vh",
//         background: "#0d1117",
//         border: "1px solid rgba(99,102,241,0.25)",
//         borderRadius: 20,
//         display: "flex", flexDirection: "column",
//         overflow: "hidden",
//         boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(99,102,241,0.08)",
//       }}>

//         {/* ── Top Bar ── */}
//         <div style={{
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           padding: "12px 20px",
//           background: "#0a0d14",
//           borderBottom: "1px solid #f1f5f9",
//           flexShrink: 0,
//           gap: 12,
//         }}>
//           {/* Left: icon + title */}
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{
//               width: 30, height: 30, borderRadius: 8,
//               background: "rgba(99,102,241,0.18)", border: "1px solid rgba(99,102,241,0.3)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//             }}>
//               <Code2 size={14} color="#818cf8" />
//             </div>
//             <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>Code Editor</span>
//             <span style={{
//               fontSize: 11, fontWeight: 600, color: "#475569",
//               background: "#f1f5f9", border: "1px solid #e5e7eb",
//               borderRadius: 6, padding: "2px 8px",
//             }}>
//               DSA Interview
//             </span>
//           </div>

//           {/* Centre: language tabs */}
//           <div style={{ display: "flex", gap: 6, background: "#f8fafc", borderRadius: 10, padding: 4 }}>
//             {Object.entries(LANG_CONFIG).map(([k, v]) => (
//               <button
//                 key={k}
//                 onClick={() => handleLangChange(k)}
//                 style={{
//                   padding: "6px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 700,
//                   border: "none", cursor: "pointer", transition: "all 0.18s",
//                   background: lang === k ? "rgba(99,102,241,0.25)" : "transparent",
//                   color: lang === k ? "#c7d2fe" : "#4b5563",
//                   boxShadow: lang === k ? "0 2px 8px rgba(99,102,241,0.2)" : "none",
//                 }}
//               >
//                 {v.label}
//               </button>
//             ))}
//           </div>

//           {/* Right: stats + close */}
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <span style={{ fontSize: 11, color: "#2d3748", fontFamily: "monospace" }}>
//               {lineCount} lines
//             </span>
//             <button
//               onClick={onClose}
//               style={{
//                 width: 28, height: 28, borderRadius: "50%",
//                 background: "#f1f5f9", border: "1px solid #e2e8f0",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 cursor: "pointer", color: "#4b5563", transition: "all 0.2s",
//               }}
//               onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "#f1f5f9"; }}
//             >
//               <X size={13} />
//             </button>
//           </div>
//         </div>

//         {/* ── Body: Problem | Editor ── */}
//         <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

//           {/* Problem pane */}
//           <div style={{
//             width: 380, flexShrink: 0,
//             background: "#080b12",
//             borderRight: "1px solid #f1f5f9",
//             display: "flex", flexDirection: "column",
//             overflow: "hidden",
//           }}>
//             {/* Problem header */}
//             <div style={{
//               padding: "14px 18px 10px",
//               borderBottom: "1px solid #f1f5f9",
//               flexShrink: 0,
//             }}>
//               <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6366f1" }}>
//                 Problem Statement
//               </span>
//             </div>
//             {/* Problem body */}
//             <div style={{
//               flex: 1, overflowY: "auto", padding: "16px 18px",
//               fontFamily: "'DM Sans', system-ui, sans-serif",
//               fontSize: 13.5, color: "#64748b", lineHeight: 1.8,
//               whiteSpace: "pre-wrap",
//             }}
//               className="editor-scroll"
//             >
//               {problem || "Loading problem…"}
//             </div>

//             {/* Keyboard shortcuts reference */}
//             <div style={{
//               padding: "10px 18px 14px",
//               borderTop: "1px solid #f1f5f9",
//               flexShrink: 0,
//             }}>
//               <p style={{ fontSize: 10, fontWeight: 700, color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
//                 Shortcuts
//               </p>
//               {[
//                 ["Tab", "2-space indent"],
//                 ["↑↓ Enter", "Autocomplete"],
//                 ["{ ( [", "Auto-close pair"],
//                 ["Esc", "Dismiss autocomplete"],
//               ].map(([k, v]) => (
//                 <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
//                   <code style={{ fontSize: 10.5, color: "#6366f1", fontFamily: "monospace" }}>{k}</code>
//                   <span style={{ fontSize: 10.5, color: "#cbd5e1" }}>{v}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Editor pane */}
//           <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

//             {/* Editor tab bar */}
//             <div style={{
//               display: "flex", alignItems: "center",
//               padding: "0 0 0 0",
//               background: "#0a0d14",
//               borderBottom: "1px solid #f1f5f9",
//               flexShrink: 0,
//             }}>
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 8,
//                 padding: "8px 16px",
//                 borderRight: "1px solid #f1f5f9",
//                 borderBottom: "2px solid #6366f1",
//                 background: "#0d1117",
//               }}>
//                 <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
//                 <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
//                   solution.{lang === "cpp" ? "cpp" : lang === "python" ? "py" : "java"}
//                 </span>
//               </div>
//             </div>

//             {/* The actual CodeEditor component */}
//             <CodeEditor value={code} onChange={setCode} language={lang} />

//             {/* Bottom action bar */}
//             <div style={{
//               display: "flex", alignItems: "center", justifyContent: "space-between",
//               padding: "10px 18px",
//               background: "#0a0d14",
//               borderTop: "1px solid #f1f5f9",
//               flexShrink: 0,
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
//                 <span style={{ fontSize: 11, color: "#1f2937", fontFamily: "monospace" }}>
//                   {LANG_CONFIG[lang]?.label} · {code.split("\n").length} lines · {code.length} chars
//                 </span>
//               </div>

//               <div style={{ display: "flex", gap: 10 }}>
//                 <button
//                   onClick={onClose}
//                   style={{
//                     background: "#f1f5f9", border: "1px solid #e2e8f0",
//                     borderRadius: 8, padding: "8px 16px",
//                     fontSize: 12.5, fontWeight: 600, color: "#4b5563", cursor: "pointer",
//                     transition: "all 0.15s",
//                   }}
//                   onMouseEnter={(e) => { e.currentTarget.style.color = "#64748b"; }}
//                   onMouseLeave={(e) => { e.currentTarget.style.color = "#4b5563"; }}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={() => onSubmit(code, lang)}
//                   disabled={!code.trim() || loadingNext}
//                   style={{
//                     display: "flex", alignItems: "center", gap: 7,
//                     background: (code.trim() && !loadingNext)
//                       ? "linear-gradient(135deg, #059669, #10b981)"
//                       : "#f1f5f9",
//                     border: "none", borderRadius: 8, padding: "8px 18px",
//                     fontSize: 12.5, fontWeight: 700,
//                     color: (code.trim() && !loadingNext) ? "#fff" : "#1f2937",
//                     cursor: (code.trim() && !loadingNext) ? "pointer" : "not-allowed",
//                     boxShadow: (code.trim() && !loadingNext) ? "0 4px 16px rgba(16,185,129,0.3)" : "none",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   {loadingNext ? (
//                     <>
//                       <span style={{
//                         width: 12, height: 12,
//                         border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
//                         borderRadius: "50%", display: "inline-block",
//                         animation: "spin 0.7s linear infinite",
//                       }} />
//                       Evaluating…
//                     </>
//                   ) : (
//                     <><CheckCircle size={13} /> Submit Code</>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════
//    ROBOT AVATAR
// ══════════════════════════════════════════════════════════════ */
// const RobotAvatar = ({ isSpeaking }) => (
//   <svg viewBox="0 0 120 140" width="120" height="140" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
//     <defs>
//       <radialGradient id="antennaBall" cx="50%" cy="50%" r="50%">
//         <stop offset="0%" stopColor={isSpeaking ? "#4338ca" : "#6366f1"} />
//         <stop offset="100%" stopColor={isSpeaking ? "#6366f1" : "#3730a3"} />
//       </radialGradient>
//       <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
//         <stop offset="0%" stopColor="#c7d2fe" /><stop offset="100%" stopColor="#6366f1" />
//       </radialGradient>
//       <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
//         <stop offset="0%" stopColor="#1e1b4b" /><stop offset="100%" stopColor="#0f172a" />
//       </linearGradient>
//       <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
//         <stop offset="0%" stopColor="#1e1b4b" /><stop offset="100%" stopColor="#0f172a" />
//       </linearGradient>
//       <style>{`
//         @keyframes blink { 0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.05)} }
//         @keyframes mouthTalk {
//           0%{d:path("M48 86 Q60 88 72 86 Q60 90 48 86")}
//           25%{d:path("M48 86 Q60 95 72 86 Q60 91 48 86")}
//           50%{d:path("M48 86 Q60 90 72 86 Q60 98 48 86")}
//           75%{d:path("M48 86 Q60 93 72 86 Q60 89 48 86")}
//           100%{d:path("M48 86 Q60 88 72 86 Q60 90 48 86")}
//         }
//         @keyframes wave1{0%,100%{opacity:0.15;transform:scale(1)}50%{opacity:0.55;transform:scale(1.12)}}
//         @keyframes wave2{0%,100%{opacity:0.1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.22)}}
//         @keyframes wave3{0%,100%{opacity:0.06;transform:scale(1)}50%{opacity:0.25;transform:scale(1.34)}}
//         @keyframes antennaGlow{0%,100%{opacity:0.7}50%{opacity:1}}
//         @keyframes bodyPulse{0%,100%{opacity:0.6}50%{opacity:1}}
//         @keyframes earFlash{0%,80%,100%{fill:#312e81}90%{fill:#818cf8}}
//         .eye-left{transform-origin:38px 67px;animation:blink 4s ease-in-out infinite}
//         .eye-right{transform-origin:82px 67px;animation:blink 4s ease-in-out 0.2s infinite}
//         .mouth-talk{animation:mouthTalk 0.35s ease-in-out infinite}
//         .sr1{transform-origin:60px 70px;animation:${isSpeaking?"wave1 0.8s ease-in-out infinite":"none"};opacity:${isSpeaking?0.3:0}}
//         .sr2{transform-origin:60px 70px;animation:${isSpeaking?"wave2 0.8s ease-in-out 0.15s infinite":"none"};opacity:${isSpeaking?0.2:0}}
//         .sr3{transform-origin:60px 70px;animation:${isSpeaking?"wave3 0.8s ease-in-out 0.3s infinite":"none"};opacity:${isSpeaking?0.12:0}}
//         .ab{animation:${isSpeaking?"antennaGlow 0.6s ease-in-out infinite":"none"}}
//         .el{animation:${isSpeaking?"earFlash 1.2s ease-in-out infinite":"none"}}
//         .er{animation:${isSpeaking?"earFlash 1.2s ease-in-out 0.6s infinite":"none"}}
//         .cl{animation:${isSpeaking?"bodyPulse 0.5s ease-in-out infinite":"bodyPulse 2.5s ease-in-out infinite"}}
//       `}</style>
//     </defs>
//     <ellipse className="sr1" cx="60" cy="70" rx="58" ry="56" fill="none" stroke="#6366f1" strokeWidth="2"/>
//     <ellipse className="sr2" cx="60" cy="70" rx="70" ry="68" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
//     <ellipse className="sr3" cx="60" cy="70" rx="84" ry="82" fill="none" stroke="#6366f1" strokeWidth="1"/>
//     <line x1="60" y1="18" x2="60" y2="6" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round"/>
//     <circle className="ab" cx="60" cy="5" r="4.5" fill="url(#antennaBall)"/>
//     <rect x="52" y="108" width="16" height="8" rx="2" fill="#1e1b4b"/>
//     <rect x="30" y="116" width="60" height="26" rx="10" fill="url(#bodyGrad)" stroke="#3730a3" strokeWidth="0.8"/>
//     <rect x="40" y="121" width="40" height="16" rx="5" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.25)" strokeWidth="0.5"/>
//     <circle className="cl" cx="50" cy="129" r="3" fill="#6366f1"/>
//     <circle className="cl" cx="60" cy="129" r="3" fill="#818cf8" style={{animationDelay:"0.15s"}}/>
//     <circle className="cl" cx="70" cy="129" r="3" fill="#6366f1" style={{animationDelay:"0.3s"}}/>
//     <rect className="el" x="12" y="52" width="10" height="22" rx="4" fill="#312e81" stroke="#4338ca" strokeWidth="0.5"/>
//     <rect className="er" x="98" y="52" width="10" height="22" rx="4" fill="#312e81" stroke="#4338ca" strokeWidth="0.5"/>
//     <rect x="18" y="22" width="84" height="86" rx="18" fill="url(#faceGrad)" stroke="#3730a3" strokeWidth="0.8"/>
//     <rect x="26" y="23" width="68" height="5" rx="3" fill="rgba(129,140,248,0.15)"/>
//     <rect x="20" y="48" width="80" height="30" rx="6" fill="rgba(30,27,75,0.6)" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5"/>
//     <g className="eye-left">
//       <ellipse cx="38" cy="67" rx="10" ry="10" fill="rgba(99,102,241,0.15)"/>
//       <ellipse cx="38" cy="67" rx="7" ry="7" fill="url(#eyeGlow)"/>
//       <ellipse cx="38" cy="67" rx="4" ry="4" fill="#c7d2fe"/>
//       <ellipse cx="36.5" cy="65.5" rx="1.2" ry="1.2" fill="white" opacity="0.9"/>
//     </g>
//     <g className="eye-right">
//       <ellipse cx="82" cy="67" rx="10" ry="10" fill="rgba(99,102,241,0.15)"/>
//       <ellipse cx="82" cy="67" rx="7" ry="7" fill="url(#eyeGlow)"/>
//       <ellipse cx="82" cy="67" rx="4" ry="4" fill="#c7d2fe"/>
//       <ellipse cx="80.5" cy="65.5" rx="1.2" ry="1.2" fill="white" opacity="0.9"/>
//     </g>
//     <rect x="57" y="79" width="6" height="4" rx="2" fill="#312e81"/>
//     {isSpeaking ? (
//       <g>
//         <ellipse cx="60" cy="91" rx="13" ry="8" fill="#1e1b4b"/>
//         <path className="mouth-talk" d="M48 86 Q60 88 72 86 Q60 90 48 86" fill="#4338ca" stroke="none"/>
//         <rect x="51" y="86" width="18" height="5" rx="2" fill="rgba(199,210,254,0.9)"/>
//         <ellipse cx="60" cy="95" rx="6" ry="3" fill="#7c3aed" opacity="0.7"/>
//       </g>
//     ) : (
//       <path d="M47 89 Q60 94 73 89" fill="none" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round"/>
//     )}
//     <ellipse cx="28" cy="82" rx="5" ry="3" fill="rgba(167,139,250,0.15)" opacity={isSpeaking?0.8:0.3}/>
//     <ellipse cx="92" cy="82" rx="5" ry="3" fill="rgba(167,139,250,0.15)" opacity={isSpeaking?0.8:0.3}/>
//     <text x="60" y="148" textAnchor="middle" fontSize="10" fontFamily="'DM Sans',system-ui,sans-serif" fontWeight="600" fill={isSpeaking?"#818cf8":"#475569"} letterSpacing="0.08em">
//       {isSpeaking ? "● SPEAKING" : "● IDLE"}
//     </text>
//   </svg>
// );

// /* ══════════════════════════════════════════════════════════════
//    MAIN INTERVIEW SESSION
// ══════════════════════════════════════════════════════════════ */
// const InterviewSession = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const settings = location.state || {
//     interviewType: "Technical",
//     role: "Software Engineer",
//     duration: "10",
//     codingLang: "cpp",
//   };

//   const isCoding    = settings.interviewType?.toLowerCase().includes("coding");
//   const totalSeconds = Number(settings.duration) * 60;

//   const [timeLeft, setTimeLeft]   = useState(totalSeconds);
//   const [running,  setRunning]    = useState(true);
//   const [messages, setMessages]   = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState("");
//   const [lastFeedback,    setLastFeedback]     = useState("");
//   const [askedQuestions,  setAskedQuestions]   = useState([]);

//   // voice
//   const [listening,     setListening]     = useState(false);
//   const [voiceCaptured, setVoiceCaptured] = useState(false);
//   const [finalAnswer,   setFinalAnswer]   = useState("");
//   const [lastChunk,     setLastChunk]     = useState("");
//   const [waveLevel,     setWaveLevel]     = useState(0);
//   const [loadingNext,   setLoadingNext]   = useState(false);
//   const [lastMinuteWarningSpoken, setLastMinuteWarningSpoken] = useState(false);
//   const [aiSpeaking,    setAiSpeaking]    = useState(false);

//   // coding
//   const [codeEditorOpen,   setCodeEditorOpen]   = useState(false);
//   const [starterCode,      setStarterCode]      = useState("");
//   const [codeLanguage,     setCodeLanguage]     = useState(settings.codingLang || "cpp");
//   const [codingProblemCount, setCodingProblemCount] = useState(0);

//   const recognitionRef  = useRef(null);
//   const waveIntervalRef = useRef(null);
//   const videoRef        = useRef(null);
//   const streamRef       = useRef(null);

//   const speak = (text) => {
//     if (!text) return;
//     window.speechSynthesis.cancel();
//     const utt = new SpeechSynthesisUtterance(text);
//     utt.rate = 1; utt.pitch = 1;
//     utt.onstart = () => setAiSpeaking(true);
//     utt.onend   = () => setAiSpeaking(false);
//     utt.onerror = () => setAiSpeaking(false);
//     setAiSpeaking(true);
//     window.speechSynthesis.speak(utt);
//   };

//   useEffect(() => {
//     if (!running) return;
//     if (timeLeft <= 0) { endInterview(); return; }
//     const iv = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
//     return () => clearInterval(iv);
//   }, [timeLeft, running]);

//   useEffect(() => {
//     if (isCoding) return;
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) { alert("Speech Recognition not supported. Use Chrome."); return; }
//     const r = new SR();
//     r.continuous = false; r.lang = "en-US"; r.interimResults = false;
//     r.onresult = (ev) => {
//       const spoken = ev.results?.[0]?.[0]?.transcript || "";
//       if (!spoken.trim()) return;
//       setLastChunk(spoken);
//       setFinalAnswer((p) => (p + " " + spoken).trim());
//       setVoiceCaptured(true); setListening(false); stopWaveform(); setWaveLevel(0);
//     };
//     r.onerror = () => { setListening(false); stopWaveform(); setWaveLevel(0); };
//     r.onend   = () => { setListening(false); stopWaveform(); setWaveLevel(0); };
//     recognitionRef.current = r;
//   }, [isCoding]);

//   useEffect(() => {
//     startCamera(); startInterview();
//     return () => { stopCamera(); window.speechSynthesis.cancel(); stopWaveform(); };
//   }, []);

//   const startCamera = async () => {
//     try {
//       const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       streamRef.current = s;
//       if (videoRef.current) videoRef.current.srcObject = s;
//     } catch {}
//   };
//   const stopCamera = () => {
//     if (!streamRef.current) return;
//     streamRef.current.getTracks().forEach((t) => t.stop());
//     streamRef.current = null;
//   };
//   const startWaveform = () => {
//     stopWaveform();
//     waveIntervalRef.current = setInterval(() => setWaveLevel(Math.floor(Math.random() * 100)), 120);
//   };
//   const stopWaveform = () => {
//     if (waveIntervalRef.current) { clearInterval(waveIntervalRef.current); waveIntervalRef.current = null; }
//   };

//   const fetchNextQuestion = async (answerText, transcriptArr, askedArr) => {
//     const res = await fetch(`${BACKEND_URL}/api/interview/next`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         interviewType: settings.interviewType,
//         role: settings.role,
//         transcript: transcriptArr,
//         userAnswer: answerText,
//         askedQuestions: askedArr,
//         timeLeftSeconds: timeLeft,
//         codingLanguage: codeLanguage,
//       }),
//     });
//     return await res.json();
//   };

//   const startInterview = async () => {
//     try {
//       const first = await fetchNextQuestion(null, [], []);
//       if (!first?.nextQuestion) { setCurrentQuestion("⚠️ Server issue: No question received."); return; }
//       setMessages([{ role: "ai", content: first.nextQuestion }]);
//       setCurrentQuestion(first.nextQuestion);
//       setLastFeedback("");
//       setAskedQuestions([first.nextQuestion]);
//       if (isCoding) {
//         const langCfg = LANG_CONFIG[codeLanguage];
//         setStarterCode(first.starterCode || langCfg?.defaultCode(first.nextQuestion) || "");
//         setCodingProblemCount(1);
//         speak("Welcome to your DSA coding interview. Read the problem carefully and write your solution in the code editor.");
//         setTimeout(() => setCodeEditorOpen(true), 1200);
//       } else {
//         setTimeout(() => speak(first.nextQuestion), 250);
//       }
//     } catch {
//       setCurrentQuestion("❌ Backend not reachable. Start backend on port 5000.");
//     }
//   };

//   const startListening = () => {
//     if (!recognitionRef.current || !running) return;
//     window.speechSynthesis.cancel(); setAiSpeaking(false);
//     setListening(true); startWaveform();
//     try { recognitionRef.current.start(); } catch { setListening(false); stopWaveform(); }
//   };

//   const submitAnswer = async () => {
//     const ans = finalAnswer.trim();
//     if (!ans || !voiceCaptured) return;
//     setLoadingNext(true);
//     try {
//       const local = [...messages, { role: "user", content: ans }];
//       setMessages(local);
//       const ai = await fetchNextQuestion(ans, local, askedQuestions);
//       if (!ai?.nextQuestion) { setCurrentQuestion("⚠️ Server issue."); setLoadingNext(false); return; }
//       setLastFeedback(ai.shortFeedback || "");
//       setCurrentQuestion(ai.nextQuestion);
//       const updated = [...local,
//         ...(ai.shortFeedback ? [{ role:"ai", content:`Feedback: ${ai.shortFeedback}` }] : []),
//         { role:"ai", content: ai.nextQuestion },
//       ];
//       setMessages(updated);
//       setAskedQuestions((p) => [...p, ai.nextQuestion]);
//       if (timeLeft <= 60 && !lastMinuteWarningSpoken) {
//         setLastMinuteWarningSpoken(true);
//         speak("We have less than one minute left. This will be the last question.");
//         setTimeout(() => speak(ai.nextQuestion), 1800);
//       } else {
//         setTimeout(() => speak(ai.nextQuestion), 200);
//       }
//       setFinalAnswer(""); setLastChunk(""); setVoiceCaptured(false);
//     } catch { setCurrentQuestion("❌ Error: Backend issue"); }
//     finally { setLoadingNext(false); }
//   };

//   const submitCode = async (code, lang) => {
//     if (!code.trim()) return;
//     setLoadingNext(true);
//     try {
//       const entry = `[Code Submission #${codingProblemCount} · ${LANG_CONFIG[lang]?.label}]\n\`\`\`${lang}\n${code}\n\`\`\``;
//       const local = [...messages, { role:"user", content: entry }];
//       setMessages(local);
//       const ai = await fetchNextQuestion(entry, local, askedQuestions);
//       if (!ai?.nextQuestion) { setCurrentQuestion("⚠️ Server issue."); setLoadingNext(false); setCodeEditorOpen(false); return; }
//       setLastFeedback(ai.shortFeedback || "");
//       setCurrentQuestion(ai.nextQuestion);
//       const langCfg = LANG_CONFIG[lang];
//       setStarterCode(ai.starterCode || langCfg?.defaultCode(ai.nextQuestion) || "");
//       setCodingProblemCount((n) => n + 1);
//       const updated = [...local,
//         ...(ai.shortFeedback ? [{ role:"ai", content:`Code Feedback: ${ai.shortFeedback}` }] : []),
//         { role:"ai", content: ai.nextQuestion },
//       ];
//       setMessages(updated);
//       setAskedQuestions((p) => [...p, ai.nextQuestion]);
//       const feedback = ai.shortFeedback
//         ? `${ai.shortFeedback} Here is your next problem.`
//         : "Good attempt. Here is your next problem.";
//       speak(feedback);
//       setCodeEditorOpen(false);
//       setTimeout(() => setCodeEditorOpen(true), 600);
//     } catch { setCurrentQuestion("❌ Error: Backend issue"); }
//     finally { setLoadingNext(false); }
//   };

//   const endInterview = async () => {
//     setRunning(false); window.speechSynthesis.cancel(); setAiSpeaking(false); setCodeEditorOpen(false);
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/interview/end`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ interviewType: settings.interviewType, role: settings.role, duration: settings.duration, transcript: messages }),
//       });
//       const report = await res.json();
//       generatePDF(report);
//     } catch { alert("❌ Could not generate report."); }
//     stopCamera(); navigate("/mock-interview");
//   };

//   const generatePDF = (report) => {
//     const doc = new jsPDF();
//     doc.setFontSize(18); doc.text("PrepWise - Interview Report", 15, 20);
//     doc.setFontSize(12);
//     doc.text(`Interview Type: ${settings.interviewType}`, 15, 35);
//     doc.text(`Role: ${settings.role}`, 15, 43);
//     doc.text(`Duration: ${settings.duration} minutes`, 15, 51);
//     doc.setFontSize(14); doc.text(`Performance Score: ${report.score ?? 0}/10`, 15, 65);
//     let y = 78;
//     const section = (title, items) => {
//       doc.setFontSize(13); doc.text(title, 15, y); y += 8; doc.setFontSize(11);
//       (items || ["None"]).forEach((s, i) => { doc.text(`${i+1}. ${s}`, 18, y); y += 7; }); y += 5;
//     };
//     section("Strengths:", report.strengths);
//     section("Improvements:", report.improvements);
//     section("Focus Areas:", report.focusAreas);
//     doc.setFontSize(13); doc.text("Final Feedback:", 15, y); y += 8; doc.setFontSize(11);
//     doc.text(doc.splitTextToSize(report.finalFeedback || "Good effort!", 170), 15, y);
//     doc.save("PrepWise_Interview_Report.pdf");
//     alert("✅ Interview complete! PDF downloaded.");
//   };

//   const formatTime = (sec) => `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
//   const timePercent = (timeLeft / totalSeconds) * 100;
//   const timeColor   = timeLeft <= 60 ? "#dc2626" : timeLeft <= totalSeconds * 0.3 ? "#b45309" : "#818cf8";

//   const BARS = 18;
//   const waveHeights = Array.from({ length: BARS }, (_, i) => {
//     if (!listening) return 4;
//     const dist = Math.abs(i - BARS/2) / (BARS/2);
//     return 4 + (waveLevel * (1 - dist * 0.7)) / 100 * 28;
//   });

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
//         @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

//         @keyframes pulse-dot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
//         @keyframes glow-ring  { 0%,100%{box-shadow:0 0 0 4px rgba(99,102,241,0.1),0 0 20px rgba(99,102,241,0.15)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0.18),0 0 36px rgba(99,102,241,0.3)} }
//         @keyframes glow-ring-active { 0%,100%{box-shadow:0 0 0 4px rgba(99,102,241,0.25),0 0 28px rgba(99,102,241,0.4)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0.35),0 0 48px rgba(99,102,241,0.55)} }
//         @keyframes slide-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes spin        { to{transform:rotate(360deg)} }
//         @keyframes code-pulse  { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,0.2)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,0.35),0 0 24px rgba(99,102,241,0.3)} }

//         .session-root * { box-sizing:border-box; }
//         .speak-btn:hover:not(:disabled) { transform:scale(1.04); box-shadow:0 12px 32px rgba(99,102,241,0.45)!important; }
//         .speak-btn  { transition:transform 0.18s,box-shadow 0.18s; }
//         .action-btn:hover:not(:disabled) { filter:brightness(1.15); transform:translateY(-1px); }
//         .action-btn { transition:filter 0.15s,transform 0.15s; }
//         .end-btn:hover { background:rgba(239,68,68,0.18)!important; border-color:rgba(239,68,68,0.5)!important; }
//         .end-btn { transition:background 0.2s,border-color 0.2s; }
//         .open-editor-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(99,102,241,0.4)!important; }
//         .open-editor-btn { transition:transform 0.18s,box-shadow 0.18s; }
//         .robot-wrapper { transition:filter 0.4s ease; }
//         .robot-wrapper.speaking { filter:drop-shadow(0 0 18px rgba(99,102,241,0.5)); }
//         .robot-wrapper.idle     { filter:drop-shadow(0 0 6px rgba(99,102,241,0.15)); }
//         .editor-scroll::-webkit-scrollbar { width:5px; }
//         .editor-scroll::-webkit-scrollbar-track { background:transparent; }
//         .editor-scroll::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.2); border-radius:4px; }
//       `}</style>

//       {/* ── CODE EDITOR MODAL ── */}
//       <CodeEditorModal
//         open={codeEditorOpen}
//         problem={currentQuestion}
//         starterCode={starterCode}
//         language={codeLanguage}
//         onLanguageChange={setCodeLanguage}
//         onSubmit={submitCode}
//         onClose={() => setCodeEditorOpen(false)}
//         loadingNext={loadingNext}
//       />

//       <div className="session-root" style={{
//         minHeight: "calc(100vh - 80px)",
//         background: "#030712",
//         fontFamily: "'DM Sans', system-ui, sans-serif",
//         padding: "28px 24px",
//         color: "#0f172a",
//       }}>
//         <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

//           {/* ── HEADER ── */}
//           <div style={{
//             display:"flex", alignItems:"center", justifyContent:"space-between",
//             background:"#f8fafc", border:"1px solid #e5e7eb",
//             borderRadius: 20, padding:"18px 28px",
//           }}>
//             <div>
//               <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
//                 <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", animation:"pulse-dot 1.6s ease-in-out infinite", boxShadow:"0 0 8px #22c55e" }} />
//                 <span style={{ fontSize:12, fontWeight:700, color:"#22c55e", letterSpacing:"0.1em", textTransform:"uppercase" }}>Live Session</span>
//                 {isCoding && (
//                   <span style={{ fontSize:11, fontWeight:700, color:"#b45309", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:6, padding:"2px 8px", letterSpacing:"0.07em" }}>
//                     ⌨️ CODING MODE · {LANG_CONFIG[codeLanguage]?.label}
//                   </span>
//                 )}
//               </div>
//               <h1 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:800, letterSpacing:"-0.02em", margin:0, color:"#0f172a" }}>
//                 {settings.role} Interview
//               </h1>
//               <p style={{ fontSize:13, color:"#475569", margin:"4px 0 0", fontWeight:500 }}>
//                 {settings.interviewType} · AI Voice Interview · {isCoding ? `Problem ${codingProblemCount}` : "Unlimited Questions"}
//               </p>
//             </div>
//             <div style={{ textAlign:"right" }}>
//               <p style={{ fontSize:11, color:"#475569", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Time Remaining</p>
//               <p style={{ fontSize:36, fontWeight:800, letterSpacing:"-0.03em", color:timeColor, lineHeight:1, margin:0, transition:"color 0.5s" }}>
//                 {formatTime(timeLeft)}
//               </p>
//               <div style={{ marginTop:8, width:120, height:4, background:"#e5e7eb", borderRadius:4, marginLeft:"auto" }}>
//                 <div style={{ height:"100%", borderRadius:4, width:`${timePercent}%`, background:timeColor, transition:"width 1s linear,background 0.5s" }} />
//               </div>
//             </div>
//           </div>

//           {/* ── MAIN GRID ── */}
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

//             {/* AI Interviewer card */}
//             <div style={{
//               background:"#f8fafc", border:"1px solid #e5e7eb",
//               borderRadius:22, padding:"32px 28px",
//               display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
//               position:"relative", overflow:"hidden",
//             }}>
//               <div style={{ position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)", width:200, height:100, background:`radial-gradient(ellipse,${aiSpeaking?"rgba(99,102,241,0.28)":"rgba(99,102,241,0.12)"} 0%,transparent 70%)`, transition:"background 0.5s", pointerEvents:"none" }} />
//               <div className={`robot-wrapper ${aiSpeaking?"speaking":"idle"}`} style={{ width:140, height:160, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", background:aiSpeaking?"rgba(99,102,241,0.08)":"#f8fafc", border:`2px solid ${aiSpeaking?"rgba(99,102,241,0.35)":"#e5e7eb"}`, animation:aiSpeaking?"glow-ring-active 1s ease-in-out infinite":"glow-ring 3s ease-in-out infinite", transition:"background 0.4s,border-color 0.4s", padding:12 }}>
//                 <RobotAvatar isSpeaking={aiSpeaking} />
//               </div>
//               <p style={{ marginTop:16, fontSize:18, fontWeight:700, color:"#1e293b" }}>AI Interviewer</p>
//               <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4, padding:"4px 12px", borderRadius:20, background:aiSpeaking?"rgba(99,102,241,0.12)":"transparent", border:`1px solid ${aiSpeaking?"rgba(99,102,241,0.3)":"transparent"}`, transition:"all 0.3s ease" }}>
//                 <div style={{ width:6, height:6, borderRadius:"50%", background:aiSpeaking?"#818cf8":"#cbd5e1", boxShadow:aiSpeaking?"0 0 8px #818cf8":"none", animation:aiSpeaking?"pulse-dot 0.8s ease-in-out infinite":"none", transition:"background 0.3s" }} />
//                 <span style={{ fontSize:11.5, color:aiSpeaking?"#4338ca":"#cbd5e1", fontWeight:600, transition:"color 0.3s" }}>
//                   {aiSpeaking ? "Speaking now…" : isCoding ? "Waiting for your code" : listening ? "Listening to you" : "Waiting for your answer"}
//                 </span>
//               </div>
//               {lastFeedback && (
//                 <div style={{ marginTop:14, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:14, padding:"10px 16px", maxWidth:320, fontSize:13, color:"#4338ca", lineHeight:1.6, animation:"slide-up 0.3s ease" }}>
//                   <span style={{ fontSize:11, fontWeight:700, color:"#6366f1", display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>
//                     {isCoding ? "Code Feedback" : "Feedback"}
//                   </span>
//                   {lastFeedback}
//                 </div>
//               )}
//               <div style={{ marginTop:24, display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
//                 <button onClick={() => speak(currentQuestion)} className="action-btn" style={{ display:"flex", alignItems:"center", gap:7, background:"#f1f5f9", border:"1px solid #cbd5e1", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:600, color:"#64748b", cursor:"pointer" }}>
//                   <Volume2 size={14} />{isCoding ? "Read Problem" : "Repeat"}
//                 </button>
//                 {!isCoding && (
//                   <button onClick={startListening} disabled={listening || !running} className="speak-btn" style={{ display:"flex", alignItems:"center", gap:7, background:listening?"linear-gradient(135deg,#dc2626,#b91c1c)":"linear-gradient(135deg,#4f46e5,#7c3aed)", border:"none", borderRadius:12, padding:"10px 20px", fontSize:13, fontWeight:700, color:"#fff", cursor:listening?"default":"pointer", boxShadow:listening?"0 8px 24px rgba(220,38,38,0.35)":"0 8px 24px rgba(99,102,241,0.3)", opacity:!running?0.5:1 }}>
//                     {listening ? <><MicOff size={14}/> Listening…</> : <><Mic size={14}/> Speak</>}
//                   </button>
//                 )}
//               </div>
//               {!isCoding && (
//                 <div style={{ marginTop:24, display:"flex", gap:3, alignItems:"flex-end", height:36 }}>
//                   {waveHeights.map((h, i) => (
//                     <div key={i} style={{ width:4, borderRadius:4, height:h, background:listening?`rgba(99,102,241,${0.4+(i%3)*0.2})`:"#e2e8f0", transition:"height 0.1s ease,background 0.3s" }} />
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* You card */}
//             <div style={{ background:"#f8fafc", border:"1px solid #e5e7eb", borderRadius:22, padding:"32px 28px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
//               <div style={{ width:180, height:180, borderRadius:"50%", overflow:"hidden", border:listening?"2px solid rgba(34,197,94,0.5)":isCoding?"2px solid rgba(99,102,241,0.3)":"2px solid #cbd5e1", boxShadow:listening?"0 0 0 6px rgba(34,197,94,0.08)":"0 0 0 6px #f8fafc", background:"#0f172a", transition:"border 0.3s,box-shadow 0.3s" }}>
//                 <video ref={videoRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
//               </div>
//               <p style={{ marginTop:14, fontSize:18, fontWeight:700, color:"#1e293b" }}>You</p>

//               {isCoding ? (
//                 <div style={{ width:"100%", marginTop:12, display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
//                   <p style={{ fontSize:13, color:"#64748b", fontWeight:500, margin:0 }}>
//                     {loadingNext ? "Evaluating your code…" : codeEditorOpen ? "Code editor is open ↗" : "Open the editor to write your solution"}
//                   </p>
//                   <button onClick={() => setCodeEditorOpen(true)} disabled={!running || loadingNext} className="open-editor-btn" style={{ display:"flex", alignItems:"center", gap:8, background:(running&&!loadingNext)?"linear-gradient(135deg,#4f46e5,#7c3aed)":"#f1f5f9", border:"none", borderRadius:14, padding:"13px 28px", fontSize:14, fontWeight:700, color:"#fff", cursor:(running&&!loadingNext)?"pointer":"not-allowed", boxShadow:(running&&!loadingNext)?"0 8px 28px rgba(99,102,241,0.35)":"none", opacity:(!running||loadingNext)?0.5:1, animation:(running&&!loadingNext&&!codeEditorOpen)?"code-pulse 2s ease-in-out infinite":"none" }}>
//                     {loadingNext ? (
//                       <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />Evaluating…</>
//                     ) : (
//                       <><Code2 size={15}/> Open Code Editor</>
//                     )}
//                   </button>
//                   <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
//                     {Array.from({ length: codingProblemCount }).map((_, i) => (
//                       <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:i===codingProblemCount-1?"rgba(99,102,241,0.2)":"rgba(34,197,94,0.15)", border:`1px solid ${i===codingProblemCount-1?"rgba(99,102,241,0.4)":"rgba(34,197,94,0.3)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:i===codingProblemCount-1?"#818cf8":"#22c55e" }}>
//                         {i+1}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
//                     <div style={{ width:7, height:7, borderRadius:"50%", background:listening?"#22c55e":voiceCaptured?"#818cf8":"#cbd5e1", boxShadow:listening?"0 0 8px #22c55e":voiceCaptured?"0 0 8px #818cf8":"none", animation:listening?"pulse-dot 1s ease-in-out infinite":"none", transition:"background 0.3s" }} />
//                     <p style={{ fontSize:12.5, color:"#64748b", fontWeight:500 }}>
//                       {listening ? "Listening… speak now 🎙️" : voiceCaptured ? "Answer captured — click Submit" : "Click Speak to answer"}
//                     </p>
//                   </div>
//                   <div style={{ marginTop:16, width:"100%", textAlign:"left" }}>
//                     <p style={{ fontSize:11, fontWeight:700, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Your Answer</p>
//                     <div style={{ minHeight:80, background:"rgba(0,0,0,0.3)", border:`1px solid ${voiceCaptured?"rgba(99,102,241,0.3)":"#e5e7eb"}`, borderRadius:14, padding:"12px 16px", fontSize:13.5, color:finalAnswer?"#1e293b":"#cbd5e1", lineHeight:1.65, transition:"border-color 0.3s" }}>
//                       {finalAnswer || "🎙️ Click Speak and start answering…"}
//                     </div>
//                     {lastChunk && <p style={{ marginTop:6, fontSize:11.5, color:"#334155", fontStyle:"italic" }}>Last: "{lastChunk}"</p>}
//                   </div>
//                   <button onClick={submitAnswer} disabled={!running||!voiceCaptured||loadingNext} className="action-btn" style={{ marginTop:18, display:"flex", alignItems:"center", gap:8, background:(running&&voiceCaptured&&!loadingNext)?"linear-gradient(135deg,#059669,#10b981)":"#f1f5f9", border:(running&&voiceCaptured&&!loadingNext)?"none":"1px solid #e2e8f0", color:(running&&voiceCaptured&&!loadingNext)?"#fff":"#cbd5e1", borderRadius:12, padding:"11px 22px", fontSize:13.5, fontWeight:700, cursor:(running&&voiceCaptured&&!loadingNext)?"pointer":"not-allowed", boxShadow:(running&&voiceCaptured&&!loadingNext)?"0 8px 24px rgba(16,185,129,0.3)":"none" }}>
//                     {loadingNext ? (<><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />Submitting…</>) : (<><Send size={14}/>Submit Answer</>)}
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* ── QUESTION BAR ── */}
//           <div style={{ background:isCoding?"rgba(245,158,11,0.06)":"rgba(99,102,241,0.06)", border:`1px solid ${isCoding?"rgba(245,158,11,0.2)":"rgba(99,102,241,0.18)"}`, borderRadius:16, padding:"18px 24px", display:"flex", alignItems:"flex-start", gap:14 }}>
//             <div style={{ minWidth:32, height:32, borderRadius:10, background:isCoding?"rgba(245,158,11,0.15)":"rgba(99,102,241,0.15)", border:`1px solid ${isCoding?"rgba(245,158,11,0.3)":"rgba(99,102,241,0.25)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
//               {isCoding ? "⌨️" : "❓"}
//             </div>
//             <div style={{ flex:1 }}>
//               <p style={{ fontSize:11, fontWeight:700, color:isCoding?"#b45309":"#6366f1", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>
//                 {isCoding ? `DSA Problem #${codingProblemCount}` : "Current Question"}
//               </p>
//               <p style={{ fontSize:15, color:"#cbd5e1", lineHeight:1.65, margin:0, fontWeight:500, whiteSpace:"pre-wrap" }}>
//                 {currentQuestion || "Loading first question…"}
//               </p>
//               {isCoding && (
//                 <button onClick={() => setCodeEditorOpen(true)} style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:6, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"7px 14px", fontSize:12.5, fontWeight:600, color:"#fbbf24", cursor:"pointer" }}>
//                   <Play size={12}/> Solve in Editor
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* ── FOOTER ── */}
//           <div style={{ display:"flex", justifyContent:"center", paddingTop:4 }}>
//             <button onClick={endInterview} className="end-btn" style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#dc2626", borderRadius:12, padding:"11px 26px", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>
//               <LogOut size={15}/> End Interview
//             </button>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// };

// export default InterviewSession;