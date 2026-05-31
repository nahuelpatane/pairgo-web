import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Plus, Check, X as XIcon, ArrowRight, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MOCK_BACKPACKERS, CITIES, ROLES, getInitials, getAvatarColor } from "../data/mockData";
import PostPositionModal from "../components/PostPositionModal";
import RateWorkerModal from "../components/RateWorkerModal";
import { api } from "../api";

const COMP_LABEL = {
  exchange: "Skill exchange",
  accommodation: "Exchange + accommodation",
  paid: "Paid",
  paid_accommodation: "Paid + accommodation",
};

// --- Small reusable components ---

function StarRow({ rating, size = 11 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          fill={rating >= n ? "var(--gold)" : "transparent"}
          stroke={rating >= n ? "var(--gold)" : "rgba(255,255,255,.2)"} />
      ))}
    </div>
  );
}

function Badge({ label, bg, border, color }) {
  return (
    <span style={{ padding: "3px 10px", borderRadius: 100, background: bg, border: `1px solid ${border}`, fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color, textTransform: "capitalize", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

const STATUS_STYLE = {
  open:      { bg: "rgba(74,222,128,.1)",  border: "rgba(74,222,128,.25)",  color: "#4ade80" },
  filled:    { bg: "rgba(96,165,250,.1)",  border: "rgba(96,165,250,.25)",  color: "#60a5fa" },
  closed:    { bg: "rgba(255,255,255,.04)", border: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.3)" },
  pending:   { bg: "rgba(229,161,0,.1)",   border: "rgba(229,161,0,.25)",   color: "var(--gold)" },
  active:    { bg: "rgba(74,222,128,.1)",  border: "rgba(74,222,128,.25)",  color: "#4ade80" },
  completed: { bg: "rgba(96,165,250,.1)",  border: "rgba(96,165,250,.25)",  color: "#60a5fa" },
  declined:  { bg: "rgba(255,255,255,.04)", border: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.3)" },
};

// --- Tab bar ---
function TabBar({ active, onChange, pendingCount }) {
  const tabs = [
    { id: "positions", label: "My Positions" },
    { id: "browse",    label: "Browse Workers" },
    { id: "requests",  label: "Requests", badge: pendingCount },
  ];
  return (
    <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.04)", padding: 4, borderRadius: 14, marginBottom: 28 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex: 1, position: "relative", padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, transition: "all .2s", background: active === t.id ? "rgba(255,255,255,.1)" : "transparent", color: active === t.id ? "#fff" : "rgba(255,255,255,.4)" }}>
          {t.label}
          {t.badge > 0 && (
            <span style={{ position: "absolute", top: 5, right: 8, width: 18, height: 18, borderRadius: "50%", background: "var(--coral)", fontSize: 11, fontWeight: 700, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// --- Position card ---
function PositionCard({ position, requestCount, onClose }) {
  const sc = STATUS_STYLE[position.status] || STATUS_STYLE.open;
  return (
    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--coral), var(--gold))", opacity: position.status === "open" ? 0.6 : 0.2 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{position.role}</div>
          <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
            {new Date(position.startDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })} · {position.duration}
          </div>
        </div>
        <Badge label={position.status} {...sc} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: position.description ? 12 : 14 }}>
        <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(255,255,255,.05)", fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.5)" }}>
          {COMP_LABEL[position.compensation] || position.compensation}
        </span>
        {requestCount > 0 && (
          <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(232,101,74,.1)", border: "1px solid rgba(232,101,74,.2)", fontFamily: "var(--font-b)", fontSize: 12, color: "var(--coral)", fontWeight: 600 }}>
            {requestCount} {requestCount === 1 ? "invite" : "invites"}
          </span>
        )}
      </div>

      {position.description && (
        <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.35)", lineHeight: 1.6, marginBottom: 14 }}>
          {position.description}
        </p>
      )}

      {position.status === "open" && (
        <button onClick={onClose}
          style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.3)", background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 100, padding: "5px 12px", cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}>
          Close position
        </button>
      )}
    </div>
  );
}

