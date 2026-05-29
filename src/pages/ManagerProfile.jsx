import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const COMING_SOON = [
  { icon: "🔍", title: "Browse backpackers", desc: "See verified workers available in your city, filtered by role and start date." },
  { icon: "📋", title: "Post a position", desc: "List the role you need filled and let backpackers find you." },
  { icon: "🔄", title: "Manage swap requests", desc: "Review incoming candidates, approve or decline swaps with one click." },
  { icon: "⭐", title: "Rate workers", desc: "Leave reviews after every swap to keep the community quality high." },
];

export default function ManagerProfile({ onBack }) {
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); onBack(); };

  const displayName = user?.name || "Manager";
  const venueName = user?.venueName || "Your Venue";
  const city = user?.city || "";
  const venueType = user?.venueType || "Business";
  const roleNeeded = user?.roleNeeded || "";

  return (
    <div style={{ background: "#0F0F0D", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(15,15,13,.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 500, transition: "color .2s", padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            pair<span style={{ color: "var(--coral)" }}>go</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.3)" }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.4)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, transition: "all .2s", padding: "8px 16px" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.4)"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop: 57, minHeight: 280, background: "linear-gradient(145deg, #1a1a18 0%, #111 100%)", display: "flex", alignItems: "flex-end", position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,101,74,.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(229,161,0,.06), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 32px 40px", width: "100%", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {/* Venue icon */}
              <div style={{ width: 80, height: 80, borderRadius: 22, background: "linear-gradient(135deg, rgba(232,101,74,.2), rgba(229,161,0,.1))", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>
                🏢
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <h1 style={{ fontFamily: "var(--font-d)", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px" }}>{venueName}</h1>
                  <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(27,122,90,.2)", border: "1px solid rgba(27,122,90,.3)", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 1 }}>✓ Manager</span>
                </div>
                <div style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "rgba(255,255,255,.45)" }}>
                  {venueType}{city ? ` · ${city}` : ""}{roleNeeded ? ` · Looking for ${roleNeeded}` : ""}
                </div>
                <div style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
                  Managed by {displayName}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px 64px" }}>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "24px 28px", marginBottom: 24, display: "flex", gap: 32, flexWrap: "wrap" }}
        >
          {[
            { label: "Open positions", value: "1", color: "var(--coral)" },
            { label: "Swaps completed", value: "0", color: "var(--gold)" },
            { label: "Account type", value: "Manager", color: "#60a5fa" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Coming soon */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{ marginBottom: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Clock size={16} style={{ color: "var(--coral)" }} />
            <span style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--coral)" }}>
              Features launching soon
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>
            Your dashboard is on its way.
          </h2>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "rgba(255,255,255,.4)", lineHeight: 1.65, marginBottom: 28, maxWidth: 500 }}>
            We're building the manager tools right now. You'll be able to browse backpackers, post positions, and manage swap requests all from here.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {COMING_SOON.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.3 }}
              style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 18, padding: "24px 22px", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--coral), var(--gold))", opacity: 0.4 }} />
              <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.6 }}>{item.desc}</div>
              <div style={{ marginTop: 16, padding: "4px 10px", borderRadius: 100, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "inline-block", fontFamily: "var(--font-b)", fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                Coming soon
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
