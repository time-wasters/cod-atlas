"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ClientSettingsPort } from "../../../application/settings/ports/client-settings.port.js";

export function useMapOverlayOpacityPreference(clientSettingsPort: ClientSettingsPort) {
  const settings = useSyncExternalStore(
    clientSettingsPort.subscribe,
    clientSettingsPort.getSnapshot,
    clientSettingsPort.getServerSnapshot,
  );
  const enabled = settings.zoomAdaptiveMapOverlaysEnabled;
  const setEnabled = useCallback((nextEnabled: boolean) => {
    clientSettingsPort.update({ zoomAdaptiveMapOverlaysEnabled: nextEnabled });
  }, [clientSettingsPort]);

  return { enabled, setEnabled };
}
