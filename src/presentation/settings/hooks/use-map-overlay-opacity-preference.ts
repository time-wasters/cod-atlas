"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { MapOverlayOpacityPreferencePort } from "../../../application/preferences/ports/map-overlay-opacity-preference.port.js";

export function useMapOverlayOpacityPreference(preferencePort: MapOverlayOpacityPreferencePort) {
  const enabled = useSyncExternalStore(
    preferencePort.subscribe,
    preferencePort.getSnapshot,
    preferencePort.getServerSnapshot,
  );
  const setEnabled = useCallback((nextEnabled: boolean) => {
    preferencePort.setEnabled(nextEnabled);
  }, [preferencePort]);

  return { enabled, setEnabled };
}
