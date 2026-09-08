import { useUser, useClerk } from '@clerk/clerk-react';
import { Lock } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 380, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.04)", padding: "36px 32px" }}>
          <div style={{ marginBottom: 18, color: "#4f46e5" }}><Lock size={36} /></div>
          <h2 style={{ color: "#0f172a", fontSize: 20, fontWeight: 700, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
            Please sign in to continue
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            You need to be signed in to access this page. It's free and takes about 30 seconds.
          </p>
          <button
            onClick={() => openSignIn()}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "12px 26px", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
            }}
          >
            Sign in / Sign up
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;