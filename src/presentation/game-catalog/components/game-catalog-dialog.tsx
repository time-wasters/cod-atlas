"use client";

import type { RefObject } from "react";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";

const seriesLabels: Record<GameDto["series"], string> = {
  "world-war-ii": "World War II",
  "modern-warfare": "Modern Warfare",
  "black-ops": "Black Ops",
  standalone: "Standalone",
};
const subseriesLabels: Record<Exclude<GameDto["subseries"], null>, string> = {
  main: "Main",
  reboot: "Reboot",
  remaster: "Remaster",
  "add-on": "Add-on",
  "spin-off": "Spin-off",
};
const releaseDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function GameCatalogDialog({
  dialogRef,
  games,
  iconFor,
  onExternalIconError,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  games: readonly GameDto[];
  iconFor: (game: GameDto) => string | undefined;
  onExternalIconError: (gameId: string) => void;
}) {
  const orderedGames = [...games].sort((left, right) =>
    left.released.localeCompare(right.released) || left.label.localeCompare(right.label));
  const gamesById = new Map(games.map((game) => [game.id, game]));

  return (
    <dialog
      ref={dialogRef}
      className="project-info-dialog game-catalog-dialog"
      aria-labelledby="game-catalog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="project-info-content game-catalog-content">
        <header>
          <div>
            <span>Game catalogue</span>
            <h2 id="game-catalog-title">Call of Duty games</h2>
          </div>
          <form method="dialog">
            <button aria-label="Close game catalogue"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
          </form>
        </header>
        <p className="game-catalog-intro">Games currently defined in the Atlas data, ordered by release date.</p>
        <ol className="game-catalog-list">
          {orderedGames.map((game) => {
            const gameIcon = iconFor(game);
            const usesExternalGameIcon = Boolean(gameIcon && gameIcon !== game.icon);
            const remasterSource = game.remasterOf ? gamesById.get(game.remasterOf) : null;
            return (
              <li className="game-catalog-entry" key={game.id}>
                <div className="game-catalog-icon" aria-hidden="true">
                  {gameIcon ? (
                    // Game icons are reviewed public assets and do not need image optimization.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={usesExternalGameIcon ? "is-external" : undefined}
                      src={gameIcon}
                      alt=""
                      onError={() => {
                        if (usesExternalGameIcon) onExternalIconError(game.id);
                      }}
                    />
                  ) : (
                    <span>{game.code.slice(0, 3)}</span>
                  )}
                </div>
                <div className="game-catalog-details">
                  <strong>{game.labelLong}</strong>
                  <span>
                    <time dateTime={game.released}>{releaseDateFormatter.format(new Date(`${game.released}T00:00:00Z`))}</time>
                    <i aria-hidden="true">·</i>
                    {seriesLabels[game.series]}
                    {game.subseries && (
                      <>
                        <i aria-hidden="true">·</i>
                        {subseriesLabels[game.subseries]}
                      </>
                    )}
                  </span>
                  {remasterSource && <small>Remaster of {remasterSource.labelLong}</small>}
                </div>
                <code>{game.code}</code>
              </li>
            );
          })}
        </ol>
      </div>
    </dialog>
  );
}
