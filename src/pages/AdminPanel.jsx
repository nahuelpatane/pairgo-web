import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

const FONT = "'DM Sans', sans-serif";
const SERIF = "'Fraunces', serif";
const CORAL = "#E8654A";
const CORAL_D = "#D4503A";

// ─── Helpers ───────────────────────────────────────────────────────────────

function joinedDate(id = "") {
  const ts = parseInt(id.split("_")[1]);
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function userCity(u) {
  return u.role === "manager" ? (u.city || u.currentCity || "—") : (u.currentCity || "—");
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Avatar({ user }) {
  if (user.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt=""
        style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,.1)" }}
      />
    );
  }
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
      background: user.avatarColor || CORAL,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, fontSize: 13, fontWeight: 700, color: "#fff",
      border: "2px solid rgba(255,255,255,.1)",
    }}>
      {user.initials || (user.name || "?")[0].toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }) {
  const isManager = role === "manager";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
      fontFamily: FONT, letterSpacing: ".3px",
      background: isManager ? "rgba(37,99,235,.15)" : "rgba(232,101,74,.15)",
      color: isManager ? "#60a5fa" : CORAL,
      border: `1px solid ${isManager ? "rgba(37,99,235,.25)" : "rgba(232,101,74,.25)"}`,
    }}>
      {isManager ? "🏢" : "🎒"} {isManager ? "Manager" : "Backpacker"}
    </span>
  );
}

