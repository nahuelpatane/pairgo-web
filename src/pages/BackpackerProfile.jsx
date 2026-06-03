import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, RefreshCw, User, LogOut, Check, X as XIcon, Edit2, Save, Plus, Trash2, Video, Clock, MapPin, ChevronRight, Star, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CITIES, ROLES, getInitials, getAvatarColor } from "../data/mockData";
import { api } from "../api";
import JobsMap from "../components/JobsMap";

// ─── Constants ────────────────────────────────────────────────
const VISA_TYPES = ["Working Holiday 417","Working Holiday 462","Student 500","Graduate 485","Skilled Worker 482","Other"];
const DAYS       = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SHIFTS     = ["morning","afternoon","night"];
const SHIFT_INFO = [{ label:"Morning", time:"6am–2pm" },{ label:"Afternoon", time:"2pm–10pm" },{ label:"Night", time:"10pm–6am" }];

// Approximate city positions on the Australia SVG (viewBox 500x440)

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

const DEMO = {
  coverPhoto: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  visaType: "Working Holiday (417)",
  bio: "",
};

// ─── Helpers ──────────────────────────────────────────────────
function calcProgress(u = {}) {
  let s = 0;
  if (u.currentCity)  s += 10;
  if (u.targetCity)   s += 10;
  if (u.visaType)     s += 10;
  if (u.currentRole)  s += 10;
  if (u.bio)          s += 10;
  if (Object.values(u.availability || {}).some(v => v?.length > 0)) s += 15;
  if ((u.workExperience || []).length > 0) s += 20;
  if (u.videoUrl)     s += 15;
  return Math.min(s, 100);
}

