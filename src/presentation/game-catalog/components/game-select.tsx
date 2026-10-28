"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";

const focusableSelector = 'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]';

export function GameSelect({
  canReset,
  count,
  filters,
  games,
  iconFor,
  multiple,
  onExternalIconError,
  onReset,
  onToggle,
  onValueChange,
  selected,
}: {
  canReset: boolean;
  count: number;
  filters: ReactNode;
  games: GameDto[];
  iconFor: (game: GameDto) => string | null | undefined;
  multiple: boolean;
  onExternalIconError: (gameId: string) => void;
  onReset: () => void;
  onToggle: (value: string) => void;
  onValueChange: (value: string) => void;
  selected: ReadonlySet<string>;
}) {
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [customizingGames, setCustomizingGames] = useState(false);
  const showCheckboxes = multiple || customizingGames;
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const selectionSummary = useRef<HTMLSpanElement>(null);
  const selectionIcons = useRef<HTMLSpanElement>(null);
  const id = `game-select-${useId()}`;
  const selectedGame = selected.size === 1 ? games.find((item) => selected.has(item.code)) : null;
  const allSelected = games.every((game) => selected.has(game.code));
  const selectedIconGames = games.filter((game) => selected.has(game.code));
  const showSelectedIcons = !allSelected && selected.size >= 2 && selected.size <= 8
    && selectedIconGames.length === selected.size;
  const summary = allSelected ? "All games" : selectedGame
    ? `${selectedGame.released.slice(0, 4)} · ${selectedGame.label}`
    : selected.size > 0 ? `${selected.size} games selected` : "No games selected";

  useLayoutEffect(() => {
    const container = selectionSummary.current;
    const icons = selectionIcons.current;
    if (!container) return;
    if (!icons) {
      delete container.dataset.iconsFit;
      return;
    }
    const fit = () => {
      container.dataset.iconsFit = String(icons.scrollWidth <= container.clientWidth);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [showSelectedIcons, selected.size]);

  function close(restoreFocus = false) {
    setOpen(false);
    setShowFilters(false);
    if (restoreFocus) trigger.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const anchor = trigger.current;
      const menu = popup.current;
      if (!anchor || !menu) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(Math.max(rect.width, 280), window.innerWidth - 16);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const flip = below < 220 && above > below;
      menu.style.width = `${width}px`;
      menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
      menu.style.top = flip ? "auto" : `${rect.bottom + 4}px`;
      menu.style.bottom = flip ? `${window.innerHeight - rect.top + 4}px` : "auto";
      menu.style.maxHeight = `${Math.max(0, Math.min(520, flip ? above : below))}px`;
      menu.style.visibility = "visible";
    };
    position();
    popup.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent | FocusEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) {
        setOpen(false);
        setShowFilters(false);
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [open]);

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    const controls = [...(popup.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])]
      .filter((element) => element.getClientRects().length > 0);
    const index = controls.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Tab" && ((event.shiftKey && index === 0) || (!event.shiftKey && index === controls.length - 1))) {
      event.preventDefault();
      const outside = [...document.querySelectorAll<HTMLElement>(focusableSelector)]
        .filter((element) => !popup.current?.contains(element) && element.getClientRects().length > 0);
      const anchorIndex = outside.indexOf(trigger.current!);
      const destination = event.shiftKey ? trigger.current : outside[anchorIndex + 1];
      close();
      (destination ?? trigger.current)?.focus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? controls.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + controls.length) % controls.length;
      controls[next]?.focus();
    }
  }

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
    <>
      <button
        ref={trigger}
        className="country-select-trigger game-select-trigger"
        type="button"
        aria-label={`Filter by game, ordered by release date: ${showSelectedIcons ? selectedIconGames.map((game) => game.label).join(", ") : summary}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        data-state={open ? "open" : "closed"}
        onClick={() => open ? close() : setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span ref={selectionSummary} className="game-select-summary">
          <span className="game-select-summary-text">{summary}</span>
          {showSelectedIcons && <span ref={selectionIcons} className="game-select-summary-icons" aria-hidden="true">
            {selectedIconGames.map((game) => <span key={game.id} title={game.label}>
              {gameIcon(game) ?? <span className="game-select-icon-placeholder">{game.code.slice(0, 3)}</span>}
            </span>)}
          </span>}
        </span>
        {selectedGame ? gameIcon(selectedGame) : null}
        {count > 0 && <small className="game-select-count">{count}</small>}
        <span className="country-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
        </span>
      </button>

      {open && createPortal(
        <div ref={popup} id={id} className="game-select-popup" role="dialog" aria-label="Games" aria-describedby={`${id}-hint`} onKeyDown={navigate} style={{ visibility: "hidden" }}>
          <button className="game-select-filter-option" type="button" aria-expanded={showFilters} aria-controls={showFilters ? `${id}-filters` : undefined} onClick={() => setShowFilters(!showFilters)}>
            <span>Filter</span>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d={showFilters ? "m3 6 5 5 5-5" : "m6 3 5 5-5 5"} /></svg>
          </button>
          {showFilters && <div className="game-select-filters" id={`${id}-filters`}>
            <p>Choose a template to select matching games, then adjust the checkboxes below.</p>
            {filters}
          </div>}
          <div className="game-select-actions">
            <span id={`${id}-hint`}>{showCheckboxes ? "Select one or more games" : "Choose a game"}</span>
            <button type="button" disabled={!canReset} onClick={onReset}>Reset games</button>
          </div>
          <div className="game-select-options" role="group" aria-label={showCheckboxes ? "Select games" : "Choose a game"}>
            <button className="game-select-option" type="button" aria-pressed={allSelected} onClick={() => { onValueChange("all"); if (!showCheckboxes) close(true); }}>
              <span>All games</span>
            </button>
            {games.map((item) => showCheckboxes ? (
              <label className="game-select-option" key={item.id} onDoubleClick={(event) => {
                event.preventDefault();
                setCustomizingGames(true);
                onValueChange(item.code);
              }}>
                <input type="checkbox" checked={selected.has(item.code)} onChange={() => { setCustomizingGames(true); onToggle(item.code); }} />
                <span>{item.released.slice(0, 4)} · {item.label}</span>
                {gameIcon(item)}
              </label>
            ) : (
              <button className="game-select-option" key={item.id} type="button" aria-pressed={!allSelected && selected.has(item.code)} onClick={() => { onValueChange(item.code); close(true); }}>
                <span>{item.released.slice(0, 4)} · {item.label}</span>
                {gameIcon(item)}
              </button>
            ))}
          </div>
        </div>, document.body,
      )}
    </>
  );
}
