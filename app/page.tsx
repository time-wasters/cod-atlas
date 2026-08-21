"use client";

import type { Map as LeafletMap, Marker as LeafletMarker, MarkerClusterGroup } from "leaflet";
import * as Select from "@radix-ui/react-select";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import ReactMarkdown from "react-markdown";
import atlasSource from "./data/atlas.generated.json";
import historyOverlaysSource from "./data/history-overlays.generated.json";
import mapOverlaysSource from "./data/map-overlays.generated.json";
import { atlasUrlWithState, parseAtlasUrl } from "./url-state";

type Entry = {
  id: string;
  levelId: string;
  locationId: string;
  title: string;
  game: string;
  gameIds: string[];
  campaign?: {
    id: string;
    label: string;
  } | null;
  campaignOrder?: number;
  wiki: string;
  country: string;
  region?: string | null;
  city?: string | null;
  landmark?: string | null;
  coordinates?: [number, number] | null;
  precision: "exact" | "approximate" | "city" | "region" | "country" | "off-world";
  confidence?: "high" | "medium" | "fallback";
  method?: string;
  urls?: Partial<Record<"googleMaps" | "wikipedia" | "callOfDutyMaps", string>>[];
  hasLevelNotes: boolean;
  modes: ("singleplayer" | "multiplayer")[];
};

type WikiImage = {
  origin?: "local";
  sourceUrl: string;
  thumbnailUrl: string;
  detailPageUrl: string;
  author: {
    name: string | null;
    userUrl: string | null;
    role: "author" | "uploader" | null;
  };
  license: {
    name: string | null;
    url: string | null;
  };
  rights: {
    status: "licensed" | "non-free" | "unknown";
    notice: string | null;
    noticeUrl: string | null;
  };
};

type WikiMedia = {
  main: WikiImage | null;
  map: WikiImage | null;
};

function locationUrl(entry: Entry, provider: "googleMaps" | "wikipedia" | "callOfDutyMaps") {
  return entry.urls?.find((item) => item[provider])?.[provider] ?? null;
}

function googleMapsUrl(entry: Entry) {
  if (entry.precision === "country") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.country)}`;
  }
  if (!entry.coordinates) return null;
  const [latitude, longitude] = entry.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`;
}

function locationName(entry: Entry) {
  return entry.landmark ?? entry.city ?? entry.region ?? entry.country;
}

function locationPath(entry: Entry) {
  return [entry.country, entry.region, entry.city, entry.landmark].filter(Boolean).join(" › ");
}

function imageBasename(source: string) {
  return source.split(/[?#]/, 1)[0].split("/").at(-1) ?? source;
}

function atlasMarkerIcon(L: typeof import("leaflet"), entry: Entry, active: boolean, campaignDimmed = false) {
  const cityLevel = !["country", "off-world"].includes(entry.precision);
  return L.divIcon({
    className: "atlas-marker-wrap",
    html: `<span class="atlas-marker ${cityLevel ? "is-city" : "is-country"}${active ? " is-active" : ""}${campaignDimmed ? " is-campaign-dimmed" : ""}"><b></b></span>`,
    iconSize: [active ? 30 : 18, active ? 30 : 18],
    iconAnchor: [active ? 15 : 9, active ? 15 : 9],
  });
}

type Group = {
  name: string;
  continent: string;
  coordinates: [number, number] | null;
  kind: "terrestrial" | "off-world";
  flagCode: string | null;
  entries: Entry[];
};
type Game = {
  id: string;
  code: string;
  label: string;
  released: string;
  category: "world-war" | "modern-warfare" | "black-ops" | "standalone";
  era: "classic" | "golden" | "sci-fi" | "reboot" | "live-service";
  icon?: string;
};
type FilterOption = { value: string; label: string };
type ExternalIconManifest = Record<string, {
  icon?: { provider: "steam" | "steamgriddb"; path: string };
  clienticon?: { provider: "steam"; path: string };
}>;
type MapOverlayRecord = {
  levelId: string;
  image: string;
  opacity: number;
  corners: {
    topLeft: [number, number];
    topRight: [number, number];
    bottomLeft: [number, number];
    bottomRight: [number, number];
  };
  attribution: {
    title: string;
    source: string;
    sourceUrl: string;
    extractedBy: string;
    extractedByUrl: string;
    copyrightHolder: string;
    rights: "non-free";
    rightsNotice: string;
    rightsNoticeUrl: string;
  };
};
type HistoryOverlayRecord = {
  levelId: string;
  id: string;
  image: string;
  opacity: number;
  corners: MapOverlayRecord["corners"];
  attribution: {
    title: string;
    source: string;
    sourceUrl: string;
    author: string;
    copyrightHolder: string;
    rights: "non-free";
    rightsNotice: string;
    rightsNoticeUrl: string;
  };
};
type AtlasData = {
  games: Game[];
  levelBanners: Record<string, WikiImage>;
  wikiMedia: Record<string, WikiMedia>;
  groups: Group[];
  totals: {
    groups: number;
    entries: number;
    mapped: number;
    cityMatched: number;
    countryFallback: number;
  };
  updatedAt: string;
};

type Selection = { group: Group; entry: Entry };
type CountryOption = Pick<Group, "name" | "flagCode"> & { available: boolean };
type CampaignOption = {
  key: string;
  gameId: string;
  id: string;
  label: string;
  levels: Selection[];
};

const data = atlasSource as AtlasData;
const historyOverlays = historyOverlaysSource as Record<string, HistoryOverlayRecord[]>;
const mapOverlays = mapOverlaysSource as Record<string, MapOverlayRecord>;
const gamesById = new Map(data.games.map((game) => [game.id, game]));
const gamesByCode = new Map(data.games.map((game) => [game.code, game]));
const countryNames = new Set(data.groups.map((group) => group.name));
const selections = data.groups.flatMap((group) => group.entries.map((entry) => ({ group, entry })));
const gameCategoryOptions: FilterOption[] = [
  { value: "world-war", label: "World War" },
  { value: "modern-warfare", label: "Modern Warfare" },
  { value: "black-ops", label: "Black Ops" },
  { value: "standalone", label: "Standalone" },
];
const gameEraOptions: FilterOption[] = [
  { value: "classic", label: "Classic" },
  { value: "golden", label: "Golden" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "reboot", label: "Reboot" },
  { value: "live-service", label: "Live-Service" },
];
const continentOrder = [
  "Africa",
  "Antarctica",
  "Arctic",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Oceans",
  "Off-world",
];
const continentOptions: FilterOption[] = [...new Set(data.groups.map((group) => group.continent))]
  .sort((a, b) => continentOrder.indexOf(a) - continentOrder.indexOf(b) || a.localeCompare(b))
  .map((value) => ({ value, label: value }));
const precisionOptions: FilterOption[] = [
  { value: "exact", label: "Exact" },
  { value: "approximate", label: "Approximate" },
  { value: "city", label: "City" },
  { value: "region", label: "Region" },
  { value: "country", label: "Country" },
  { value: "off-world", label: "Off-world" },
];
const confidenceOptions: FilterOption[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "fallback", label: "Fallback" },
];
const methodOptions: FilterOption[] = [
  { value: "verified-landmark", label: "Verified landmark" },
  { value: "real-world-inspiration", label: "Real-world inspiration" },
  { value: "manual-approximate", label: "Manual approximate" },
  { value: "wiki-location", label: "Wiki location" },
  { value: "article-context", label: "Article context" },
  { value: "title", label: "Title" },
  { value: "title-mention", label: "Title mention" },
  { value: "region-fallback", label: "Region fallback" },
  { value: "country-fallback", label: "Country fallback" },
];
const valuesFor = (options: FilterOption[]) => new Set(options.map((option) => option.value));
const gameCategoryValues = valuesFor(gameCategoryOptions);
const gameEraValues = valuesFor(gameEraOptions);
const continentValues = valuesFor(continentOptions);
const precisionValues = valuesFor(precisionOptions);
const confidenceValues = valuesFor(confidenceOptions);
const methodValues = valuesFor(methodOptions);
const EXTERNAL_ICONS_PREFERENCE = "cod-atlas:external-game-icons";
const externalIconPreferenceListeners = new Set<() => void>();

function externalIconsEnabledSnapshot() {
  return typeof window !== "undefined" && window.localStorage.getItem(EXTERNAL_ICONS_PREFERENCE) === "true";
}

function subscribeToExternalIconPreference(listener: () => void) {
  externalIconPreferenceListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === EXTERNAL_ICONS_PREFERENCE) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    externalIconPreferenceListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setExternalIconsEnabled(enabled: boolean) {
  window.localStorage.setItem(EXTERNAL_ICONS_PREFERENCE, String(enabled));
  externalIconPreferenceListeners.forEach((listener) => listener());
}
const MAP_MAX_ZOOM = 18;

function animateMapOverlayOpacity(
  overlay: import("leaflet").ImageOverlay.Rotated,
  target: number,
  animationRef: { current: number | null },
  opacityRef: { current: number },
  onComplete?: () => void,
) {
  if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    overlay.setOpacity(target);
    opacityRef.current = target;
    animationRef.current = null;
    onComplete?.();
    return;
  }
  const start = opacityRef.current;
  const startedAt = performance.now();
  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / 320);
    const eased = 1 - (1 - progress) ** 3;
    const opacity = start + (target - start) * eased;
    overlay.setOpacity(opacity);
    opacityRef.current = opacity;
    if (progress < 1) animationRef.current = requestAnimationFrame(tick);
    else {
      animationRef.current = null;
      onComplete?.();
    }
  };
  animationRef.current = requestAnimationFrame(tick);
}

const EXTERNAL_LINK_ICONS = {
  googleMaps: "webpage_icons/maps-google-com.ico",
  wikipedia: "webpage_icons/wikipedia-com.ico",
  callOfDutyMaps: "webpage_icons/callofdutymaps-com.webp",
  fandom: "webpage_icons/callofduty-fandom-com.webp",
} as const;

function ExternalLinkIcon({ name }: { name: keyof typeof EXTERNAL_LINK_ICONS }) {
  return (
    // These tiny reviewed favicon assets do not need runtime image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={EXTERNAL_LINK_ICONS[name]} width="24" height="24" alt="" aria-hidden="true" />
  );
}

function LevelModeIcon({ multiplayer }: { multiplayer: boolean }) {
  return multiplayer ? (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" role="img" aria-label="Multiplayer">
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" />
      <path d="M2.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M13 14c.8-.7 1.8-1 3-1 3 0 4.7 2 5 5.5" />
    </svg>
  ) : (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" role="img" aria-label="Singleplayer">
      <circle cx="12" cy="7.5" r="3.5" /><path d="M5 20c.5-5 2.8-7.5 7-7.5s6.5 2.5 7 7.5" />
    </svg>
  );
}

