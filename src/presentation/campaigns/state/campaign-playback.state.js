/** @typedef {{ index: number, status: "idle" | "playing" | "paused" | "finished" }} PlaybackState */

/**
 * Keeps transport controls within the selected campaign; the last stop never wraps.
 * @param {PlaybackState} state
 * @param {"start" | "pause" | "resume" | "next" | "previous" | "finish"} action
 * @param {number} count
 * @returns {PlaybackState}
 */
export function transitionCampaignPlayback(state, action, count) {
  if (count < 1) return { index: 0, status: "idle" };
  if (action === "start") return { index: 0, status: "playing" };
  if (action === "pause") return state.status === "playing" ? { ...state, status: "paused" } : state;
  if (action === "resume") return state.status === "paused" ? { ...state, status: "playing" } : state;
  if (action === "finish") return state.index === count - 1 ? { ...state, status: "finished" } : state;
  if (state.status === "idle") return state;
  const index = Math.max(0, Math.min(count - 1, state.index + (action === "next" ? 1 : -1)));
  if (index === state.index) return state;
  return { index, status: state.status === "finished" ? "paused" : state.status };
}
