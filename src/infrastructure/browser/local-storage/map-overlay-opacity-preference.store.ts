const STORAGE_KEY = "cod-atlas:zoom-adaptive-map-overlays";
const listeners = new Set<() => void>();

function getSnapshot() {
  return typeof window === "undefined" || window.localStorage.getItem(STORAGE_KEY) !== "false";
}

function getServerSnapshot() {
  return true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function setEnabled(enabled: boolean) {
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
  listeners.forEach((listener) => listener());
}

export const mapOverlayOpacityPreferenceStore = {
  getSnapshot,
  getServerSnapshot,
  subscribe,
  setEnabled,
};
