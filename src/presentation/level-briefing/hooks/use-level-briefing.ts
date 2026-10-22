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
  const open = useCallback((requestedLevelId: string, hasNotes: boolean) => {
    setExpandedLevelId(requestedLevelId);
    if (!hasNotes) {
      setBriefing({ levelId: requestedLevelId, status: "missing", content: null });
      return;
    }
    if (briefing?.levelId === requestedLevelId) return;
    setBriefing({ levelId: requestedLevelId, status: "loading", content: null });
    const receive = (response: LevelBriefingState) => {
      setBriefing((current) => current?.levelId === requestedLevelId ? response : current);
    };
    void port.load(requestedLevelId).then(receive).catch(() => {
      receive({ levelId: requestedLevelId, status: "missing", content: null });
    });
  }, [briefing?.levelId, port]);
  const toggle = useCallback(() => {
    if (expandedLevelId === levelId) { collapse(); return; }
    if (available) open(levelId, available);
  }, [available, collapse, expandedLevelId, levelId, open]);

  return {
    expanded: expandedLevelId === levelId,
    briefing: briefing?.levelId === levelId ? briefing : null,
    toggle,
    open,
    collapse,
  };
}
