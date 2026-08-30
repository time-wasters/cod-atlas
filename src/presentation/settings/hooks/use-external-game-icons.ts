"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  loadExternalGameIconManifest,
  resolveExternalGameIconUrl,
  type ExternalGameIconManifest,
} from "../../../infrastructure/browser/http/external-game-icon-manifest.client.js";
import { externalGameIconsPreferenceStore } from "../../../infrastructure/browser/local-storage/external-game-icons-preference.store.js";

type GameWithIcon = {
  id: string;
  icon?: string;
};

export function useExternalGameIcons() {
  const enabled = useSyncExternalStore(
    externalGameIconsPreferenceStore.subscribe,
    externalGameIconsPreferenceStore.getSnapshot,
    externalGameIconsPreferenceStore.getServerSnapshot,
  );
  const [manifest, setManifest] = useState<ExternalGameIconManifest | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [failedGameIds, setFailedGameIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!enabled || manifest || unavailable) return;
    const controller = new AbortController();
    loadExternalGameIconManifest(controller.signal)
      .then(setManifest)
      .catch(() => {
        if (controller.signal.aborted) return;
        setUnavailable(true);
      });
    return () => controller.abort();
  }, [enabled, manifest, unavailable]);

  const iconFor = useCallback((game: GameWithIcon) => {
    const externalPath = enabled && !failedGameIds.has(game.id)
      ? manifest?.[game.id]?.icon?.path
      : null;
    return externalPath ? resolveExternalGameIconUrl(externalPath) : game.icon;
  }, [enabled, failedGameIds, manifest]);

  const markUnavailable = useCallback((gameId: string) => {
    setFailedGameIds((failed) => new Set(failed).add(gameId));
  }, []);

  const setEnabled = useCallback((nextEnabled: boolean) => {
    externalGameIconsPreferenceStore.setEnabled(nextEnabled);
  }, []);

  return { enabled, unavailable, iconFor, markUnavailable, setEnabled };
}
