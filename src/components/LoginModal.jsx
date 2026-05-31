import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const INPUT_STYLE = {
  width: "100%",
  borderRadius: 12,
  paddingLeft: 44,
  paddingRight: 16,
  paddingTop: 14,
  paddingBottom: 14,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  background: "rgba(0,0,0,0.45)",
  border: "1px solid rgba(255,255,255,.1)",
  fontFamily: "var(--font-b)",
  transition: "border-color .2s",
  display: "block",
};

function Field({ icon: Icon, type = "text", placeholder, value, onChange, required = true }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Icon
        size={15}
        style={{
          position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: "rgba(255,255,255,0.35)", zIndex: 1,
        }}
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...INPUT_STYLE,
          borderColor: focused ? "var(--coral)" : "rgba(255,255,255,.1)",
        }}
      />
    </div>
  );
}

export default function LoginModal({ onClose, onSuccess, onSwitchToSignup }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) { onClose(); onSuccess(); }
    else setError(result.error);
  };

  return (
    <AnimatePresence>
      <motion.div
        style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)" }} />

        <motion.div
          style={{
            position: "relative", width: "100%", maxWidth: 380,
            background: "rgba(255,255,255,.07)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, overflow: "hidden",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Accent bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />

          <div style={{ padding: 32 }}>
            {/* Close */}
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 6, transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
                pair<span style={{ color: "var(--coral)" }}>go</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", marginBottom: 4 }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-b)" }}>
                Sign in to your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />
              <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />

              <div style={{ textAlign: "right" }}>
                <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,.3)", fontFamily: "var(--font-b)", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--coral)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
                  Forgot your password?
                </a>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(232,101,74,.12)", border: "1px solid rgba(232,101,74,.3)" }}>
                  <AlertCircle size={14} style={{ color: "var(--coral)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--coral)" }}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4, width: "100%",
                  background: loading ? "rgba(232,101,74,.6)" : "var(--coral)",
                  color: "#fff", border: "none", borderRadius: 100,
                  padding: "14px 26px", fontFamily: "var(--font-b)", fontSize: 15, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer", transition: "background .2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "var(--coral-deep)"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "var(--coral)"; }}
              >
                {loading ? (
                  <>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                    Signing in…
                  </>
                ) : "Log In"}
              </button>
            </form>

            {/* Footer */}
            <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.3)", fontFamily: "var(--font-b)", marginTop: 24 }}>
              Don't have an account?{" "}
              <button
                onClick={() => { onClose(); onSwitchToSignup(); }}
                style={{ color: "rgba(255,255,255,.3)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: "inherit", padding: 0, transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--coral)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}
              >
                Create an account
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
