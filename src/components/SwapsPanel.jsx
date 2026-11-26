import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Check, Mail, MapPin, Phone, RefreshCw, X } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/useAuth";
import { CITIES, getAvatarColor, getInitials } from "../data/constants";
import { OPEN_SWAP, SWAP_STATUS_LABEL, formatDay, otherSide, sideOf } from "../data/swaps";
import SwapTimeline from "./SwapTimeline";

const h2 = { fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.4px" };
const muted = { fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 };
const btn = (bg, color, border = "transparent") => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 16px", borderRadius: 100,
  background: bg, color, border: `1.5px solid ${border}`, fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, cursor: "pointer",
});
const field = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(0,0,0,.1)", fontFamily: "var(--font-b)", fontSize: 13, outline: "none", background: "#fff", color: "var(--ink)" };

function Avatar({ worker, id, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, overflow: "hidden", flexShrink: 0, background: worker?.avatarColor || getAvatarColor(id || ""), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontSize: size * 0.36, fontWeight: 700, color: "#fff" }}>
      {worker?.profilePhoto ? <img src={worker.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (worker?.initials || getInitials(worker?.name))}
    </div>
  );
}

// ─── Eligibility header: verified job, destination, "looking for swap" toggle ───
function SwapSetup({ info, onGoProfile, onToast, onChanged }) {
  const { updateUser } = useAuth();
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (data, msg) => {
    setBusy(true);
    const r = await updateUser(data);
    setBusy(false);
    if (!r.success) return onToast("Error: " + r.error);
    onToast(msg);
    onChanged();
  };

  if (!info) return null;

  if (info.reason === "not_verified") {
    return (
      <div className="pcard" style={{ padding: "22px 26px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 30 }}>🔒</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ ...h2, fontSize: 16, marginBottom: 3 }}>Get verified to swap jobs</div>
          <p style={muted}>Add your current job and have your manager confirm it. Then you can trade places with a worker in the city you want to go to.</p>
        </div>
        <button onClick={onGoProfile} style={btn("var(--coral)", "#fff")}>Add current job <ArrowRight size={14} /></button>
      </div>
    );
  }

  const job = info.job;
  if (info.reason === "no_target") {
    return (
      <div className="pcard" style={{ padding: "22px 26px", marginBottom: 16 }}>
        <div style={{ ...h2, fontSize: 16, marginBottom: 3 }}>Where do you want to go?</div>
        <p style={{ ...muted, marginBottom: 12 }}>You work as {job.role} in {job.city}. Pick the city you'd like to swap to.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={target} onChange={e => setTarget(e.target.value)} style={{ ...field, width: "auto", minWidth: 200 }}>
            <option value="">Select a city…</option>
            {CITIES.filter(c => c !== job.city).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button disabled={!target || busy} onClick={() => save({ targetCity: target }, `Destination set: ${target}`)} style={{ ...btn("var(--coral)", "#fff"), opacity: !target || busy ? .5 : 1 }}>Save</button>
        </div>
      </div>
    );
  }

  const on = info.lookingForSwap;
  return (
    <div className="pcard" style={{ padding: "22px 26px", marginBottom: 16, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ ...h2, fontSize: 16 }}>{job.role}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 100, background: "rgba(34,160,90,.1)", color: "#1f9d55", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700 }}>
            <BadgeCheck size={12} /> Verified
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, ...muted }}>
          <MapPin size={13} /> {job.venueName}, {job.city} <ArrowRight size={13} /> <b style={{ color: "var(--ink)" }}>{info.targetCity}</b>
        </div>
      </div>
      <button disabled={busy} onClick={() => save({ lookingForSwap: !on }, on ? "You're hidden from swap matches" : "You're now visible for swaps 🔄")}
        aria-pressed={on}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 8px", borderRadius: 100, border: `1.5px solid ${on ? "rgba(34,160,90,.3)" : "rgba(0,0,0,.1)"}`, background: on ? "rgba(34,160,90,.08)" : "#fff", cursor: "pointer" }}>
        <span style={{ width: 38, height: 22, borderRadius: 100, background: on ? "#1f9d55" : "rgba(0,0,0,.15)", position: "relative", transition: "background .2s" }}>
          <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
        </span>
        <span style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: on ? "#1f9d55" : "var(--ink-soft)" }}>
          {on ? "Looking for a swap" : "Not looking"}
        </span>
      </button>
    </div>
  );
}

