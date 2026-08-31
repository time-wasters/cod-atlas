"use client";

import type { ReactNode, RefObject } from "react";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { LevelAppearanceDto } from "../../../infrastructure/atlas-data/dto/level-appearance.dto.js";
import { ExternalLinkIcon } from "../../shared/components/external-link-icon.js";
import { GameIcon } from "../../game-catalog/components/game-icon.js";
import { FittedLevelTitle } from "./fitted-level-title.js";
import { LevelModeIcon } from "./level-mode-icon.js";

type LevelGameViewModel = {
  external: boolean;
  game: GameDto;
  icon: string | null;
};

type LevelDetailsViewModel = {
  appearance: LevelAppearanceDto;
  briefingExpanded: boolean;
  entry: AtlasEntryDto;
  games: LevelGameViewModel[];
  group: AtlasGroupDto;
  links: {
    callOfDutyMaps: string | null;
    googleMaps: string | null;
    wikipedia: string | null;
  };
  mapOverlay: { available: boolean; enabled: boolean };
  otherLocations: { group: AtlasGroupDto; entry: AtlasEntryDto }[];
};

function LocationCountry({ group, entry }: { group: AtlasGroupDto; entry: AtlasEntryDto }) {
  return (
    <div className="intel-kicker">
      {group.flagCode ? (
        <span className={`flag:${group.flagCode} intel-country-flag`} role="img" aria-label={`${entry.country} flag`} />
      ) : (
        <svg className="intel-country-fallback" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="6.5" /></svg>
      )}
      <span className="intel-country-name">{entry.country}</span>
    </div>
  );
}

function LocationTaxonomy({ entry }: { entry: AtlasEntryDto }) {
  if (!entry.region && !entry.city && !entry.landmark) return null;
  return (
    <div className="location-taxonomy" aria-label="Location hierarchy">
      {entry.region && <div className="taxonomy-tier is-region"><span>Region</span><strong>{entry.region}</strong></div>}
      {entry.city && <div className="taxonomy-tier is-city"><span>City</span><strong>{entry.city}</strong></div>}
      {entry.landmark && <div className="taxonomy-tier is-landmark"><span>Landmark</span><strong>{entry.landmark}</strong></div>}
    </div>
  );
}

