"use client";

import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { ContentUpdateOption } from "../../../application/content-updates/use-cases/build-content-update-options.js";
import type { CountryAvailability } from "../../../application/atlas/use-cases/filter-atlas-groups.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import {
  AdvancedFilterDropdown,
  type FilterHoverDetail,
  type FilterOption,
} from "../../filters/components/advanced-filter-dropdown.js";
import { CountrySelect } from "../../filters/components/country-select.js";
import type { AdvancedFilterGroupId } from "../../filters/state/use-atlas-filters.js";
import { GameSelect } from "../../game-catalog/components/game-select.js";
import { AtlasFooter } from "./atlas-footer.js";

type AdvancedFilterViewModel = {
  id: AdvancedFilterGroupId;
  title: string;
  options: FilterOption[];
  selected: Set<string>;
  open: boolean;
  hoverDetails?: ReadonlyMap<string, FilterHoverDetail>;
  onOpenChange: (open: boolean) => void;
  onToggle: (value: string) => void;
  onClear: () => void;
};

export type AtlasSidebarViewModel = {
  advanced: {
    count: number;
    filters: AdvancedFilterViewModel[];
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
    onReset: () => void;
  };
  browse: {
    activeCampaignKey: string | null;
    activeContentUpdateKey: string | null;
    campaigns: CampaignOption<AtlasGroupDto, AtlasEntryDto>[];
    contentUpdates: ContentUpdateOption<AtlasGroupDto, AtlasEntryDto>[];
    groups: AtlasGroupDto[];
    mode: "locations" | "campaigns" | "updates";
    onCampaignSelect: (campaign: CampaignOption<AtlasGroupDto, AtlasEntryDto>) => void;
    onContentUpdateSelect: (contentUpdate: ContentUpdateOption<AtlasGroupDto, AtlasEntryDto>) => void;
    onGroupSelect: (group: AtlasGroupDto) => void;
    onModeChange: (mode: "locations" | "campaigns" | "updates") => void;
    selectedGroupName: string;
  };
  country: {
    countries: CountryAvailability[];
    onChange: (value: string) => void;
    value: string;
  };
  game: {
    games: GameDto[];
    onChange: (value: string) => void;
    onOpenCatalog: () => void;
    value: string;
  };
  modes: {
    label: string;
    onToggle: () => void;
    visible: boolean;
  }[];
  open: boolean;
  results: {
    fallback: number;
    localized: number;
    onExport: () => void;
    regions: number;
    total: number;
  };
  search: {
    onBlur: () => void;
    onChange: (value: string) => void;
    value: string;
  };
};