// --- Backpacker card ---
function BackpackerCard({ bp, requested, noPositions, onInvite }) {
  const disabled = requested || noPositions;
  return (
    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "22px", transition: "border-color .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.14)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"}>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: bp.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "#fff" }}>
            {bp.initials}
          </div>
          {bp.verified && (
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "#4ade80", border: "2px solid #0F0F0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={10} color="#000" strokeWidth={3} />
            </div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 16, fontWeight: 700, color: "#fff" }}>
              {bp.name} <span style={{ fontWeight: 400 }}>{bp.flag}</span>
            </div>
            {bp.isRealUser && (
              <span style={{ padding: "2px 7px", borderRadius: 100, background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)", fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, color: "#4ade80", letterSpacing: 0.5 }}>
                LIVE
              </span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 4 }}>
            {bp.currentCity} <ArrowRight size={11} style={{ flexShrink: 0 }} /> {bp.targetCity}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <StarRow rating={bp.rating} />
        <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
          {bp.rating} ({bp.reviewCount})
        </span>
        {bp.swapsCompleted > 0 && (
          <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            · {bp.swapsCompleted} {bp.swapsCompleted === 1 ? "swap" : "swaps"}
          </span>
        )}
      </div>

      {/* Roles */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {bp.roles.map(r => (
          <span key={r} style={{ padding: "2px 9px", borderRadius: 100, background: "rgba(255,255,255,.05)", fontFamily: "var(--font-b)", fontSize: 11, color: "rgba(255,255,255,.45)" }}>
            {r}
          </span>
        ))}
      </div>

      <p style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.6, marginBottom: 12 }}>
        {bp.bio}
      </p>

      <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.3)", marginBottom: 16 }}>
        Available from{" "}
        <span style={{ color: "rgba(255,255,255,.6)", fontWeight: 600 }}>
          {new Date(bp.availableFrom).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
        </span>
      </div>

      <button
        onClick={() => !disabled && onInvite(bp)}
        disabled={disabled}
        title={noPositions ? "Post a position first" : ""}
        style={{
          width: "100%",
          background: requested ? "rgba(74,222,128,.1)" : noPositions ? "rgba(255,255,255,.03)" : "rgba(232,101,74,.14)",
          border: `1px solid ${requested ? "rgba(74,222,128,.25)" : noPositions ? "rgba(255,255,255,.06)" : "rgba(232,101,74,.3)"}`,
          color: requested ? "#4ade80" : noPositions ? "rgba(255,255,255,.22)" : "var(--coral)",
          borderRadius: 100, padding: "9px 16px",
          fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600,
          cursor: disabled ? "default" : "pointer", transition: "all .2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "rgba(232,101,74,.24)"; }}
        onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = "rgba(232,101,74,.14)"; }}
      >
        {requested ? <><Check size={13} /> Invited</> : noPositions ? "Post a position first" : "Send Invite"}
      </button>
    </div>
  );
}

