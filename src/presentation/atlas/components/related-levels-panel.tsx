"use client";

import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";

type RelatedLevel = { group: AtlasGroupDto; entry: AtlasEntryDto };

export type RelatedLevelsViewModel = {
  ariaLabel: string;
  campaign: boolean;
  collectionKind: "campaign" | "update" | "region";
  expanded: boolean;
  gameIcon: { external: boolean; gameId: string; src: string } | null;
  hiddenCount: number;
  items: RelatedLevel[];
  label: string;
  open: boolean;
  selectedLevelId: string;
  totalCount: number;
};

function locationName(entry: AtlasEntryDto) {
  return entry.landmark ?? entry.city ?? entry.region ?? entry.country;
}

export function RelatedLevelsPanel({
  onCollapse,
  onExpand,
  onGameIconError,
  onSelect,
  onToggle,
  viewModel,
}: {
  onCollapse: () => void;
  onExpand: () => void;
  onGameIconError: (gameId: string) => void;
  onSelect: (group: AtlasGroupDto, entry: AtlasEntryDto) => void;
  onToggle: () => void;
  viewModel: RelatedLevelsViewModel;
}) {
  return (
    <aside className={`related-levels-panel${viewModel.open ? "" : " is-collapsed"}`} aria-label={viewModel.ariaLabel}>
      <button
        className={`related-levels-toggle${viewModel.gameIcon ? " has-game-icon" : ""}`}
        type="button"
        aria-expanded={viewModel.open}
        aria-controls="related-level-list"
        onClick={onToggle}
      >
        {viewModel.gameIcon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`related-levels-game-icon${viewModel.gameIcon.external ? " is-external" : ""}`}
            src={viewModel.gameIcon.src}
            alt=""
            onError={() => {
              if (viewModel.gameIcon?.external) onGameIconError(viewModel.gameIcon.gameId);
            }}
          />
        )}
        <span>{viewModel.label}</span>
        <small>{viewModel.totalCount}</small>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {viewModel.open && (
        <div className={`intel-entries${viewModel.expanded ? " is-expanded" : ""}`} id="related-level-list">
          {viewModel.items.map(({ group, entry }) => (
            <div className={`intel-entry${entry.levelId === viewModel.selectedLevelId ? " is-selected" : ""}`} key={entry.levelId}>
              <button className={viewModel.campaign && entry.campaignOrder != null ? "has-campaign-order" : undefined} onClick={() => onSelect(group, entry)}>
                {viewModel.campaign && entry.campaignOrder != null && (
                  <span className="campaign-route-stop campaign-related-level-number" aria-label={`Campaign mission ${entry.campaignOrder}`}>
                    {String(entry.campaignOrder).padStart(2, "0")}
                  </span>
                )}
                <span className="intel-entry-copy">
                  <strong>{entry.title}</strong>
                  <span>{locationName(entry)}{viewModel.collectionKind === "region" ? ` · ${entry.game}` : ""}</span>
                </span>
              </button>
            </div>
          ))}
          {viewModel.hiddenCount > 0 && (
            <button className="more-row" type="button" aria-expanded="false" aria-controls="related-level-list" onClick={onExpand}>
              + {viewModel.hiddenCount} more {viewModel.hiddenCount === 1 ? "level" : "levels"} in this {viewModel.collectionKind}
            </button>
          )}
          {viewModel.expanded && viewModel.totalCount > 8 && (
            <button className="more-row is-collapse" type="button" aria-expanded="true" aria-controls="related-level-list" onClick={onCollapse}>
              Show fewer
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
