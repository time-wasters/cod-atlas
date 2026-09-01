"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type {
  ExternalGameIconManifest,
  ExternalGameIconManifestPort,
} from "../../../application/game-catalog/ports/external-game-icon-manifest.port.js";
import type { ExternalGameIconsPreferencePort } from "../../../application/preferences/ports/external-game-icons-preference.port.js";

type GameWithIcon = {
  id: string;
  icon?: string;
};

export function useExternalGameIcons({
  manifestPort,
  preferencePort,
}: {
  manifestPort: ExternalGameIconManifestPort;
  preferencePort: ExternalGameIconsPreferencePort;
}) {
  const enabled = useSyncExternalStore(
    preferencePort.subscribe,
    preferencePort.getSnapshot,
    preferencePort.getServerSnapshot,
  );
  const [manifest, setManifest] = useState<ExternalGameIconManifest | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [failedGameIds, setFailedGameIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!enabled || manifest || unavailable) return;
    const controller = new AbortController();
    manifestPort.load(controller.signal)
      .then(setManifest)
      .catch(() => {
        if (!controller.signal.aborted) setUnavailable(true);
      });
    return () => controller.abort();
  }, [enabled, manifest, manifestPort, unavailable]);

  const iconFor = useCallback((game: GameWithIcon) => {
    const externalPath = enabled && !failedGameIds.has(game.id)
      ? manifest?.[game.id]?.icon?.path
      : null;
    return externalPath ? manifestPort.resolveUrl(externalPath) : game.icon;
  }, [enabled, failedGameIds, manifest, manifestPort]);

  const markUnavailable = useCallback((gameId: string) => {
    setFailedGameIds((failed) => new Set(failed).add(gameId));
  }, []);

  const setEnabled = useCallback((nextEnabled: boolean) => {
    preferencePort.setEnabled(nextEnabled);
  }, [preferencePort]);

  return { enabled, unavailable, iconFor, markUnavailable, setEnabled };
}
