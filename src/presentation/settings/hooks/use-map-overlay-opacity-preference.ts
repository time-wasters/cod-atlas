"use client";

import { useCallback, useSyncExternalStore } from "react";
import { mapOverlayOpacityPreferenceStore } from "../../../infrastructure/browser/local-storage/map-overlay-opacity-preference.store.js";

export function useMapOverlayOpacityPreference() {
  const enabled = useSyncExternalStore(
    mapOverlayOpacityPreferenceStore.subscribe,
    mapOverlayOpacityPreferenceStore.getSnapshot,
    mapOverlayOpacityPreferenceStore.getServerSnapshot,
  );
  const setEnabled = useCallback((nextEnabled: boolean) => {
    mapOverlayOpacityPreferenceStore.setEnabled(nextEnabled);
  }, []);

  return { enabled, setEnabled };
}
