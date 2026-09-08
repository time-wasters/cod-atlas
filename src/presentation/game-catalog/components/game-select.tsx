"use client";

import * as Select from "@radix-ui/react-select";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";

export function GameSelect({
  games,
  iconFor,
  onExternalIconError,
  value,
  onValueChange,
}: {
  games: GameDto[];
  iconFor: (game: GameDto) => string | null | undefined;
  onExternalIconError: (gameId: string) => void;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const selectedGame = games.find((item) => item.code === value) ?? null;

  function gameIcon(game: GameDto) {
    const icon = iconFor(game);
    if (!icon) return null;
    const external = icon !== game.icon;
    return (
      // Game icons are reviewed public assets and do not need image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`game-select-icon${external ? " is-external" : ""}`}
        src={icon}
        alt=""
        aria-hidden="true"
        onError={() => {
          if (external) onExternalIconError(game.id);
        }}
      />
    );
  }

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="country-select-trigger" aria-label="Filter by game, ordered by release date">
        <Select.Value>{selectedGame ? `${selectedGame.released.slice(0, 4)} · ${selectedGame.label}` : "All games"}</Select.Value>
        {selectedGame ? gameIcon(selectedGame) : null}
        <Select.Icon className="country-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="country-select-content" position="popper" align="start" sideOffset={4} collisionPadding={8}>
          <Select.ScrollUpButton className="country-select-scroll-button" aria-label="Scroll up">▲</Select.ScrollUpButton>
          <Select.Viewport className="country-select-viewport">
            <Select.Item className="country-select-item" value="all">
              <Select.ItemText>All games</Select.ItemText>
            </Select.Item>
            {games.map((item) => (
              <Select.Item className="country-select-item" key={item.id} value={item.code}>
                <Select.ItemText>{item.released.slice(0, 4)} · {item.label}</Select.ItemText>
                {gameIcon(item)}
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="country-select-scroll-button" aria-label="Scroll down">▼</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
