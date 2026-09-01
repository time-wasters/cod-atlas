"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdvancedFilterGroupId } from "../state/use-atlas-filters.js";

export type FilterOption = { value: string; label: string; disabled?: boolean; note?: string };
export type FilterHoverDetail = {
  label: string;
  description: string;
  years: string;
  games: { label: string; year: string }[];
};

type AdvancedFilterDropdownProps = {
  id: AdvancedFilterGroupId;
  title: string;
  options: FilterOption[];
  selected: Set<string>;
  open: boolean;
  emptyLabel?: string;
  hoverDetails?: ReadonlyMap<string, FilterHoverDetail>;
  onOpenChange: (open: boolean) => void;
  onToggle: (value: string) => void;
  onClear: () => void;
};

export function AdvancedFilterDropdown({
  id,
  title,
  options,
  selected,
  open,
  emptyLabel = "Any",
  hoverDetails,
  onOpenChange,
  onToggle,
  onClear,
}: AdvancedFilterDropdownProps) {
  const menuId = `advanced-filter-${id}`;
  const labelId = `${menuId}-label`;
  const dropdown = useRef<HTMLElement>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [hoverCardPosition, setHoverCardPosition] = useState({ top: 8, left: 8, side: "right" as "left" | "right" });
  const selectedOptions = options.filter((option) => selected.has(option.value));
  const summary = selectedOptions.length === 0
    ? emptyLabel
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} selected`;
  const hoveredDetail = hoveredOption ? hoverDetails?.get(hoveredOption) ?? null : null;

  const showHoverDetail = (value: string) => {
    if (!hoverDetails?.has(value) || !dropdown.current) return;
    const rect = dropdown.current.getBoundingClientRect();
    const width = 300;
    const gap = 9;
    const margin = 8;
    const fitsRight = rect.right + gap + width <= window.innerWidth - margin;
    const fitsLeft = rect.left - gap - width >= margin;
    const side = fitsRight || !fitsLeft ? "right" : "left";
    const preferredLeft = side === "right" ? rect.right + gap : rect.left - gap - width;
    setHoverCardPosition({
      top: Math.min(Math.max(margin, rect.top), Math.max(margin, window.innerHeight - 420)),
      left: Math.min(Math.max(margin, preferredLeft), Math.max(margin, window.innerWidth - width - margin)),
      side,
    });
    setHoveredOption(value);
  };

  const requestOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setHoveredOption(null);
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!dropdown.current?.contains(event.target as Node)) {
        setHoveredOption(null);
        onOpenChange(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHoveredOption(null);
        onOpenChange(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onOpenChange, open]);

  return (
    <section className={`advanced-filter-dropdown${open ? " is-open" : ""}`} ref={dropdown}>
      <h3 id={labelId}>{title}</h3>
      <button
        className="advanced-filter-dropdown-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => requestOpenChange(!open)}
      >
        <span>{summary}</span>
        {selected.size > 0 && <small>{selected.size}</small>}
        <svg viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1 5 5 5-5" /></svg>
      </button>
      {open && (
        <div id={menuId} className="advanced-filter-dropdown-menu" role="group" aria-labelledby={labelId}>
          <div className="advanced-filter-dropdown-menu-header">
            <span>Select one or more</span>
            <button type="button" disabled={selected.size === 0} onClick={onClear}>Clear</button>
          </div>
          <div
            className="advanced-filter-checkboxes"
            onPointerLeave={() => setHoveredOption(null)}
            onScroll={() => setHoveredOption(null)}
          >
            {options.map((option) => (
              <label
                className={option.disabled ? "is-disabled" : ""}
                key={option.value}
                aria-describedby={hoveredOption === option.value ? `${menuId}-hover-detail` : undefined}
                onPointerEnter={() => showHoverDetail(option.value)}
                onFocus={() => showHoverDetail(option.value)}
                onBlur={() => setHoveredOption(null)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  disabled={option.disabled}
                  onChange={() => onToggle(option.value)}
                />
                <span>{option.label}</span>
                {option.note && <small>{option.note}</small>}
              </label>
            ))}
          </div>
        </div>
      )}
      {open && hoveredDetail && typeof document !== "undefined" && createPortal(
        <aside
          id={`${menuId}-hover-detail`}
          className={`advanced-filter-hover-info is-${hoverCardPosition.side}`}
          style={{ top: hoverCardPosition.top, left: hoverCardPosition.left }}
          role="tooltip"
        >
          <header>
            <span>{title}</span>
            <h4>{hoveredDetail.label}</h4>
          </header>
          <p>{hoveredDetail.description}</p>
          <dl>
            <div>
              <dt>Years</dt>
              <dd>{hoveredDetail.years}</dd>
            </div>
          </dl>
          <strong>Included games</strong>
          <ul>
            {hoveredDetail.games.map((game) => (
              <li key={`${game.year}-${game.label}`}><time>{game.year}</time><span>{game.label}</span></li>
            ))}
          </ul>
        </aside>,
        document.body,
      )}
    </section>
  );
}
