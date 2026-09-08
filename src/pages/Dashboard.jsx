import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import bannerImg from "../banner.jpg";
import {
  Users,
  FileEdit,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Briefcase,
  FileText,
  ArrowRight,
  Play,
  ChevronRight,
  Brain,
  FileSearch,
  GitBranch,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Utility: intersection-observer hook for
   scroll-triggered reveal animations
───────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    const numeric = parseInt(target.replace(/\D/g, ""));
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(numeric / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  const display = target.includes("+") ? `${count}+` : target.includes("%") ? `${count}%` : target.includes("/") ? target : `${count}`;
  return <span ref={ref}>{display}</span>;
}

/* ─────────────────────────────────────────────
   Floating particle background
───────────────────────────────────────────── */
function ParticleField() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 6,
    duration: Math.random() * 8 + 6,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(148,163,184,0.35)",
            animation: `floatDot ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const handleGetStarted = () => (isSignedIn ? navigate("/career-compass") : openSignIn());

  return (
    <section style={s.heroSection}>
      <ParticleField />

      {/* Glow blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* Grid overlay */}
      <div style={s.gridOverlay} />

      <div style={s.heroInner}>
        {/* Eyebrow badge */}
        <div style={s.badge}>
          <Sparkles size={13} color="#60a5fa" />
          <span>AI-Powered Career Intelligence</span>
          
        </div>

        {/* Headline */}
        <h1 style={s.heroHeading}>
          <span style={s.heroLine1}>Your AI Career Coach</span>
          <span style={s.heroLine2}>for Professional Success</span>
        </h1>

        <p style={s.heroSubtitle}>
          Advance your career with personalized guidance, AI-powered interview
          prep, and smart tools that adapt to your ambitions.
        </p>

        {/* CTA buttons */}
        <div style={s.ctaRow}>
          <button onClick={handleGetStarted} style={s.ctaPrimary} className="cta-primary">
            {isSignedIn ? "Go to Career Compass" : "Get Started Free"}
            <ArrowRight size={16} />
          </button>
         
        </div>
        {!isSignedIn && (
          <p style={{ fontSize: 12.5, color: "#64748b", marginTop: -14, marginBottom: 24 }}>
            Please sign in or sign up to access any tool on this platform — it's free.
          </p>
        )}

        

        {/* Dashboard mockup */}
        <div style={s.mockupWrapper}>
          <div style={s.mockupGlow} />
          <div style={s.mockupFrame}>
            <div style={s.mockupBar}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} style={{ ...s.mockupDot, background: c }} />
              ))}
              <span style={s.mockupUrl}>StrivAIra/dashboard</span>
            </div>
            <img
              src={bannerImg}
              alt="Dashboard Preview"
              style={s.mockupImg}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.style.background = "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)";
                e.target.parentElement.style.minHeight = "320px";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
function Stats() {
  const [ref, visible] = useReveal(0.2);
  const stats = [
    { value: "50+", label: "Industries Covered", icon: "▦" },

{ value: "1000+", label: "Interview Questions", icon: "◎" },

{ value: "95%", label: "Success Rate", icon: "↗" },

{ value: "24/7", label: "AI Support", icon: "◉" },
  ];
  return (
    <section style={s.statsSection} ref={ref}>
      <div style={s.statsInner} className="stats-inner">
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              ...s.statCard,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.55s ${i * 0.1}s, transform 0.55s ${i * 0.1}s`,
            }}
          >
            <div style={s.statEmoji}>{stat.icon}</div>
            <div style={s.statValue}>
              {stat.value === "24/7" ? "24/7" : <AnimatedCounter target={stat.value} />}
            </div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorks() {
  const [ref, visible] = useReveal(0.1);
  const steps = [
    {
      icon: <Users size={26} />,
      step: "01",
      title: "Professional Onboarding",
      description: "Share your industry and expertise level. We tailor every recommendation to your specific career context.",
    },
    {
      icon: <FileEdit size={26} />,
      step: "02",
      title: "Craft Your Documents",
      description: "Generate ATS-optimized resumes and compelling cover letters that beat the algorithm and impress humans.",
    },
    {
      icon: <MessageSquare size={26} />,
      step: "03",
      title: "Prepare for Interviews",
      description: "Practice with AI-powered mock interviews tailored to your target role, company, and seniority level.",
    },
    {
      icon: <TrendingUp size={26} />,
      step: "04",
      title: "Track Your Progress",
      description: "Monitor growth with detailed performance analytics. Know exactly where to improve and celebrate wins.",
    },
  ];

  return (
    <section style={s.howSection} ref={ref}>
      {/* Section label */}
      <div style={s.sectionMeta}>
        <span style={s.sectionPill}>HOW IT WORKS</span>
      </div>
      <h2 style={s.sectionHeading}>
        Four steps to your{" "}
        <span style={s.gradientText}>dream career</span>
      </h2>
      <p style={s.sectionSubtitle}>
        A proven, structured path from where you are to where you want to be.
      </p>

      {/* Steps */}
      <div style={s.stepsGrid}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              ...s.stepCard,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition: `opacity 0.6s ${i * 0.12}s, transform 0.6s ${i * 0.12}s`,
            }}
            className="step-card"
          >
            {/* Connector line */}
            {i < steps.length - 1 && <div style={s.connector} />}

            <div style={s.stepTop}>
              <div style={s.stepIconWrap}>{step.icon}</div>
              <span style={s.stepNum}>{step.step}</span>
            </div>
            <h3 style={s.stepTitle}>{step.title}</h3>
            <p style={s.stepDesc}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
