// Helpers shared by the worker and manager swap views

export const OPEN_SWAP = ["proposed", "accepted", "confirmed", "active"];
export const CLOSED_SWAP = ["completed", "declined", "rejected", "cancelled"];

/** Which side of the swap ("a" = proposer, "b" = receiver) a worker or manager is on. */
export const sideOf = (swap, userId) =>
  swap.a.workerId === userId || swap.a.managerId === userId ? "a" : "b";
export const otherSide = (side) => (side === "a" ? "b" : "a");

export const SWAP_STATUS_LABEL = {
  proposed:  "Proposed",
  accepted:  "Waiting for managers",
  confirmed: "Confirmed",
  active:    "In progress",
  completed: "Completed",
  declined:  "Declined",
  rejected:  "Rejected by a manager",
  cancelled: "Cancelled",
};

/** Progress steps for the timeline: each one is done / current / todo. */
export function swapSteps(swap) {
  const order = ["proposed", "accepted", "confirmed", "active", "completed"];
  // where the swap got to before a terminal state (declined/rejected/cancelled)
  const reached = order.includes(swap.status)
    ? order.indexOf(swap.status)
    : Math.max(0, ...(swap.history || []).map(h => order.indexOf(h.status)));
  const failed = CLOSED_SWAP.includes(swap.status) && swap.status !== "completed";

  const steps = [
    { key: "proposed",  label: "Proposed" },
    { key: "accepted",  label: "Both workers agree" },
    { key: "confirmed", label: "Both managers approve" },
    { key: "active",    label: "Swap started" },
    { key: "completed", label: "Completed" },
  ];
  return steps.map((s, i) => ({
    ...s,
    state: i <= reached ? "done" : i === reached + 1 ? (failed ? "failed" : "current") : "todo",
  }));
}

export const formatDay = (d) =>
  d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "";