// --- Request item ---
function RequestItem({ request, onApprove, onDecline, onComplete, onRate }) {
  const sc = STATUS_STYLE[request.status] || STATUS_STYLE.pending;
  return (
    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: request.backpackerAvatarColor || "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
        {request.backpackerInitials}
      </div>

      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "#fff" }}>
            {request.backpackerName} {request.backpackerFlag}
          </div>
          {request.initiator === "backpacker" && (
            <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.3)", fontFamily: "var(--font-b)", fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: 0.5 }}>
              APPLIED
            </span>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
          {request.positionRole} · {new Date(request.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          {request.backpackerEmail && <span style={{ marginLeft: 6, color: "rgba(255,255,255,.25)" }}>· {request.backpackerEmail}</span>}
        </div>
        {request.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <StarRow rating={request.rating.score} />
            {request.rating.comment && (
              <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.3)", fontStyle: "italic" }}>
                "{request.rating.comment}"
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge label={sc.label || request.status} {...sc} />

        {request.status === "pending" && (
          <>
            <ActionBtn onClick={() => onApprove(request.id)} color="#4ade80" bg="rgba(74,222,128,.1)" border="rgba(74,222,128,.25)" hoverBg="rgba(74,222,128,.2)">
              <Check size={12} /> Accept
            </ActionBtn>
            <ActionBtn onClick={() => onDecline(request.id)} color="rgba(255,255,255,.4)" bg="rgba(255,255,255,.04)" border="rgba(255,255,255,.08)" hoverColor="var(--coral)" hoverBg="rgba(232,101,74,.1)">
              <XIcon size={12} /> Decline
            </ActionBtn>
          </>
        )}

        {request.status === "active" && (
          <ActionBtn onClick={() => onComplete(request.id)} color="#60a5fa" bg="rgba(96,165,250,.1)" border="rgba(96,165,250,.25)" hoverBg="rgba(96,165,250,.2)">
            Mark Complete
          </ActionBtn>
        )}

        {request.status === "completed" && !request.rating && (
          <ActionBtn onClick={() => onRate(request)} color="var(--gold)" bg="rgba(229,161,0,.1)" border="rgba(229,161,0,.25)" hoverBg="rgba(229,161,0,.2)">
            <Star size={12} /> Rate Worker
          </ActionBtn>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, bg, border, hoverBg, hoverColor, children }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 100, background: bg, border: `1px solid ${border}`, color, fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg || bg; if (hoverColor) e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; if (hoverColor) e.currentTarget.style.color = color; }}>
      {children}
    </button>
  );
}

// --- Empty state ---
function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.08)", borderRadius: 20 }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "rgba(255,255,255,.35)", marginBottom: action ? 20 : 0 }}>{desc}</p>
      {action}
    </div>
  );
}