function Features() {
  const [ref, visible] = useReveal(0.1);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const goTo = (path) => (isSignedIn ? navigate(path) : openSignIn());

  const features = [
    { icon: <Brain size={22} />, title: "Interest & Personality Analysis", description: "A quick, grounded read on how you work best and what to weigh in a career choice.", accent: "#3b82f6", glow: "rgba(59,130,246,0.15)", path: "/career-analyzer" },
    { icon: <FileSearch size={22} />, title: "Resume, LinkedIn & GitHub Analysis", description: "GitHub pulled live from its public API, plus your resume and LinkedIn summary, analyzed together.", accent: "#818cf8", glow: "rgba(129,140,248,0.15)", path: "/career-analyzer" },
    { icon: <Sparkles size={22} />, title: "AI Career Recommendation", description: "Get a role recommendation grounded in your interests, skills, or resume — not a generic list.", accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)", path: "/career-compass" },
    { icon: <GitBranch size={22} />, title: "Skill Gap Analysis", description: "See exactly which skills you already have for a target role, and which ones to prioritize next.", accent: "#10b981", glow: "rgba(16,185,129,0.15)", path: "/career-analyzer" },
    { icon: <FileEdit size={22} />, title: "Personalized Learning Roadmap", description: "A visual, adaptive path from your current skills to placement-ready, with courses and mini-projects.", accent: "#06b6d4", glow: "rgba(6,182,212,0.15)", path: "/career-roadmap" },
    { icon: <Briefcase size={22} />, title: "Job Market, Trends & Salary Prediction", description: "Real, sourced demand, salary, and automation-risk data — not AI estimates.", accent: "#f59e0b", glow: "rgba(245,158,11,0.15)", path: "/trends" },
    { icon: <TrendingUp size={22} />, title: "Career Growth & Promotion Prediction", description: "The realistic promotion ladder for any role — timeline, salary, skills, and certifications.", accent: "#ec4899", glow: "rgba(236,72,153,0.15)", path: "/career-compass" },
    { icon: <MessageSquare size={22} />, title: "AI Career Mentor", description: "Ask real questions like \"should I learn Java or Python first?\" and get a direct, personalized answer.", accent: "#3b82f6", glow: "rgba(59,130,246,0.15)", path: "/strivaira-chatbot" },
    { icon: <Play size={22} />, title: "AI Interview Coach", description: "Practice technical, HR, and coding interviews with instant, structured feedback.", accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)", path: "/mock-interview" },
    { icon: <FileText size={22} />, title: "Career Digital Twin & Continuous Tracking", description: "A living profile that updates your placement readiness as you finish courses, certs, and projects.", accent: "#f59e0b", glow: "rgba(245,158,11,0.15)", path: "/digital-twin" },
  ];

  return (
    <section style={s.featSection} ref={ref}>
      <div style={s.sectionMeta}>
        <span style={s.sectionPill}>ALL 10 FEATURES</span>
      </div>
      <h2 style={s.sectionHeading}>
        Everything you need to{" "}
        <span style={s.gradientText}>land the role</span>
      </h2>
      <p style={s.sectionSubtitle}>
        A complete career acceleration suite — not just another resume tool.
        {!isSignedIn && " Sign in to open any card below."}
      </p>

      <div style={s.featGrid}>
        {features.map((feat, i) => (
          <div
            key={i}
            onClick={() => goTo(feat.path)}
            role="button"
            tabIndex={0}
            style={{
              ...s.featCard,
              cursor: "pointer",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
              transition: `opacity 0.5s ${i * 0.06}s, transform 0.5s ${i * 0.06}s`,
              "--card-glow": feat.glow,
              "--card-accent": feat.accent,
            }}
            className="feat-card"
          >
            <div style={{ ...s.featIconWrap, background: feat.glow, color: feat.accent }}>
              {feat.icon}
            </div>
            <div style={{ ...s.featAccentLine, background: feat.accent }} />
            <h3 style={s.featTitle}>{feat.title}</h3>
            <p style={s.featDesc}>{feat.description}</p>
            <div style={{ ...s.featArrow, color: feat.accent, fontSize: 11.5, gap: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
              {isSignedIn ? "Open" : "Sign in to open"}
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────── */
function CTABanner() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const handleClick = () => (isSignedIn ? navigate("/career-compass") : openSignIn());
  return (
    <section style={s.ctaBanner}>
      <div style={s.ctaBannerGlow} />
      <div style={s.ctaBannerInner}>
        <h2 style={s.ctaBannerHeading}>Ready to accelerate your career?</h2>
        <p style={s.ctaBannerSub}>
          Join thousands of professionals who landed their dream roles with AI Career Coach.
        </p>
        <button onClick={handleClick} style={s.ctaBannerBtn} className="cta-primary">
          {isSignedIn ? "Go to Career Compass" : "Start for Free — No Credit Card"}
          <ArrowRight size={16} />
        </button>
        {!isSignedIn && (
          <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 14 }}>
            Please sign in or sign up first — every tool here requires an account.
          </p>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAGE EXPORT
───────────────────────────────────────────── */
export default function Dashboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Cal+Sans&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes floatDot {
          from { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          to   { transform: translateY(-18px) translateX(8px); opacity: 0.7; }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.06); }
        }

        .cta-primary {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          transition: transform 0.2s, box-shadow 0.2s !important;
        }
        .cta-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 36px rgba(59,130,246,0.4) !important;
        }
        .cta-secondary:hover { background: #e5e7eb !important; }

        .step-card:hover { border-color: rgba(148,163,184,0.2) !important; background: #f1f5f9 !important; }

        .feat-card:hover {
          border-color: var(--card-accent) !important;
          box-shadow: 0 0 0 1px var(--card-accent), 0 20px 48px var(--card-glow) !important;
          transform: translateY(-4px) scale(1) !important;
        }

        .stats-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        @media (max-width: 720px) {
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-inner { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .cta-primary, .cta-secondary { width: 100%; justify-content: center !important; }
        }
      `}</style>

      <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#0f172a" }}>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <CTABanner />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const s = {
  /* ── Hero ── */
  heroSection: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    overflow: "hidden",
    padding: "120px 24px 80px",
  },
  blob1: {
    position: "absolute", top: "-18%", left: "-12%",
    width: 700, height: 700, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
    animation: "pulse-glow 7s ease-in-out infinite",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: "-20%", right: "-10%",
    width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
    animation: "pulse-glow 9s 2s ease-in-out infinite",
    pointerEvents: "none",
  },
  gridOverlay: {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: `linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)`,
    backgroundSize: "64px 64px",
  },
  heroInner: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", maxWidth: 860, width: "100%",
  },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: 100, padding: "6px 14px",
    fontSize: 12.5, color: "#94a3b8", marginBottom: 32,
    backdropFilter: "blur(8px)",
    letterSpacing: 0.3,
  },
  heroHeading: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, lineHeight: 1.05,
    marginBottom: 24,
  },
  heroLine1: {
    display: "block",
    fontSize: "clamp(42px, 7vw, 80px)",
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  heroLine2: {
    display: "block",
    fontSize: "clamp(42px, 7vw, 80px)",
    letterSpacing: "-0.03em",
    background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    maxWidth: 540, fontSize: 17, color: "#64748b",
    lineHeight: 1.7, marginBottom: 36,
  },
  ctaRow: {
    display: "flex", alignItems: "center", gap: 14,
    flexWrap: "wrap", justifyContent: "center",
    marginBottom: 24,
  },
  ctaPrimary: {
    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "13px 26px", fontSize: 15, fontWeight: 600,
    cursor: "pointer", letterSpacing: 0.2,
    boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
  },
  ctaSecondary: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    color: "#1e293b", borderRadius: 12,
    padding: "13px 22px", fontSize: 15, fontWeight: 500,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
    transition: "background 0.2s",
  },
  playIcon: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#cbd5e1",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  trustRow: {
    display: "flex", gap: 20, flexWrap: "wrap",
    justifyContent: "center", marginBottom: 52,
  },
  trustItem: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12.5, color: "#475569",
  },
  trustDot: {
    width: 5, height: 5, borderRadius: "50%",
    background: "#22c55e",
  },
  mockupWrapper: {
    position: "relative", width: "100%", maxWidth: 820,
  },
  mockupGlow: {
    position: "absolute", inset: -2,
    background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(99,102,241,0.2))",
    borderRadius: 18, filter: "blur(20px)", zIndex: 0,
  },
  mockupFrame: {
    position: "relative", zIndex: 1,
    background: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: 14, overflow: "hidden",
    boxShadow: "0 32px 80px rgba(15,23,42,0.16)",
  },
  mockupBar: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "10px 16px",
    background: "#1e293b",
    borderBottom: "1px solid #e5e7eb",
  },
  mockupDot: { width: 10, height: 10, borderRadius: "50%" },
  mockupUrl: {
    marginLeft: 8, fontSize: 11.5, color: "#475569",
    background: "#f1f5f9",
    padding: "3px 12px", borderRadius: 6,
  },
  mockupImg: { width: "100%", display: "block" },

  /* ── Stats ── */
  statsSection: {
    background: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    padding: "48px 24px",
  },
  statsInner: {
    maxWidth: 960, margin: "0 auto",
  },
  statCard: {
    textAlign: "center", padding: "28px 20px",
    borderRight: "1px solid #e5e7eb",
  },
  statEmoji: { fontSize: 26, marginBottom: 10 },
  statValue: {
    fontSize: "clamp(34px, 5vw, 50px)",
    fontWeight: 700, color: "#0f172a",
    letterSpacing: "-0.02em", lineHeight: 1,
    marginBottom: 8,
  },
  statLabel: { fontSize: 13.5, color: "#475569", fontWeight: 500 },

  /* ── Shared section layout ── */
  sectionMeta: { textAlign: "center", marginBottom: 14 },
  sectionPill: {
    fontSize: 11, fontWeight: 700, letterSpacing: 2,
    color: "#3b82f6",
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(59,130,246,0.2)",
    borderRadius: 100, padding: "4px 14px",
  },
  sectionHeading: {
    textAlign: "center",
    fontSize: "clamp(28px, 4vw, 46px)",
    fontWeight: 700, color: "#0f172a",
    letterSpacing: "-0.025em", lineHeight: 1.15,
    marginBottom: 16,
  },
  sectionSubtitle: {
    textAlign: "center", maxWidth: 520, margin: "0 auto 64px",
    fontSize: 16, color: "#475569", lineHeight: 1.7,
  },
  gradientText: {
    background: "linear-gradient(135deg, #60a5fa, #818cf8)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  /* ── How it works ── */
  howSection: {
    padding: "96px 24px",
    background: "#f8fafc",
    maxWidth: 1200, margin: "0 auto",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20, maxWidth: 1100, margin: "0 auto",
    position: "relative",
  },
  stepCard: {
    position: "relative",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16, padding: "28px 24px",
    transition: "border-color 0.25s, background 0.25s",
  },
  connector: {
    display: "none", // hidden on mobile; shown via CSS if needed
  },
  stepTop: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  stepIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#60a5fa",
  },
  stepNum: {
    fontSize: 36, fontWeight: 800, color: "#e5e7eb",
    letterSpacing: "-0.04em", lineHeight: 1,
    fontFamily: "'DM Sans', sans-serif",
  },
  stepTitle: {
    fontSize: 16, fontWeight: 700, color: "#1e293b",
    marginBottom: 10, lineHeight: 1.3,
  },
  stepDesc: { fontSize: 13.5, color: "#475569", lineHeight: 1.7 },

  /* ── Features ── */
  featSection: {
    padding: "96px 24px",
    background: "#f8fafc",
    maxWidth: 1200, margin: "0 auto",
  },
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20, maxWidth: 1100, margin: "0 auto",
  },
  featCard: {
    position: "relative",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18, padding: "28px 26px 24px",
    transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
    cursor: "default",
    overflow: "hidden",
  },
  featIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  featAccentLine: {
    height: 2, width: 32, borderRadius: 2,
    marginBottom: 16,
  },
  featTitle: {
    fontSize: 16, fontWeight: 700, color: "#1e293b",
    marginBottom: 10, lineHeight: 1.3,
  },
  featDesc: {
    fontSize: 13.5, color: "#475569",
    lineHeight: 1.75, marginBottom: 20,
  },
  featArrow: {
    display: "flex", alignItems: "center",
    opacity: 0.6,
  },

  /* ── CTA Banner ── */
  ctaBanner: {
    position: "relative",
    background: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
    padding: "100px 24px",
    textAlign: "center",
    overflow: "hidden",
  },
  ctaBannerGlow: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    width: 600, height: 300,
    background: "radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ctaBannerInner: { position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" },
  ctaBannerHeading: {
    fontSize: "clamp(28px, 4vw, 46px)",
    fontWeight: 700, color: "#0f172a",
    letterSpacing: "-0.025em", marginBottom: 16,
  },
  ctaBannerSub: {
    fontSize: 16, color: "#475569",
    lineHeight: 1.7, marginBottom: 36,
  },
  ctaBannerBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    color: "#fff", border: "none", borderRadius: 12,
    padding: "14px 28px", fontSize: 15, fontWeight: 600,
    cursor: "pointer", letterSpacing: 0.2,
    boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
    margin: "0 auto",
  },
};