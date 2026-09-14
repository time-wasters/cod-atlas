"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";

type Mode = AtlasEntryDto["modes"][number];
type ModeSub = AtlasEntryDto["modeSub"];

function levelModeLabel(mode: Mode, modeSub?: ModeSub) {
  if (mode === "other" && modeSub === "special-ops") return "Special Ops";
  if (mode === "other" && modeSub === "challenge") return "Challenge";
  if (mode === "other") return "Other";
  if (mode === "zombies") return "Zombies";
  if (mode === "multiplayer") return "Multiplayer";
  return "Campaign";
}

function ModeGraphic({ mode, modeSub, decorative }: {
  mode: Mode;
  modeSub?: ModeSub;
  decorative: boolean;
}) {
  const label = levelModeLabel(mode, modeSub);
  const accessibility = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": label };

  if (mode === "other" && modeSub === "special-ops") return (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" {...accessibility}>
      <circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  );
  if (mode === "other") return (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" {...accessibility}>
      <path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
    </svg>
  );
  if (mode === "zombies") return (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" {...accessibility}>
      <path d="M5 10a7 7 0 1 1 14 0v5l-2 2h-2v3h-2v-3h-2v3H9v-3H7l-2-2Z" />
      <circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="m10 14 2-2 2 2" />
    </svg>
  );
  return mode === "multiplayer" ? (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" {...accessibility}>
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" />
      <path d="M2.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M13 14c.8-.7 1.8-1 3-1 3 0 4.7 2 5 5.5" />
    </svg>
  ) : (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" {...accessibility}>
      <circle cx="12" cy="7.5" r="3.5" /><path d="M5 20c.5-5 2.8-7.5 7-7.5s6.5 2.5 7 7.5" />
    </svg>
  );
}

export function LevelModeIcon({
  mode,
  modeSub,
  tooltip = false,
}: {
  mode: Mode;
  modeSub?: ModeSub;
  tooltip?: boolean;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);
  const tooltipId = `level-mode-tooltip-${useId().replaceAll(":", "")}`;
  const label = levelModeLabel(mode, modeSub);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    side: "left" | "right";
  } | null>(null);

  const hideTooltip = () => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    showTimer.current = null;
    setTooltipPosition(null);
  };

  const scheduleTooltip = () => {
    if (!tooltip) return;
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 9;
      const side = rect.left >= 280 ? "left" : "right";
      setTooltipPosition({
        top: Math.min(Math.max(28, rect.top + rect.height / 2), window.innerHeight - 28),
        left: side === "left" ? rect.left - gap : rect.right + gap,
        side,
      });
    }, 300);
  };

  useEffect(() => () => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
  }, []);

  if (!tooltip) return <ModeGraphic mode={mode} modeSub={modeSub} decorative={false} />;

  return (
    <span
      className="mission-mode-tooltip-anchor"
      ref={anchor}
      tabIndex={0}
      aria-label={`${label} game mode`}
      aria-describedby={tooltipPosition ? tooltipId : undefined}
      onMouseEnter={scheduleTooltip}
      onMouseLeave={hideTooltip}
      onFocus={scheduleTooltip}
      onBlur={hideTooltip}
    >
      <ModeGraphic mode={mode} modeSub={modeSub} decorative />
      {tooltipPosition && typeof document !== "undefined" && createPortal(
        <span
          id={tooltipId}
          className={`game-icon-tooltip is-${tooltipPosition.side}`}
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          role="tooltip"
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
}
