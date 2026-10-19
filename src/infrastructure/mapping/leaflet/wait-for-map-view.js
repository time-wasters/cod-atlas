/**
 * Wait for a readable, loaded overview, with bounded and cancellable polling.
 * The readiness callback follows whichever basemap is currently active.
 * @param {() => boolean} isViewLoaded
 * @param {{ signal: AbortSignal, minimumMs: number, maximumMs: number }} options
 * @returns {Promise<boolean>} Whether the view loaded before the deadline.
 */
export function waitForMapView(isViewLoaded, { signal, minimumMs, maximumMs }) {
  return new Promise((resolve) => {
    const started = Date.now();
    let timer;
    const finish = (loaded) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      resolve(loaded);
    };
    const abort = () => finish(false);
    const check = () => {
      if (signal.aborted) { finish(false); return; }
      const elapsed = Date.now() - started;
      if (elapsed >= minimumMs && isViewLoaded()) { finish(true); return; }
      if (elapsed >= maximumMs) { finish(false); return; }
      timer = setTimeout(check, Math.min(50, maximumMs - elapsed));
    };
    signal.addEventListener("abort", abort, { once: true });
    check();
  });
}