function greetingText() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// ─── Small components ─────────────────────────────────────────
function Chip({ children, accent = false, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 11px", borderRadius: 100,
      background: accent ? "rgba(232,101,74,.08)" : color ? `${color}14` : "rgba(0,0,0,.04)",
      border: accent ? "1px solid rgba(232,101,74,.15)" : color ? `1px solid ${color}28` : "none",
      fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 500,
      color: accent ? "var(--coral)" : color || "var(--ink-soft)",
      whiteSpace: "nowrap",
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

// ─── Position Card ────────────────────────────────────────────
function PositionCard({ position, applied, onApply, compact = false }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.05)", overflow: "hidden", minWidth: compact ? 240 : "auto", flex: compact ? "0 0 auto" : undefined }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />
      <div style={{ padding: compact ? "16px 18px" : "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: compact ? 16 : 18, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{position.role}</div>
            <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>{position.venueName} · {position.city}</div>
          </div>
          <span style={{ padding: "2px 8px", borderRadius: 100, background: "#d1fae5", border: "1px solid #a7f3d0", fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, color: "#065f46" }}>Open</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <Chip>{COMP_ICON[position.compensation]} {COMP_LABEL[position.compensation] || position.compensation}</Chip>
          {!compact && <Chip>📅 {new Date(position.startDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</Chip>}
          <Chip>⏱ {position.duration}</Chip>
        </div>
        {!compact && position.description && (
          <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {position.description}
          </p>
        )}
        <button onClick={() => !applied && onApply(position)} disabled={applied}
          style={{ width: "100%", borderRadius: 100, padding: "9px 16px", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: applied ? "default" : "pointer", transition: "all .2s", border: applied ? "1.5px solid #a7f3d0" : "none", background: applied ? "#d1fae5" : "var(--coral)", color: applied ? "#065f46" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onMouseEnter={e => { if (!applied) e.currentTarget.style.background = "var(--coral-deep)"; }}
          onMouseLeave={e => { if (!applied) e.currentTarget.style.background = "var(--coral)"; }}>
          {applied ? <><Check size={13} /> Applied</> : "Apply Now →"}
        </button>
      </div>
    </div>
  );
}

// ─── Swap Card ────────────────────────────────────────────────
function SwapCard({ request, onAccept, onDecline, onComplete }) {
  const isInvite = request.initiator === "manager";
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.05)", overflow: "hidden" }}>
      <div style={{ height: 3, background: isInvite ? "linear-gradient(90deg,#60a5fa,#a78bfa)" : "linear-gradient(90deg,var(--coral),var(--gold))" }} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{request.positionRole} — {request.managerVenueName || "Venue"}</div>
            <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>{request.managerVenueCity || ""} · {new Date(request.createdAt).toLocaleDateString("en-AU", { day:"numeric", month:"short" })}</div>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <div style={{ marginBottom: 12 }}><Chip accent={isInvite}>{isInvite ? "🏢 Manager invite" : "📝 Your application"}</Chip></div>
        {request.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#fef3c7", marginBottom: 12 }}>
            <span style={{ color: "var(--gold)" }}>★</span>
            <span style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "#92400e" }}>Rated {request.rating.score}/5</span>
            {request.rating.comment && <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "#92400e", fontStyle: "italic" }}>· "{request.rating.comment}"</span>}
          </div>
        )}
        {request.status === "pending" && isInvite && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onAccept(request.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", borderRadius: 100, background: "var(--forest-soft)", border: "1.5px solid rgba(27,122,90,.25)", color: "var(--forest)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#a7f3d0"} onMouseLeave={e => e.currentTarget.style.background = "var(--forest-soft)"}>
              <Check size={13} /> Accept
            </button>
            <button onClick={() => onDecline(request.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", borderRadius: 100, background: "#f9fafb", border: "1.5px solid rgba(0,0,0,.1)", color: "var(--ink-muted)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
              <XIcon size={13} /> Decline
            </button>
          </div>
        )}
        {request.status === "pending" && !isInvite && (
          <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", padding: "9px 12px", background: "#fef3c7", borderRadius: 10, border: "1px solid #fde68a" }}>⏳ Waiting for the manager to respond…</div>
        )}
        {request.status === "active" && (
          <button onClick={() => onComplete(request.id)} style={{ width: "100%", padding: "9px", borderRadius: 100, background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#bfdbfe"} onMouseLeave={e => e.currentTarget.style.background = "#dbeafe"}>
            Mark as Complete ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Australia Map ────────────────────────────────────────────
// AustraliaMap replaced by JobsMap (Google Maps) — see src/components/JobsMap.jsx

// ─── Main component ───────────────────────────────────────────
export default function BackpackerProfile({ onBack }) {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab] = useState("home");
  const [positions, setPositions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Explore tab
  const [cityFilter, setCityFilter]   = useState("all");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap]         = useState(true);

  // Profile editing
  const [saving, setSaving]           = useState("");
  const [bio, setBio]                 = useState(user?.bio || "");
  const [editBio, setEditBio]         = useState(false);
  const [currentRole, setCurrentRole] = useState(user?.currentRole || "");
  const [visaType, setVisaType]       = useState(user?.visaType || "");
  const [availability, setAvailability] = useState(user?.availability || {});
  const [workExp, setWorkExp]         = useState(user?.workExperience || []);
  const [videoUrl, setVideoUrl]       = useState(user?.videoUrl || "");
  const [editVideo, setEditVideo]     = useState(false);
  const [videoInput, setVideoInput]   = useState(user?.videoUrl || "");
  const [showAddExp, setShowAddExp]   = useState(false);
  const [newExp, setNewExp]           = useState({ role:"", venue:"", city:"", period:"", managerContact:"", description:"" });

  const handleLogout = () => { logout(); onBack(); };

  const profile = {
    ...DEMO,
    name: user?.name || "Backpacker",
    currentCity: user?.currentCity || "Sydney",
    targetCity: user?.targetCity || "Melbourne",
    currentRole: user?.currentRole || "",
    visaType: user?.visaType || DEMO.visaType,
  };
  const userInitials    = getInitials(profile.name);
  const userAvatarColor = getAvatarColor(user?.id || "");

  useEffect(() => {
    Promise.all([api.getPositions(), api.getRequests()])
      .then(([pos, reqs]) => { setPositions(pos); setRequests(reqs); })
      .catch(err => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  const myRequests   = useMemo(() => requests.filter(r => r.backpackerId === user?.id), [requests, user]);
  const appliedIds   = useMemo(() => new Set(myRequests.filter(r => r.initiator === "backpacker").map(r => r.positionId)), [myRequests]);
  const pendingInvites = myRequests.filter(r => r.initiator === "manager" && r.status === "pending").length;

  const openPositions = useMemo(() => positions.filter(p => {
    if (p.status !== "open") return false;
    if (cityFilter !== "all" && p.city !== cityFilter) return false;
    if (roleFilter !== "all" && p.role !== roleFilter) return false;
    if (searchQuery && !p.role.toLowerCase().includes(searchQuery.toLowerCase()) && !p.venueName.toLowerCase().includes(searchQuery.toLowerCase()) && !p.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [positions, cityFilter, roleFilter, searchQuery]);

  const positionsByCity = useMemo(() => {
    const map = {};
    positions.filter(p => p.status === "open").forEach(p => { map[p.city] = (map[p.city] || 0) + 1; });
    return map;
  }, [positions]);

  const targetPositions = useMemo(() => positions.filter(p => p.status === "open" && p.city === profile.targetCity), [positions, profile.targetCity]);
  const otherNewPositions = useMemo(() => positions.filter(p => p.status === "open" && p.city !== profile.targetCity).slice(0, 4), [positions, profile.targetCity]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

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
        managerId: position.managerId, managerVenueName: position.venueName, managerVenueCity: position.city,
        backpackerId: user.id, backpackerName: user.name, backpackerEmail: user.email || "",
        backpackerInitials: userInitials, backpackerAvatarColor: userAvatarColor, backpackerFlag: "",
        positionId: position.id, positionRole: position.role, initiator: "backpacker",
      });
      setRequests(prev => [req, ...prev]);
      showToast("Application sent! ✈️");
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleAccept   = (id) => patchReq(id, { status: "active" },    "Swap accepted! 🎉");
  const handleDecline  = (id) => patchReq(id, { status: "declined" });
  const handleComplete = (id) => patchReq(id, { status: "completed" }, "Swap completed! ⭐");

  const saveSection = async (data, key) => {
    setSaving(key);
    const result = await updateUser(data);
    setSaving("");
    if (result.success) showToast("Saved!");
    else showToast("Error: " + result.error);
    return result.success;
  };

  const pct = calcProgress({ ...user, bio, currentRole, visaType, availability, workExperience: workExp, videoUrl });

  const SELECT = { borderRadius: 10, padding: "8px 28px 8px 10px", background: "#fff", border: "1.5px solid rgba(0,0,0,.1)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, outline: "none", cursor: "pointer", appearance: "none", color: "var(--ink-soft)" };

  const NAV_ITEMS = [
    { id: "home",    icon: Home,      label: "Home"     },
    { id: "explore", icon: Compass,   label: "Explore"  },
    { id: "swaps",   icon: RefreshCw, label: "My Swaps", badge: pendingInvites },
    { id: "profile", icon: User,      label: "Profile"  },
  ];

  if (loading) return (
    <div style={{ background: "#F5F4F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(0,0,0,.08)", borderTopColor: "var(--coral)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)" }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F4F0" }}>
      <style>{`
        .pcard{background:#fff;border-radius:20px;border:1px solid rgba(0,0,0,.04);}
        .hscroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:4px;-ms-overflow-style:none;scrollbar-width:none;}
        .hscroll::-webkit-scrollbar{display:none;}
        .side-item{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:12px;cursor:pointer;transition:all .2s;border:none;background:transparent;width:100%;text-align:left;font-family:var(--font-b);font-size:14px;font-weight:500;color:rgba(255,255,255,.45);}
        .side-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);}
        .side-item.on{background:rgba(232,101,74,.18);color:#fff;}
        .side-item.on svg{color:var(--coral);}
        .bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:100;background:#fff;border-top:1px solid rgba(0,0,0,.07);padding:8px 0 env(safe-area-inset-bottom,8px);}
        .bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px;cursor:pointer;border:none;background:transparent;color:var(--ink-muted);font-family:var(--font-b);font-size:10px;font-weight:500;transition:color .2s;}
        .bnav-item.on{color:var(--coral);}
        @media(max-width:768px){
          .sidebar{display:none!important;}
          .main-content{padding:16px 16px 90px!important;}
          .bnav{display:flex!important;}
          .content-inner{max-width:100%!important;}
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar" style={{ width: 220, background: "var(--ink)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: "1px solid rgba(255,255,255,.05)" }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            pair<span style={{ color: "var(--coral)" }}>go</span>
          </div>
        </div>

        {/* User pill */}
        <div style={{ margin: "16px 16px 8px", padding: "12px 14px", background: "rgba(255,255,255,.05)", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: userAvatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {userInitials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>🎒 Backpacker</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-b)", fontSize: 10, color: "rgba(255,255,255,.3)" }}>Profile</span>
              <span style={{ fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, color: pct >= 80 ? "#34d399" : "var(--coral)" }}>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 100, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: pct >= 80 ? "#34d399" : "var(--coral)", transition: "width .8s ease" }} />
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => (
            <button key={id} className={`side-item${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
              <div style={{ position: "relative" }}>
                <Icon size={17} />
                {badge > 0 && (
                  <div style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: "50%", background: "var(--coral)", fontFamily: "var(--font-b)", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</div>
                )}
              </div>
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, cursor: "pointer", transition: "all .2s", border: "none", background: "transparent", width: "100%", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.3)" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.65)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
            ← Landing page
          </button>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, cursor: "pointer", transition: "all .2s", border: "none", background: "transparent", width: "100%", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.3)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f87171"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" style={{ marginLeft: 220, flex: 1, padding: "32px 32px 48px", minWidth: 0 }}>
        <div className="content-inner" style={{ maxWidth: 960, margin: "0 auto" }}>
          <AnimatePresence mode="wait">

            {/* ═══════════════ HOME ═══════════════ */}
            {tab === "home" && (
              <motion.div key="home" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

                {/* Greeting */}
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontFamily: "var(--font-d)", fontSize: "clamp(24px,3vw,34px)", fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 6 }}>
                    {greetingText()}, {profile.name.split(" ")[0]} 👋
                  </h1>
                  <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--ink-muted)" }}>
                    {new Date().toLocaleDateString("en-AU", { weekday:"long", day:"numeric", month:"long" })} · {profile.currentCity} → {profile.targetCity}
                  </p>
                </div>

                {/* Alert cards row */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {/* Profile completion alert */}
                  {pct < 80 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
                      style={{ background: "linear-gradient(135deg, var(--coral), var(--coral-deep))", borderRadius: 18, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                      onClick={() => setTab("profile")}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,.7)", marginBottom: 4 }}>Complete your profile</div>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                          {pct}% done · {100 - pct}% more to unlock better matches
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,.2)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 100 }} />
                        </div>
                      </div>
                      <ChevronRight size={20} color="rgba(255,255,255,.7)" style={{ flexShrink: 0 }} />
                    </motion.div>
                  )}

                  {/* Pending invites */}
                  {pendingInvites > 0 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      style={{ background: "#fff", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, border: "1.5px solid #93c5fd", cursor: "pointer" }}
                      onClick={() => setTab("swaps")}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏢</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>
                          {pendingInvites} manager invite{pendingInvites > 1 ? "s" : ""} waiting
                        </div>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>Tap to review and accept</div>
                      </div>
                      <ChevronRight size={18} color="var(--ink-muted)" />
                    </motion.div>
                  )}

                  {/* Active swaps */}
                  {myRequests.filter(r => r.status === "active").map(req => (
                    <motion.div key={req.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                      style={{ background: "#fff", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, border: "1.5px solid #a7f3d0", cursor: "pointer" }}
                      onClick={() => setTab("swaps")}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✅</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>Active swap · {req.positionRole}</div>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>{req.managerVenueName} · {req.managerVenueCity}</div>
                      </div>
                      <ChevronRight size={18} color="var(--ink-muted)" />
                    </motion.div>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
                  {[
                    { label: "Applied",   value: myRequests.filter(r => r.initiator === "backpacker").length, icon: "📝", color: "var(--coral)" },
                    { label: "Invites",   value: pendingInvites, icon: "🏢", color: "#60a5fa" },
                    { label: "Active",    value: myRequests.filter(r => r.status === "active").length, icon: "✅", color: "var(--forest)" },
                    { label: "Completed", value: myRequests.filter(r => r.status === "completed").length, icon: "⭐", color: "var(--gold)" },
                  ].map((s, i) => (
                    <motion.div key={i} className="pcard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.1 }}
                      style={{ padding: "18px 20px" }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Best matches (target city) */}
                {targetPositions.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: 2 }}>
                          🎯 Jobs in {profile.targetCity}
                        </h2>
                        <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>{targetPositions.length} open position{targetPositions.length !== 1 ? "s" : ""} in your target city</p>
                      </div>
                      <button onClick={() => { setCityFilter(profile.targetCity); setTab("explore"); }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 100, border: "1.5px solid rgba(0,0,0,.1)", background: "#fff", color: "var(--ink-soft)", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        See all <ChevronRight size={13} />
                      </button>
                    </div>
                    <div className="hscroll">
                      {targetPositions.slice(0, 6).map(pos => (
                        <PositionCard key={pos.id} position={pos} applied={appliedIds.has(pos.id)} onApply={handleApply} compact />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other positions */}
                {otherNewPositions.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h2 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>🔍 Other open positions</h2>
                      <button onClick={() => setTab("explore")}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 100, border: "1.5px solid rgba(0,0,0,.1)", background: "#fff", color: "var(--ink-soft)", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Explore all <ChevronRight size={13} />
                      </button>
                    </div>
                    <div className="hscroll">
                      {otherNewPositions.map(pos => (
                        <PositionCard key={pos.id} position={pos} applied={appliedIds.has(pos.id)} onApply={handleApply} compact />
                      ))}
                    </div>
                  </div>
                )}

                {targetPositions.length === 0 && otherNewPositions.length === 0 && (
                  <EmptyState icon="🌏" title="No positions yet"
                    desc="Be the first to know when managers post jobs. Check back soon!"
                    action={
                      <button onClick={() => setTab("explore")} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "11px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                        Explore map →
                      </button>
                    } />
                )}
              </motion.div>
            )}

            {/* ═══════════════ EXPLORE ═══════════════ */}
            {tab === "explore" && (
              <motion.div key="explore" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 4 }}>Explore Jobs</h1>
                  <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)" }}>{positions.filter(p=>p.status==="open").length} open positions across Australia</p>
                </div>

                {/* Search + filters */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: "1 1 200px", minWidth: 0 }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)", pointerEvents: "none" }} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search roles, venues, cities…"
                      style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,.1)", fontFamily: "var(--font-b)", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" }} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); }} style={SELECT}>
                      <option value="all">All cities</option>
                      {[...new Set(positions.filter(p=>p.status==="open").map(p=>p.city))].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--ink-muted)" }}>▾</span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={SELECT}>
                      <option value="all">All roles</option>
                      {[...new Set(positions.filter(p=>p.status==="open").map(p=>p.role))].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--ink-muted)" }}>▾</span>
                  </div>
                  <button onClick={() => setShowMap(m => !m)}
                    style={{ padding: "9px 16px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,.1)", background: showMap ? "var(--ink)" : "#fff", color: showMap ? "#fff" : "var(--ink-muted)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
                    {showMap ? "Hide map" : "Show map"}
                  </button>
                </div>

                {/* Map */}
                {showMap && (
                  <div style={{ marginBottom: 24 }}>
                    <JobsMap
                      positionsByCity={positionsByCity}
                      selectedCity={cityFilter !== "all" ? cityFilter : null}
                      onSelect={(city) => setCityFilter(city || "all")}
                    />
                    {cityFilter !== "all" && (
                      <div style={{ marginTop: 10, fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>
                        Showing {openPositions.length} position{openPositions.length !== 1 ? "s" : ""} in <strong style={{ color: "var(--ink)" }}>{cityFilter}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Results */}
                {openPositions.length === 0 ? (
                  <EmptyState icon="🔍" title="No positions found"
                    desc={positions.length === 0 ? "No managers have posted yet. Check back soon!" : "Try adjusting your filters."}
                    action={cityFilter !== "all" || roleFilter !== "all" || searchQuery ? (
                      <button onClick={() => { setCityFilter("all"); setRoleFilter("all"); setSearchQuery(""); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "11px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                        Clear filters
                      </button>
                    ) : null} />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginBottom: 48 }}>
                    {openPositions.map(pos => (
                      <PositionCard key={pos.id} position={pos} applied={appliedIds.has(pos.id)} onApply={handleApply} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ MY SWAPS ═══════════════ */}
            {tab === "swaps" && (
              <motion.div key="swaps" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h1 style={{ fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 4 }}>My Swaps</h1>
                    <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)" }}>Your applications, invites and active work swaps</p>
                  </div>
                  {pendingInvites > 0 && (
                    <span style={{ padding: "5px 14px", borderRadius: 100, background: "#fef3c7", border: "1px solid #fde68a", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 700, color: "#92400e" }}>
                      {pendingInvites} invite{pendingInvites > 1 ? "s" : ""} waiting
                    </span>
                  )}
                </div>
                {myRequests.length === 0 ? (
                  <EmptyState icon="🔄" title="No swaps yet" desc="Apply to open positions or wait for manager invites."
                    action={
                      <button onClick={() => setTab("explore")} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "11px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                        Browse jobs →
                      </button>
                    } />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
                    {myRequests.map(req => (
                      <SwapCard key={req.id} request={req} onAccept={handleAccept} onDecline={handleDecline} onComplete={handleComplete} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ PROFILE ═══════════════ */}
            {tab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 4 }}>My Profile</h1>
                  <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)" }}>Keep your profile complete to get more invites from managers</p>
                </div>

                {/* Progress bar */}
                {(() => {
                  const color = pct >= 80 ? "#34d399" : pct >= 50 ? "var(--gold)" : "var(--coral)";
                  const hint = pct < 30 ? "Add more details to get noticed."
                    : pct < 60 ? "Add your availability and work experience."
                    : pct < 100 ? "Almost there! Add a video to stand out." : "Your profile is complete! 🎉";
                  return (
                    <div className="pcard" style={{ padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Profile Completeness</span>
                          <span style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{pct}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 100, background: "rgba(0,0,0,.07)", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.16,1,.3,1] }}
                            style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg,${color},${color}bb)` }} />
                        </div>
                        <p style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)", marginTop: 8 }}>{hint}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Swap info + Bio */}
                <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Coral swap card */}
                  <div style={{ background: "linear-gradient(145deg,#E8654A,#D4503A)", borderRadius: 20, padding: "24px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -25, right: -25, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.07)", pointerEvents: "none" }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, opacity: .7, marginBottom: 16 }}>🎒 Looking to swap</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                        <div><div style={{ fontSize: 10, opacity: .6, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>From</div>
                          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700 }}>📍 {profile.currentCity}</div></div>
                        <div style={{ fontSize: 16, opacity: .6 }}>→</div>
                        <div><div style={{ fontSize: 10, opacity: .6, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>To</div>
                          <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700 }}>🎯 {profile.targetCity}</div></div>
                      </div>
                      {[
                        { icon: "💼", label: "Current role", key: "currentRole", val: currentRole, opts: ROLES, set: setCurrentRole },
                        { icon: "🛂", label: "Visa", key: "visaType", val: visaType, opts: VISA_TYPES, set: setVisaType },
                      ].map(({ icon, label, key, val, opts, set: setter }) => (
                        <div key={key} style={{ background: "rgba(255,255,255,.13)", borderRadius: 12, padding: "9px 12px", marginBottom: 7 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 13 }}>{icon}</span>
                            <span style={{ fontSize: 10, opacity: .65, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
                          </div>
                          <select value={val} onChange={e => setter(e.target.value)} onBlur={() => saveSection({ [key]: val }, key)}
                            style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer" }}>
                            <option value="" style={{ background: "#333" }}>— not set —</option>
                            {opts.map(o => <option key={o} value={o} style={{ background: "#333" }}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="pcard" style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>About me</div>
                      <button onClick={() => setEditBio(b => !b)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 13px", borderRadius: 100, border: "1.5px solid rgba(0,0,0,.1)", background: editBio ? "var(--coral)" : "#fff", color: editBio ? "#fff" : "var(--ink-muted)", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                        <Edit2 size={10} /> {editBio ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    {editBio ? (
                      <>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} placeholder="Tell managers about your experience, attitude, and what makes you a great swap candidate…"
                          style={{ width: "100%", resize: "vertical", borderRadius: 10, padding: "10px 12px", border: "1.5px solid rgba(0,0,0,.1)", fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.65, outline: "none", boxSizing: "border-box" }} />
                        <button onClick={async () => { const ok = await saveSection({ bio }, "bio"); if (ok) setEditBio(false); }} disabled={saving === "bio"}
                          style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 100, background: "var(--coral)", color: "#fff", border: "none", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          <Save size={12} /> {saving === "bio" ? "Saving…" : "Save"}
                        </button>
                      </>
                    ) : (
                      <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: bio ? "var(--ink-soft)" : "var(--ink-muted)", lineHeight: 1.75, fontStyle: bio ? "normal" : "italic" }}>
                        {bio || "No bio yet. Click Edit to add one."}
                      </p>
                    )}
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,.06)" }}>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Email</div>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-soft)" }}>{user?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Availability Grid */}
                <div className="pcard" style={{ padding: "24px 28px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>Weekly Availability</div>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>Tap each cell to toggle · Managers see this when browsing profiles</div>
                    </div>
                    <button onClick={() => saveSection({ availability }, "avail")} disabled={saving === "avail"}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 100, background: "var(--coral)", color: "#fff", border: "none", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving === "avail" ? .7 : 1 }}>
                      <Save size={12} /> {saving === "avail" ? "Saving…" : "Save"}
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "4px", minWidth: 400 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 95, padding: "4px 8px", textAlign: "left", fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Shift</th>
                          {DAY_LABELS.map((d, i) => <th key={i} style={{ padding: "4px", textAlign: "center", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {SHIFTS.map((shift, si) => (
                          <tr key={shift}>
                            <td style={{ padding: "4px 0" }}>
                              <div style={{ fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>{SHIFT_INFO[si].label}</div>
                              <div style={{ fontFamily: "var(--font-b)", fontSize: 10, color: "var(--ink-muted)" }}>{SHIFT_INFO[si].time}</div>
                            </td>
                            {DAYS.map((day) => {
                              const active = (availability[day] || []).includes(shift);
                              return (
                                <td key={day} style={{ textAlign: "center", padding: "3px" }}>
                                  <button onClick={() => { const cur = availability[day]||[]; setAvailability(a=>({...a,[day]:active?cur.filter(s=>s!==shift):[...cur,shift]})); }}
                                    style={{ width: "100%", minWidth: 32, height: 34, borderRadius: 9, border: active ? "none" : "1.5px solid rgba(0,0,0,.1)", background: active ? "var(--coral)" : "#F5F4F0", cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {active && <Check size={12} color="#fff" strokeWidth={2.5} />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="pcard" style={{ padding: "24px 28px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>Work Experience</div>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>Manager contacts can be verified by the Pairgo team</div>
                    </div>
                    <button onClick={() => setShowAddExp(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 100, background: "var(--ink)", color: "#fff", border: "none", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  {showAddExp && (
                    <div style={{ background: "#F5F4F0", borderRadius: 14, padding: "18px", marginBottom: 18, border: "1.5px solid rgba(0,0,0,.08)" }}>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>New experience</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        {[{key:"role",ph:"Role (e.g. Kitchen Hand)"},{key:"venue",ph:"Venue / business name"},{key:"city",ph:"City"},{key:"period",ph:"Period (e.g. Jan–Apr 2025)"},{key:"managerContact",ph:"Manager contact email (optional)"}].map(({key,ph})=>(
                          <input key={key} value={newExp[key]} onChange={e=>setNewExp(x=>({...x,[key]:e.target.value}))} placeholder={ph}
                            style={{ padding:"9px 12px", borderRadius:9, border:"1.5px solid rgba(0,0,0,.1)", fontFamily:"var(--font-b)", fontSize:12, outline:"none", gridColumn:key==="managerContact"?"1 / -1":"auto" }} />
                        ))}
                        <textarea value={newExp.description} onChange={e=>setNewExp(x=>({...x,description:e.target.value}))} placeholder="Brief description (optional)" rows={2}
                          style={{ gridColumn:"1 / -1", padding:"9px 12px", borderRadius:9, border:"1.5px solid rgba(0,0,0,.1)", fontFamily:"var(--font-b)", fontSize:12, outline:"none", resize:"vertical" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={async()=>{if(!newExp.role||!newExp.venue)return;const entry={...newExp,id:`exp_${Date.now()}`};const next=[entry,...workExp];setWorkExp(next);setNewExp({role:"",venue:"",city:"",period:"",managerContact:"",description:""});setShowAddExp(false);await saveSection({workExperience:next},"exp");}}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 16px", borderRadius:100, background:"var(--coral)", color:"#fff", border:"none", fontFamily:"var(--font-b)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                          <Save size={12} /> Save
                        </button>
                        <button onClick={()=>setShowAddExp(false)} style={{ padding:"8px 16px", borderRadius:100, background:"#fff", border:"1.5px solid rgba(0,0,0,.1)", color:"var(--ink-muted)", fontFamily:"var(--font-b)", fontSize:12, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {myRequests.filter(r=>r.status==="completed").length > 0 && (
                    <>
                      <div style={{ fontFamily:"var(--font-b)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, color:"var(--coral)", marginBottom:10 }}>Verified via Pairgo</div>
                      {myRequests.filter(r=>r.status==="completed").map((req,i,arr)=>(
                        <div key={req.id} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom:14, marginBottom:i<arr.length-1?14:0, borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,.06)":"none" }}>
                          <div style={{ width:40,height:40,borderRadius:11,background:"var(--coral-glow)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>🏢</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontFamily:"var(--font-d)",fontSize:14,fontWeight:700,color:"var(--ink)",marginBottom:1 }}>{req.positionRole}</div>
                            <div style={{ fontFamily:"var(--font-b)",fontSize:12,color:"var(--ink-muted)" }}>{req.managerVenueName} · {req.managerVenueCity}</div>
                            {req.rating&&<div style={{ display:"flex",alignItems:"center",gap:5,marginTop:5 }}><span style={{ color:"var(--gold)" }}>{"★".repeat(req.rating.score)}</span><span style={{ fontFamily:"var(--font-b)",fontSize:11,color:"var(--ink-muted)" }}>{req.rating.score}/5 · {req.rating.comment}</span></div>}
                          </div>
                          <span style={{ padding:"2px 8px",borderRadius:100,background:"#d1fae5",border:"1px solid #a7f3d0",fontFamily:"var(--font-b)",fontSize:9,fontWeight:700,color:"#065f46" }}>✓ Verified</span>
                        </div>
                      ))}
                      {workExp.length>0&&<div style={{ height:1,background:"rgba(0,0,0,.06)",margin:"14px 0" }} />}
                    </>
                  )}

                  {workExp.length > 0 ? (
                    workExp.map((exp,i)=>(
                      <div key={exp.id} style={{ display:"flex",gap:12,alignItems:"flex-start",paddingBottom:14,marginBottom:i<workExp.length-1?14:0,borderBottom:i<workExp.length-1?"1px solid rgba(0,0,0,.06)":"none" }}>
                        <div style={{ width:40,height:40,borderRadius:11,background:"#F5F4F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>💼</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"var(--font-d)",fontSize:14,fontWeight:700,color:"var(--ink)",marginBottom:1 }}>{exp.role}</div>
                          <div style={{ fontFamily:"var(--font-b)",fontSize:12,color:"var(--ink-muted)" }}>{exp.venue}{exp.city?` · ${exp.city}`:""}{exp.period?` · ${exp.period}`:""}</div>
                          {exp.managerContact&&<div style={{ display:"flex",alignItems:"center",gap:4,marginTop:5,padding:"3px 9px",background:"#fef3c7",borderRadius:7,width:"fit-content" }}><span style={{ fontSize:10 }}>👤</span><span style={{ fontFamily:"var(--font-b)",fontSize:10,color:"#92400e" }}>Manager: {exp.managerContact}</span></div>}
                          {exp.description&&<p style={{ fontFamily:"var(--font-b)",fontSize:12,color:"var(--ink-muted)",marginTop:5,lineHeight:1.6 }}>{exp.description}</p>}
                        </div>
                        <button onClick={async()=>{const next=workExp.filter(e=>e.id!==exp.id);setWorkExp(next);await saveSection({workExperience:next},"exp");}}
                          style={{ padding:7,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"var(--ink-muted)",transition:"all .2s" }}
                          onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";e.currentTarget.style.color="#dc2626";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--ink-muted)";}}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  ) : myRequests.filter(r=>r.status==="completed").length === 0 && (
                    <div style={{ textAlign:"center",padding:"28px",color:"var(--ink-muted)" }}>
                      <Clock size={26} style={{ marginBottom:8,opacity:.3 }} />
                      <p style={{ fontFamily:"var(--font-b)",fontSize:13 }}>No work experience added yet.</p>
                    </div>
                  )}
                </div>

                {/* Video */}
                <div className="pcard" style={{ padding: "24px 28px", marginBottom: 48 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
                        <Video size={16} color="var(--coral)" /> Presentation Video
                      </div>
                      <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>A short intro video doubles your chances of getting invited</div>
                    </div>
                    {!editVideo && <button onClick={()=>{setEditVideo(true);setVideoInput(videoUrl);}} style={{ display:"flex",alignItems:"center",gap:4,padding:"6px 14px",borderRadius:100,border:"1.5px solid rgba(0,0,0,.1)",background:"#fff",color:"var(--ink-muted)",fontFamily:"var(--font-b)",fontSize:12,fontWeight:600,cursor:"pointer" }}><Edit2 size={10}/>{videoUrl?"Edit":"Add"}</button>}
                  </div>
                  {editVideo ? (
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                      <input value={videoInput} onChange={e=>setVideoInput(e.target.value)} placeholder="YouTube or Vimeo URL"
                        style={{ flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid rgba(0,0,0,.1)",fontFamily:"var(--font-b)",fontSize:13,outline:"none",minWidth:200 }} />
                      <button onClick={async()=>{setVideoUrl(videoInput);const ok=await saveSection({videoUrl:videoInput},"video");if(ok)setEditVideo(false);}}
                        style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 16px",borderRadius:100,background:"var(--coral)",color:"#fff",border:"none",fontFamily:"var(--font-b)",fontSize:12,fontWeight:600,cursor:"pointer" }}><Save size={12} />Save</button>
                      <button onClick={()=>setEditVideo(false)} style={{ padding:"9px 14px",borderRadius:100,border:"1.5px solid rgba(0,0,0,.1)",background:"#fff",color:"var(--ink-muted)",fontFamily:"var(--font-b)",fontSize:12,fontWeight:600,cursor:"pointer" }}>Cancel</button>
                    </div>
                  ) : videoUrl ? (
                    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#F5F4F0",borderRadius:11,border:"1.5px solid rgba(0,0,0,.06)" }}>
                      <Video size={14} color="var(--coral)" style={{ flexShrink:0 }} />
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"var(--font-b)",fontSize:13,color:"var(--coral)",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>{videoUrl}</a>
                    </div>
                  ) : (
                    <div style={{ textAlign:"center",padding:"28px",border:"2px dashed rgba(0,0,0,.1)",borderRadius:14 }}>
                      <Video size={26} style={{ marginBottom:8,color:"var(--coral)",opacity:.4 }} />
                      <p style={{ fontFamily:"var(--font-b)",fontSize:13,color:"var(--ink-muted)" }}>Paste a YouTube or Vimeo link to your intro video</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="bnav">
        {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => (
          <button key={id} className={`bnav-item${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
            <div style={{ position: "relative" }}>
              <Icon size={20} />
              {badge > 0 && (
                <div style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: "50%", background: "var(--coral)", fontFamily: "var(--font-b)", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</div>
              )}
            </div>
            {label}
          </button>
        ))}
      </nav>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            style={{ position: "fixed", bottom: 32, right: 32, zIndex: 400, background: "var(--ink)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 100, padding: "11px 18px", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,.3)" }}>
            <Check size={14} color="var(--coral)" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