function FittedLevelTitle({
  children,
  disabled,
  onActivate,
}: {
  children: string;
  disabled: boolean;
  onActivate: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const element = title.current;
    if (!element) return;
    let lastWidth = -1;
    const fit = () => {
      const width = Math.round(element.getBoundingClientRect().width);
      if (width === lastWidth) return;
      lastWidth = width;
      let size = 30;
      element.style.fontSize = `${size}px`;
      while (element.scrollHeight > element.clientHeight + 1 && size > 17) {
        size -= 1;
        element.style.fontSize = `${size}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);

  return (
    <h2 ref={title}>
      <button
        className="mission-title-button"
        type="button"
        disabled={disabled}
        aria-label={`Show ${children} on map`}
        title="Show on map"
        onClick={onActivate}
      >
        {children}
      </button>
    </h2>
  );
}

function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

function toggledFilterValue(current: Set<string>, value: string) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function compareGames(a: Game, b: Game) {
  return a.released.localeCompare(b.released) || a.label.localeCompare(b.label);
}

const initialGroup = data.groups[0];
if (!initialGroup) throw new Error("Generated atlas contains no groups");

const initialEntry = initialGroup.entries[0];
if (!initialEntry) throw new Error("Generated atlas contains an empty group");

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[char]!,
  );
}

function mapViewportPadding(mapElement: HTMLElement, detailsElement: HTMLElement | null) {
  const mapRect = mapElement.getBoundingClientRect();
  const shortestEdge = Math.min(mapRect.width, mapRect.height);
  const edgePadding = Math.round(Math.min(56, Math.max(32, shortestEdge * .055)));
  let rightPadding = edgePadding;
  let bottomPadding = edgePadding;

  if (detailsElement) {
    const detailsRect = detailsElement.getBoundingClientRect();
    const horizontalOverlap = Math.max(
      0,
      Math.min(mapRect.right, detailsRect.right) - Math.max(mapRect.left, detailsRect.left),
    );
    const verticalOverlap = Math.max(
      0,
      Math.min(mapRect.bottom, detailsRect.bottom) - Math.max(mapRect.top, detailsRect.top),
    );

    if (horizontalOverlap > 0 && verticalOverlap > 0) {
      const detailsAtBottom = detailsRect.width >= mapRect.width * .68
        && Math.abs(mapRect.bottom - detailsRect.bottom) <= edgePadding;
      if (detailsAtBottom) {
        bottomPadding = mapRect.bottom - detailsRect.top + edgePadding;
      } else {
        rightPadding = mapRect.right - detailsRect.left + edgePadding;
      }
    }
  }

  return {
    paddingTopLeft: [edgePadding, edgePadding] as [number, number],
    paddingBottomRight: [
      Math.min(rightPadding, Math.max(edgePadding, mapRect.width - edgePadding - 64)),
      Math.min(bottomPadding, Math.max(edgePadding, mapRect.height - edgePadding - 64)),
    ] as [number, number],
  };
}

function CountryFlag({ code }: { code: string | null }) {
  if (!code) return null;

  return (
    <span
      className={`flag:${code} country-select-flag`}
      aria-hidden="true"
    />
  );
}

function CountrySelect({
  countries,
  value,
  onValueChange,
}: {
  countries: CountryOption[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const selectedCountry = countries.find((item) => item.name === value) ?? null;

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={`country-select-trigger${selectedCountry && !selectedCountry.available ? " is-unavailable" : ""}`}
        aria-label="Filter by country"
      >
        <Select.Value>{selectedCountry?.name ?? "All countries"}</Select.Value>
        {selectedCountry ? (
          <CountryFlag code={selectedCountry.flagCode} />
        ) : null}
        <Select.Icon className="country-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="country-select-content"
          position="popper"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <Select.ScrollUpButton className="country-select-scroll-button" aria-label="Scroll up">▲</Select.ScrollUpButton>
          <Select.Viewport className="country-select-viewport">
            <Select.Item className="country-select-item" value="all">
              <Select.ItemText>All countries</Select.ItemText>
            </Select.Item>
            {countries.map((item) => (
              <Select.Item
                className={`country-select-item${item.available ? "" : " is-unavailable"}`}
                key={item.name}
                value={item.name}
                aria-label={item.available ? item.name : `${item.name}, no matching levels`}
              >
                <Select.ItemText>{item.name}</Select.ItemText>
                <CountryFlag code={item.flagCode} />
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="country-select-scroll-button" aria-label="Scroll down">▼</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function GameSelect({
  games,
  value,
  onValueChange,
}: {
  games: Game[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const selectedGame = games.find((item) => item.code === value) ?? null;

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className="country-select-trigger"
        aria-label="Filter by game, ordered by release date"
      >
        <Select.Value>{selectedGame ? `${selectedGame.released.slice(0, 4)} · ${selectedGame.label}` : "All games"}</Select.Value>
        <Select.Icon className="country-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="country-select-content"
          position="popper"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <Select.ScrollUpButton className="country-select-scroll-button" aria-label="Scroll up">▲</Select.ScrollUpButton>
          <Select.Viewport className="country-select-viewport">
            <Select.Item className="country-select-item" value="all">
              <Select.ItemText>All games</Select.ItemText>
            </Select.Item>
            {games.map((item) => (
              <Select.Item className="country-select-item" key={item.id} value={item.code}>
                <Select.ItemText>{item.released.slice(0, 4)} · {item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="country-select-scroll-button" aria-label="Scroll down">▼</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function AdvancedFilterGroup({
  title,
  options,
  selected,
  onToggle,
  onClear,
  sourceUrl,
}: {
  title: string;
  options: FilterOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
  sourceUrl?: string;
}) {
  return (
    <section className="advanced-filter-group">
      <header>
        <h3>{title}</h3>
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`${title} definitions`}>Issue #11 â†—</a> : null}
      </header>
      <div className="advanced-filter-options">
        <button
          className={selected.size === 0 ? "is-active" : ""}
          type="button"
          aria-pressed={selected.size === 0}
          onClick={onClear}
        >
          Any
        </button>
        {options.map((option) => (
          <button
            className={selected.has(option.value) ? "is-active" : ""}
            type="button"
            key={option.value}
            aria-pressed={selected.has(option.value)}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

type SolarTargetId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "europa"
  | "saturn"
  | "titan"
  | "uranus"
  | "neptune"
  | "pluto"
  | "deep-space";

type SolarBody = {
  id: Exclude<SolarTargetId, "sun" | "moon" | "europa" | "titan">;
  name: string;
  x: number;
  radius: number;
};

const solarBodies: SolarBody[] = [
  { id: "mercury", name: "Mercury", x: 82, radius: 3 },
  { id: "venus", name: "Venus", x: 123, radius: 5 },
  { id: "earth", name: "Earth", x: 168, radius: 5 },
  { id: "mars", name: "Mars", x: 226, radius: 4 },
  { id: "jupiter", name: "Jupiter", x: 267, radius: 14 },
  { id: "saturn", name: "Saturn", x: 330, radius: 11 },
  { id: "uranus", name: "Uranus", x: 389, radius: 7 },
  { id: "neptune", name: "Neptune", x: 437, radius: 7 },
  { id: "pluto", name: "Pluto", x: 478, radius: 3 },
  { id: "deep-space", name: "Deep Space", x: 535, radius: 8 },
];

const solarTargetPoints: Record<SolarTargetId, { x: number; y: number; radius: number }> = {
  sun: { x: 45, y: 119, radius: 3 },
  mercury: { x: 82, y: 116, radius: 3 },
  venus: { x: 123, y: 116, radius: 5 },
  earth: { x: 168, y: 116, radius: 5 },
  moon: { x: 184, y: 124, radius: 2 },
  mars: { x: 226, y: 116, radius: 4 },
  jupiter: { x: 267, y: 116, radius: 14 },
  europa: { x: 285, y: 126, radius: 2 },
  saturn: { x: 330, y: 116, radius: 11 },
  titan: { x: 349, y: 126, radius: 2.5 },
  uranus: { x: 389, y: 116, radius: 7 },
  neptune: { x: 437, y: 116, radius: 7 },
  pluto: { x: 478, y: 116, radius: 3 },
  "deep-space": { x: 535, y: 116, radius: 8 },
};

function solarTargetForEntry(entry: Entry): SolarTargetId {
  const location = [entry.country, entry.region, entry.city, entry.landmark]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (location.includes("cygnus") || location.includes("deep space")) return "deep-space";
  if (location.includes("europa")) return "europa";
  if (location.includes("titan")) return "titan";
  if (location.includes("moon")) return "moon";
  if (location.includes("mercury")) return "mercury";
  if (location.includes("venus")) return "venus";
  if (location.includes("earth")) return "earth";
  if (location.includes("mars")) return "mars";
  if (location.includes("jupiter")) return "jupiter";
  if (location.includes("saturn")) return "saturn";
  if (location.includes("uranus")) return "uranus";
  if (location.includes("neptune")) return "neptune";
  if (location.includes("pluto")) return "pluto";
  if (location.includes("sun")) return "sun";
  return "deep-space";
}

function SolarPlanet({ body }: { body: SolarBody }) {
  const y = 116;

  if (body.id === "deep-space") {
    return (
      <g className="solar-galaxy" transform={`translate(${body.x} ${y})`} aria-hidden="true">
        <ellipse rx="15" ry="5" transform="rotate(-18)" />
        <path d="M-12 5c4-11 18-13 25-4M-12-3c5 9 18 10 24 2" />
        <circle r="2.2" />
      </g>
    );
  }

  if (body.id === "saturn") {
    return (
      <g className="solar-planet" transform={`translate(${body.x} ${y})`} aria-hidden="true">
        <ellipse className="solar-saturn-ring" rx="21" ry="6" transform="rotate(-22)" />
        <circle r={body.radius} />
        <path d="M-8 -3.5h16M-9 1h18M-7 5h14" />
      </g>
    );
  }

  if (body.id === "jupiter") {
    return (
      <g className="solar-planet" transform={`translate(${body.x} ${y})`} aria-hidden="true">
        <circle r={body.radius} />
        <path d="M-11 -6h22M-13 -1h26M-12 5h24" />
      </g>
    );
  }

  return (
    <g className={`solar-planet is-${body.id}`} transform={`translate(${body.x} ${y})`} aria-hidden="true">
      <circle r={body.radius} />
      {body.id === "earth" && <path d="M-4 -1q3-5 7-2M-1 1q4 1 3 5" />}
      {body.id === "mars" && <path d="M-3 0h6" />}
    </g>
  );
}

function SolarSystemOverlay({
  locations,
  selectedEntryId,
  expanded,
  onExpandedChange,
  onSelect,
}: {
  locations: Selection[];
  selectedEntryId: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onSelect: (group: Group, entry: Entry) => void;
}) {
  const locationsByTarget = new Map<SolarTargetId, Selection[]>();
  for (const location of locations) {
    const target = solarTargetForEntry(location.entry);
    locationsByTarget.set(target, [...(locationsByTarget.get(target) ?? []), location]);
  }

  function selectTarget(target: SolarTargetId) {
    const targetLocations = locationsByTarget.get(target) ?? [];
    if (!targetLocations.length) return;
    const selectedIndex = targetLocations.findIndex(({ entry }) => entry.id === selectedEntryId);
    const next = targetLocations[selectedIndex >= 0 ? (selectedIndex + 1) % targetLocations.length : 0];
    if (next) onSelect(next.group, next.entry);
  }

  return (
    <aside
      className={`solar-system-overlay${expanded ? " is-expanded" : " is-collapsed"}`}
      aria-label="Solar System mission locations"
    >
      <div className="solar-system-panel" aria-hidden={!expanded}>
        <svg viewBox="0 0 600 160" role="img" aria-labelledby="solar-system-title solar-system-description">
          <title id="solar-system-title">Solar System schematic</title>
          <desc id="solar-system-description">
            Reference planets with markers for filtered off-world Call of Duty levels.
          </desc>
          <defs>
            <radialGradient id="solar-sun-fill" cx="75%" cy="48%" r="62%">
              <stop offset="0" stopColor="#c7ad68" stopOpacity=".78" />
              <stop offset="1" stopColor="#8c7c4f" stopOpacity=".48" />
            </radialGradient>
          </defs>

          <text className="solar-system-caption" x="11" y="15">Solar System // Schematic</text>

          <g className="solar-orbits" aria-hidden="true">
            {solarBodies.filter((body) => body.id !== "deep-space").map((body) => (
              <ellipse key={body.id} cx="-42" cy="116" rx={body.x + 42} ry="147" />
            ))}
          </g>

          <g className="solar-sun" aria-hidden="true">
            <circle cx="-16" cy="116" r="55" />
          </g>

          <g className="solar-labels" aria-hidden="true">
            {solarBodies.map((body) => (
              <text
                key={body.id}
                x={body.x - 2}
                y="85"
                transform={`rotate(-30 ${body.x - 2} 85)`}
              >
                {body.name}
              </text>
            ))}
          </g>

          {solarBodies.map((body) => <SolarPlanet body={body} key={body.id} />)}
          <g className="solar-moons" aria-hidden="true">
            <circle cx="184" cy="124" r="2" />
            <circle cx="285" cy="126" r="2" />
            <circle cx="349" cy="126" r="2.5" />
          </g>

          {([...locationsByTarget] as [SolarTargetId, Selection[]][]).map(([target, targetLocations]) => {
            const point = solarTargetPoints[target];
            const isSelected = targetLocations.some(({ entry }) => entry.id === selectedEntryId);
            const label = `${targetLocations.length} filtered ${targetLocations.length === 1 ? "level" : "levels"} at ${target.replace("-", " ")}`;
            return (
              <g
                className={`solar-location-marker${isSelected ? " is-selected" : ""}`}
                key={target}
                role="button"
                tabIndex={expanded ? 0 : -1}
                aria-label={label}
                transform={`translate(${point.x} ${point.y})`}
                onClick={() => selectTarget(target)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectTarget(target);
                  }
                }}
              >
                <title>{label}</title>
                <circle className="solar-marker-hit" r={Math.max(point.radius + 10, 11)} />
                <circle className="solar-marker-outer" r={Math.max(point.radius + 7, 8)} />
                <circle className="solar-marker-inner" r={Math.max(point.radius + 3, 4)} />
                {targetLocations.length > 1 && (
                  <text className="solar-marker-count" y={Math.max(point.radius + 19, 20)} textAnchor="middle">
                    {targetLocations.length}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <button
        className="solar-system-toggle"
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse Solar System overlay" : "Expand Solar System overlay"}
        onClick={() => onExpandedChange(!expanded)}
      >
        <svg viewBox="0 0 12 18" aria-hidden="true">
          <path d={expanded ? "m8 3-5 6 5 6" : "m4 3 5 6-5 6"} />
        </svg>
      </button>
    </aside>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [game, setGame] = useState("all");
  const [country, setCountry] = useState("all");
  const [gameCategories, setGameCategories] = useState<Set<string>>(() => new Set());
  const [gameEras, setGameEras] = useState<Set<string>>(() => new Set());
  const [continents, setContinents] = useState<Set<string>>(() => new Set());
  const [precisions, setPrecisions] = useState<Set<string>>(() => new Set());
  const [confidences, setConfidences] = useState<Set<string>>(() => new Set());
  const [methods, setMethods] = useState<Set<string>>(() => new Set());
  const [showSingleplayer, setShowSingleplayer] = useState(true);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [externalIconManifest, setExternalIconManifest] = useState<ExternalIconManifest | null>(null);
  const [externalIconManifestUnavailable, setExternalIconManifestUnavailable] = useState(false);
  const [failedExternalGameIcons, setFailedExternalGameIcons] = useState<Set<string>>(() => new Set());
  const [failedLevelBanners, setFailedLevelBanners] = useState<Set<string>>(() => new Set());
  const [disabledMapOverlays, setDisabledMapOverlays] = useState<Set<string>>(() => new Set());
  const [activeHistoryOverlay, setActiveHistoryOverlay] = useState<{ levelId: string; id: string } | null>(null);
  const externalIconsEnabled = useSyncExternalStore(
    subscribeToExternalIconPreference,
    externalIconsEnabledSnapshot,
    () => false,
  );
  const [solarSystemDisplay, setSolarSystemDisplay] = useState({
    hasSpaceLocations: true,
    expanded: true,
  });
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null);
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
  const [expandedRegionEntryId, setExpandedRegionEntryId] = useState<string | null>(null);
  const [relatedLevelsOpen, setRelatedLevelsOpen] = useState(true);
  const [sidebarListMode, setSidebarListMode] = useState<"locations" | "campaigns">("locations");
  const [selectedCampaignKey, setSelectedCampaignKey] = useState<string | null>(null);
  const [expandedLevelNotesId, setExpandedLevelNotesId] = useState<string | null>(null);
  const [levelNotes, setLevelNotes] = useState<{
    levelId: string;
    status: "loading" | "ready" | "missing";
    content: string | null;
  } | null>(null);
  const [selected, setSelected] = useState<Selection>({
    group: initialGroup,
    entry: initialEntry,
  });
  const [selectionInUrl, setSelectionInUrl] = useState(false);
  const [urlSyncReady, setUrlSyncReady] = useState(false);
  const mapNode = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<MarkerClusterGroup | null>(null);
  const markers = useRef<Map<string, { marker: LeafletMarker; entry: Entry }>>(new Map());
  const markerEntries = useRef<WeakMap<LeafletMarker, Entry>>(new WeakMap());
  const campaignFocusLevelIds = useRef<Set<string> | null>(null);
  const mapImageOverlay = useRef<import("leaflet").ImageOverlay.Rotated | null>(null);
  const mapImageOverlayLevelId = useRef<string | null>(null);
  const mapImageOverlayOpacity = useRef(0);
  const mapImageOverlayAnimation = useRef<number | null>(null);
  const historyMapImageOverlay = useRef<import("leaflet").ImageOverlay.Rotated | null>(null);
  const historyMapImageOverlayKey = useRef<string | null>(null);
  const historyMapImageOverlayOpacity = useRef(0);
  const historyMapImageOverlayAnimation = useRef<number | null>(null);
  const sidebarSelectionTarget = useRef<{
    bounds: [number, number][];
    maxZoom: number;
  } | null>(null);
  const markerOverlaySelectionLevelId = useRef<string | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const mediaDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const intelCard = useRef<HTMLDivElement>(null);
  const urlHistoryMode = useRef<"push" | "replace">("replace");
  const searchEditActive = useRef(false);

  const groups = data.groups;
  const games = useMemo(() => {
    const representedCodes = new Set(
      groups.flatMap((group) => group.entries.flatMap((entry) => gameCodes(entry.game))),
    );
    return data.games.filter((item) => representedCodes.has(item.code)).sort(compareGames);
  }, [groups]);
  const gameIcon = useCallback((game: Game) => {
    const externalPath = externalIconsEnabled && !failedExternalGameIcons.has(game.id)
      ? externalIconManifest?.[game.id]?.icon?.path
      : null;
    return externalPath
      ? new URL(externalPath.replace(/^\/+/, ""), document.baseURI).href
      : game.icon;
  }, [externalIconManifest, externalIconsEnabled, failedExternalGameIcons]);

  useEffect(() => {
    const applyUrl = () => {
      const urlState = parseAtlasUrl(window.location.href);
      const requestedGame = gamesById.get(urlState.gameId);
      const requestedSelection = urlState.levelId
        ? selections.find(({ entry }) => entry.levelId === urlState.levelId
          && (!urlState.locationId || entry.locationId === urlState.locationId)) ?? null
        : null;

      urlHistoryMode.current = "replace";
      searchEditActive.current = false;
      setQuery(urlState.query);
      setGame(requestedGame?.code ?? "all");
      setCountry(countryNames.has(urlState.country) ? urlState.country : "all");
      setGameCategories(new Set(urlState.categories.filter((value) => gameCategoryValues.has(value))));
      setGameEras(new Set(urlState.eras.filter((value) => gameEraValues.has(value))));
      setContinents(new Set(urlState.continents.filter((value) => continentValues.has(value))));
      setPrecisions(new Set(urlState.precisions.filter((value) => precisionValues.has(value))));
      setConfidences(new Set(urlState.confidences.filter((value) => confidenceValues.has(value))));
      setMethods(new Set(urlState.methods.filter((value) => methodValues.has(value))));
      setShowSingleplayer(urlState.showSingleplayer);
      setShowMultiplayer(urlState.showMultiplayer);
      setSelected(requestedSelection ?? { group: initialGroup, entry: initialEntry });
      setSelectionInUrl(requestedSelection !== null);
      setSelectedCampaignKey(null);
      setExpandedRegionEntryId(null);
      setExpandedLevelNotesId(null);
      setActiveHistoryOverlay(null);
      setUrlSyncReady(true);
    };

    applyUrl();
    window.addEventListener("popstate", applyUrl);
    return () => window.removeEventListener("popstate", applyUrl);
  }, []);

  useEffect(() => {
    if (!urlSyncReady) return;
    const nextUrl = atlasUrlWithState(window.location.href, {
      query,
      gameId: gamesByCode.get(game)?.id ?? "all",
      country,
      categories: [...gameCategories],
      eras: [...gameEras],
      continents: [...continents],
      precisions: [...precisions],
      confidences: [...confidences],
      methods: [...methods],
      showSingleplayer,
      showMultiplayer,
      levelId: selectionInUrl ? selected.entry.levelId : null,
      locationId: selectionInUrl ? selected.entry.locationId : null,
    });
    const currentRelativeUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const nextRelativeUrl = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    if (nextRelativeUrl !== currentRelativeUrl) {
      const method = urlHistoryMode.current === "replace" ? "replaceState" : "pushState";
      window.history[method](window.history.state, "", nextRelativeUrl);
    }
    urlHistoryMode.current = "push";
  }, [
    country,
    confidences,
    continents,
    game,
    gameCategories,
    gameEras,
    methods,
    precisions,
    query,
    selected.entry.levelId,
    selected.entry.locationId,
    selectionInUrl,
    showMultiplayer,
    showSingleplayer,
    urlSyncReady,
  ]);

  useEffect(() => {
    if (!externalIconsEnabled || externalIconManifest || externalIconManifestUnavailable) return;
    const controller = new AbortController();
    const manifestUrl = new URL("images/games_external/manifest.json", document.baseURI);
    fetch(manifestUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`External icon manifest returned ${response.status}`);
        return response.json() as Promise<ExternalIconManifest>;
      })
      .then(setExternalIconManifest)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setExternalIconManifestUnavailable(true);
      });
    return () => controller.abort();
  }, [externalIconManifest, externalIconManifestUnavailable, externalIconsEnabled]);
  const matchesStructuredFilters = useCallback((entry: Entry) => {
    const matchesGame = game === "all" || entry.game.split(" / ").includes(game);
    const matchesCategory = gameCategories.size === 0 || entry.gameIds.some((gameId) => {
      const entryGame = gamesById.get(gameId);
      return entryGame ? gameCategories.has(entryGame.category) : false;
    });
    const matchesEra = gameEras.size === 0 || entry.gameIds.some((gameId) => {
      const entryGame = gamesById.get(gameId);
      return entryGame ? gameEras.has(entryGame.era) : false;
    });
    const matchesPrecision = precisions.size === 0 || precisions.has(entry.precision);
    const matchesConfidence = confidences.size === 0
      || (entry.confidence ? confidences.has(entry.confidence) : false);
    const matchesMethod = methods.size === 0 || (entry.method ? methods.has(entry.method) : false);
    const matchesMode =
      (showSingleplayer && entry.modes.includes("singleplayer"))
      || (showMultiplayer && entry.modes.includes("multiplayer"));
    return matchesGame
      && matchesCategory
      && matchesEra
      && matchesPrecision
      && matchesConfidence
      && matchesMethod
      && matchesMode;
  }, [confidences, game, gameCategories, gameEras, methods, precisions, showMultiplayer, showSingleplayer]);
  const countries = useMemo(
    () => groups
      .map(({ name, flagCode, continent, entries }) => ({
        name,
        flagCode,
        available: (continents.size === 0 || continents.has(continent))
          && entries.some(matchesStructuredFilters),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [continents, groups, matchesStructuredFilters],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) => {
          const matchesText =
            !needle ||
            group.name.toLowerCase().includes(needle) ||
            entry.region?.toLowerCase().includes(needle) ||
            entry.city?.toLowerCase().includes(needle) ||
            entry.landmark?.toLowerCase().includes(needle) ||
            entry.title.toLowerCase().includes(needle) ||
            entry.game.toLowerCase().includes(needle);
          return matchesStructuredFilters(entry) && matchesText;
        }),
      }))
      .filter((group) => group.entries.length
        && (country === "all" || group.name === country)
        && (continents.size === 0 || continents.has(group.continent)));
  }, [continents, country, groups, matchesStructuredFilters, query]);
  const campaigns = useMemo<CampaignOption[]>(() => {
    if (game === "all") return [];
    const campaignsByKey = new Map<string, CampaignOption & { levelIds: Set<string> }>();
    for (const group of groups) {
      for (const entry of group.entries) {
        if (!entry.campaign) continue;
        const campaignGame = gamesById.get(entry.gameIds[0]);
        if (!campaignGame || campaignGame.code !== game) continue;
        const key = `${campaignGame.id}:${entry.campaign.id}`;
        let campaign = campaignsByKey.get(key);
        if (!campaign) {
          campaign = {
            key,
            gameId: campaignGame.id,
            id: entry.campaign.id,
            label: entry.campaign.label,
            levels: [],
            levelIds: new Set(),
          };
          campaignsByKey.set(key, campaign);
        }
        if (!campaign.levelIds.has(entry.levelId)) {
          campaign.levelIds.add(entry.levelId);
          campaign.levels.push({ group, entry });
        }
      }
    }
    return [...campaignsByKey.values()]
      .map(({ key, gameId, id, label, levels }) => ({
        key,
        gameId,
        id,
        label,
        levels: levels.sort((a, b) =>
          (a.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER) - (b.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
          || a.entry.title.localeCompare(b.entry.title)),
      }))
      .sort((a, b) => {
        const gameComparison = compareGames(gamesById.get(a.gameId)!, gamesById.get(b.gameId)!);
        if (gameComparison) return gameComparison;
        return (a.levels[0]?.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
          - (b.levels[0]?.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
          || a.label.localeCompare(b.label);
      });
  }, [game, groups]);
  const selectedCampaign = campaigns.find((campaign) => campaign.key === selectedCampaignKey) ?? null;
  const mapFitCoordinates = useMemo(() => {
    const seen = new Set<string>();
    return filtered.flatMap((group) => group.entries.flatMap((entry) => {
      if (!entry.coordinates) return [];
      const key = entry.coordinates.join(",");
      if (seen.has(key)) return [];
      seen.add(key);
      return [entry.coordinates];
    }));
  }, [filtered]);
  const resultCount = filtered.reduce((sum, group) => sum + group.entries.length, 0);
  const advancedFilterCount = gameCategories.size
    + gameEras.size
    + continents.size
    + precisions.size
    + confidences.size
    + methods.size
    + Number(!(showSingleplayer && !showMultiplayer));
  const resetAdvancedFilters = useCallback(() => {
    urlHistoryMode.current = "push";
    setGameCategories(new Set());
    setGameEras(new Set());
    setContinents(new Set());
    setPrecisions(new Set());
    setConfidences(new Set());
    setMethods(new Set());
    setShowSingleplayer(true);
    setShowMultiplayer(false);
  }, []);
  const spaceLocations = useMemo(
    () => filtered.flatMap((group) => group.entries
      .filter((entry) => entry.precision === "off-world")
      .map((entry) => ({ group, entry }))),
    [filtered],
  );
  const hasSpaceLocations = spaceLocations.length > 0;
  const solarSystemExpanded = solarSystemDisplay.hasSpaceLocations === hasSpaceLocations
    ? solarSystemDisplay.expanded
    : hasSpaceLocations;
  const selectedGoogleMapsUrl = googleMapsUrl(selected.entry);
  const selectedWikipediaUrl = locationUrl(selected.entry, "wikipedia");
  const selectedCallOfDutyMapsUrl = locationUrl(selected.entry, "callOfDutyMaps");
  const otherLevelLocations = useMemo(
    () => groups.flatMap((group) => group.entries
      .filter((entry) => entry.levelId === selected.entry.levelId && entry.id !== selected.entry.id)
      .map((entry) => ({ group, entry }))),
    [groups, selected.entry.id, selected.entry.levelId],
  );
  const selectedMedia = data.wikiMedia[selected.entry.wikiArticle];
  const selectedLevelBanner = failedLevelBanners.has(selected.entry.levelId)
    ? null
    : data.levelBanners[selected.entry.levelId] ?? null;
  const selectedImage = selectedLevelBanner ?? selectedMedia?.main ?? selectedMedia?.map ?? null;
  const selectedImageIsLocal = selectedImage?.origin === "local";
  const selectedImageKey = selectedImage
    ? `${selected.entry.id}:${selectedImage.thumbnailUrl}`
    : null;
  const selectedImageLoaded = selectedImageKey !== null && loadedImageKey === selectedImageKey;
  const selectedImageFailed = selectedImageKey !== null && failedImageKey === selectedImageKey;
  const regionalLevels = selected.group.entries.filter((entry, index, entries) =>
    entry.levelId !== selected.entry.levelId
    && entries.findIndex((candidate) => candidate.levelId === entry.levelId) === index);
  const relatedLevels = selectedCampaign?.levels
    ?? regionalLevels.map((entry) => ({ group: selected.group, entry }));
  const relatedLevelsExpansionKey = selectedCampaign ? `campaign:${selectedCampaign.key}` : selected.entry.id;
  const relatedLevelsExpanded = expandedRegionEntryId === relatedLevelsExpansionKey;
  const visibleRelatedLevels = relatedLevelsExpanded ? relatedLevels : relatedLevels.slice(0, 8);
  const hiddenRelatedLevelCount = relatedLevels.length - visibleRelatedLevels.length;
  const levelNotesExpanded = selected.entry.hasLevelNotes
    && expandedLevelNotesId === selected.entry.levelId;
  const selectedLevelNotes = levelNotes?.levelId === selected.entry.levelId ? levelNotes : null;
  const selectedMapOverlay = mapOverlays[selected.entry.levelId] ?? null;
  const selectedMapOverlayEnabled = selectedMapOverlay !== null && !disabledMapOverlays.has(selected.entry.levelId);
  const selectedHistoryOverlays = historyOverlays[selected.entry.levelId] ?? [];
  const selectedHistoryOverlay = activeHistoryOverlay?.levelId === selected.entry.levelId
    ? selectedHistoryOverlays.find((overlay) => overlay.id === activeHistoryOverlay.id) ?? null
    : null;

  const selectEntry = useCallback((group: Group, entry: Entry) => {
    urlHistoryMode.current = "push";
    setSelected({ group, entry });
    setSelectionInUrl(true);
    setExpandedRegionEntryId(null);
    setExpandedLevelNotesId(null);
    setActiveHistoryOverlay(null);
  }, []);

  const toggleHistoryOverlay = useCallback((overlay: HistoryOverlayRecord) => {
    const isActive = activeHistoryOverlay?.levelId === overlay.levelId
      && activeHistoryOverlay.id === overlay.id;
    if (isActive) {
      setActiveHistoryOverlay(null);
      return;
    }
    setActiveHistoryOverlay({ levelId: overlay.levelId, id: overlay.id });
    if (!map.current || !leaflet.current || !mapNode.current) return;
    const boundsCoordinates = [
      overlay.corners.topLeft,
      overlay.corners.topRight,
      overlay.corners.bottomLeft,
      overlay.corners.bottomRight,
      ...(selected.entry.coordinates ? [selected.entry.coordinates] : []),
    ];
    const movement = {
      ...mapViewportPadding(mapNode.current, intelCard.current),
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: .55,
    };
    map.current.stop();
    if (movement.animate) map.current.flyToBounds(boundsCoordinates, movement);
    else map.current.fitBounds(boundsCoordinates, movement);
  }, [activeHistoryOverlay, selected.entry.coordinates]);

  const selectSidebarGroup = useCallback((group: Group) => {
    const entry = group.entries[0];
    if (!entry) return;
    if (group.kind === "off-world") {
      setSolarSystemDisplay({ hasSpaceLocations: true, expanded: true });
    }
    const coordinates = group.entries.flatMap((candidate) => candidate.coordinates ? [candidate.coordinates] : []);
    const fallbackCoordinate = group.coordinates ?? entry.coordinates ?? null;
    const bounds = coordinates.length ? coordinates : fallbackCoordinate ? [fallbackCoordinate] : [];
    const maxZoom = group.entries.some((candidate) => ["country", "off-world"].includes(candidate.precision))
      ? 5
      : group.entries.some((candidate) => candidate.precision === "region")
        ? 6
        : group.entries.some((candidate) => candidate.precision === "city")
          ? 8
          : 10;
    sidebarSelectionTarget.current = bounds.length ? { bounds, maxZoom } : null;
    selectEntry(group, entry);
  }, [selectEntry]);

  const selectMapMarker = useCallback((group: Group, entry: Entry) => {
    markerOverlaySelectionLevelId.current = mapOverlays[entry.levelId] ? entry.levelId : null;
    selectEntry(group, entry);
  }, [selectEntry]);

  const selectCampaign = useCallback((campaign: CampaignOption) => {
    setSelectedCampaignKey((currentKey) => currentKey === campaign.key ? null : campaign.key);
    setExpandedRegionEntryId(null);
    setRelatedLevelsOpen(true);
    setDetailsOpen(true);
  }, []);

  const focusSelectedMarker = useCallback(() => {
    const currentMap = map.current;
    const layer = markerLayer.current;
    const selectedMarker = markers.current.get(selected.entry.id)?.marker;
    if (!currentMap || !layer || !selectedMarker) return;

    currentMap.stop();
    layer.zoomToShowLayer(selectedMarker, () => {
      if (map.current !== currentMap || !mapNode.current) return;
      currentMap.panInside(
        selectedMarker.getLatLng(),
        mapViewportPadding(mapNode.current, intelCard.current),
      );
    });
  }, [selected.entry.id]);

  const toggleLevelNotes = useCallback(() => {
    if (!selected.entry.hasLevelNotes) return;
    const levelId = selected.entry.levelId;
    if (expandedLevelNotesId === levelId) {
      setExpandedLevelNotesId(null);
      return;
    }
    setExpandedLevelNotesId(levelId);
    if (levelNotes?.levelId === levelId) return;
    setLevelNotes({ levelId, status: "loading", content: null });
    const notesUrl = new URL(`level-notes/${levelId}.md`, document.baseURI);
    fetch(notesUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Level notes returned ${response.status}`);
        return response.text();
      })
      .then((content) => setLevelNotes({
        levelId,
        status: content.trim() ? "ready" : "missing",
        content,
      }))
      .catch(() => setLevelNotes({ levelId, status: "missing", content: null }));
  }, [expandedLevelNotesId, levelNotes?.levelId, selected.entry.hasLevelNotes, selected.entry.levelId]);

  useEffect(() => {
    mediaDialog.current?.close();
  }, [selected.entry.id]);

  useEffect(() => {
    if (!mapNode.current || map.current) return;
    const markerStore = markers.current;
    let cancelled = false;
    import("leaflet").then(async (leafletModule) => {
      await import("leaflet.markercluster");
      await import("leaflet-imageoverlay-rotated");
      if (cancelled || !mapNode.current || map.current) return;
      // Leaflet is CommonJS. Its ESM namespace is immutable, while
      // leaflet.markercluster augments the shared default export at runtime.
      const L = leafletModule.default as unknown as typeof import("leaflet");
      const instance = L.map(mapNode.current, {
        center: [27, 8],
        zoom: 2,
        minZoom: 2,
        maxZoom: MAP_MAX_ZOOM,
        zoomControl: false,
        worldCopyJump: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: MAP_MAX_ZOOM,
      }).addTo(instance);
      L.control.zoom({ position: "bottomright" }).addTo(instance);
      map.current = instance;
      markerLayer.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 1.35,
        maxClusterRadius: 42,
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        spiderLegPolylineOptions: {
          color: "#d8bb65",
          weight: 1.5,
          opacity: .8,
        },
        iconCreateFunction(cluster) {
          const count = cluster.getChildCount();
          const size = count < 10 ? 34 : count < 100 ? 40 : 46;
          const scale = count < 10 ? "is-small" : count < 100 ? "is-medium" : "is-large";
          const focusedLevelIds = campaignFocusLevelIds.current;
          const containsCampaignLevel = !focusedLevelIds || cluster.getAllChildMarkers().some((marker) => {
            const entry = markerEntries.current.get(marker);
            return entry ? focusedLevelIds.has(entry.levelId) : false;
          });
          return L.divIcon({
            className: "atlas-cluster-wrap",
            html: `<span class="atlas-cluster ${scale}${containsCampaignLevel ? "" : " is-campaign-dimmed"}">${count}</span>`,
            iconSize: [size, size],
          });
        },
      }).addTo(instance);
      leaflet.current = L;
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markerLayer.current = null;
      markerStore.clear();
      mapImageOverlay.current = null;
      mapImageOverlayLevelId.current = null;
      if (mapImageOverlayAnimation.current !== null) cancelAnimationFrame(mapImageOverlayAnimation.current);
      mapImageOverlayAnimation.current = null;
      mapImageOverlayOpacity.current = 0;
      historyMapImageOverlay.current = null;
      historyMapImageOverlayKey.current = null;
      if (historyMapImageOverlayAnimation.current !== null) cancelAnimationFrame(historyMapImageOverlayAnimation.current);
      historyMapImageOverlayAnimation.current = null;
      historyMapImageOverlayOpacity.current = 0;
      leaflet.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !map.current || !markerLayer.current || !leaflet.current) return;
    const layer = markerLayer.current;
    const L = leaflet.current;
    layer.clearLayers();
    markers.current.clear();
    filtered.forEach((group) => {
      group.entries.forEach((entry) => {
        if (!entry.coordinates) return;
        const marker = L.marker(entry.coordinates, {
          icon: atlasMarkerIcon(L, entry, false),
          title: `${entry.title} — ${locationName(entry)}`,
          keyboard: true,
        });
        marker.on("click", () => selectMapMarker(group, entry));
        marker.bindTooltip(`${entry.title} · ${locationName(entry)}`, {
          direction: "top",
          offset: [0, -8],
        });
        markerEntries.current.set(marker, entry);
        marker.addTo(layer);
        markers.current.set(entry.id, { marker, entry });
      });
    });
  }, [filtered, mapReady, selectMapMarker]);

  useEffect(() => {
    if (!mapReady || !map.current || !leaflet.current) return;
    const currentMap = map.current;
    const L = leaflet.current;
    const focusedLevelIds = selectedCampaign
      ? new Set(selectedCampaign.levels.map(({ entry }) => entry.levelId))
      : null;
    campaignFocusLevelIds.current = focusedLevelIds;
    markers.current.forEach(({ marker, entry }) => {
      const active = entry.id === selected.entry.id;
      const campaignDimmed = focusedLevelIds !== null && !focusedLevelIds.has(entry.levelId);
      marker.setIcon(atlasMarkerIcon(L, entry, active, campaignDimmed));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
    markerLayer.current?.refreshClusters();
    const selectedIsVisible = filtered.some((group) =>
      group.entries.some((entry) => entry.id === selected.entry.id));
    if (selected.entry.coordinates && selectedIsVisible && mapNode.current) {
      const sidebarTarget = sidebarSelectionTarget.current;
      if (sidebarTarget) {
        sidebarSelectionTarget.current = null;
        const padding = mapViewportPadding(mapNode.current, intelCard.current);
        currentMap.stop();
        const movement = {
          ...padding,
          maxZoom: sidebarTarget.maxZoom,
          animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          duration: .55,
        };
        if (movement.animate) currentMap.flyToBounds(sidebarTarget.bounds, movement);
        else currentMap.fitBounds(sidebarTarget.bounds, movement);
        return;
      }
      const overlaySelectionLevelId = markerOverlaySelectionLevelId.current;
      markerOverlaySelectionLevelId.current = null;
      const markerOverlay = overlaySelectionLevelId === selected.entry.levelId
        ? mapOverlays[overlaySelectionLevelId]
        : null;
      if (markerOverlay) {
        const padding = mapViewportPadding(mapNode.current, intelCard.current);
        const size = currentMap.getSize();
        const visibleBounds = L.latLngBounds([
          currentMap.containerPointToLatLng(padding.paddingTopLeft),
          currentMap.containerPointToLatLng([
            size.x - padding.paddingBottomRight[0],
            size.y - padding.paddingBottomRight[1],
          ]),
        ]);
        const overlayAndMarkerBounds = L.latLngBounds([
          markerOverlay.corners.topLeft,
          markerOverlay.corners.topRight,
          markerOverlay.corners.bottomLeft,
          markerOverlay.corners.bottomRight,
          selected.entry.coordinates,
        ]);
        if (!visibleBounds.contains(overlayAndMarkerBounds)) {
          currentMap.stop();
          const movement = {
            ...padding,
            maxZoom: currentMap.getZoom(),
            animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            duration: .55,
          };
          if (movement.animate) currentMap.flyToBounds(overlayAndMarkerBounds, movement);
          else currentMap.fitBounds(overlayAndMarkerBounds, movement);
          return;
        }
      }
      currentMap.panInside(
        selected.entry.coordinates,
        mapViewportPadding(mapNode.current, intelCard.current),
      );
    }
  }, [filtered, mapReady, selected, selectedCampaign]);

  useEffect(() => {
    if (!mapReady || !map.current || !leaflet.current) return;
    if (!selectedMapOverlay) {
      if (mapImageOverlayAnimation.current !== null) cancelAnimationFrame(mapImageOverlayAnimation.current);
      mapImageOverlay.current?.remove();
      mapImageOverlay.current = null;
      mapImageOverlayLevelId.current = null;
      mapImageOverlayAnimation.current = null;
      mapImageOverlayOpacity.current = 0;
      return;
    }
    if (mapImageOverlay.current && mapImageOverlayLevelId.current === selected.entry.levelId) {
      animateMapOverlayOpacity(
        mapImageOverlay.current,
        selectedMapOverlayEnabled ? selectedMapOverlay.opacity : 0,
        mapImageOverlayAnimation,
        mapImageOverlayOpacity,
      );
      return;
    }
    if (mapImageOverlayAnimation.current !== null) cancelAnimationFrame(mapImageOverlayAnimation.current);
    mapImageOverlay.current?.remove();
    const L = leaflet.current;
    const imageUrl = new URL(selectedMapOverlay.image.replace(/^\/+/, ""), document.baseURI).href;
    const overlay = L.imageOverlay.rotated(
      imageUrl,
      selectedMapOverlay.corners.topLeft,
      selectedMapOverlay.corners.topRight,
      selectedMapOverlay.corners.bottomLeft,
      {
        opacity: 0,
        interactive: false,
        className: "game-map-overlay",
        alt: `${selected.entry.title} historical game map overlay`,
      },
    ).addTo(map.current);
    mapImageOverlay.current = overlay;
    mapImageOverlayLevelId.current = selected.entry.levelId;
    mapImageOverlayOpacity.current = 0;
    animateMapOverlayOpacity(
      overlay,
      selectedMapOverlayEnabled ? selectedMapOverlay.opacity : 0,
      mapImageOverlayAnimation,
      mapImageOverlayOpacity,
    );
  }, [mapReady, selected.entry.levelId, selected.entry.title, selectedMapOverlay, selectedMapOverlayEnabled]);

  useEffect(() => {
    if (!mapReady || !map.current || !leaflet.current) return;
    if (!selectedHistoryOverlay) {
      const existing = historyMapImageOverlay.current;
      if (!existing) return;
      animateMapOverlayOpacity(
        existing,
        0,
        historyMapImageOverlayAnimation,
        historyMapImageOverlayOpacity,
        () => {
          if (historyMapImageOverlay.current !== existing) return;
          existing.remove();
          historyMapImageOverlay.current = null;
          historyMapImageOverlayKey.current = null;
          historyMapImageOverlayOpacity.current = 0;
        },
      );
      return;
    }

    const overlayKey = `${selectedHistoryOverlay.levelId}:${selectedHistoryOverlay.id}`;
    if (historyMapImageOverlay.current && historyMapImageOverlayKey.current === overlayKey) {
      animateMapOverlayOpacity(
        historyMapImageOverlay.current,
        selectedHistoryOverlay.opacity,
        historyMapImageOverlayAnimation,
        historyMapImageOverlayOpacity,
      );
      return;
    }

    if (historyMapImageOverlayAnimation.current !== null) {
      cancelAnimationFrame(historyMapImageOverlayAnimation.current);
    }
    historyMapImageOverlay.current?.remove();
    const imageUrl = new URL(selectedHistoryOverlay.image.replace(/^\/+/, ""), document.baseURI).href;
    const overlay = leaflet.current.imageOverlay.rotated(
      imageUrl,
      selectedHistoryOverlay.corners.topLeft,
      selectedHistoryOverlay.corners.topRight,
      selectedHistoryOverlay.corners.bottomLeft,
      {
        opacity: 0,
        interactive: false,
        className: "history-map-overlay",
        alt: selectedHistoryOverlay.attribution.title,
      },
    ).addTo(map.current);
    historyMapImageOverlay.current = overlay;
    historyMapImageOverlayKey.current = overlayKey;
    historyMapImageOverlayOpacity.current = 0;
    animateMapOverlayOpacity(
      overlay,
      selectedHistoryOverlay.opacity,
      historyMapImageOverlayAnimation,
      historyMapImageOverlayOpacity,
    );
  }, [mapReady, selectedHistoryOverlay]);

  useEffect(() => {
    if (!mapReady || !map.current || !mapNode.current) return;
    const currentMap = map.current;
    const padding = mapViewportPadding(mapNode.current, intelCard.current);
    const animation = {
      ...padding,
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: .45,
    };

    currentMap.stop();
    if (mapFitCoordinates.length) {
      currentMap.fitBounds(mapFitCoordinates, {
        ...animation,
        maxZoom: mapFitCoordinates.length === 1 ? 6 : 7,
      });
    } else {
      currentMap.setView([27, 8], 2, {
        animate: animation.animate,
        duration: animation.duration,
      });
    }
  }, [mapFitCoordinates, mapReady]);

  useEffect(() => {
    if (!mapReady || !map.current) return;
    const refreshMapSize = () => map.current?.invalidateSize({ pan: false });
    const animationFrame = requestAnimationFrame(refreshMapSize);
    const transitionEnd = window.setTimeout(refreshMapSize, 340);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionEnd);
    };
  }, [mapReady, sidebarOpen]);

  function exportKml() {
    const placemarks = filtered.flatMap((group) => {
      return group.entries.flatMap((entry) => {
        if (!entry.coordinates) return [];
        const [lat, lng] = entry.coordinates;
        return `<Placemark><name>${escapeXml(entry.title)}</name><description>${escapeXml(
          `${entry.game} · ${locationPath(entry)} · ${entry.method === "manual-approximate" ? "approximate historical position" : entry.precision === "city" ? "city-level" : "country fallback"} · ${entry.wiki}`,
        )}</description><Point><coordinates>${lng},${lat},0</coordinates></Point></Placemark>`;
      });
    });
    const kml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>CoD Atlas</name>${placemarks.join("")}</Document></kml>`;
    const url = URL.createObjectURL(new Blob([kml], { type: "application/vnd.google-earth.kml+xml" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "call-of-duty-atlas.kml";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={`atlas-shell${sidebarOpen ? "" : " is-sidebar-collapsed"}`}>
      <header className="atlas-header">
        <div className="atlas-brand">
          <h1>
            {/* This reviewed local brand asset does not need runtime image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/banner.png" width="790" height="153" alt="CoD Atlas" />
          </h1>
          <p>Real-world geography of the series</p>
        </div>
        <div className="header-stat">
          <strong>{data.totals.entries}</strong>
          <span>locations</span>
        </div>
        <button className="settings-button" type="button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.1 5.1v-3.2l-2.3-.7a7 7 0 0 0-.7-1.6l1.1-2.2-2.2-2.2-2.2 1.1a7 7 0 0 0-1.6-.7L11.5 2H8.4l-.7 2.3a7 7 0 0 0-1.6.7L3.9 3.9 1.7 6.1l1.1 2.2a7 7 0 0 0-.7 1.6L0 10.5v3.1l2.3.7a7 7 0 0 0 .7 1.6l-1.1 2.2 2.2 2.2 2.2-1.1a7 7 0 0 0 1.6.7l.7 2.3h3.1l.7-2.3a7 7 0 0 0 1.6-.7l2.2 1.1 2.2-2.2-1.1-2.2a7 7 0 0 0 .7-1.6l2.2-.7Z" />
          </svg>
        </button>
      </header>

      {settingsOpen && (
        <section className="settings-page" aria-labelledby="settings-title">
          <div className="settings-surface">
            <header>
              <h2 id="settings-title">Settings</h2>
              <button type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}>×</button>
            </header>
            <div className="settings-content">
              <section className="settings-group">
                <div className="settings-copy">
                  <h3>External game icons</h3>
                  <p>Use imported icons when available; local icons remain the fallback.</p>
                  {externalIconsEnabled && externalIconManifestUnavailable && <small className="is-warning">External icons are unavailable in this build; local icons are still active.</small>}
                </div>
                <button
                  className={`settings-switch${externalIconsEnabled ? " is-enabled" : ""}`}
                  type="button"
                  role="switch"
                  aria-checked={externalIconsEnabled}
                  onClick={() => setExternalIconsEnabled(!externalIconsEnabled)}
                >
                  <span aria-hidden="true" />
                  <b>{externalIconsEnabled ? "On" : "Off"}</b>
                </button>
              </section>
              <p className="settings-note">This preference is stored only in this browser.</p>
            </div>
          </div>
        </section>
      )}

      <aside className="atlas-sidebar" aria-label="Map filters">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => {
              urlHistoryMode.current = searchEditActive.current ? "replace" : "push";
              searchEditActive.current = true;
              setQuery(event.target.value);
            }}
            onBlur={() => {
              searchEditActive.current = false;
            }}
            placeholder="Search missions, maps, countries…"
            aria-label="Search locations"
          />
        </label>

        <div className="filter-grid">
          <div className="filter-field game-filter">
            <span>Game <small>Oldest to newest</small></span>
            <GameSelect
              games={games}
              value={game}
              onValueChange={(value) => {
                urlHistoryMode.current = "push";
                setGame(value);
                setSelectedCampaignKey(null);
                setExpandedRegionEntryId(null);
                if (value === "all") setSidebarListMode("locations");
              }}
            />
          </div>
          <div className="filter-field">
            <span>Country</span>
            <CountrySelect
              countries={countries}
              value={country}
              onValueChange={(value) => {
                urlHistoryMode.current = "push";
                setCountry(value);
              }}
            />
          </div>
        </div>

        {advancedFiltersOpen ? (
          <section className="advanced-filters" aria-labelledby="advanced-filters-title">
            <header className="advanced-filters-header">
              <button
                className="advanced-filters-back"
                type="button"
                aria-label="Close advanced filters"
                onClick={() => setAdvancedFiltersOpen(false)}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" /></svg>
              </button>
              <div>
                <span>Filter matrix</span>
                <h2 id="advanced-filters-title">Advanced filters</h2>
              </div>
              <button
                className="advanced-filters-reset"
                type="button"
                disabled={advancedFilterCount === 0}
                onClick={resetAdvancedFilters}
              >
                Reset
              </button>
            </header>

            <div className="advanced-filters-scroll">
              <AdvancedFilterGroup
                title="Game category"
                options={gameCategoryOptions}
                selected={gameCategories}
                onToggle={(value) => {
                  urlHistoryMode.current = "push";
                  setGameCategories((current) => toggledFilterValue(current, value));
                }}
                onClear={() => {
                  urlHistoryMode.current = "push";
                  setGameCategories(new Set());
                }}
              />
              <AdvancedFilterGroup
                title="Era"
                options={gameEraOptions}
                selected={gameEras}
                sourceUrl="https://github.com/time-wasters/cod-atlas/issues/11"
                onToggle={(value) => {
                  urlHistoryMode.current = "push";
                  setGameEras((current) => toggledFilterValue(current, value));
                }}
                onClear={() => {
                  urlHistoryMode.current = "push";
                  setGameEras(new Set());
                }}
              />
              <AdvancedFilterGroup
                title="Continent"
                options={continentOptions}
                selected={continents}
                onToggle={(value) => {
                  urlHistoryMode.current = "push";
                  setContinents((current) => toggledFilterValue(current, value));
                }}
                onClear={() => {
                  urlHistoryMode.current = "push";
                  setContinents(new Set());
                }}
              />

              <section className="advanced-filter-group">
                <header><h3>Mode</h3></header>
                <div className="mode-filter advanced-mode-filter" aria-label="Game mode visibility">
                  <button
                    className={showSingleplayer ? "is-active" : ""}
                    type="button"
                    aria-pressed={showSingleplayer}
                    onClick={() => {
                      urlHistoryMode.current = "push";
                      setShowSingleplayer((visible) => !visible);
                    }}
                  >
                    <span aria-hidden="true">{showSingleplayer ? "✓" : "○"}</span> Singleplayer
                  </button>
                  <button
                    className={showMultiplayer ? "is-active" : ""}
                    type="button"
                    aria-pressed={showMultiplayer}
                    onClick={() => {
                      urlHistoryMode.current = "push";
                      setShowMultiplayer((visible) => !visible);
                    }}
                  >
                    <span aria-hidden="true">{showMultiplayer ? "✓" : "○"}</span> Multiplayer
                  </button>
                  <button type="button" disabled aria-pressed="false" title="Zombies filtering will be added later">
                    <span aria-hidden="true">○</span> Zombies <small>Later</small>
                  </button>
                </div>
              </section>

              <AdvancedFilterGroup
                title="Precision"
                options={precisionOptions}
                selected={precisions}
                onToggle={(value) => {
                  urlHistoryMode.current = "push";
                  setPrecisions((current) => toggledFilterValue(current, value));
                }}
                onClear={() => {
                  urlHistoryMode.current = "push";
                  setPrecisions(new Set());
                }}
              />
              <AdvancedFilterGroup
                title="Confidence"
                options={confidenceOptions}
                selected={confidences}
                onToggle={(value) => {
                  urlHistoryMode.current = "push";
                  setConfidences((current) => toggledFilterValue(current, value));
                }}
                onClear={() => {
                  urlHistoryMode.current = "push";
                  setConfidences(new Set());
                }}
              />
              <AdvancedFilterGroup
                title="Method"
                options={methodOptions}
                selected={methods}
                onToggle={(value) => {
                  urlHistoryMode.current = "push";
                  setMethods((current) => toggledFilterValue(current, value));
                }}
                onClear={() => {
                  urlHistoryMode.current = "push";
                  setMethods(new Set());
                }}
              />
            </div>

            <button className="advanced-filters-results" type="button" onClick={() => setAdvancedFiltersOpen(false)}>
              Show <strong>{resultCount}</strong> results
            </button>
          </section>
        ) : (
          <>
            <button
              className={`advanced-filter-trigger${advancedFilterCount ? " is-active" : ""}`}
              type="button"
              aria-expanded="false"
              onClick={() => setAdvancedFiltersOpen(true)}
            >
              <span>
                <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M5 9h8M7 13h4" /></svg>
                Advanced filters
              </span>
              <strong>{advancedFilterCount || "All"}</strong>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
            </button>

            <section className="result-panel" aria-live="polite">
          <div><strong>{resultCount}</strong><span>results</span></div>
          <dl>
            <div><dt>Localized</dt><dd>{filtered.flatMap((item) => item.entries).filter((item) => !["country", "off-world"].includes(item.precision)).length}</dd></div>
            <div><dt>Fallback</dt><dd>{filtered.flatMap((item) => item.entries).filter((item) => item.precision === "country").length}</dd></div>
            <div><dt>Regions</dt><dd>{filtered.length}</dd></div>
          </dl>
        </section>

        <button className="kml-button" onClick={exportKml}>↓ Export filtered KML for Google Maps</button>

        <section className="mission-list">
          <div className="sidebar-list-switch" role="tablist" aria-label="Browse atlas data">
            <button
              className={sidebarListMode === "locations" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={sidebarListMode === "locations"}
              aria-controls="sidebar-locations"
              onClick={() => {
                setSidebarListMode("locations");
                setSelectedCampaignKey(null);
                setExpandedRegionEntryId(null);
              }}
            >
              <span>Locations</span><small>{filtered.length}</small>
            </button>
            <button
              className={sidebarListMode === "campaigns" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={sidebarListMode === "campaigns"}
              aria-controls="sidebar-campaigns"
              disabled={game === "all"}
              title={game === "all" ? "Choose a game to browse campaigns" : undefined}
              onClick={() => setSidebarListMode("campaigns")}
            >
              <span>Campaigns</span><small>{campaigns.length}</small>
            </button>
          </div>
          {sidebarListMode === "locations" ? (
            <div className="scroll-list" id="sidebar-locations" role="tabpanel">
              {filtered.map((group, index) => (
                <button
                  key={`${group.name}-${index}`}
                  className={group.name === selected.group.name ? "location-row is-selected" : "location-row"}
                  onClick={() => selectSidebarGroup(group)}
                >
                  <i className="location-marker-icon" aria-hidden="true" />
                  <span><b>{group.name}</b><small>{group.entries.length} appearances</small></span>
                  <em>{group.coordinates ? "MAP" : "ORBIT"}</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="scroll-list" id="sidebar-campaigns" role="tabpanel">
              {campaigns.map((campaign, index) => (
                <button
                  key={campaign.key}
                  className={campaign.key === selectedCampaignKey ? "campaign-row is-selected" : "campaign-row"}
                  type="button"
                  onClick={() => selectCampaign(campaign)}
                >
                  <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                  <span>
                    <b>{campaign.label}</b>
                    <small>{campaign.levels.length} levels</small>
                  </span>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
                </button>
              ))}
              {campaigns.length === 0 && (
                <p className="campaign-list-empty">No campaign data is available for this game.</p>
              )}
            </div>
          )}
        </section>

        <footer>
          <p className="creator-credit">Made with ♥️ by <a href="https://github.com/plp-gtr" target="_blank" rel="noreferrer">plp-GTR</a></p>
          <p className="source-credit">
            Inspired by <a className="icon-link" href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">
              u/robracer97
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
              </svg>
            </a>
            &nbsp;·&nbsp;
            <a className="icon-link" href="https://github.com/time-wasters/cod-atlas" target="_blank" rel="noreferrer">
              Source code
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.87c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>
            &nbsp;·&nbsp;
            <button className="icon-link footer-info-button" type="button" onClick={() => infoDialog.current?.showModal()}>
              Info
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" /><path d="M8 7v4M8 4.5h.01" />
              </svg>
            </button>
          </p>
            </footer>
          </>
        )}
        <button
          className="sidebar-toggle"
          type="button"
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Hide map filters" : "Show map filters"}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <svg viewBox="0 0 12 18" aria-hidden="true">
            <path d={sidebarOpen ? "m8 3-5 6 5 6" : "m4 3 5 6-5 6"} />
          </svg>
        </button>
      </aside>

      <dialog
        ref={infoDialog}
        className="project-info-dialog"
        aria-labelledby="project-info-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="project-info-content">
          <header>
            <h2 id="project-info-title">About CoD Atlas</h2>
            <form method="dialog">
              <button aria-label="Close project information"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
            </form>
          </header>
          <p>This website was made by me, <a href="https://github.com/plp-gtr" target="_blank" rel="noreferrer">Philipp Gächter</a>.</p>
          <p>It is a pure hobby project that resulted from the urge to start the Call of Duty series from the first game and play all major instances, especially the console games I missed when I was young.</p>
          <p>While playing I was scouting the locations on Google Streetview and Maps to see how accurate the game is and out of pure interest.</p>
          <p>When searching for a map of all CoD levels in real life, I stumbled across the map from <a href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">u/robracer97</a>. Unfortunately it is not dynamic or zoomable, so I&apos;ve started this project.</p>
          <p>Have fun!</p>
        </div>
      </dialog>

      <section className="map-stage" aria-label="Interactive world map">
        <div ref={mapNode} className="map-canvas" />
        <div className="map-grid" aria-hidden="true" />
        <div className="map-label" aria-hidden="true">TACTICAL GEOGRAPHY // GLOBAL</div>

        <SolarSystemOverlay
          locations={spaceLocations}
          selectedEntryId={selected.entry.id}
          expanded={solarSystemExpanded}
          onExpandedChange={(expanded) => setSolarSystemDisplay({ hasSpaceLocations, expanded })}
          onSelect={selectEntry}
        />

        {detailsOpen && levelNotesExpanded && (
          <aside id="selected-level-briefing" className="level-briefing-pane" aria-labelledby="level-briefing-title">
            <header>
              <div>
                <span>Level briefing</span>
                <h2 id="level-briefing-title">{selected.entry.title}</h2>
              </div>
              <button type="button" aria-label="Close level briefing" onClick={toggleLevelNotes}>×</button>
            </header>
            <div className="level-briefing-content">
              {selectedLevelNotes?.status === "loading" && <p className="level-briefing-state">Loading briefing…</p>}
              {selectedLevelNotes?.status === "missing" && <p className="level-briefing-state">No briefing has been written for this level yet.</p>}
              {selectedLevelNotes?.status === "ready" && selectedLevelNotes.content && (
                <ReactMarkdown
                  components={{
                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
                    img: ({ src = "", alt = "" }) => {
                      const historyOverlay = selectedHistoryOverlays.find(
                        (overlay) => imageBasename(overlay.image) === imageBasename(src),
                      );
                      if (!historyOverlay) {
                        // Markdown images are authored content and cannot use the Next image optimizer.
                        // eslint-disable-next-line @next/next/no-img-element
                        return <img src={src} alt={alt} />;
                      }
                      const isActive = selectedHistoryOverlay?.id === historyOverlay.id;
                      const action = isActive ? "Hide from map" : "Show on map";
                      const imageUrl = new URL(historyOverlay.image.replace(/^\/+/, ""), document.baseURI).href;
                      return (
                        <button
                          className={`history-overlay-image${isActive ? " is-active" : ""}`}
                          type="button"
                          aria-pressed={isActive}
                          aria-label={`${action}: ${historyOverlay.attribution.title}`}
                          title={`${action}: ${historyOverlay.attribution.title}`}
                          onClick={() => toggleHistoryOverlay(historyOverlay)}
                        >
                          {/* Repository-hosted research figures do not use the Next image optimizer. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt={alt || historyOverlay.attribution.title} />
                          <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
                            {action}
                          </span>
                        </button>
                      );
                    },
                  }}
                >
                  {selectedLevelNotes.content}
                </ReactMarkdown>
              )}
            </div>
          </aside>
        )}

        <div
          className={`intel-column${detailsOpen ? "" : " is-collapsed"}${detailsOpen && levelNotesExpanded ? " has-open-briefing" : ""}`}
          ref={intelCard}
        >
        <button
          className="details-toggle"
          type="button"
          aria-expanded={detailsOpen}
          aria-controls="selected-level-details"
          aria-label={detailsOpen ? "Hide level details" : "Show level details"}
          onClick={() => setDetailsOpen((open) => !open)}
        >
          <svg viewBox="0 0 12 18" aria-hidden="true">
            <path d={detailsOpen ? "m4 3 5 6-5 6" : "m8 3-5 6 5 6"} />
          </svg>
        </button>
        <button
          className="collapsed-level-title"
          type="button"
          aria-label={`Show details for ${selected.entry.title}`}
          onClick={() => setDetailsOpen(true)}
        >
          <span>{selected.entry.title}</span>
        </button>
        <article className="intel-card" id="selected-level-details">
          <div className="mission-heading">
            <LevelModeIcon multiplayer={selected.entry.modes.includes("multiplayer")} />
            <FittedLevelTitle
              disabled={!selected.entry.coordinates}
              onActivate={focusSelectedMarker}
            >
              {selected.entry.title}
            </FittedLevelTitle>
            <div className="mission-games">
              {selected.entry.gameIds.map((gameId) => {
                const selectedGame = gamesById.get(gameId);
                if (!selectedGame) return null;
                const selectedGameIcon = gameIcon(selectedGame);
                const usesExternalGameIcon = Boolean(selectedGameIcon && selectedGameIcon !== selectedGame.icon);
                return selectedGameIcon ? (
                  // Game icons are reviewed local public assets and do not need image optimization.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={`mission-game-icon${usesExternalGameIcon ? " is-external" : ""}`}
                    key={gameId}
                    src={selectedGameIcon}
                    alt={selectedGame.label}
                    title={selectedGame.label}
                    onError={() => {
                      if (usesExternalGameIcon) {
                        setFailedExternalGameIcons((failed) => new Set(failed).add(gameId));
                      }
                    }}
                  />
                ) : (
                  <span className="mission-game-name" key={gameId}>{selectedGame.label}</span>
                );
              })}
            </div>
          </div>
          {selectedImage && (
            <figure className="intel-media" key={selectedImageKey}>
              {!selectedImageLoaded && (
                <span className="media-load-state" role="status">
                  {selectedImageFailed ? "Image unavailable" : "Loading image…"}
                </span>
              )}
              {/* Local reviewed banners take precedence; Wiki thumbnails remain the fallback. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={selectedImageLoaded ? "is-loaded" : ""}
                src={selectedImage.thumbnailUrl}
                alt={`${selected.entry.title} level banner`}
                referrerPolicy={selectedImageIsLocal ? undefined : "no-referrer"}
                onLoad={() => setLoadedImageKey(selectedImageKey)}
                onError={() => {
                  setFailedImageKey(selectedImageKey);
                  if (selectedImageIsLocal) {
                    setFailedLevelBanners((failed) => new Set(failed).add(selected.entry.levelId));
                  }
                }}
              />
              <button
                className="media-info-button"
                type="button"
                aria-label="Show image copyright and attribution information"
                title="Image information"
                onClick={() => mediaDialog.current?.showModal()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 10.8v6M12 7.2h.01" />
                </svg>
              </button>
            </figure>
          )}
          <div className="intel-location-row">
            <div className="intel-kicker">
              {selected.group.flagCode ? (
                <span
                  className={`flag:${selected.group.flagCode} intel-country-flag`}
                  role="img"
                  aria-label={`${selected.entry.country} flag`}
                />
              ) : (
                <svg className="intel-country-fallback" viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="6.5" />
                </svg>
              )}
              <span className="intel-country-name">{selected.entry.country}</span>
            </div>
            {selectedMapOverlay && (
              <button
                className={`map-overlay-toggle${selectedMapOverlayEnabled ? " is-enabled" : ""}`}
                type="button"
                aria-pressed={selectedMapOverlayEnabled}
                aria-label={`${selectedMapOverlayEnabled ? "Hide" : "Show"} game map overlay`}
                title={`${selectedMapOverlayEnabled ? "Hide" : "Show"} game map overlay`}
                onClick={() => setDisabledMapOverlays((disabled) => {
                  const next = new Set(disabled);
                  if (selectedMapOverlayEnabled) next.add(selected.entry.levelId);
                  else next.delete(selected.entry.levelId);
                  return next;
                })}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
              </button>
            )}
          </div>
          {(selected.entry.region || selected.entry.city || selected.entry.landmark) && (
            <div className="location-taxonomy" aria-label="Location hierarchy">
              {selected.entry.region && (
                <div className="taxonomy-tier is-region"><span>Region</span><strong>{selected.entry.region}</strong></div>
              )}
              {selected.entry.city && (
                <div className="taxonomy-tier is-city"><span>City</span><strong>{selected.entry.city}</strong></div>
              )}
              {selected.entry.landmark && (
                <div className="taxonomy-tier is-landmark"><span>Landmark</span><strong>{selected.entry.landmark}</strong></div>
              )}
            </div>
          )}
          <div className={`precision-badge ${selected.entry.precision === "approximate" ? "is-approximate" : !["country", "off-world"].includes(selected.entry.precision) ? "is-city" : "is-country"}`}>
            {selected.entry.precision === "approximate" ? "Approximate historical position" : !["country", "off-world"].includes(selected.entry.precision) ? `Localized · ${selected.entry.confidence} confidence` : selected.entry.precision === "off-world" ? "Off-world location" : "No city evidence · country fallback"}
          </div>
          {otherLevelLocations.length > 0 && (
            <div className="related-level-locations" aria-label="Other locations in this level">
              {otherLevelLocations.map(({ group, entry }) => (
                <div className="related-level-location" key={entry.id}>
                  <div className="intel-kicker">
                    {group.flagCode ? (
                      <span
                        className={`flag:${group.flagCode} intel-country-flag`}
                        role="img"
                        aria-label={`${entry.country} flag`}
                      />
                    ) : (
                      <svg
                        className="intel-country-fallback"
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                      >
                        <circle cx="9" cy="9" r="6.5" />
                      </svg>
                    )}
                    <span className="intel-country-name">{entry.country}</span>
                  </div>
                  {(entry.region || entry.city || entry.landmark) && (
                    <div className="location-taxonomy">
                      {entry.region && (
                        <div className="taxonomy-tier is-region"><span>Region</span><strong>{entry.region}</strong></div>
                      )}
                      {entry.city && (
                        <div className="taxonomy-tier is-city"><span>City</span><strong>{entry.city}</strong></div>
                      )}
                      {entry.landmark && (
                        <div className="taxonomy-tier is-landmark"><span>Landmark</span><strong>{entry.landmark}</strong></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="place-links" aria-label="External place links">
            {selectedGoogleMapsUrl && (
              <a
                href={selectedGoogleMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in Google Maps"
                title="Google Maps"
              >
                <ExternalLinkIcon name="googleMaps" />
                <span>Google Maps</span>
              </a>
            )}
            {selectedWikipediaUrl && (
              <a
                href={selectedWikipediaUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Wikipedia"
                title="Wikipedia"
              >
                <ExternalLinkIcon name="wikipedia" />
                <span>Wikipedia</span>
              </a>
            )}
            {selectedCallOfDutyMapsUrl && (
              <a
                href={selectedCallOfDutyMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open this map on Call of Duty Maps"
                title="Call of Duty Maps"
              >
                <ExternalLinkIcon name="callOfDutyMaps" />
                <span>CoD Maps</span>
              </a>
            )}
            <a
              href={selected.entry.wiki}
              target="_blank"
              rel="noreferrer"
              aria-label="Open on Call of Duty Wiki"
              title="Call of Duty Wiki"
            >
              <ExternalLinkIcon name="fandom" />
              <span>CoD Wiki</span>
            </a>
          </div>
          <section className="level-briefing">
            <button
              className="level-briefing-toggle"
              type="button"
              aria-expanded={levelNotesExpanded}
              aria-controls={selected.entry.hasLevelNotes ? "selected-level-briefing" : undefined}
              onClick={toggleLevelNotes}
              disabled={!selected.entry.hasLevelNotes}
              title={selected.entry.hasLevelNotes ? undefined : "No level briefing available"}
            >
              <b aria-hidden="true">{levelNotesExpanded ? "›" : "‹"}</b>
              <span>
                <small>Level briefing</small>
                <strong>{selected.entry.hasLevelNotes ? "Research & historical context" : "No briefing available"}</strong>
              </span>
            </button>
          </section>
        </article>
        {relatedLevels.length > 0 && (
          <aside className={`related-levels-panel${relatedLevelsOpen ? "" : " is-collapsed"}`} aria-label={selectedCampaign ? `${selectedCampaign.label} levels` : "Related levels"}>
            <button
              className="related-levels-toggle"
              type="button"
              aria-expanded={relatedLevelsOpen}
              aria-controls="related-level-list"
              onClick={() => setRelatedLevelsOpen((open) => !open)}
            >
              <span>{selectedCampaign?.label ?? "Related levels"}</span>
              <small>{relatedLevels.length}</small>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            {relatedLevelsOpen && (
              <div
                className={`intel-entries${relatedLevelsExpanded ? " is-expanded" : ""}`}
                id="related-level-list"
              >
                {visibleRelatedLevels.map(({ group, entry }) => (
                  <div className={`intel-entry${entry.levelId === selected.entry.levelId ? " is-selected" : ""}`} key={entry.levelId}>
                    <button onClick={() => selectEntry(group, entry)}><strong>{entry.title}</strong><span>{locationName(entry)} · {entry.game}</span></button>
                    <a href={entry.wiki} target="_blank" rel="noreferrer" aria-label={`Open ${entry.title} on CoD Wiki`}>↗</a>
                  </div>
                ))}
                {hiddenRelatedLevelCount > 0 && (
                  <button
                    className="more-row"
                    type="button"
                    aria-expanded="false"
                    aria-controls="related-level-list"
                    onClick={() => setExpandedRegionEntryId(relatedLevelsExpansionKey)}
                  >
                    + {hiddenRelatedLevelCount} more {hiddenRelatedLevelCount === 1 ? "level" : "levels"} in this {selectedCampaign ? "campaign" : "region"}
                  </button>
                )}
                {relatedLevelsExpanded && relatedLevels.length > 8 && (
                  <button
                    className="more-row is-collapse"
                    type="button"
                    aria-expanded="true"
                    aria-controls="related-level-list"
                    onClick={() => setExpandedRegionEntryId(null)}
                  >
                    Show fewer
                  </button>
                )}
              </div>
            )}
          </aside>
        )}
        </div>

        {selectedImage && (
          <dialog
            ref={mediaDialog}
            className="media-info-dialog"
            aria-labelledby="media-info-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) event.currentTarget.close();
            }}
          >
            <div className="media-info-content">
              <header>
                <div>
                  <span>{selectedImage.rights.status === "non-free" ? "Copyrighted media" : selectedImage.rights.status === "licensed" ? "Licensed media" : "Wiki media"}</span>
                  <h2 id="media-info-title">Image information</h2>
                </div>
                <form method="dialog">
                  <button aria-label="Close image information"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
                </form>
              </header>
              {selectedImage.rights.notice && (
                <div className="media-rights-notice">{selectedImage.rights.notice}</div>
              )}
              <dl>
                {selectedImage.author.name && selectedImage.author.userUrl && (
                  <div>
                    <dt>{selectedImageIsLocal ? "Captured by" : selectedImage.author.role === "uploader" ? "Uploaded by" : "Author"}</dt>
                    <dd><a href={selectedImage.author.userUrl} target="_blank" rel="noreferrer">{selectedImage.author.name}</a></dd>
                  </div>
                )}
                {selectedImage.license.name && selectedImage.license.url && (
                  <div>
                    <dt>License</dt>
                    <dd><a href={selectedImage.license.url} target="_blank" rel="noreferrer">{selectedImage.license.name}</a></dd>
                  </div>
                )}
                {selectedImage.rights.noticeUrl && (
                  <div>
                    <dt>Rights notice</dt>
                    <dd><a href={selectedImage.rights.noticeUrl} target="_blank" rel="noreferrer">{selectedImageIsLocal ? "Rights terms" : "Read on CoD Wiki"}</a></dd>
                  </div>
                )}
                <div>
                  <dt>Source</dt>
                  <dd><a href={selectedImage.detailPageUrl} target="_blank" rel="noreferrer">{selectedImageIsLocal ? "Open repository image" : "Open file page"}</a></dd>
                </div>
              </dl>
              <p className="media-notice-credit">{selectedImageIsLocal
                ? "Image extracted or captured by plp-gtr; the underlying game artwork remains subject to its original copyright."
                : "Notice reproduced from the Call of Duty Wiki; the image remains subject to its original copyright status."}</p>
            </div>
          </dialog>
        )}
      </section>
    </main>
  );
}
