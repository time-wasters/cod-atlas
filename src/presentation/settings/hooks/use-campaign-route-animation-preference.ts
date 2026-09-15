"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ClientSettingsPort } from "../../../application/settings/ports/client-settings.port.js";

export function useCampaignRouteAnimationPreference(clientSettingsPort: ClientSettingsPort) {
  const settings = useSyncExternalStore(
    clientSettingsPort.subscribe,
    clientSettingsPort.getSnapshot,
    clientSettingsPort.getServerSnapshot,
  );
  const enabled = settings.campaignRouteAnimationEnabled;
  const setEnabled = useCallback((nextEnabled: boolean) => {
    clientSettingsPort.update({ campaignRouteAnimationEnabled: nextEnabled });
  }, [clientSettingsPort]);

  return { enabled, setEnabled };
}
