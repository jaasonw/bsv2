/**
 * A short buzz on discrete actions — tab changes, toggling someone onto an
 * item. Android and some desktop browsers honour it; iOS Safari ignores it,
 * so there's nothing to feature-detect beyond the API existing.
 */
export function tapFeedback(duration = 10) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate(duration);
}
