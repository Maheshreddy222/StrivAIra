import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/clerk-react";
import { ChevronDown, Sparkles, BarChart2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/* ── StrivAIra Logo Component ─────────────────────────────────────── */
const StrivAIraLogo = () => (
  <svg
    width="210"
    height="44"
    viewBox="0 0 210 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="StrivAIra"
  >
    <defs>
      <linearGradient id="strivGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0073ff" />
        <stop offset="100%" stopColor="#202543" />
      </linearGradient>
      <linearGradient id="raGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#202543" />
        <stop offset="100%" stopColor="#0073ff" />
      </linearGradient>
      <linearGradient id="aiLetterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EEEDFE" />
        <stop offset="50%" stopColor="#AFA9EC" />
        <stop offset="100%" stopColor="#7F77DD" />
      </linearGradient>
      <filter id="aiGlow">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* "Striv" */}
    <text
      x="0"
      y="28"
      fontFamily="'Orbitron', 'Courier New', monospace"
      fontSize="27"
      fontWeight="700"
      letterSpacing="-0.5"
      fill="url(#strivGrad)"
    >
      Striv
    </text>

    {/* AI highlight pill background glow */}
    <rect x="76" y="5" width="38" height="28" rx="6" fill="#1a1347" opacity="0.9" />
    <rect x="76" y="5" width="38" height="28" rx="6" fill="none" stroke="#7F77DD" strokeWidth="1" opacity="0.85" />
    {/* subtle inner top shine */}
    <rect x="78" y="6" width="34" height="5" rx="3" fill="#AFA9EC" opacity="0.07" />

    {/* "AI" — single occurrence, glowing */}
    <text
      x="95"
      y="24"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="'Orbitron', 'Courier New', monospace"
      fontSize="14"
      fontWeight="900"
      letterSpacing="1.5"
      fill="url(#aiLetterGrad)"
      filter="url(#aiGlow)"
    >
      AI
    </text>

    {/* "ra" */}
    <text
      x="120"
      y="28"
      fontFamily="'Orbitron', 'Courier New', monospace"
      fontSize="27"
      fontWeight="700"
      letterSpacing="-0.5"
      fill="url(#raGrad)"
    >
      ra
    </text>

    {/* Underline accent */}
    <line x1="0" y1="38" x2="155" y2="38" stroke="url(#strivGrad)" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
    <circle cx="0" cy="38" r="1.5" fill="#5DCAA5" opacity="0.5" />
    <circle cx="155" cy="38" r="1.5" fill="#5DCAA5" opacity="0.5" />
  </svg>
);

/* ── Main Header ──────────────────────────────────────────────────── */
const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { openSignIn } = useClerk();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Build Resume", path: "/build-resume" },
    { name: "Mock Interview", path: "/mock-interview" },
    { name: "Career Roadmap", path: "/career-roadmap" },
    { name: "Career Compass", path: "/career-compass" },
    { name: "Digital Twin", path: "/digital-twin" },
    { name: "Career Analyzer", path: "/career-analyzer" },
    { name: "StrivAIra Chat", path: "/strivaira-chatbot"},
  ];

  return (
    <>
      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

        .strivai-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15,23,42,0.04);
          backdrop-filter: blur(12px);
        }

        .strivai-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Logo hover shimmer */
        .strivai-logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .strivai-logo-link:hover { opacity: 0.88; }
        .strivai-logo-link:hover svg polygon[fill="#13103a"] {
          fill: #1e1860;
        }

        /* Metrics pill */
        .strivai-metrics-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(83,74,183,0.9);
          background: rgba(83,74,183,0.10);
          border: 1px solid rgba(127,119,221,0.22);
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          white-space: nowrap;
          font-family: inherit;
        }
        .strivai-metrics-btn:hover {
          background: rgba(83,74,183,0.22);
          border-color: rgba(127,119,221,0.5);
          color: #3B3A8A;
        }

        /* Nav area */
        .strivai-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Growth Tools dropdown trigger */
        .strivai-tools-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          font-family: inherit;
        }
        .strivai-tools-btn:hover,
        .strivai-tools-btn.open {
          background: rgba(93,202,165,0.10);
          border-color: rgba(93,202,165,0.30);
          color: #1f8f6d;
        }
        .strivai-tools-btn .chevron {
          transition: transform 0.22s;
          opacity: 0.65;
        }
        .strivai-tools-btn.open .chevron { transform: rotate(180deg); }

        /* Dropdown menu */
        .strivai-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          min-width: 200px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 16px 48px rgba(15,23,42,0.12), 0 2px 8px rgba(83,74,183,0.08);
          overflow: hidden;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .strivai-dropdown-item {
          display: block;
          padding: 11px 18px;
          font-size: 13.5px;
          color: #475569;
          text-decoration: none;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s, color 0.15s, padding-left 0.15s;
          position: relative;
        }
        .strivai-dropdown-item:last-child { border-bottom: none; }
        .strivai-dropdown-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 2px;
          background: linear-gradient(to bottom, #5DCAA5, #7F77DD);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .strivai-dropdown-item:hover {
          background: rgba(93,202,165,0.07);
          color: #1e293b;
          padding-left: 22px;
        }
        .strivai-dropdown-item:hover::before { opacity: 1; }

        /* Sign In button */
        .strivai-signin-btn {
          padding: 8px 22px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #534AB7 0%, #3B3A8A 100%);
          border: 1px solid rgba(127,119,221,0.4);
          cursor: pointer;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow: 0 0 16px rgba(83,74,183,0.35);
          font-family: inherit;
        }
        .strivai-signin-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(83,74,183,0.55);
        }
        .strivai-signin-btn:active { transform: translateY(0); }

        /* Divider between metrics btn and nav */
        .strivai-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
          margin: 0 4px;
        }
      `}</style>

      <header className="strivai-header">
        <div className="strivai-inner">

          {/* ── Left: Logo ── */}
          <Link to="/" className="strivai-logo-link">
            <StrivAIraLogo />
          </Link>

          {/* ── Right: Nav ── */}
          <nav className="strivai-nav">

            {/* Trends button */}
            <button
              onClick={() => navigate("/trends")}
              className="strivai-metrics-btn"
            >
              <BarChart2 size={14} />
              Trends
            </button>

            <div className="strivai-divider" />

            {/* Growth Tools dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`strivai-tools-btn${isDropdownOpen ? " open" : ""}`}
              >
                <Sparkles size={15} style={{ color: "#1f8f6d" }} />
                Growth Tools
                <ChevronDown size={15} className="chevron" />
              </button>

              {isDropdownOpen && (
                <div className="strivai-dropdown">
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsDropdownOpen(false)}
                      className="strivai-dropdown-item"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            <SignedOut>
              <button
                onClick={() => openSignIn()}
                className="strivai-signin-btn"
              >
                Sign In
              </button>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;