// ─── One open swap with timeline and the actions available to me ───
function SwapCard({ swap, me, onAction }) {
  const mine = sideOf(swap, me);
  const them = swap[otherSide(mine)];
  const partner = them.worker || {};
  const isReceiver = mine === "b";
  const contact = partner.email || partner.phone;

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.06)", overflow: "hidden" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,var(--coral),var(--gold))" }} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
          <Avatar worker={partner} id={them.workerId} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              Swap with {partner.name}
            </div>
            <div style={{ ...muted, fontSize: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              {swap.role}: {swap[mine].venueName}, {swap[mine].city} <RefreshCw size={11} /> {them.venueName}, {them.city}
            </div>
            {swap.startDate && <div style={{ ...muted, fontSize: 12 }}>Proposed start: {formatDay(swap.startDate)}</div>}
          </div>
          <span style={{ padding: "4px 11px", borderRadius: 100, background: "var(--coral-glow)", color: "var(--coral)", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700 }}>
            {swap.status === "proposed" ? (isReceiver ? "Wants to swap with you" : "Waiting for their answer") : SWAP_STATUS_LABEL[swap.status]}
          </span>
        </div>

        {swap.message && (
          <div style={{ ...muted, fontSize: 13, fontStyle: "italic", padding: "10px 14px", background: "#F5F4F0", borderRadius: 12, marginBottom: 16 }}>
            “{swap.message}”{isReceiver ? "" : " — you"}
          </div>
        )}

        <SwapTimeline swap={swap} />

        {contact && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, padding: "10px 14px", background: "var(--forest-soft)", borderRadius: 12, fontFamily: "var(--font-b)", fontSize: 12, color: "var(--forest)" }}>
            <b>Coordinate your move:</b>
            {partner.email && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {partner.email}</span>}
            {partner.phone && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {partner.phone}</span>}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {swap.status === "proposed" && isReceiver && (
            <>
              <button onClick={() => onAction(swap.id, "accept")} style={btn("var(--forest-soft)", "var(--forest)", "rgba(27,122,90,.25)")}><Check size={13} /> Accept swap</button>
              <button onClick={() => onAction(swap.id, "decline")} style={btn("#fff", "var(--ink-muted)", "rgba(0,0,0,.1)")}><X size={13} /> Decline</button>
            </>
          )}
          {swap.status === "proposed" && !isReceiver && (
            <button onClick={() => onAction(swap.id, "cancel")} style={btn("#fff", "var(--ink-muted)", "rgba(0,0,0,.1)")}>Withdraw proposal</button>
          )}
          {["accepted", "confirmed"].includes(swap.status) && (
            <button onClick={() => window.confirm("Cancel this swap? Both managers will see it was cancelled.") && onAction(swap.id, "cancel")}
              style={btn("#fff", "var(--ink-muted)", "rgba(0,0,0,.1)")}>Cancel swap</button>
          )}
          {swap.status === "accepted" && <span style={{ ...muted, fontSize: 12, alignSelf: "center" }}>Both managers need to approve. We'll show it here.</span>}
          {swap.status === "confirmed" && <span style={{ ...muted, fontSize: 12, alignSelf: "center" }}>Your manager marks the swap as started on the day you move.</span>}
        </div>
      </div>
    </div>
  );
}

