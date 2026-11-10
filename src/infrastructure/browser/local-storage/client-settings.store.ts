import type {
  ClientSettings,
  ClientSettingsPort,
} from "../../../application/settings/ports/client-settings.port.js";

import { APP_DEFAULTS_CONFIG } from "../../../shared/config/app-defaults.config.js";
import { cookieConsentStore } from "./cookie-consent.store.js";

const STORAGE_KEY = "cod-atlas:client-settings";
const LEGACY_EXTERNAL_GAME_ICONS_KEY = "cod-atlas:external-game-icons";
const LEGACY_ZOOM_ADAPTIVE_MAP_OVERLAYS_KEY = "cod-atlas:zoom-adaptive-map-overlays";

const DEFAULT_SETTINGS: ClientSettings = Object.freeze({ ...APP_DEFAULTS_CONFIG.settings });

const listeners = new Set<() => void>();
let cachedStorageValue: string | null | undefined;
let cachedSettings = DEFAULT_SETTINGS;
let sessionSettings = DEFAULT_SETTINGS;
let preferencesAllowed = false;
let unsubscribeConsent: (() => void) | undefined;

function parseSettings(storageValue: string): ClientSettings {
  try {
    const stored = JSON.parse(storageValue) as Partial<ClientSettings>;

    return {
      campaignRouteAnimationEnabled:
        typeof stored?.campaignRouteAnimationEnabled === "boolean"
          ? stored.campaignRouteAnimationEnabled
          : DEFAULT_SETTINGS.campaignRouteAnimationEnabled,
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
    campaignRouteAnimationEnabled: DEFAULT_SETTINGS.campaignRouteAnimationEnabled,
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
    cachedSettings.campaignRouteAnimationEnabled !== settings.campaignRouteAnimationEnabled ||
    cachedSettings.externalGameIconsEnabled !== settings.externalGameIconsEnabled ||
    cachedSettings.zoomAdaptiveMapOverlaysEnabled !== settings.zoomAdaptiveMapOverlaysEnabled
  ) {
    cachedSettings = Object.freeze(settings);
  }

  return cachedSettings;
}

function getSnapshot() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (!cookieConsentStore.getSnapshot().preferences) return sessionSettings;

  let storageValue: string | null;
  try {
    storageValue = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return sessionSettings;
  }
  if (storageValue === cachedStorageValue) return cachedSettings;

  if (storageValue !== null) {
    return cacheSettings(storageValue, parseSettings(storageValue));
  }

  let legacySettings: ClientSettings | null;
  try { legacySettings = readLegacySettings(); }
  catch { return sessionSettings; }
  if (!legacySettings) return cacheSettings(null, sessionSettings);

  const migratedStorageValue = JSON.stringify(legacySettings);
  try { window.localStorage.setItem(STORAGE_KEY, migratedStorageValue); }
  catch { /* Keep the migrated preference in memory when storage is unavailable. */ }
  return cacheSettings(migratedStorageValue, legacySettings);
}

function getServerSnapshot() {
  return DEFAULT_SETTINGS;
}

function handleStorage(event: StorageEvent) {
  if (!cookieConsentStore.getSnapshot().preferences || (event.key !== STORAGE_KEY && event.key !== null)) return;

  cachedStorageValue = undefined;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    preferencesAllowed = cookieConsentStore.getSnapshot().preferences;
    window.addEventListener("storage", handleStorage);
    unsubscribeConsent = cookieConsentStore.subscribe(() => {
      const allowed = cookieConsentStore.getSnapshot().preferences;
      if (preferencesAllowed && !allowed) {
        // Delete only our optional preferences, never unrelated site data.
        try {
          for (const key of [STORAGE_KEY, LEGACY_EXTERNAL_GAME_ICONS_KEY, LEGACY_ZOOM_ADAPTIVE_MAP_OVERLAYS_KEY]) {
            window.localStorage.removeItem(key);
          }
        } catch { /* Denied storage must not prevent revocation. */ }
        sessionSettings = DEFAULT_SETTINGS;
      }
      preferencesAllowed = allowed;
      cachedStorageValue = undefined;
      listeners.forEach((notify) => notify());
    });
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
      unsubscribeConsent?.();
    }
  };
}

function update(settings: Partial<ClientSettings>) {
  if (typeof window === "undefined") return;

  const nextSettings = { ...getSnapshot(), ...settings };
  sessionSettings = Object.freeze(nextSettings);
  const storageValue = JSON.stringify(nextSettings);
  if (cookieConsentStore.getSnapshot().preferences) {
    try { window.localStorage.setItem(STORAGE_KEY, storageValue); }
    catch { /* Settings can still apply to the current visit. */ }
  }
  cacheSettings(storageValue, nextSettings);
  listeners.forEach((listener) => listener());
}

export const clientSettingsStore: ClientSettingsPort = {
  getSnapshot,
  getServerSnapshot,
  subscribe,
  update,
};
