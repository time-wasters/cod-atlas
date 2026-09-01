export function createBrowserAnimationFrameClock() {
  return {
    cancelFrame: (frameId) => cancelAnimationFrame(frameId),
    now: () => performance.now(),
    prefersReducedMotion: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    requestFrame: (callback) => requestAnimationFrame(callback),
  };
}