// ─── A worker I could swap with ───
function MatchCard({ match, onPropose }) {
  const { worker, job, swap } = match;
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const ok = await onPropose({ workerId: worker.id, startDate, message });
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.06)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar worker={worker} id={worker.id} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{worker.name}</div>
          <div style={{ ...muted, fontSize: 12 }}>{[worker.nationality, worker.visaType].filter(Boolean).join(" · ") || "Backpacker"}</div>
        </div>
      </div>
      <div style={{ ...muted, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
        <BadgeCheck size={13} color="#1f9d55" /> {job.role} at <b style={{ color: "var(--ink)" }}>{job.venueName}</b>, {job.city}
      </div>
      {worker.bio && <p style={{ ...muted, fontSize: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{worker.bio}</p>}
      {worker.languages?.length > 0 && <div style={{ ...muted, fontSize: 11 }}>🗣 {worker.languages.join(", ")}</div>}

      {swap ? (
        <div style={{ ...muted, fontSize: 12, fontWeight: 600, color: "var(--coral)" }}>Swap {SWAP_STATUS_LABEL[swap.status].toLowerCase()} — see above</div>
      ) : open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#F5F4F0", borderRadius: 12, padding: 12 }}>
          <label style={{ ...muted, fontSize: 11, fontWeight: 700 }}>When would you like to swap?
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...field, marginTop: 4 }} />
          </label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={500} rows={2} placeholder={`Say hi to ${worker.name.split(" ")[0]}…`} style={{ ...field, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={busy} onClick={send} style={{ ...btn("var(--coral)", "#fff"), flex: 1, opacity: busy ? .6 : 1 }}>Send proposal</button>
            <button onClick={() => setOpen(false)} style={btn("#fff", "var(--ink-muted)", "rgba(0,0,0,.1)")}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={btn("var(--ink)", "#fff")}><RefreshCw size={13} /> Propose swap</button>
      )}
    </div>
  );
}

/** "Job swap" section of the worker's My Swaps tab. `swaps` lives in the parent for the nav badge. */
export default function SwapsPanel({ swaps, setSwaps, onToast, onGoProfile }) {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.getSwapMatches()
      .then(setInfo)
      .catch(err => console.error("Error loading swap matches:", err));
  }, [reload, user?.lookingForSwap, user?.targetCity]);

  const refresh = () => setReload(n => n + 1);

  const act = async (id, action) => {
    try {
      const updated = await api.swapAction(id, action);
      setSwaps(prev => prev.map(s => s.id === id ? updated : s));
      onToast({ accept: "Swap accepted! Now your managers will review it 🙌", decline: "Proposal declined", cancel: "Swap cancelled" }[action] || "Updated");
      if (action === "accept") api.getSwaps().then(setSwaps).catch(() => {}); // other proposals may have been withdrawn
      refresh();
    } catch (err) { onToast("Error: " + err.message); }
  };

  const propose = async (data) => {
    try {
      const swap = await api.createSwap(data);
      setSwaps(prev => [swap, ...prev]);
      onToast("Swap proposal sent ✈️");
      refresh();
      return true;
    } catch (err) { onToast("Error: " + err.message); return false; }
  };

  const open = swaps.filter(s => OPEN_SWAP.includes(s.status));
  const past = swaps.filter(s => !OPEN_SWAP.includes(s.status));
  const matches = info?.matches || [];

  return (
    <div style={{ marginBottom: 40 }}>
      <SwapSetup info={info} onGoProfile={onGoProfile} onToast={onToast} onChanged={refresh} />

      {open.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {open.map(s => <SwapCard key={s.id} swap={s} me={user.id} onAction={act} />)}
        </div>
      )}

      {info?.eligible && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <h2 style={h2}>Workers you can swap with</h2>
            <span style={{ ...muted, fontSize: 12 }}>{info.job.role}s in {info.targetCity} who want to come to {info.job.city}</span>
          </div>
          {matches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 24px", background: "#fff", border: "1.5px dashed rgba(0,0,0,.1)", borderRadius: 18 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🧭</div>
              <div style={{ ...h2, fontSize: 16, marginBottom: 6 }}>No matches yet</div>
              <p style={{ ...muted, maxWidth: 420, margin: "0 auto" }}>
                Nobody in {info.targetCity} working as {info.job.role} wants to move to {info.job.city} right now.
                {!info.lookingForSwap && " Turn on “Looking for a swap” so they can find you too."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {matches.map(m => <MatchCard key={m.worker.id} match={m} onPropose={propose} />)}
            </div>
          )}
        </>
      )}

      {past.length > 0 && (
        <details style={{ marginTop: 20 }}>
          <summary style={{ ...muted, fontWeight: 600, cursor: "pointer" }}>Past swaps ({past.length})</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {past.map(s => {
              const them = s[otherSide(sideOf(s, user.id))];
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,.06)", ...muted, fontSize: 12 }}>
                  <span>{them.worker?.name} · {them.venueName}, {them.city}</span>
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
