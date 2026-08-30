"use client";

import { useCallback, useState } from "react";
import {
  loadLevelBriefing,
  type LevelBriefingResponse,
} from "../../../infrastructure/browser/http/level-briefing.client.js";

type LevelBriefingState = LevelBriefingResponse | {
  levelId: string;
  status: "loading";
  content: null;
};

type UseLevelBriefingInput = {
  levelId: string;
  available: boolean;
};

export function useLevelBriefing({ levelId, available }: UseLevelBriefingInput) {
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<LevelBriefingState | null>(null);

  const collapse = useCallback(() => setExpandedLevelId(null), []);
  const toggle = useCallback(() => {
    if (!available) return;
    if (expandedLevelId === levelId) {
      setExpandedLevelId(null);
      return;
    }

    setExpandedLevelId(levelId);
    if (briefing?.levelId === levelId) return;
    setBriefing({ levelId, status: "loading", content: null });
    loadLevelBriefing(levelId).then(setBriefing);
  }, [available, briefing?.levelId, expandedLevelId, levelId]);

  return {
    expanded: available && expandedLevelId === levelId,
    briefing: briefing?.levelId === levelId ? briefing : null,
    toggle,
    collapse,
  };
}