export function LevelDetailsPanel({
  actions,
  columnRef,
  detailsOpen,
  media,
  relatedLevels,
  viewModel,
}: {
  actions: {
    onFocus: () => void;
    onGameIconError: (gameId: string) => void;
    onToggleBriefing: () => void;
    onToggleDetails: () => void;
    onToggleMapOverlay: () => void;
  };
  columnRef: RefObject<HTMLDivElement | null>;
  detailsOpen: boolean;
  media: ReactNode;
  relatedLevels: ReactNode;
  viewModel: LevelDetailsViewModel;
}) {
  const { appearance, entry, group } = viewModel;
  const precisionLabel = entry.precision === "approximate"
    ? "Approximate historical position"
    : !["country", "off-world"].includes(entry.precision)
      ? `Localized · ${entry.confidence} confidence`
      : entry.precision === "off-world"
        ? "Off-world location"
        : "No city evidence · country fallback";
  return (
    <div
      className={`intel-column${detailsOpen ? "" : " is-collapsed"}${detailsOpen && viewModel.briefingExpanded ? " has-open-briefing" : ""}`}
      ref={columnRef}
    >
      <button
        className="details-toggle"
        type="button"
        aria-expanded={detailsOpen}
        aria-controls="selected-level-details"
        aria-label={detailsOpen ? "Hide level details" : "Show level details"}
        onClick={actions.onToggleDetails}
      >
        <svg viewBox="0 0 12 18" aria-hidden="true"><path d={detailsOpen ? "m4 3 5 6-5 6" : "m8 3-5 6 5 6"} /></svg>
      </button>
      <button className="collapsed-level-title" type="button" aria-label={`Show details for ${appearance.title}`} onClick={actions.onToggleDetails}>
        <span>{appearance.title}</span>
      </button>
      <article className="intel-card" id="selected-level-details">
        <div className="mission-heading">
          <LevelModeIcon mode={entry.modes[0]} />
          <FittedLevelTitle disabled={!entry.coordinates} onActivate={actions.onFocus}>{appearance.title}</FittedLevelTitle>
          <div className="mission-games">
            {viewModel.games.map(({ external, game, icon }) => icon ? (
              <GameIcon
                key={game.id}
                game={game}
                src={icon}
                external={external}
                onError={() => {
                  if (external) actions.onGameIconError(game.id);
                }}
              />
            ) : (
              <span className="mission-game-name" key={game.id}>{game.label}</span>
            ))}
          </div>
        </div>
        {media}
        <div className="intel-location-row">
          <LocationCountry group={group} entry={entry} />
          {viewModel.mapOverlay.available && (
            <button
              className={`map-overlay-toggle${viewModel.mapOverlay.enabled ? " is-enabled" : ""}`}
              type="button"
              aria-pressed={viewModel.mapOverlay.enabled}
              aria-label={`${viewModel.mapOverlay.enabled ? "Hide" : "Show"} game map overlay`}
              title={`${viewModel.mapOverlay.enabled ? "Hide" : "Show"} game map overlay`}
              onClick={actions.onToggleMapOverlay}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
            </button>
          )}
        </div>
        <LocationTaxonomy entry={entry} />
        <div className={`precision-badge ${entry.precision === "approximate" ? "is-approximate" : !["country", "off-world"].includes(entry.precision) ? "is-city" : "is-country"}`}>
          {precisionLabel}
        </div>
        {viewModel.otherLocations.length > 0 && (
          <div className="related-level-locations" aria-label="Other locations in this level">
            {viewModel.otherLocations.map(({ group: otherGroup, entry: otherEntry }) => (
              <div className="related-level-location" key={otherEntry.id}>
                <LocationCountry group={otherGroup} entry={otherEntry} />
                <LocationTaxonomy entry={otherEntry} />
              </div>
            ))}
          </div>
        )}
        <div className="place-links" aria-label="External place links">
          {viewModel.links.googleMaps && <a href={viewModel.links.googleMaps} target="_blank" rel="noreferrer" aria-label="Open in Google Maps" title="Google Maps"><ExternalLinkIcon name="googleMaps" /><span>Google Maps</span></a>}
          {viewModel.links.wikipedia && <a href={viewModel.links.wikipedia} target="_blank" rel="noreferrer" aria-label="Open on Wikipedia" title="Wikipedia"><ExternalLinkIcon name="wikipedia" /><span>Wikipedia</span></a>}
          {viewModel.links.callOfDutyMaps && <a href={viewModel.links.callOfDutyMaps} target="_blank" rel="noreferrer" aria-label="Open this map on Call of Duty Maps" title="Call of Duty Maps"><ExternalLinkIcon name="callOfDutyMaps" /><span>CoD Maps</span></a>}
          <a href={appearance.wiki} target="_blank" rel="noreferrer" aria-label="Open on Call of Duty Wiki" title="Call of Duty Wiki"><ExternalLinkIcon name="fandom" /><span>CoD Wiki</span></a>
        </div>
        <section className="level-briefing">
          <button
            className="level-briefing-toggle"
            type="button"
            aria-expanded={viewModel.briefingExpanded}
            aria-controls={appearance.hasLevelNotes ? "selected-level-briefing" : undefined}
            onClick={actions.onToggleBriefing}
            disabled={!appearance.hasLevelNotes}
            title={appearance.hasLevelNotes ? undefined : "No level briefing available"}
          >
            <b aria-hidden="true">{viewModel.briefingExpanded ? "›" : "‹"}</b>
            <span><small>Level briefing</small><strong>{appearance.hasLevelNotes ? "Research & historical context" : "No briefing available"}</strong></span>
          </button>
        </section>
      </article>
      {relatedLevels}
    </div>
  );
}
