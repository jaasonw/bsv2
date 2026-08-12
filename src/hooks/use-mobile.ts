import * as React from "react";

// Matches the `lg` breakpoint the layouts switch at. Anything narrower gets the
// mobile tree and the bottom-sheet modals.
const MOBILE_BREAKPOINT = 1024;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/**
 * True when the viewport is narrower than the `lg` breakpoint.
 *
 * Mobile-first on the server: the prerendered HTML is the mobile tree, so
 * phones paint the right layout immediately and only wide viewports swap after
 * hydration. `useSyncExternalStore` keeps the value correct on the very first
 * client render rather than flashing a wrong layout for one frame.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => true);
}
