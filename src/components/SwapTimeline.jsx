import { Check, X } from "lucide-react";
import { swapSteps } from "../data/swaps";

const THEMES = {
  light: { done: "var(--coral)", todo: "rgba(0,0,0,.12)", text: "var(--ink)", muted: "var(--ink-muted)", fail: "#dc2626", ok: "#1f9d55" },
  dark:  { done: "var(--coral)", todo: "rgba(255,255,255,.12)", text: "#fff", muted: "rgba(255,255,255,.4)", fail: "#f87171", ok: "#4ade80" },
};

const approvalText = (v) => (v === true ? "approved" : v === false ? "rejected" : "pending");

/** Horizontal progress of a swap, with each manager's decision under the approval step. */
export default function SwapTimeline({ swap, theme = "light" }) {
  const t = THEMES[theme];
  const steps = swapSteps(swap);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 2 }}>
      {steps.map((s, i) => {
        const color = s.state === "done" ? t.done : s.state === "failed" ? t.fail : s.state === "current" ? t.done : t.todo;
        return (
          <div key={s.key} style={{ flex: 1, minWidth: 92, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {i > 0 && (
              <div style={{ position: "absolute", top: 10, right: "50%", width: "100%", height: 2, background: steps[i - 1].state === "done" && s.state !== "todo" ? t.done : t.todo }} />
            )}
            <div style={{
              position: "relative", width: 22, height: 22, borderRadius: "50%",
              background: s.state === "done" ? color : "transparent",
              border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: s.state === "current" ? `0 0 0 4px ${theme === "light" ? "var(--coral-glow)" : "rgba(232,101,74,.18)"}` : "none",
            }}>
              {s.state === "done" && <Check size={12} color="#fff" strokeWidth={3} />}
              {s.state === "failed" && <X size={12} color={t.fail} strokeWidth={3} />}
            </div>
            <div style={{ marginTop: 6, textAlign: "center", fontFamily: "var(--font-b)", fontSize: 11, fontWeight: s.state === "current" ? 700 : 600, color: s.state === "todo" ? t.muted : s.state === "failed" ? t.fail : t.text, lineHeight: 1.3, padding: "0 4px" }}>
              {s.label}
            </div>
            {s.key === "confirmed" && ["accepted", "confirmed", "active", "completed", "rejected"].includes(swap.status) && (
              <div style={{ marginTop: 3, textAlign: "center", fontFamily: "var(--font-b)", fontSize: 10, color: t.muted, lineHeight: 1.4 }}>
                {[["a", swap.a], ["b", swap.b]].map(([k, side]) => (
                  <div key={k} style={{ color: side.approval === true ? t.ok : side.approval === false ? t.fail : t.muted }}>
                    {side.venueName}: {approvalText(side.approval)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