export function AtlasSidebar({
  onOpenProjectInfo,
  onToggle,
  viewModel,
}: {
  onOpenProjectInfo: () => void;
  onToggle: () => void;
  viewModel: AtlasSidebarViewModel;
}) {
  const { advanced, browse, country, game, modes, results, search } = viewModel;
  return (
    <aside className="atlas-sidebar" aria-label="Map filters">
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <input
          value={search.value}
          onChange={(event) => search.onChange(event.target.value)}
          onBlur={search.onBlur}
          placeholder="Search missions, maps, countries…"
          aria-label="Search locations"
        />
      </label>

      <div className="filter-grid">
        <div className="filter-field game-filter">
          <span>
            <button className="game-catalog-trigger" type="button" aria-haspopup="dialog" onClick={game.onOpenCatalog}>Game</button>
            <small>Oldest to newest</small>
          </span>
          <GameSelect games={game.games} value={game.value} onValueChange={game.onChange} />
        </div>
        <div className="filter-field">
          <span>Country</span>
          <CountrySelect countries={country.countries} value={country.value} onValueChange={country.onChange} />
        </div>
      </div>

      <div className="mode-filter" aria-label="Map type visibility">
        {modes.map((mode) => (
          <button
            className={mode.visible ? "is-active" : ""}
            type="button"
            aria-pressed={mode.visible}
            onClick={mode.onToggle}
            key={mode.label}
          >
            <span aria-hidden="true">{mode.visible ? "✓" : "○"}</span> {mode.label}
          </button>
        ))}
      </div>

      {advanced.open ? (
        <section className="advanced-filters" aria-labelledby="advanced-filters-title">
          <header className="advanced-filters-header">
            <button className="advanced-filters-back" type="button" aria-label="Close advanced filters" onClick={advanced.onClose}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" /></svg>
            </button>
            <div className="advanced-filters-title"><span>Filter matrix</span><h2 id="advanced-filters-title">Advanced filters</h2></div>
            <div className="advanced-filters-actions">
              <button className="advanced-filters-reset" type="button" disabled={advanced.count === 0} onClick={advanced.onReset}>Reset</button>
            </div>
          </header>
          <div className="advanced-filters-scroll">
            {advanced.filters.map((filter) => <AdvancedFilterDropdown {...filter} key={filter.id} />)}
          </div>
          <button className="advanced-filters-results" type="button" onClick={advanced.onClose}>
            Show <strong>{results.total}</strong> results
          </button>
        </section>
      ) : (
        <>
          <button className={`advanced-filter-trigger${advanced.count ? " is-active" : ""}`} type="button" aria-expanded="false" onClick={advanced.onOpen}>
            <span><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M5 9h8M7 13h4" /></svg>Advanced filters</span>
            <strong>{advanced.count || "All"}</strong>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
          </button>

          <section className="result-panel" aria-live="polite">
            <div><strong>{results.total}</strong><span>results</span></div>
            <dl>
              <div><dt>Localized</dt><dd>{results.localized}</dd></div>
              <div><dt>Fallback</dt><dd>{results.fallback}</dd></div>
              <div><dt>Regions</dt><dd>{results.regions}</dd></div>
            </dl>
          </section>
          <button className="kml-button" onClick={results.onExport}>↓ Export filtered KML for Google Maps</button>

          <section className="mission-list">
            <div className="sidebar-list-switch" role="tablist" aria-label="Browse atlas data">
              <button
                className={browse.mode === "locations" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={browse.mode === "locations"}
                aria-controls="sidebar-locations"
                onClick={() => browse.onModeChange("locations")}
              >
                <span>Locations</span><small>{browse.groups.length}</small>
              </button>
              <button
                className={browse.mode === "campaigns" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={browse.mode === "campaigns"}
                aria-controls="sidebar-campaigns"
                disabled={game.value === "all"}
                title={game.value === "all" ? "Choose a game to browse campaigns" : undefined}
                onClick={() => browse.onModeChange("campaigns")}
              >
                <span>Campaigns</span><small>{browse.campaigns.length}</small>
              </button>
              <button
                className={browse.mode === "updates" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={browse.mode === "updates"}
                aria-controls="sidebar-content-updates"
                disabled={game.value === "all" || browse.contentUpdates.length === 0}
                title={game.value === "all"
                  ? "Choose a game to browse content updates"
                  : browse.contentUpdates.length === 0
                    ? "No Multiplayer or Zombies content-update data is available for this game"
                    : undefined}
                onClick={() => browse.onModeChange("updates")}
              >
                <span>Updates</span><small>{browse.contentUpdates.length}</small>
              </button>
            </div>
            {browse.mode === "locations" ? (
              <div className="scroll-list" id="sidebar-locations" role="tabpanel">
                {browse.groups.map((group, index) => (
                  <button
                    key={`${group.name}-${index}`}
                    className={group.name === browse.selectedGroupName ? "location-row is-selected" : "location-row"}
                    onClick={() => browse.onGroupSelect(group)}
                  >
                    <i className="location-marker-icon" aria-hidden="true" />
                    <span><b>{group.name}</b><small>{group.entries.length} appearances</small></span>
                    <em>{group.coordinates ? "MAP" : "ORBIT"}</em>
                  </button>
                ))}
              </div>
            ) : browse.mode === "campaigns" ? (
              <div className="scroll-list" id="sidebar-campaigns" role="tabpanel">
                {browse.campaigns.map((campaign, index) => (
                  <button
                    key={campaign.key}
                    className={campaign.key === browse.activeCampaignKey ? "campaign-row is-selected" : "campaign-row"}
                    type="button"
                    onClick={() => browse.onCampaignSelect(campaign)}
                  >
                    <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                    <span><b>{campaign.label}</b><small>{campaign.levels.length} levels</small></span>
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
                  </button>
                ))}
                {browse.campaigns.length === 0 && <p className="campaign-list-empty">No campaign data is available for this game.</p>}
              </div>
            ) : (
              <div className="scroll-list" id="sidebar-content-updates" role="tabpanel">
                {browse.contentUpdates.map((contentUpdate) => (
                  <button
                    key={contentUpdate.key}
                    className={contentUpdate.key === browse.activeContentUpdateKey ? "campaign-row is-selected" : "campaign-row"}
                    type="button"
                    onClick={() => browse.onContentUpdateSelect(contentUpdate)}
                  >
                    <i aria-hidden="true">{contentUpdate.id.padStart(2, "0")}</i>
                    <span><b>{contentUpdate.label}</b><small>{contentUpdate.levels.length} levels</small></span>
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
                  </button>
                ))}
                {browse.contentUpdates.length === 0 && <p className="campaign-list-empty">No content-update data is available for this game.</p>}
              </div>
            )}
          </section>
          <AtlasFooter onOpenProjectInfo={onOpenProjectInfo} />
        </>
      )}

      <button
        className="sidebar-toggle"
        type="button"
        aria-expanded={viewModel.open}
        aria-label={viewModel.open ? "Hide map filters" : "Show map filters"}
        onClick={onToggle}
      >
        <svg viewBox="0 0 12 18" aria-hidden="true"><path d={viewModel.open ? "m8 3-5 6 5 6" : "m4 3 5 6-5 6"} /></svg>
      </button>
    </aside>
  );
}
