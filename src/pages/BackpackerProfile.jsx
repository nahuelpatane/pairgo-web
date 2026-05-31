import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Check, X as XIcon, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CITIES, ROLES, getInitials, getAvatarColor } from "../data/mockData";
import { api } from "../api";

const COMP_LABEL = {
  exchange: "Skill exchange", accommodation: "Exchange + accommodation",
  paid: "Paid", paid_accommodation: "Paid + accommodation",
};
const COMP_ICON = { exchange: "🔄", accommodation: "🏠", paid: "💵", paid_accommodation: "💵🏠" };

const STATUS_STYLE = {
  pending:   { label: "Pending",   color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  active:    { label: "Active",    color: "#065f46", bg: "#d1fae5", border: "#a7f3d0" },
  completed: { label: "Completed", color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  declined:  { label: "Declined",  color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
};

// Static rich content shown in Profile tab (demo seed data)
const DEMO = {
  photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  coverPhoto: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  visaType: "Working Holiday (417)",
  languages: ["English (Fluent)"],
  bio: "Backpacker looking for work swap opportunities across Australia. Open to hospitality, farm work, and more.",
  skills: [],
  certs: [],
  workHistory: [],
};

// --- Small components ---

function Chip({ children, accent = false }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 100,
      background: accent ? "rgba(232,101,74,.08)" : "rgba(0,0,0,.04)",
      border: accent ? "1px solid rgba(232,101,74,.15)" : "none",
      fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 500,
      color: accent ? "var(--coral)" : "var(--ink-soft)",
    }}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span style={{ padding: "3px 10px", borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", background: "#fff", border: "1px dashed rgba(0,0,0,.1)", borderRadius: 20 }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)", marginBottom: action ? 20 : 0 }}>{desc}</p>
      {action}
    </div>
  );
}

// --- Position card (Find Jobs tab) ---
function PositionCard({ position, applied, onApply }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,.05)", overflow: "hidden" }}>
      <div style={{ height: 4, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />
      <div style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              {position.role}
            </div>
            <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", fontWeight: 500 }}>
              {position.venueName} · {position.city}
            </div>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 100, background: "#d1fae5", border: "1px solid #a7f3d0", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color: "#065f46", whiteSpace: "nowrap" }}>
            Open
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <Chip>{COMP_ICON[position.compensation]} {COMP_LABEL[position.compensation] || position.compensation}</Chip>
          <Chip>📅 {new Date(position.startDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</Chip>
          <Chip>⏱ {position.duration}</Chip>
          {position.venueType && <Chip>{position.venueType}</Chip>}
        </div>

        {position.description && (
          <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 16 }}>
            {position.description}
          </p>
        )}

        <button
          onClick={() => !applied && onApply(position)}
          disabled={applied}
          style={{
            width: "100%", borderRadius: 100, padding: "11px 20px",
            fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600,
            cursor: applied ? "default" : "pointer", transition: "all .2s",
            border: applied ? "1.5px solid #a7f3d0" : "none",
            background: applied ? "#d1fae5" : "var(--coral)",
            color: applied ? "#065f46" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}
          onMouseEnter={e => { if (!applied) e.currentTarget.style.background = "var(--coral-deep)"; }}
          onMouseLeave={e => { if (!applied) e.currentTarget.style.background = "var(--coral)"; }}
        >
          {applied ? <><Check size={14} /> Applied</> : "Apply Now →"}
        </button>
      </div>
    </div>
  );
}

// --- Swap card (My Swaps tab) ---
function SwapCard({ request, onAccept, onDecline, onComplete }) {
  const isInvite = request.initiator === "manager";
  const ss = STATUS_STYLE[request.status] || STATUS_STYLE.pending;

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.05)", overflow: "hidden" }}>
      <div style={{ height: 3, background: isInvite ? "linear-gradient(90deg, #60a5fa, #a78bfa)" : "linear-gradient(90deg, var(--coral), var(--gold))" }} />
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
              {request.positionRole} — {request.managerVenueName || "Venue"}
            </div>
            <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>
              {request.managerVenueCity || ""} · {new Date(request.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <Chip accent={isInvite}>{isInvite ? "🏢 Manager invite" : "📝 Your application"}</Chip>
        </div>

        {request.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "#fef3c7", marginBottom: 14 }}>
            <span style={{ color: "var(--gold)" }}>★</span>
            <span style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "#92400e" }}>Rated {request.rating.score}/5 by manager</span>
            {request.rating.comment && <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "#92400e", fontStyle: "italic" }}>· "{request.rating.comment}"</span>}
          </div>
        )}

        {/* Actions */}
        {request.status === "pending" && isInvite && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onAccept(request.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 100, background: "var(--forest-soft)", border: "1.5px solid rgba(27,122,90,.25)", color: "var(--forest)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#a7f3d0"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--forest-soft)"}>
              <Check size={14} /> Accept
            </button>
            <button onClick={() => onDecline(request.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 100, background: "#f9fafb", border: "1.5px solid rgba(0,0,0,.1)", color: "var(--ink-muted)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
              <XIcon size={14} /> Decline
            </button>
          </div>
        )}

        {request.status === "pending" && !isInvite && (
          <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", padding: "10px 14px", background: "#fef3c7", borderRadius: 10, border: "1px solid #fde68a" }}>
            ⏳ Waiting for the manager to respond…
          </div>
        )}

        {request.status === "active" && (
          <button onClick={() => onComplete(request.id)}
            style={{ width: "100%", padding: "10px", borderRadius: 100, background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#bfdbfe"}
            onMouseLeave={e => e.currentTarget.style.background = "#dbeafe"}>
            Mark as Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main component
// ============================================================
export default function BackpackerProfile({ onBack }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("jobs");
  const [positions, setPositions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const handleLogout = () => { logout(); onBack(); };

  const profile = {
    ...DEMO,
    name: user?.name || "Backpacker",
    currentCity: user?.currentCity || "Sydney",
    targetCity: user?.targetCity || "Melbourne",
    currentRole: user?.currentRole || "",
  };

  const userInitials = getInitials(profile.name);
  const userAvatarColor = getAvatarColor(user?.id || "");

  // Load data from API on mount
  useEffect(() => {
    Promise.all([api.getPositions(), api.getRequests()])
      .then(([pos, reqs]) => { setPositions(pos); setRequests(reqs); })
      .catch(err => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  // My requests
  const myRequests = useMemo(() => requests.filter(r => r.backpackerId === user?.id), [requests, user]);
  const appliedIds = useMemo(() => new Set(myRequests.filter(r => r.initiator === "backpacker").map(r => r.positionId)), [myRequests]);
  const pendingInvites = myRequests.filter(r => r.initiator === "manager" && r.status === "pending").length;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const patchReq = async (id, patch, toastMsg) => {
    try {
      const updated = await api.patchRequest(id, patch);
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      if (toastMsg) showToast(toastMsg);
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleApply = async (position) => {
    try {
      const req = await api.createRequest({
        managerId: position.managerId,
        managerVenueName: position.venueName,
        managerVenueCity: position.city,
        backpackerId: user.id,
        backpackerName: user.name,
        backpackerEmail: user.email || "",
        backpackerInitials: userInitials,
        backpackerAvatarColor: userAvatarColor,
        backpackerFlag: "",
        positionId: position.id,
        positionRole: position.role,
        initiator: "backpacker",
      });
      setRequests(prev => [req, ...prev]);
      showToast("Application sent!");
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleAccept   = (id) => patchReq(id, { status: "active" },    "Swap accepted!");
  const handleDecline  = (id) => patchReq(id, { status: "declined" });
  const handleComplete = (id) => patchReq(id, { status: "completed" }, "Swap completed!");

  // Filtered open positions
  const openPositions = useMemo(() => positions.filter(p => {
    if (p.status !== "open") return false;
    if (cityFilter !== "all" && p.city !== cityFilter) return false;
    if (roleFilter !== "all" && p.role !== roleFilter) return false;
    return true;
  }), [positions, cityFilter, roleFilter]);

  const availableCities = [...new Set(positions.filter(p => p.status === "open").map(p => p.city))];
  const availableRoles  = [...new Set(positions.filter(p => p.status === "open").map(p => p.role))];

  const SELECT = {
    borderRadius: 10, padding: "8px 30px 8px 12px", background: "#fff",
    border: "1.5px solid rgba(0,0,0,.1)", fontFamily: "var(--font-b)", fontSize: 13,
    fontWeight: 500, outline: "none", cursor: "pointer", appearance: "none",
    color: "var(--ink-soft)",
  };

  if (loading) return (
    <div style={{ background: "#F5F4F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(0,0,0,.08)", borderTopColor: "var(--coral)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)" }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#F5F4F0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        .ptab{padding:10px 20px;border-radius:100px;border:none;font-family:var(--font-b);font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;background:transparent;color:var(--ink-muted);}
        .ptab.on{background:var(--ink);color:#fff;}
        .ptab:hover:not(.on){background:rgba(0,0,0,.06);color:var(--ink);}
        .pcard{background:#fff;border-radius:24px;border:1px solid rgba(0,0,0,.04);}
        .skill-tag{padding:8px 16px;border-radius:100px;background:#fff;border:1.5px solid rgba(0,0,0,.08);font-family:var(--font-b);font-size:13px;font-weight:500;color:var(--ink-soft);cursor:default;}
        @media(max-width:768px){.prof-header-inner{flex-direction:column!important;}.prof-actions{margin-top:16px;}}
        @media(max-width:640px){.prof-content{padding:0 16px!important;}.pcard{padding:20px!important;}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(26,26,24,.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={onBack}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.55)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 500, transition: "color .2s", padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            pair<span style={{ color: "var(--coral)" }}>go</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.35)" }}>{user?.email}</span>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.4)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, transition: "all .2s", padding: "8px 16px" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.4)"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      </nav>

      {/* COVER */}
      <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
        <img src={profile.coverPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", marginTop: 57 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.6) 100%)" }} />
      </div>

      {/* CONTENT */}
      <div className="prof-content" style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>

        {/* HEADER CARD */}
        <motion.div className="pcard" style={{ padding: "28px 32px", marginTop: -80, position: "relative", zIndex: 10, boxShadow: "0 8px 40px rgba(0,0,0,.1)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <div className="prof-header-inner" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 96, height: 96, borderRadius: 22, background: userAvatarColor, border: "4px solid #fff", boxShadow: "0 4px 20px rgba(0,0,0,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: 32, fontWeight: 800, color: "#fff" }}>
                {userInitials}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-d)", fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px" }}>{profile.name}</h1>
                <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(232,101,74,.1)", color: "var(--coral)", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>🎒 Backpacker</span>
              </div>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)", marginBottom: 18 }}>
                {profile.currentRole && `${profile.currentRole} · `}{profile.currentCity} → {profile.targetCity}
              </div>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                {[
                  { label: "Applied",   value: myRequests.filter(r => r.initiator === "backpacker").length, color: "var(--coral)" },
                  { label: "Invites",   value: pendingInvites, color: "#60a5fa" },
                  { label: "Active",    value: myRequests.filter(r => r.status === "active").length, color: "var(--forest)" },
                  { label: "Completed", value: myRequests.filter(r => r.status === "completed").length, color: "var(--gold)" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Swap info card */}
            <div style={{ flexShrink: 0, background: "linear-gradient(135deg, var(--coral), var(--coral-deep))", borderRadius: 18, padding: "18px 22px", color: "#fff", minWidth: 180 }}>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, opacity: .7, marginBottom: 12 }}>Looking to swap</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-b)", fontSize: 10, opacity: .6, marginBottom: 2 }}>From</div>
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700 }}>📍 {profile.currentCity}</div>
                </div>
                <div style={{ opacity: .6 }}>→</div>
                <div>
                  <div style={{ fontFamily: "var(--font-b)", fontSize: 10, opacity: .6, marginBottom: 2 }}>To</div>
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700 }}>🎯 {profile.targetCity}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, margin: "24px 0 20px", background: "#fff", padding: 4, borderRadius: 100, width: "fit-content", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
          {[
            { id: "jobs",    label: "Find Jobs" },
            { id: "swaps",   label: `My Swaps${pendingInvites > 0 ? ` · ${pendingInvites} new` : ""}` },
            { id: "profile", label: "Profile" },
          ].map(t => (
            <button key={t.id} className={`ptab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ---- FIND JOBS ---- */}
          {tab === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {/* Filters */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px", marginRight: "auto" }}>
                  Open Positions
                </h2>
                {availableCities.length > 0 && (
                  <div style={{ position: "relative" }}>
                    <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={SELECT}>
                      <option value="all">All cities</option>
                      {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-muted)", fontSize: 11 }}>▾</span>
                  </div>
                )}
                {availableRoles.length > 0 && (
                  <div style={{ position: "relative" }}>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={SELECT}>
                      <option value="all">All roles</option>
                      {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-muted)", fontSize: 11 }}>▾</span>
                  </div>
                )}
              </div>

              {openPositions.length === 0 ? (
                <EmptyState icon="🔍" title="No open positions"
                  desc={positions.length === 0 ? "No managers have posted positions yet. Check back soon!" : "No positions match those filters."} />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 48 }}>
                  {openPositions.map(pos => (
                    <PositionCard key={pos.id} position={pos}
                      applied={appliedIds.has(pos.id)}
                      onApply={handleApply} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---- MY SWAPS ---- */}
          {tab === "swaps" && (
            <motion.div key="swaps" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>My Swaps</h2>
                {pendingInvites > 0 && (
                  <span style={{ padding: "4px 12px", borderRadius: 100, background: "#fef3c7", border: "1px solid #fde68a", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 700, color: "#92400e" }}>
                    {pendingInvites} invite{pendingInvites > 1 ? "s" : ""} waiting
                  </span>
                )}
              </div>

              {myRequests.length === 0 ? (
                <EmptyState icon="🔄" title="No swaps yet"
                  desc="Apply to open positions or wait for manager invites."
                  action={
                    <button onClick={() => setTab("jobs")}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "11px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                      Browse Jobs →
                    </button>
                  } />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
                  {myRequests.map(req => (
                    <SwapCard key={req.id} request={req}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      onComplete={handleComplete} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---- PROFILE ---- */}
          {tab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, marginBottom: 20 }}>
                {/* Swap card */}
                <div style={{ background: "linear-gradient(145deg, #E8654A, #D4503A)", borderRadius: 24, padding: "28px 24px", color: "#fff", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.07)", pointerEvents: "none" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, opacity: .7, marginBottom: 20 }}>🎒 Looking to swap</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                      <div>
                        <div style={{ fontSize: 10, opacity: .6, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>From</div>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>📍 {profile.currentCity}</div>
                      </div>
                      <div style={{ fontSize: 20, opacity: .7 }}>→</div>
                      <div>
                        <div style={{ fontSize: 10, opacity: .6, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>To</div>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>🎯 {profile.targetCity}</div>
                      </div>
                    </div>
                    {[{ icon: "💼", label: "Current role", value: profile.currentRole || "—" }, { icon: "🛂", label: "Visa", value: profile.visaType }].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.13)", borderRadius: 14, padding: "11px 15px", marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: 10, opacity: .6, textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About */}
                <div className="pcard" style={{ padding: "28px 32px" }}>
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>About</div>
                  <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75 }}>{profile.bio}</p>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Email</div>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}>{user?.email}</div>
                  </div>
                </div>
              </div>

              {/* Completed swaps (from real data) */}
              {myRequests.filter(r => r.status === "completed").length > 0 && (
                <div className="pcard" style={{ padding: "28px 32px", marginBottom: 20 }}>
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 20 }}>Work History</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {myRequests.filter(r => r.status === "completed").map((req, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 16, borderBottom: i < myRequests.filter(r => r.status === "completed").length - 1 ? "1px solid rgba(0,0,0,.06)" : "none" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--coral-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏢</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{req.positionRole}</div>
                          <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>{req.managerVenueName} · {req.managerVenueCity}</div>
                          {req.rating && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                              <span style={{ color: "var(--gold)" }}>{"★".repeat(req.rating.score)}</span>
                              <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>{req.rating.score}/5 from manager</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ height: 48 }} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            style={{ position: "fixed", bottom: 32, right: 32, zIndex: 400, background: "var(--ink)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 100, padding: "12px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,.3)" }}>
            <Check size={15} color="var(--coral)" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
