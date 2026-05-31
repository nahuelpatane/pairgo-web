import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { ROLES } from "../data/mockData";

const DURATIONS = ["1–2 weeks", "2–4 weeks", "1–2 months", "2+ months", "Flexible"];
const COMPENSATION = [
  { value: "exchange", label: "Skill exchange only", desc: "Worker provides skills in exchange for experience" },
  { value: "accommodation", label: "Exchange + accommodation", desc: "Free accommodation included with the swap" },
  { value: "paid", label: "Paid position", desc: "Worker receives a wage" },
  { value: "paid_accommodation", label: "Paid + accommodation", desc: "Wage and free accommodation included" },
];

const FIELD = {
  width: "100%", borderRadius: 12, padding: "13px 16px",
  color: "#fff", fontSize: 14, outline: "none",
  background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,.1)",
  fontFamily: "var(--font-b)", transition: "border-color .2s", appearance: "none",
};

const Label = ({ children }) => (
  <div style={{ fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
    {children}
  </div>
);

export default function PostPositionModal({ onClose, onSubmit, venueName, city }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ role: "", startDate: "", duration: "", description: "", compensation: "exchange" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.role) return setError("Select the role you need.");
    if (!form.startDate) return setError("Pick a start date.");
    if (!form.duration) return setError("Select a duration.");
    setError("");
    onSubmit(form);
  };

  return (
    <AnimatePresence>
      <motion.div
        style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(12px)" }} />
        <motion.div
          style={{
            position: "relative", width: "100%", maxWidth: 490,
            background: "rgba(22,22,20,.97)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 22, overflow: "hidden",
            maxHeight: "92vh", overflowY: "auto",
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

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-d)", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: 4 }}>
                Post a Position
              </h2>
              <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.35)" }}>
                {venueName} · {city}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Role */}
              <div>
                <Label>Role needed</Label>
                <div style={{ position: "relative" }}>
                  <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...FIELD, cursor: "pointer", paddingRight: 36 }}
                    onFocus={e => e.target.style.borderColor = "var(--coral)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}>
                    <option value="" disabled style={{ background: "#1a1a18" }}>Select a role…</option>
                    {ROLES.map(r => <option key={r} value={r} style={{ background: "#1a1a18" }}>{r}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,.3)", fontSize: 12 }}>▾</span>
                </div>
              </div>

              {/* Start date + Duration */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <Label>Start date</Label>
                  <input type="date" value={form.startDate} min={today}
                    onChange={e => set("startDate", e.target.value)}
                    style={{ ...FIELD, colorScheme: "dark", cursor: "pointer" }}
                    onFocus={e => e.target.style.borderColor = "var(--coral)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <div style={{ position: "relative" }}>
                    <select value={form.duration} onChange={e => set("duration", e.target.value)} style={{ ...FIELD, cursor: "pointer", paddingRight: 36 }}
                      onFocus={e => e.target.style.borderColor = "var(--coral)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}>
                      <option value="" disabled style={{ background: "#1a1a18" }}>Select…</option>
                      {DURATIONS.map(d => <option key={d} value={d} style={{ background: "#1a1a18" }}>{d}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,.3)", fontSize: 12 }}>▾</span>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div>
                <Label>Compensation</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {COMPENSATION.map(opt => (
                    <label key={opt.value} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer", transition: "all .2s",
                      border: `1px solid ${form.compensation === opt.value ? "rgba(232,101,74,.45)" : "rgba(255,255,255,.07)"}`,
                      background: form.compensation === opt.value ? "rgba(232,101,74,.07)" : "rgba(255,255,255,.02)",
                    }}>
                      <input type="radio" name="compensation" value={opt.value}
                        checked={form.compensation === opt.value}
                        onChange={() => set("compensation", opt.value)}
                        style={{ marginTop: 2, accentColor: "var(--coral)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "#fff" }}>{opt.label}</div>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description <span style={{ color: "rgba(255,255,255,.2)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></Label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Describe the role and what the worker can expect…"
                  rows={3}
                  style={{ ...FIELD, resize: "vertical", minHeight: 80, lineHeight: 1.6 }}
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
                Post Position
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