function StatCard({ icon, label, value, color = "rgba(255,255,255,.06)" }) {
  return (
    <div style={{
      background: color, border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 16, padding: "20px 24px", flex: 1,
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.38)", fontWeight: 500, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────

function AdminLogin({ onSuccess }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.adminLogin(pw);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0b",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{
        width: "100%", maxWidth: 360,
        background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,.5)",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${CORAL}, #e5a100)` }} />
        <div style={{ padding: 32 }}>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 4 }}>
            pair<span style={{ color: CORAL }}>go</span>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.3)", letterSpacing: "2px", marginLeft: 8, textTransform: "uppercase" }}>
              Admin
            </span>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.38)", marginBottom: 28, marginTop: 4 }}>
            Enter the admin password to continue
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              placeholder="Admin password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              required
              autoFocus
              style={{
                width: "100%", padding: "13px 16px", borderRadius: 12,
                background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.1)",
                color: "#fff", fontSize: 14, fontFamily: FONT, outline: "none",
                transition: "border-color .2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = CORAL}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
            />

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(232,101,74,.1)", border: "1px solid rgba(232,101,74,.25)",
                fontSize: 13, color: CORAL, fontFamily: FONT,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 100,
                background: loading ? "rgba(232,101,74,.5)" : CORAL,
                color: "#fff", border: "none", fontFamily: FONT, fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background .2s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = CORAL_D; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = CORAL; }}
            >
              {loading
                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} /> Verifying…</>
                : "Access Admin Panel →"
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ──────────────────────────────────────────────────────

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | backpacker | manager
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // userId pending confirm
  const [actionLoading, setActionLoading] = useState(null); // userId with pending action

  // Check existing admin session
  useEffect(() => {
    api.adminCheck()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const loadData = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const [usersData, statsData] = await Promise.all([
        api.adminGetUsers(),
        api.adminGetStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch {}
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const handleLogout = async () => {
    await api.adminLogout().catch(() => {});
    setAuthed(false);
  };

  const handleDelete = async (userId) => {
    if (confirmDelete !== userId) {
      setConfirmDelete(userId);
      return;
    }
    setActionLoading(userId);
    try {
      await api.adminDeleteUser(userId);
      setUsers(u => u.filter(x => x.id !== userId));
      setStats(s => s ? { ...s, totalUsers: s.totalUsers - 1, [users.find(u => u.id === userId)?.role === "manager" ? "managers" : "backpackers"]: Math.max(0, s[users.find(u => u.id === userId)?.role === "manager" ? "managers" : "backpackers"] - 1) } : s);
    } catch {}
    setActionLoading(null);
    setConfirmDelete(null);
  };

  const handleRoleChange = async (user) => {
    const newRole = user.role === "backpacker" ? "manager" : "backpacker";
    setActionLoading(user.id);
    try {
      const { user: updated } = await api.adminPatchUser(user.id, { role: newRole });
      setUsers(u => u.map(x => x.id === user.id ? { ...x, role: updated.role } : x));
      setStats(s => {
        if (!s) return s;
        const from = user.role === "backpacker" ? "backpackers" : "managers";
        const to = user.role === "backpacker" ? "managers" : "backpackers";
        return { ...s, [from]: Math.max(0, s[from] - 1), [to]: s[to] + 1 };
      });
    } catch {}
    setActionLoading(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || userCity(u).toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Render: checking / login ───────────────────────────────────────────

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0d0b" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 28, height: 28, border: "2.5px solid rgba(232,101,74,.25)", borderTopColor: CORAL, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => { setAuthed(true); }} />;
  }

  // ── Render: dashboard ─────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0b", color: "#fff", fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px;}
        .row-hover{transition:background .15s;}
        .row-hover:hover{background:rgba(255,255,255,.04)!important;}
        .btn-action{transition:all .15s;border:none;cursor:pointer;border-radius:8px;padding:6px 12px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;}
      `}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(13,13,11,.9)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,.07)",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            pair<span style={{ color: CORAL }}>go</span>
          </div>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.1)" }} />
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: "2px", textTransform: "uppercase" }}>
            Admin
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={loadData}
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,.6)", fontSize: 13, fontFamily: FONT, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleLogout}
            style={{ background: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,.45)", fontSize: 13, fontFamily: FONT, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.45)"}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
            <StatCard icon="👥" label="Total users" value={stats.totalUsers} />
            <StatCard icon="🎒" label="Backpackers" value={stats.backpackers} color="rgba(232,101,74,.08)" />
            <StatCard icon="🏢" label="Managers" value={stats.managers} color="rgba(37,99,235,.08)" />
            <StatCard icon="📋" label="Positions" value={stats.positions} />
            <StatCard icon="🔄" label="Requests" value={stats.requests} />
          </div>
        )}

        {/* Users section */}
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                Users
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", fontFamily: FONT, marginTop: 2 }}>
                {loadingUsers ? "Loading…" : `${filtered.length} of ${users.length}`}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Role filter */}
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.05)", borderRadius: 10, padding: 3 }}>
              {[["all", "All"], ["backpacker", "🎒 Backpackers"], ["manager", "🏢 Managers"]].map(([v, label]) => (
                <button key={v} onClick={() => setRoleFilter(v)} style={{
                  padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontFamily: FONT, fontSize: 12, fontWeight: 600, transition: "all .15s",
                  background: roleFilter === v ? (v === "backpacker" ? CORAL : v === "manager" ? "#2563eb" : "rgba(255,255,255,.1)") : "transparent",
                  color: roleFilter === v ? "#fff" : "rgba(255,255,255,.4)",
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search name, email or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 13, fontFamily: FONT,
                outline: "none", width: 220,
              }}
              onFocus={e => e.target.style.borderColor = CORAL}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
            />
          </div>

          {/* Table */}
          {loadingUsers ? (
            <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, border: "2px solid rgba(232,101,74,.25)", borderTopColor: CORAL, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 64, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{users.length === 0 ? "🌱" : "🔍"}</div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 6 }}>
                {users.length === 0 ? "No users yet" : "No results found"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.25)", fontFamily: FONT }}>
                {users.length === 0 ? "Users will appear here once they sign up." : "Try changing the search or filter."}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {["User", "Role", "City", "Joined", "Actions"].map(h => (
                      <th key={h} style={{
                        padding: "10px 16px", textAlign: "left",
                        fontFamily: FONT, fontSize: 11, fontWeight: 700,
                        color: "rgba(255,255,255,.3)", letterSpacing: "1.5px", textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>

                      {/* User */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar user={user} />
                          <div>
                            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                              {user.name || "—"}
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", fontFamily: FONT }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 16px" }}>
                        <RoleBadge role={user.role} />
                      </td>

                      {/* City */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontFamily: FONT }}>
                          📍 {userCity(user)}
                        </span>
                      </td>

                      {/* Joined */}
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.35)", fontFamily: FONT }}>
                          {joinedDate(user.id)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>

                          {/* Change role */}
                          <button
                            className="btn-action"
                            onClick={() => handleRoleChange(user)}
                            disabled={actionLoading === user.id}
                            title={`Change to ${user.role === "backpacker" ? "Manager" : "Backpacker"}`}
                            style={{
                              background: "rgba(255,255,255,.07)",
                              color: "rgba(255,255,255,.65)",
                              opacity: actionLoading === user.id ? 0.5 : 1,
                            }}
                            onMouseEnter={e => { if (actionLoading !== user.id) e.currentTarget.style.background = "rgba(255,255,255,.13)"; }}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.07)"}
                          >
                            {actionLoading === user.id ? "…" : (user.role === "backpacker" ? "→ Manager" : "→ Backpacker")}
                          </button>

                          {/* Delete */}
                          <button
                            className="btn-action"
                            onClick={() => { setConfirmDelete(c => c === user.id ? null : null); handleDelete(user.id); }}
                            onMouseLeave={() => setConfirmDelete(c => c === user.id ? null : c)}
                            disabled={actionLoading === user.id}
                            style={{
                              background: confirmDelete === user.id ? "rgba(239,68,68,.85)" : "rgba(239,68,68,.1)",
                              color: confirmDelete === user.id ? "#fff" : "#f87171",
                              opacity: actionLoading === user.id ? 0.5 : 1,
                              border: "1px solid rgba(239,68,68,.2)",
                            }}
                            onMouseEnter={e => { if (actionLoading !== user.id) e.currentTarget.style.background = confirmDelete === user.id ? "rgba(220,38,38,.9)" : "rgba(239,68,68,.2)"; }}
                          >
                            {confirmDelete === user.id ? "Confirm delete?" : "Delete"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "rgba(255,255,255,.15)", fontFamily: FONT }}>
          pairgo admin · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
