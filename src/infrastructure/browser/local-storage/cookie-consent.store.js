export const COOKIE_CONSENT_KEY = "cod-atlas:cookie-consent:v1";
const PENDING = Object.freeze({ decided: false, preferences: false, externalServices: false });

/**
 * Only this consent record may be read before permission is granted.
 * Rejection stays in memory; it does not write browser storage.
 * @param {{ storage?: () => Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
 * listen?: (listener: (event: StorageEvent) => void) => () => void }} [options]
 * @returns {import("../../../application/settings/ports/cookie-consent.port.js").CookieConsentPort}
 */
export function createCookieConsentStore({
  storage = () => typeof window === "undefined" ? null : window.localStorage,
  listen = (listener) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  },
} = {}) {
  /** @type {import("../../../application/settings/ports/cookie-consent.port.js").CookieConsent} */
  let snapshot = PENDING;
  let initialized = false;
  /** @type {string | null | undefined} */
  let cachedRecord;
  /** @type {Set<() => void>} */
  const listeners = new Set();
  /** @type {undefined | (() => void)} */
  let stopListening;

  const getSnapshot = () => {
    try {
      const record = storage()?.getItem(COOKIE_CONSENT_KEY) ?? null;
      if (initialized && record === cachedRecord) return snapshot;
      initialized = true;
      cachedRecord = record;
      snapshot = PENDING;
      try {
        const value = JSON.parse(record ?? "null");
        if (typeof value?.preferences === "boolean" && typeof value?.externalServices === "boolean") {
          snapshot = Object.freeze({ decided: true, preferences: value.preferences, externalServices: value.externalServices });
        }
      } catch { /* Unavailable or malformed storage must never enable optional features. */ }
    } catch { /* Retain this visit's choice if the browser blocks storage access. */ }
    return snapshot;
  };
  const notify = () => listeners.forEach((listener) => listener());

  return {
    getSnapshot,
    getServerSnapshot: () => PENDING,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) {
        stopListening = listen((event) => {
          if (event.key !== COOKIE_CONSENT_KEY && event.key !== null) return;
          initialized = false;
          snapshot = PENDING;
          getSnapshot();
          notify();
        });
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) stopListening?.();
      };
    },
    update(choices) {
      const previous = getSnapshot();
      snapshot = Object.freeze({ decided: true, ...choices });
      initialized = true;
      try {
        const target = storage();
        if (choices.preferences || choices.externalServices) {
          const record = JSON.stringify(choices);
          target?.setItem(COOKIE_CONSENT_KEY, record);
          cachedRecord = target ? record : null;
        } else if (previous.preferences || previous.externalServices) {
          target?.removeItem(COOKIE_CONSENT_KEY);
          cachedRecord = null;
        }
      } catch { /* Consent still works for this visit if persistence is unavailable. */ }
      notify();
    },
  };
}

export const cookieConsentStore = createCookieConsentStore();
