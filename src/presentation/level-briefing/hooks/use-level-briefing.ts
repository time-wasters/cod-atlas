"use client";

import { useCallback, useState } from "react";
import type {
  LevelBriefingPort,
  LevelBriefingResponse,
} from "../../../application/level-briefing/ports/level-briefing.port.js";

type LevelBriefingState = LevelBriefingResponse | {
  levelId: string;
  status: "loading";
  content: null;
};

type UseLevelBriefingInput = {
  levelId: string;
  available: boolean;
  port: LevelBriefingPort;
};

export function useLevelBriefing({ levelId, available, port }: UseLevelBriefingInput) {
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
    port.load(levelId).then(setBriefing);
  }, [available, briefing?.levelId, expandedLevelId, levelId, port]);

  return {
    expanded: available && expandedLevelId === levelId,
    briefing: briefing?.levelId === levelId ? briefing : null,
    toggle,
    collapse,
  };
}
