"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";

export function GameIcon({
  game,
  src,
  external,
  onError,
}: {
  game: GameDto;
  src: string;
  external: boolean;
  onError: () => void;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    side: "left" | "right";
  } | null>(null);
  const tooltipId = `game-icon-tooltip-${game.id}`;

  const hideTooltip = () => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    showTimer.current = null;
    setTooltipPosition(null);
  };

  const scheduleTooltip = () => {
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

  return (
    <span
      className="game-icon-tooltip-anchor"
      ref={anchor}
      tabIndex={0}
      aria-label={game.labelLong}
      aria-describedby={tooltipPosition ? tooltipId : undefined}
      onMouseEnter={scheduleTooltip}
      onMouseLeave={hideTooltip}
      onFocus={scheduleTooltip}
      onBlur={hideTooltip}
    >
      {/* Game icons are reviewed local public assets and do not need image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`mission-game-icon${external ? " is-external" : ""}`} src={src} alt="" onError={onError} />
      {tooltipPosition && typeof document !== "undefined" && createPortal(
        <span
          id={tooltipId}
          className={`game-icon-tooltip is-${tooltipPosition.side}`}
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          role="tooltip"
        >
          {game.labelLong}
        </span>,
        document.body,
      )}
    </span>
  );
}
