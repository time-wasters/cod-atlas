import type {
  ClientSettings,
  ClientSettingsPort,
} from "../../../application/settings/ports/client-settings.port.js";

const STORAGE_KEY = "cod-atlas:client-settings";
const LEGACY_EXTERNAL_GAME_ICONS_KEY = "cod-atlas:external-game-icons";
const LEGACY_ZOOM_ADAPTIVE_MAP_OVERLAYS_KEY = "cod-atlas:zoom-adaptive-map-overlays";

const DEFAULT_SETTINGS: ClientSettings = Object.freeze({
  externalGameIconsEnabled: false,
  zoomAdaptiveMapOverlaysEnabled: true,
});

const listeners = new Set<() => void>();
let cachedStorageValue: string | null | undefined;
let cachedSettings = DEFAULT_SETTINGS;

function parseSettings(storageValue: string): ClientSettings {
  try {
    const stored = JSON.parse(storageValue) as Partial<ClientSettings>;

    return {
      externalGameIconsEnabled:
        typeof stored?.externalGameIconsEnabled === "boolean"
          ? stored.externalGameIconsEnabled
          : DEFAULT_SETTINGS.externalGameIconsEnabled,
      zoomAdaptiveMapOverlaysEnabled:
        typeof stored?.zoomAdaptiveMapOverlaysEnabled === "boolean"
          ? stored.zoomAdaptiveMapOverlaysEnabled
          : DEFAULT_SETTINGS.zoomAdaptiveMapOverlaysEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function readLegacySettings(): ClientSettings | null {
  const externalGameIcons = window.localStorage.getItem(LEGACY_EXTERNAL_GAME_ICONS_KEY);
  const zoomAdaptiveMapOverlays = window.localStorage.getItem(
    LEGACY_ZOOM_ADAPTIVE_MAP_OVERLAYS_KEY,
  );

  if (externalGameIcons === null && zoomAdaptiveMapOverlays === null) return null;

  return {
    externalGameIconsEnabled:
      externalGameIcons === null
        ? DEFAULT_SETTINGS.externalGameIconsEnabled
        : externalGameIcons === "true",
    zoomAdaptiveMapOverlaysEnabled:
      zoomAdaptiveMapOverlays === null
        ? DEFAULT_SETTINGS.zoomAdaptiveMapOverlaysEnabled
        : zoomAdaptiveMapOverlays !== "false",
  };
}

function cacheSettings(storageValue: string | null, settings: ClientSettings) {
  cachedStorageValue = storageValue;

  if (
    cachedSettings.externalGameIconsEnabled !== settings.externalGameIconsEnabled ||
    cachedSettings.zoomAdaptiveMapOverlaysEnabled !== settings.zoomAdaptiveMapOverlaysEnabled
  ) {
    cachedSettings = Object.freeze(settings);
  }

  return cachedSettings;
}

function getSnapshot() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  const storageValue = window.localStorage.getItem(STORAGE_KEY);
  if (storageValue === cachedStorageValue) return cachedSettings;

  if (storageValue !== null) {
    return cacheSettings(storageValue, parseSettings(storageValue));
  }

  const legacySettings = readLegacySettings();
  if (!legacySettings) return cacheSettings(null, DEFAULT_SETTINGS);

  const migratedStorageValue = JSON.stringify(legacySettings);
  window.localStorage.setItem(STORAGE_KEY, migratedStorageValue);
  return cacheSettings(migratedStorageValue, legacySettings);
}

function getServerSnapshot() {
  return DEFAULT_SETTINGS;
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;

  cachedStorageValue = undefined;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}

function update(settings: Partial<ClientSettings>) {
  if (typeof window === "undefined") return;

  const nextSettings = { ...getSnapshot(), ...settings };
  const storageValue = JSON.stringify(nextSettings);
  window.localStorage.setItem(STORAGE_KEY, storageValue);
  cacheSettings(storageValue, nextSettings);
  listeners.forEach((listener) => listener());
}

export const clientSettingsStore: ClientSettingsPort = {
  getSnapshot,
  getServerSnapshot,
  subscribe,
  update,
};
