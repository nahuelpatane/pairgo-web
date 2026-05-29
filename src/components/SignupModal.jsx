import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Lock, MapPin, Briefcase, Building2, ChevronLeft, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CITIES, ROLES, VENUE_TYPES } from "../data/mockData";

const STEP_VARIANTS = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const FIELD_BASE = {
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

const ICON_STYLE = {
  position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
  pointerEvents: "none", color: "rgba(255,255,255,0.35)", zIndex: 1,
};

function SelectInput({ icon: Icon, value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Icon size={15} style={ICON_STYLE} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...FIELD_BASE,
          color: value ? "#fff" : "rgba(255,255,255,.35)",
          cursor: "pointer",
          appearance: "none",
          borderColor: focused ? "var(--coral)" : "rgba(255,255,255,.1)",
        }}
      >
        <option value="" disabled style={{ background: "#1a1a18" }}>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#1a1a18", color: "#fff" }}>{o}</option>
        ))}
      </select>
      <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)", pointerEvents: "none", fontSize: 11 }}>▼</div>
    </div>
  );
}

function TextInput({ icon: Icon, value, onChange, placeholder, type = "text", required = true }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Icon size={15} style={ICON_STYLE} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...FIELD_BASE,
          borderColor: focused ? "var(--coral)" : "rgba(255,255,255,.1)",
        }}
      />
    </div>
  );
}

