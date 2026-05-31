import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, AlertCircle } from "lucide-react";

const LABELS = ["", "Needs improvement", "Fair", "Good", "Great", "Excellent!"];

export default function RateWorkerModal({ request, onClose, onSubmit }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!score) return setError("Select a star rating first.");
    setError("");
    onSubmit({ score, comment });
  };

  const active = hover || score;

  return (
    <AnimatePresence>
      <motion.div
        style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(12px)" }} />
        <motion.div
          style={{
            position: "relative", width: "100%", maxWidth: 400,
            background: "rgba(22,22,20,.97)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 22, overflow: "hidden",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />
          <div style={{ padding: 32 }}>
            <button onClick={onClose}
              style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", display: "flex", padding: 4, borderRadius: 6, transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
              <X size={18} />
            </button>

            {/* Worker info */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: request.backpackerAvatarColor || "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {request.backpackerInitials}
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                  Rate {request.backpackerName}
                </h2>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                  {request.positionRole} swap
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Stars */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                  How was the experience?
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button"
                      onClick={() => setScore(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
                      <Star
                        size={38}
                        fill={active >= n ? "var(--gold)" : "transparent"}
                        stroke={active >= n ? "var(--gold)" : "rgba(255,255,255,.18)"}
                        style={{ transition: "all .15s", transform: active >= n ? "scale(1.12)" : "scale(1)", display: "block" }}
                      />
                    </button>
                  ))}
                </div>
                <div style={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
                  {score > 0 && (
                    <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                      {LABELS[score]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <div style={{ fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Comment <span style={{ color: "rgba(255,255,255,.2)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="How did the swap go? What was this worker like?"
                  rows={3}
                  style={{ width: "100%", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,.1)", fontFamily: "var(--font-b)", transition: "border-color .2s", resize: "vertical", lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = "var(--coral)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"} />
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(232,101,74,.1)", border: "1px solid rgba(232,101,74,.3)" }}>
                  <AlertCircle size={14} style={{ color: "var(--coral)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--coral)" }}>{error}</span>
                </div>
              )}

              <button type="submit"
                style={{ width: "100%", background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "14px 26px", fontFamily: "var(--font-b)", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--coral-deep)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--coral)"}>
                Submit Rating
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
