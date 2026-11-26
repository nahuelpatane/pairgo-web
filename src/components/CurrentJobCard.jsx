import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Briefcase, Clock, Plus } from "lucide-react";
import { api } from "../api";
import { ROLES } from "../data/constants";

const OPEN = ["pending", "active"];

const label = { fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, display: "block" };
const field = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(0,0,0,.1)", fontFamily: "var(--font-b)", fontSize: 13, outline: "none", background: "#fff", color: "var(--ink)" };
const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 100, background: "var(--coral)", color: "#fff", border: "none", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const btnGhost = { padding: "8px 16px", borderRadius: 100, background: "#fff", border: "1.5px solid rgba(0,0,0,.1)", color: "var(--ink-muted)", fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer" };

const formatMonth = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-AU", { month: "short", year: "numeric" });
};

/**
 * "Current job" card on the worker profile. The worker picks the venue they work at
 * and the manager confirms it — that confirmation is what makes them verified.
 */
export default function CurrentJobCard({ defaultRole = "", onToast }) {
  const [links, setLinks]     = useState([]);
  const [venues, setVenues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [adding, setAdding]   = useState(false);
  const [form, setForm]       = useState({ managerId: "", role: defaultRole, startDate: "" });

  useEffect(() => {
    Promise.all([api.getEmployment(), api.getVenues()])
      .then(([l, v]) => { setLinks(l); setVenues(v); })
      .catch(err => console.error("Error loading current job:", err))
      .finally(() => setLoading(false));
  }, []);

  const current = links.find(l => OPEN.includes(l.status));
  const lastRejected = !current && links[0]?.status === "rejected" ? links[0] : null;

  const venuesByCity = useMemo(() => {
    const map = {};
    venues.forEach(v => { (map[v.city || "Other"] ||= []).push(v); });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [venues]);

  const submit = async () => {
    if (!form.managerId || !form.role) return onToast?.("Pick your venue and role.");
    setBusy(true);
    try {
      const link = await api.createEmployment(form);
      setLinks(prev => [link, ...prev]);
      setAdding(false);
      onToast?.("Request sent to your manager ✉️");
    } catch (err) { onToast?.("Error: " + err.message); }
    setBusy(false);
  };

  const act = async (action, msg) => {
    setBusy(true);
    try {
      const updated = await api.employmentAction(current.id, action);
      setLinks(prev => prev.map(l => l.id === updated.id ? updated : l));
      onToast?.(msg);
    } catch (err) { onToast?.("Error: " + err.message); }
    setBusy(false);
  };

  return (
    <div className="pcard" style={{ padding: "24px 28px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>Current job</div>
          <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>Confirmed by your manager — required to swap jobs</div>
        </div>
        {!loading && !current && !adding && (
          <button onClick={() => setAdding(true)} style={{ ...btnPrimary, background: "var(--ink)" }}>
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {loading && <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>Loading…</div>}

      {/* Current (pending or verified) */}
      {current && (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--coral-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Briefcase size={19} color="var(--coral)" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
              <span style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{current.role}</span>
              {current.status === "active" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 100, background: "rgba(34,160,90,.1)", color: "#1f9d55", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700 }}>
                  <BadgeCheck size={12} /> Verified
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 100, background: "rgba(229,161,0,.12)", color: "#b07800", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700 }}>
                  <Clock size={12} /> Awaiting confirmation
                </span>
              )}
            </div>
            <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)" }}>
              {current.venueName}{current.city && ` · ${current.city}`}{current.startDate && ` · since ${formatMonth(current.startDate)}`}
            </div>
            {current.status === "pending" && (
              <p style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.5 }}>
                Your manager at {current.venueName} needs to confirm you work there.
              </p>
            )}
          </div>
          <button disabled={busy} style={btnGhost}
            onClick={() => current.status === "pending"
              ? act("cancel", "Request cancelled")
              : window.confirm(`Confirm you no longer work at ${current.venueName}?`) && act("end", "Job ended")}>
            {current.status === "pending" ? "Cancel request" : "I no longer work here"}
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !current && !adding && (
        <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>
          {lastRejected
            ? <>{lastRejected.venueName} didn't confirm your job. Check you picked the right venue and try again.</>
            : <>Add where you work now. Once your manager confirms it you'll be <b>verified</b> and can swap jobs with workers in other cities.</>}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div style={{ background: "#F5F4F0", borderRadius: 14, padding: 18, border: "1.5px solid rgba(0,0,0,.08)" }}>
          {venues.length === 0 ? (
            <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", marginBottom: 12 }}>
              No venues on Pairgo yet. Ask your manager to sign up so they can confirm your job.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={label}>Venue</span>
                <select value={form.managerId} onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))} style={field}>
                  <option value="">Select where you work…</option>
                  {venuesByCity.map(([city, list]) => (
                    <optgroup key={city} label={city}>
                      {list.map(v => <option key={v.managerId} value={v.managerId}>{v.venueName}{v.venueType && ` (${v.venueType})`}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Your role</span>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={field}>
                  <option value="">Select role…</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <span style={label}>Started</span>
                <input type="month" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={field} />
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {venues.length > 0 && (
              <button disabled={busy} onClick={submit} style={{ ...btnPrimary, opacity: busy ? .6 : 1 }}>Send to manager</button>
            )}
            <button onClick={() => setAdding(false)} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
