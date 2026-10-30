"use client";

import { useEffect, useRef } from "react";
import { Tooltip } from "../../shared/components/tooltip.js";
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
  const selectedOptions = options.filter((option) => selected.has(option.value));
  const summary = selectedOptions.length === 0
    ? emptyLabel
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} selected`;

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!dropdown.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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
        onClick={() => onOpenChange(!open)}
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
          <div className="advanced-filter-checkboxes">
            {options.map((option) => {
              const detail = hoverDetails?.get(option.value);
              return (
                <Tooltip key={option.value} delay={0} className="atlas-tooltip--details advanced-filter-hover-info"
                  content={detail ? <FilterHoverContent title={title} detail={detail} /> : undefined}>
                  {(triggerProps) => (
                    <label {...triggerProps} className={option.disabled ? "is-disabled" : ""}>
                      <input
                        type="checkbox"
                        aria-describedby={triggerProps["aria-describedby"]}
                        checked={selected.has(option.value)}
                        disabled={option.disabled}
                        onChange={() => onToggle(option.value)}
                      />
                      <span>{option.label}</span>
                      {option.note && <small>{option.note}</small>}
                    </label>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function FilterHoverContent({ title, detail }: { title: string; detail: FilterHoverDetail }) {
  return (
    <>
      <header>
        <span>{title}</span>
        <h4>{detail.label}</h4>
      </header>
      <p>{detail.description}</p>
      <dl>
        <div>
          <dt>Years</dt>
          <dd>{detail.years}</dd>
        </div>
      </dl>
      <strong>Included games</strong>
      <ul>
        {detail.games.map((game) => (
          <li key={`${game.year}-${game.label}`}><time>{game.year}</time><span>{game.label}</span></li>
        ))}
      </ul>
    </>
  );
}
