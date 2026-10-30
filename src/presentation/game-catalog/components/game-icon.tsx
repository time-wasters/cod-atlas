"use client";

import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import { Tooltip } from "../../shared/components/tooltip.js";

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
  return (
    <Tooltip content={game.labelLong}>
      <span
        className="game-icon-tooltip-anchor"
        tabIndex={0}
        aria-label={game.labelLong}
      >
        {/* Game icons are reviewed local public assets and do not need image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`mission-game-icon${external ? " is-external" : ""}`} src={src} alt="" onError={onError} />
      </span>
    </Tooltip>
  );
}
