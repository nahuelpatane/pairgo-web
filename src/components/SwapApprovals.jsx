import { ArrowRight, BadgeCheck, Check, Mail, Phone, X } from "lucide-react";
import { getAvatarColor, getInitials } from "../data/constants";
import { OPEN_SWAP, SWAP_STATUS_LABEL, formatDay, otherSide, sideOf } from "../data/swaps";
import SwapTimeline from "./SwapTimeline";

const muted = { fontFamily: "var(--font-b)", fontSize: 12, color: "rgba(255,255,255,.45)", lineHeight: 1.55 };
const btn = (color, bg, border) => ({
  display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 100,
  border: `1px solid ${border}`, background: bg, color, fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer",
});
const chip = { padding: "3px 10px", borderRadius: 100, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", fontFamily: "var(--font-b)", fontSize: 11, color: "rgba(255,255,255,.65)" };

function Avatar({ worker, id, size = 52 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, overflow: "hidden", flexShrink: 0, background: worker?.avatarColor || getAvatarColor(id || ""), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: size * 0.34, fontWeight: 700, color: "#fff" }}>
      {worker?.profilePhoto ? <img src={worker.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (worker?.initials || getInitials(worker?.name))}
    </div>
  );
}

function SwapReview({ swap, me, onAction }) {
  const mine = sideOf(swap, me);              // my venue's side
  const incomingSide = swap[otherSide(mine)]; // the worker who would come to my venue
  const incoming = incomingSide.worker || {};
  const outgoing = swap[mine].worker || {};
  const myDecision = swap[mine].approval;
  const needsMe = swap.status === "accepted" && myDecision === null;
  const exp = incoming.workExperience || [];

  return (
    <div style={{ borderRadius: 20, background: "rgba(255,255,255,.03)", border: `1px solid ${needsMe ? "rgba(232,101,74,.35)" : "rgba(255,255,255,.07)"}`, overflow: "hidden" }}>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ ...muted, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <b style={{ color: "#fff" }}>{swap.role}</b> · {outgoing.name} leaves <ArrowRight size={12} /> {incoming.name} joins from {incomingSide.venueName}, {incomingSide.city}
            {swap.startDate && <> · from {formatDay(swap.startDate)}</>}
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 100, background: needsMe ? "rgba(232,101,74,.14)" : "rgba(255,255,255,.06)", color: needsMe ? "var(--coral)" : "rgba(255,255,255,.6)", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700 }}>
            {needsMe ? "Needs your approval" : myDecision === true && swap.status === "accepted" ? "Waiting for the other manager" : SWAP_STATUS_LABEL[swap.status]}
          </span>
        </div>

        {/* Incoming worker profile */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", padding: 16, borderRadius: 16, background: "rgba(255,255,255,.03)", marginBottom: 18 }}>
          <Avatar worker={incoming} id={incomingSide.workerId} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-d)", fontSize: 17, fontWeight: 700, color: "#fff" }}>{incoming.name}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                <BadgeCheck size={13} /> Verified {swap.role} at {incomingSide.venueName}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {incoming.nationality && <span style={chip}>🌍 {incoming.nationality}</span>}
              {incoming.visaType && <span style={chip}>🛂 {incoming.visaType}</span>}
              {(incoming.languages || []).map(l => <span key={l} style={chip}>🗣 {l}</span>)}
              {(incoming.certifications || []).map(c => <span key={c} style={chip}>📜 {c}</span>)}
            </div>
            {incoming.bio && <p style={{ ...muted, fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 8 }}>{incoming.bio}</p>}
            {exp.length > 0 && (
              <div style={muted}>
                <b style={{ color: "rgba(255,255,255,.7)" }}>Experience:</b>{" "}
                {exp.slice(0, 3).map(e => `${e.role} at ${e.venue}${e.city ? ` (${e.city})` : ""}`).join(" · ")}
                {exp.length > 3 && ` · +${exp.length - 3} more`}
              </div>
            )}
            {incoming.videoUrl && <a href={incoming.videoUrl} target="_blank" rel="noreferrer" style={{ ...muted, color: "var(--coral)" }}>Watch intro video →</a>}
          </div>
        </div>

        <SwapTimeline swap={swap} theme="dark" />

        {(incoming.email || incoming.phone) && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, padding: "10px 14px", borderRadius: 12, background: "rgba(74,222,128,.06)", border: "1px solid rgba(74,222,128,.15)", ...muted, color: "#4ade80" }}>
            <b>Contact {incoming.name?.split(" ")[0]}:</b>
            {incoming.email && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {incoming.email}</span>}
            {incoming.phone && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {incoming.phone}</span>}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {needsMe && (
            <>
              <button onClick={() => onAction(swap.id, "approve")} style={btn("#4ade80", "rgba(74,222,128,.1)", "rgba(74,222,128,.3)")}><Check size={14} /> Approve {incoming.name?.split(" ")[0]}</button>
              <button onClick={() => window.confirm(`Reject this swap? ${outgoing.name} stays at your venue.`) && onAction(swap.id, "reject")}
                style={btn("rgba(255,255,255,.55)", "transparent", "rgba(255,255,255,.12)")}><X size={14} /> Reject</button>
            </>
          )}
          {swap.status === "confirmed" && (
            <button onClick={() => window.confirm(`Mark as started? ${incoming.name} joins your team and ${outgoing.name} leaves it.`) && onAction(swap.id, "start")}
              style={btn("#fff", "var(--coral)", "var(--coral)")}>Mark swap as started</button>
          )}
          {swap.status === "active" && (
            <button onClick={() => onAction(swap.id, "complete")} style={btn("#60a5fa", "rgba(96,165,250,.1)", "rgba(96,165,250,.3)")}>Mark as completed</button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Manager tab: swaps involving a worker of this venue, once both workers agreed. */
export default function SwapApprovals({ swaps, me, onAction }) {
  const open = swaps.filter(s => OPEN_SWAP.includes(s.status));
  const past = swaps.filter(s => !OPEN_SWAP.includes(s.status));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginBottom: 4 }}>Job swaps</h2>
        <p style={{ ...muted, fontSize: 13 }}>
          When one of your workers agrees to swap with a worker from another venue, you review who'd join your team. It goes ahead only if both managers approve.
        </p>
      </div>

      {open.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px", background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.08)", borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔄</div>
          <h3 style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No swaps to review</h3>
          <p style={{ ...muted, fontSize: 14 }}>Swaps appear here once a worker from your team and their swap partner both agree.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {open.map(s => <SwapReview key={s.id} swap={s} me={me} onAction={onAction} />)}
        </div>
      )}

      {past.length > 0 && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ ...muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Past swaps ({past.length})</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {past.map(s => {
              const mine = sideOf(s, me);
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,.03)", ...muted }}>
                  <span>{s[mine].worker?.name} ⇄ {s[otherSide(mine)].worker?.name} · {s.role}</span>
                  <span style={{ fontWeight: 700 }}>{SWAP_STATUS_LABEL[s.status]} · {formatDay(s.updatedAt)}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