// ============================================================
// Main component
// ============================================================
export default function ManagerProfile({ onBack }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("positions");
  const [positions, setPositions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [realBackpackers, setRealBackpackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [rateTarget, setRateTarget] = useState(null);
  const [cityFilter, setCityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const handleLogout = () => { logout(); onBack(); };

  const displayName = user?.name || "Manager";
  const venueName = user?.venueName || "Your Venue";
  const city = user?.city || "";
  const venueType = user?.venueType || "Business";
  const roleNeeded = user?.roleNeeded || "";

  // Load all data from API on mount
  useEffect(() => {
    Promise.all([api.getPositions(), api.getRequests(), api.getBackpackers()])
      .then(([pos, reqs, bps]) => {
        setPositions(pos);
        setRequests(reqs);
        setRealBackpackers(bps);
      })
      .catch(err => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  // All backpackers: real registered users first, then mocks
  const allBackpackers = useMemo(() => [...realBackpackers, ...MOCK_BACKPACKERS], [realBackpackers]);

  // Derived data
  const myPositions = positions.filter(p => p.managerId === user?.id);
  const myRequests  = requests.filter(r => r.managerId === user?.id);
  const openCount       = myPositions.filter(p => p.status === "open").length;
  const activeCount     = myRequests.filter(r => r.status === "active").length;
  const completedCount  = myRequests.filter(r => r.status === "completed").length;
  const pendingCount    = myRequests.filter(r => r.status === "pending").length;
  const hasOpenPosition = myPositions.some(p => p.status === "open");
  const invitedIds      = useMemo(() => new Set(myRequests.map(r => r.backpackerId)), [myRequests]);

  const requestCountFor = (posId) => myRequests.filter(r => r.positionId === posId).length;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // --- Actions (all async, all go through API) ---
  const handlePostPosition = async (form) => {
    try {
      const pos = await api.createPosition({ managerId: user.id, venueName, city, venueType, ...form });
      setPositions(prev => [pos, ...prev]);
      setShowPostModal(false);
      showToast("Position posted!");
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleClosePosition = async (posId) => {
    try {
      const updated = await api.patchPosition(posId, { status: "closed" });
      setPositions(prev => prev.map(p => p.id === posId ? updated : p));
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleInvite = async (bp) => {
    const openPos = myPositions.find(p => p.status === "open");
    if (!openPos) return;
    try {
      const req = await api.createRequest({
        managerId: user.id,
        backpackerId: bp.id, backpackerName: bp.name,
        backpackerEmail: bp.email || "",
        backpackerFlag: bp.flag || "",
        backpackerInitials: bp.initials || getInitials(bp.name),
        backpackerAvatarColor: bp.avatarColor || getAvatarColor(bp.id),
        positionId: openPos.id, positionRole: openPos.role,
        initiator: "manager",
      });
      setRequests(prev => [req, ...prev]);
      showToast(`Invite sent to ${bp.name}!`);
    } catch (err) { showToast("Error: " + err.message); }
  };

  const patchReq = async (id, patch, toastMsg) => {
    try {
      const updated = await api.patchRequest(id, patch);
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      if (toastMsg) showToast(toastMsg);
    } catch (err) { showToast("Error: " + err.message); }
  };

  const handleApprove  = (id) => patchReq(id, { status: "active" },    "Swap accepted!");
  const handleDecline  = (id) => patchReq(id, { status: "declined" });
  const handleComplete = (id) => patchReq(id, { status: "completed" });
  const handleRate     = (req) => setRateTarget(req);
  const handleRateSubmit = async ({ score, comment }) => {
    await patchReq(rateTarget.id, { rating: { score, comment, createdAt: Date.now() } }, "Rating submitted!");
    setRateTarget(null);
  };

  // Filtered backpackers
  const filteredBPs = useMemo(() => allBackpackers.filter(bp => {
    if (cityFilter !== "all" && bp.currentCity !== cityFilter) return false;
    if (roleFilter !== "all" && !bp.roles.includes(roleFilter)) return false;
    return true;
  }), [cityFilter, roleFilter, allBackpackers]);

  const SELECT_STYLE = {
    borderRadius: 10, padding: "9px 32px 9px 14px",
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
    fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500,
    outline: "none", cursor: "pointer", appearance: "none",
  };

  if (loading) return (
    <div style={{ background: "#0F0F0D", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,.1)", borderTopColor: "var(--coral)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "rgba(255,255,255,.3)" }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0F0F0D", minHeight: "100vh", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,15,13,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={onBack}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 500, transition: "color .2s", padding: 0 }}
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
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.4)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, transition: "all .2s", padding: "8px 16px" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.4)"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop: 57, minHeight: 260, background: "linear-gradient(145deg, #1a1a18 0%, #111 100%)", display: "flex", alignItems: "flex-end", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,101,74,.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(229,161,0,.06), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 32px 36px", width: "100%", position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ width: 76, height: 76, borderRadius: 20, background: "linear-gradient(135deg, rgba(232,101,74,.2), rgba(229,161,0,.1))", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
                🏢
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <h1 style={{ fontFamily: "var(--font-d)", fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px" }}>{venueName}</h1>
                  <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(27,122,90,.2)", border: "1px solid rgba(27,122,90,.3)", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 1 }}>✓ Manager</span>
                </div>
                <div style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "rgba(255,255,255,.4)" }}>
                  {venueType}{city ? ` · ${city}` : ""}{roleNeeded ? ` · Looking for ${roleNeeded}` : ""}
                </div>
                <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.28)", marginTop: 4 }}>
                  Managed by {displayName}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "22px 28px", marginBottom: 24, display: "flex", gap: 36, flexWrap: "wrap" }}>
          {[
            { label: "Open positions", value: openCount,    color: "var(--coral)" },
            { label: "Active swaps",   value: activeCount,  color: "#4ade80" },
            { label: "Completed",      value: completedCount, color: "var(--gold)" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tab bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}>
          <TabBar active={activeTab} onChange={setActiveTab} pendingCount={pendingCount} />
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* ---- MY POSITIONS ---- */}
          {activeTab === "positions" && (
            <motion.div key="positions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>My Positions</h2>
                <button onClick={() => setShowPostModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "10px 18px", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--coral-deep)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--coral)"}>
                  <Plus size={15} /> Post Position
                </button>
              </div>

              {myPositions.length === 0 ? (
                <EmptyState icon="📋" title="No positions yet" desc="Post a position to start finding workers."
                  action={
                    <button onClick={() => setShowPostModal(true)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--coral)", color: "#fff", border: "none", borderRadius: 100, padding: "11px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                      <Plus size={15} /> Post your first position
                    </button>
                  } />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {myPositions.map(pos => (
                    <PositionCard key={pos.id} position={pos} requestCount={requestCountFor(pos.id)} onClose={() => handleClosePosition(pos.id)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---- BROWSE WORKERS ---- */}
          {activeTab === "browse" && (
            <motion.div key="browse" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginRight: "auto" }}>Browse Workers</h2>
                <div style={{ position: "relative" }}>
                  <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                    style={{ ...SELECT_STYLE, color: cityFilter !== "all" ? "#fff" : "rgba(255,255,255,.5)" }}>
                    <option value="all">All cities</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,.3)", fontSize: 12 }}>▾</span>
                </div>
                <div style={{ position: "relative" }}>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    style={{ ...SELECT_STYLE, color: roleFilter !== "all" ? "#fff" : "rgba(255,255,255,.5)" }}>
                    <option value="all">All roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,.3)", fontSize: 12 }}>▾</span>
                </div>
              </div>

              {!hasOpenPosition && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, background: "rgba(229,161,0,.06)", border: "1px solid rgba(229,161,0,.2)", marginBottom: 20 }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                  <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(229,161,0,.9)", lineHeight: 1.5 }}>
                    Post a position first to start inviting workers.{" "}
                    <button onClick={() => { setActiveTab("positions"); setTimeout(() => setShowPostModal(true), 150); }}
                      style={{ color: "var(--gold)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 700, padding: 0, textDecoration: "underline" }}>
                      Post one now →
                    </button>
                  </p>
                </div>
              )}

              {filteredBPs.length === 0 ? (
                <EmptyState icon="🔍" title="No workers found" desc="Try adjusting the city or role filters." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {filteredBPs.map(bp => (
                    <BackpackerCard key={bp.id} bp={bp}
                      requested={invitedIds.has(bp.id)}
                      noPositions={!hasOpenPosition}
                      onInvite={handleInvite} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---- REQUESTS ---- */}
          {activeTab === "requests" && (
            <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Swap Requests</h2>
                {pendingCount > 0 && (
                  <span style={{ padding: "4px 12px", borderRadius: 100, background: "rgba(232,101,74,.14)", border: "1px solid rgba(232,101,74,.3)", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 700, color: "var(--coral)" }}>
                    {pendingCount} pending
                  </span>
                )}
              </div>

              {myRequests.length === 0 ? (
                <EmptyState icon="🔄" title="No requests yet" desc="Browse workers and send invites to get started." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {myRequests.map(req => (
                    <RequestItem key={req.id} request={req}
                      onApprove={handleApprove} onDecline={handleDecline}
                      onComplete={handleComplete} onRate={handleRate} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Modals */}
      {showPostModal && (
        <PostPositionModal venueName={venueName} city={city}
          onClose={() => setShowPostModal(false)}
          onSubmit={handlePostPosition} />
      )}
      {rateTarget && (
        <RateWorkerModal request={rateTarget}
          onClose={() => setRateTarget(null)}
          onSubmit={handleRateSubmit} />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            style={{ position: "fixed", bottom: 32, right: 32, zIndex: 400, background: "rgba(22,22,20,.96)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 100, padding: "12px 20px", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, color: "#fff", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
            <Check size={15} color="var(--coral)" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
