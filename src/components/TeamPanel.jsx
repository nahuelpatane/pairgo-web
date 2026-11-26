import { BadgeCheck, Check, X } from "lucide-react";
import { getAvatarColor, getInitials } from "../data/constants";

const formatMonth = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-AU", { month: "short", year: "numeric" });
};

const btn = (color, bg, border) => ({
  display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 100,
  border: `1px solid ${border}`, background: bg, color, fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, cursor: "pointer",
});

function WorkerRow({ link, children }) {
  const w = link.worker || {};
  const name = w.name || "Unknown worker";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", flexWrap: "wrap" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: w.avatarColor || getAvatarColor(link.workerId), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "#fff" }}>
        {w.profilePhoto ? <img src={w.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (w.initials || getInitials(name))}
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "#fff" }}>{name}</div>
        <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
          {link.role}{link.startDate && ` · since ${formatMonth(link.startDate)}`}{w.email && ` · ${w.email}`}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>{children}</div>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,.35)", marginBottom: 10 }}>
        {title} · {count}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

/** Manager view of the workers linked to their venue: confirm new ones, end old ones. */
export default function TeamPanel({ links, onAction }) {
  const pending = links.filter(l => l.status === "pending");
  const active  = links.filter(l => l.status === "active");

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginBottom: 4 }}>My Team</h2>
        <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.4)" }}>
          Confirm the workers who work at your venue. Only verified workers can swap jobs.
        </p>
      </div>

      {pending.length === 0 && active.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 24px", background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.08)", borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>👥</div>
          <h3 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No team members yet</h3>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "rgba(255,255,255,.35)" }}>
            Ask your staff to sign up on Pairgo and add your venue as their current job.
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <Section title="Waiting for confirmation" count={pending.length}>
          {pending.map(l => (
            <WorkerRow key={l.id} link={l}>
              <button onClick={() => onAction(l.id, "confirm")} style={btn("#4ade80", "rgba(74,222,128,.1)", "rgba(74,222,128,.3)")}>
                <Check size={13} /> Confirm
              </button>
              <button onClick={() => onAction(l.id, "reject")} style={btn("rgba(255,255,255,.5)", "transparent", "rgba(255,255,255,.12)")}>
                <X size={13} /> Not my worker
              </button>
            </WorkerRow>
          ))}
        </Section>
      )}

      {active.length > 0 && (
        <Section title="Verified team" count={active.length}>
          {active.map(l => (
            <WorkerRow key={l.id} link={l}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "#4ade80" }}>
                <BadgeCheck size={14} /> Verified
              </span>
              <button onClick={() => window.confirm(`${l.worker?.name || "This worker"} no longer works at your venue?`) && onAction(l.id, "end")}
                style={btn("rgba(255,255,255,.5)", "transparent", "rgba(255,255,255,.12)")}>
                Remove
              </button>
            </WorkerRow>
          ))}
        </Section>
      )}
    </div>
  );
}