export default function SignupModal({ onClose, onSuccess, onSwitchToLogin }) {
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    currentCity: "", currentRole: "", targetCity: "",
    venueName: "", city: "", venueType: "", roleNeeded: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Ingresá tu nombre completo."); return; }
    if (!form.email.trim()) { setError("Ingresá tu email."); return; }
    if (form.password.length < 4) { setError("La contraseña debe tener al menos 4 caracteres."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = signup({ ...form, role: selectedRole });
    setLoading(false);
    if (result.success) { setStep(3); }
  };

  const handleGoToProfile = () => { onClose(); onSuccess(); };

  const inputStyle = { background: "rgba(255,255,255,.08)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20 };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div
          className="relative w-full overflow-hidden"
          style={{ ...inputStyle, maxWidth: step === 1 ? 520 : 420 }}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Role selection ── */}
            {step === 1 && (
              <motion.div key="step1" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22 }} style={{ padding: "32px 32px 28px" }}>
                <button onClick={onClose} className="absolute top-4 right-4 text-white/25 hover:text-white/70 transition-colors">
                  <X size={18} />
                </button>
                <div style={{ fontFamily: "var(--font-d)", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>
                  pair<span style={{ color: "var(--coral)" }}>go</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", marginBottom: 6 }}>
                  Create your account
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.38)", fontFamily: "var(--font-b)", marginBottom: 28 }}>
                  What brings you to Pairgo?
                </p>

                {/* Role cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Backpacker */}
                  <button
                    onClick={() => handleRoleSelect("backpacker")}
                    style={{
                      background: "linear-gradient(145deg, rgba(232,101,74,.18), rgba(232,101,74,.08))",
                      border: "1.5px solid rgba(232,101,74,.25)", borderRadius: 18, padding: "28px 20px",
                      cursor: "pointer", transition: "all .25s", textAlign: "left",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(145deg, rgba(232,101,74,.28), rgba(232,101,74,.14))"; e.currentTarget.style.borderColor = "var(--coral)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(145deg, rgba(232,101,74,.18), rgba(232,101,74,.08))"; e.currentTarget.style.borderColor = "rgba(232,101,74,.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 14 }}>🎒</div>
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Backpacker</div>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.55 }}>
                      I'm looking for work while traveling Australia
                    </div>
                    <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "var(--coral)", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-b)" }}>
                      Get started →
                    </div>
                  </button>

                  {/* Manager */}
                  <button
                    onClick={() => handleRoleSelect("manager")}
                    style={{
                      background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(255,255,255,.1)",
                      borderRadius: 18, padding: "28px 20px", cursor: "pointer", transition: "all .25s", textAlign: "left",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 14 }}>🏢</div>
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Manager</div>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.55 }}>
                      I need reliable staff when my team takes off
                    </div>
                    <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-b)" }}>
                      Get started →
                    </div>
                  </button>
                </div>

                <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.28)", fontFamily: "var(--font-b)", marginTop: 24 }}>
                  Already have an account?{" "}
                  <button
                    onClick={() => { onClose(); onSwitchToLogin(); }}
                    style={{ color: "rgba(255,255,255,.28)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: "inherit", padding: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--coral)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.28)")}
                  >
                    Log in
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Form ── */}
            {step === 2 && (
              <motion.div key="step2" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22 }} style={{ padding: "32px 32px 28px" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,.4)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, padding: 0, transition: "color .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.4)")}>
                    <ChevronLeft size={14} /> Back
                  </button>
                  <div style={{ flex: 1, height: 2, borderRadius: 100, background: "rgba(255,255,255,.06)" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: 100, background: "var(--coral)" }} />
                  </div>
                  <span style={{ fontSize: 22 }}>{selectedRole === "backpacker" ? "🎒" : "🏢"}</span>
                </div>

                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", marginBottom: 4 }}>
                  {selectedRole === "backpacker" ? "Backpacker account" : "Manager account"}
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontFamily: "var(--font-b)", marginBottom: 24 }}>
                  {selectedRole === "backpacker" ? "Create your swap profile" : "Create your venue profile"}
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <TextInput icon={User} value={form.name} onChange={(v) => set("name", v)} placeholder="Full name" />
                  <TextInput icon={Mail} type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="Email address" />
                  <TextInput icon={Lock} type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="Password (min. 4 characters)" />

                  <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "4px 0" }} />

                  {selectedRole === "backpacker" ? (
                    <>
                      <SelectInput icon={MapPin} value={form.currentCity} onChange={(v) => set("currentCity", v)} options={CITIES} placeholder="Current city" />
                      <SelectInput icon={Briefcase} value={form.currentRole} onChange={(v) => set("currentRole", v)} options={ROLES} placeholder="I work as…" />
                      <SelectInput icon={MapPin} value={form.targetCity} onChange={(v) => set("targetCity", v)} options={CITIES.filter((c) => c !== form.currentCity)} placeholder="I want to go to…" />
                    </>
                  ) : (
                    <>
                      <TextInput icon={Building2} value={form.venueName} onChange={(v) => set("venueName", v)} placeholder="Venue / business name" />
                      <SelectInput icon={MapPin} value={form.city} onChange={(v) => set("city", v)} options={CITIES} placeholder="City" />
                      <SelectInput icon={Building2} value={form.venueType} onChange={(v) => set("venueType", v)} options={VENUE_TYPES} placeholder="Venue type" />
                      <SelectInput icon={Briefcase} value={form.roleNeeded} onChange={(v) => set("roleNeeded", v)} options={ROLES} placeholder="I need a…" />
                    </>
                  )}

                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(232,101,74,.12)", border: "1px solid rgba(232,101,74,.25)" }}>
                      <AlertCircle size={14} style={{ color: "var(--coral)", flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--coral)" }}>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: 4, width: "100%", background: loading ? "rgba(232,101,74,.6)" : "var(--coral)",
                      color: "#fff", border: "none", borderRadius: 100, padding: "13px 26px",
                      fontFamily: "var(--font-b)", fontSize: 15, fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer", transition: "all .2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--coral-deep)"; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--coral)"; }}
                  >
                    {loading ? (
                      <>
                        <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                        Creating account…
                      </>
                    ) : "Create my account →"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <motion.div key="step3" variants={STEP_VARIANTS} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22 }} style={{ padding: "48px 32px", textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  style={{ fontSize: 56, marginBottom: 20 }}
                >
                  {selectedRole === "backpacker" ? "🎒" : "🏢"}
                </motion.div>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 10 }}>
                  Welcome, {form.name.split(" ")[0]}!
                </h2>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "rgba(255,255,255,.45)", lineHeight: 1.65, marginBottom: 32, maxWidth: 280, margin: "0 auto 32px" }}>
                  {selectedRole === "backpacker"
                    ? "Your backpacker profile is ready. Start browsing swap opportunities."
                    : "Your manager account is ready. Start finding the right workers for your venue."}
                </p>
                <button
                  onClick={handleGoToProfile}
                  style={{
                    background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100,
                    padding: "14px 32px", fontFamily: "var(--font-b)", fontSize: 15, fontWeight: 600,
                    cursor: "pointer", transition: "all .2s", display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--coral-deep)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--coral)"}
                >
                  Go to my profile →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
