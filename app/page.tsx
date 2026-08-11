"use client";

import type { Map as LeafletMap, Marker as LeafletMarker, MarkerClusterGroup } from "leaflet";
import * as Select from "@radix-ui/react-select";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import ReactMarkdown from "react-markdown";
import atlasSource from "./data/atlas.generated.json";
import mapOverlaysSource from "./data/map-overlays.generated.json";

type Entry = {
  id: string;
  levelId: string;
  locationId: string;
  title: string;
  game: string;
  gameIds: string[];
  wiki: string;
  country: string;
  region?: string | null;
  city?: string | null;
  landmark?: string | null;
  coordinates?: [number, number] | null;
  precision: "exact" | "approximate" | "city" | "region" | "country" | "off-world";
  confidence?: "high" | "medium" | "fallback";
  method?: string;
  urls?: Partial<Record<"googleMaps" | "wikipedia", string>>[];
  modes: ("singleplayer" | "multiplayer")[];
};

type WikiImage = {
  sourceUrl: string;
  thumbnailUrl: string;
  detailPageUrl: string;
  author: {
    name: string;
    userUrl: string;
    role: "author" | "uploader";
  };
  license: {
    name: string | null;
    url: string | null;
  };
  rights: {
    status: "licensed" | "non-free";
    notice: string | null;
    noticeUrl: string | null;
  };
};

type WikiMedia = {
  main: WikiImage | null;
  map: WikiImage | null;
};

function locationUrl(entry: Entry, provider: "googleMaps" | "wikipedia") {
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

function atlasMarkerIcon(L: typeof import("leaflet"), entry: Entry, active: boolean) {
  const cityLevel = !["country", "off-world"].includes(entry.precision);
  return L.divIcon({
    className: "atlas-marker-wrap",
    html: `<span class="atlas-marker ${cityLevel ? "is-city" : "is-country"}${active ? " is-active" : ""}"><b></b></span>`,
    iconSize: [active ? 30 : 18, active ? 30 : 18],
    iconAnchor: [active ? 15 : 9, active ? 15 : 9],
  });
}

type Group = {
  name: string;
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
  icon?: string;
};
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
type AtlasData = {
  games: Game[];
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

const data = atlasSource as AtlasData;
const mapOverlays = mapOverlaysSource as Record<string, MapOverlayRecord>;
const gamesById = new Map(data.games.map((game) => [game.id, game]));
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
const EXTERNAL_LINK_ICON_PATHS = {
  googleMaps: "M19.527 4.799c1.212 2.608.937 5.678-.405 8.173-1.101 2.047-2.744 3.74-4.098 5.614-.619.858-1.244 1.75-1.669 2.727-.141.325-.263.658-.383.992-.121.333-.224.673-.34 1.008-.109.314-.236.684-.627.687h-.007c-.466-.001-.579-.53-.695-.887-.284-.874-.581-1.713-1.019-2.525-.51-.944-1.145-1.817-1.79-2.671L19.527 4.799zM8.545 7.705l-3.959 4.707c.724 1.54 1.821 2.863 2.871 4.18.247.31.494.622.737.936l4.984-5.925-.029.01c-1.741.601-3.691-.291-4.392-1.987a3.377 3.377 0 0 1-.209-.716c-.063-.437-.077-.761-.004-1.198l.001-.007zM5.492 3.149l-.003.004c-1.947 2.466-2.281 5.88-1.117 8.77l4.785-5.689-.058-.05-3.607-3.035zM14.661.436l-3.838 4.563a.295.295 0 0 1 .027-.01c1.6-.551 3.403.15 4.22 1.626.176.319.323.683.377 1.045.068.446.085.773.012 1.22l-.003.016 3.836-4.561A8.382 8.382 0 0 0 14.67.439l-.009-.003zM9.466 5.868L14.162.285l-.047-.012A8.31 8.31 0 0 0 11.986 0a8.439 8.439 0 0 0-6.169 2.766l-.016.018 3.665 3.084z",
  wikipedia: "M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.436 0 .135.053.33.166.601 1.082 2.646 4.818 10.521 4.818 10.521l.136.046 2.411-4.81-.482-1.067-1.658-3.264s-.318-.654-.428-.872c-.728-1.443-.712-1.518-1.447-1.617-.207-.023-.313-.05-.313-.149v-.468l.06-.045h4.292l.113.037v.451c0 .105-.076.15-.227.15l-.308.047c-.792.061-.661.381-.136 1.422l1.582 3.252 1.758-3.504c.293-.64.233-.801.111-.947-.07-.084-.305-.22-.812-.24l-.201-.021c-.052 0-.098-.015-.145-.051-.045-.031-.067-.076-.067-.129v-.427l.061-.045c1.247-.008 4.043 0 4.043 0l.059.045v.436c0 .121-.059.178-.193.178-.646.03-.782.095-1.023.439-.12.186-.375.589-.646 1.039l-2.301 4.273-.065.135 2.792 5.712.17.048 4.396-10.438c.154-.422.129-.722-.064-.895-.197-.172-.346-.273-.857-.295l-.42-.016c-.061 0-.105-.014-.152-.045-.043-.029-.072-.075-.072-.119v-.436l.059-.045h4.961l.041.045v.437c0 .119-.074.18-.209.18-.648.03-1.127.18-1.443.421-.314.255-.557.616-.736 1.067 0 0-4.043 9.258-5.426 12.339-.525 1.007-1.053.917-1.503-.031-.571-1.171-1.773-3.786-2.646-5.71l.053-.036z",
  fandom: "M22.192 11.317c0 .2-.08.392-.222.533l-9.28 9.306a.686.686 0 0 1-.512.224.743.743 0 0 1-.534-.225l-.654-.614a.284.284 0 0 1-.007-.41l10.713-10.72c.182-.182.497-.054.497.201v1.706zm-11.904 7.018-.532.475a.445.445 0 0 1-.604-.014l-7.065-6.897a.918.918 0 0 1-.277-.66V9.952c0-.464.566-.698.9-.371l7.499 7.322c.13.13.35.396.35.717 0 .205-.047.495-.27.717zM3.973 4.987l2.431-2.402a.292.292 0 0 1 .41 0l8.139 8.045a2.19 2.19 0 0 1 0 3.12l-2.43 2.401a.293.293 0 0 1-.408 0l-8.14-8.047a2.172 2.172 0 0 1-.65-1.56c0-.59.23-1.144.648-1.557zm9.632 1.375 2.54-2.51a2.241 2.241 0 0 1 1.897-.623c.5.068.956.326 1.313.679l2.571 2.542a.284.284 0 0 1 0 .406l-3.91 3.867a.29.29 0 0 1-.41 0l-4.001-3.956a.285.285 0 0 1 0-.405zM23.7 5.885 18.04.19a.603.603 0 0 0-.852-.002l-4.493 4.485a.898.898 0 0 1-1.262.002L6.94.237a.603.603 0 0 0-.842-.002L.31 5.871c-.2.194-.31.458-.31.733v5.34c0 .271.11.534.305.726l11.277 11.145a.603.603 0 0 0 .846 0L23.696 12.67c.194-.193.304-.455.304-.727V6.606c0-.27-.106-.529-.298-.72z",
} as const;

function ExternalLinkIcon({ name }: { name: keyof typeof EXTERNAL_LINK_ICON_PATHS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={EXTERNAL_LINK_ICON_PATHS[name]} />
    </svg>
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

function FittedLevelTitle({ children }: { children: string }) {
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

  return <h2 ref={title}>{children}</h2>;
}

function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
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
  id: Exclude<SolarTargetId, "moon" | "europa" | "titan" | "deep-space">;
  name: string;
  x: number;
  radius: number;
};

const solarBodies: SolarBody[] = [
  { id: "mercury", name: "Mercury", x: 82, radius: 3 },
  { id: "venus", name: "Venus", x: 123, radius: 5 },
  { id: "earth", name: "Earth", x: 168, radius: 5 },
  { id: "mars", name: "Mars", x: 213, radius: 4 },
  { id: "jupiter", name: "Jupiter", x: 267, radius: 14 },
  { id: "saturn", name: "Saturn", x: 330, radius: 11 },
  { id: "uranus", name: "Uranus", x: 389, radius: 7 },
  { id: "neptune", name: "Neptune", x: 437, radius: 7 },
  { id: "pluto", name: "Pluto", x: 478, radius: 3 },
];

const solarTargetPoints: Record<SolarTargetId, { x: number; y: number; radius: number }> = {
  sun: { x: 45, y: 119, radius: 3 },
  mercury: { x: 82, y: 116, radius: 3 },
  venus: { x: 123, y: 116, radius: 5 },
  earth: { x: 168, y: 116, radius: 5 },
  moon: { x: 179, y: 123, radius: 2 },
  mars: { x: 213, y: 116, radius: 4 },
  jupiter: { x: 267, y: 116, radius: 14 },
  europa: { x: 285, y: 126, radius: 2 },
  saturn: { x: 330, y: 116, radius: 11 },
  titan: { x: 349, y: 126, radius: 2.5 },
  uranus: { x: 389, y: 116, radius: 7 },
  neptune: { x: 437, y: 116, radius: 7 },
  pluto: { x: 478, y: 116, radius: 3 },
  "deep-space": { x: 486, y: 32, radius: 2 },
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
        <svg viewBox="0 0 500 160" role="img" aria-labelledby="solar-system-title solar-system-description">
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
          {(locationsByTarget.get("deep-space")?.length ?? 0) > 0 && (
            <text className="solar-deep-space-label" x="489" y="15" textAnchor="end">
              +{locationsByTarget.get("deep-space")?.length} Deep Space
            </text>
          )}

          <g className="solar-orbits" aria-hidden="true">
            {solarBodies.map((body) => (
              <ellipse key={body.id} cx="-42" cy="116" rx={body.x + 42} ry="147" />
            ))}
          </g>

          <g className="solar-sun" aria-hidden="true">
            <circle cx="-16" cy="116" r="55" />
            <path d="M8 71q24 43 0 89M18 78q20 37 0 76" />
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
            <circle cx="179" cy="123" r="2" />
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
  const [precision, setPrecision] = useState("all");
  const [showSingleplayer, setShowSingleplayer] = useState(true);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [externalIconManifest, setExternalIconManifest] = useState<ExternalIconManifest | null>(null);
  const [externalIconManifestUnavailable, setExternalIconManifestUnavailable] = useState(false);
  const [failedExternalGameIcons, setFailedExternalGameIcons] = useState<Set<string>>(() => new Set());
  const [disabledMapOverlays, setDisabledMapOverlays] = useState<Set<string>>(() => new Set());
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
  const mapNode = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<MarkerClusterGroup | null>(null);
  const markers = useRef<Map<string, { marker: LeafletMarker; entry: Entry }>>(new Map());
  const mapImageOverlay = useRef<import("leaflet").ImageOverlay.Rotated | null>(null);
  const mapImageOverlayLevelId = useRef<string | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const mediaDialog = useRef<HTMLDialogElement>(null);
  const intelCard = useRef<HTMLElement>(null);

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
  const countries = useMemo(
    () => groups
      .map(({ name, flagCode, entries }) => ({
        name,
        flagCode,
        available: entries.some((entry) => {
          const matchesGame = game === "all" || entry.game.split(" / ").includes(game);
          const matchesMode =
            (showSingleplayer && entry.modes.includes("singleplayer")) ||
            (showMultiplayer && entry.modes.includes("multiplayer"));
          return matchesGame && matchesMode;
        }),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [game, groups, showMultiplayer, showSingleplayer],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) => {
          const matchesGame = game === "all" || entry.game.split(" / ").includes(game);
          const matchesPrecision = precision === "all"
            || (precision === "localized" && !["country", "off-world"].includes(entry.precision))
            || entry.precision === precision;
          const matchesMode =
            (showSingleplayer && entry.modes.includes("singleplayer")) ||
            (showMultiplayer && entry.modes.includes("multiplayer"));
          const matchesText =
            !needle ||
            group.name.toLowerCase().includes(needle) ||
            entry.region?.toLowerCase().includes(needle) ||
            entry.city?.toLowerCase().includes(needle) ||
            entry.landmark?.toLowerCase().includes(needle) ||
            entry.title.toLowerCase().includes(needle) ||
            entry.game.toLowerCase().includes(needle);
          return matchesGame && matchesPrecision && matchesMode && matchesText;
        }),
      }))
      .filter((group) => group.entries.length && (country === "all" || group.name === country));
  }, [country, groups, game, precision, query, showMultiplayer, showSingleplayer]);
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
  const otherLevelLocations = useMemo(
    () => groups.flatMap((group) => group.entries
      .filter((entry) => entry.levelId === selected.entry.levelId && entry.id !== selected.entry.id)
      .map((entry) => ({ group, entry }))),
    [groups, selected.entry.id, selected.entry.levelId],
  );
  const selectedMedia = data.wikiMedia[selected.entry.wikiArticle];
  const selectedImage = selectedMedia?.main ?? selectedMedia?.map ?? null;
  const selectedImageKey = selectedImage
    ? `${selected.entry.id}:${selectedImage.thumbnailUrl}`
    : null;
  const selectedImageLoaded = selectedImageKey !== null && loadedImageKey === selectedImageKey;
  const selectedImageFailed = selectedImageKey !== null && failedImageKey === selectedImageKey;
  const regionLevelsExpanded = expandedRegionEntryId === selected.entry.id;
  const regionalLevels = selected.group.entries.filter((entry, index, entries) =>
    entry.levelId !== selected.entry.levelId
    && entries.findIndex((candidate) => candidate.levelId === entry.levelId) === index);
  const visibleRegionalLevels = regionLevelsExpanded ? regionalLevels : regionalLevels.slice(0, 8);
  const hiddenRegionalLevelCount = regionalLevels.length - visibleRegionalLevels.length;
  const levelNotesExpanded = expandedLevelNotesId === selected.entry.levelId;
  const selectedLevelNotes = levelNotes?.levelId === selected.entry.levelId ? levelNotes : null;
  const selectedMapOverlay = mapOverlays[selected.entry.levelId] ?? null;
  const selectedMapOverlayEnabled = selectedMapOverlay !== null && !disabledMapOverlays.has(selected.entry.levelId);

  const selectEntry = useCallback((group: Group, entry: Entry) => {
    setSelected({ group, entry });
    setExpandedRegionEntryId(null);
    setExpandedLevelNotesId(null);
  }, []);

  const toggleLevelNotes = useCallback(() => {
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
  }, [expandedLevelNotesId, levelNotes?.levelId, selected.entry.levelId]);

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
          return L.divIcon({
            className: "atlas-cluster-wrap",
            html: `<span class="atlas-cluster ${scale}">${count}</span>`,
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
        marker.on("click", () => selectEntry(group, entry));
        marker.bindTooltip(`${entry.title} · ${locationName(entry)}`, {
          direction: "top",
          offset: [0, -8],
        });
        marker.addTo(layer);
        markers.current.set(entry.id, { marker, entry });
      });
    });
  }, [filtered, mapReady, selectEntry]);

  useEffect(() => {
    if (!mapReady || !map.current || !leaflet.current) return;
    const currentMap = map.current;
    const L = leaflet.current;
    markers.current.forEach(({ marker, entry }) => {
      const active = entry.id === selected.entry.id;
      marker.setIcon(atlasMarkerIcon(L, entry, active));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
    const selectedIsVisible = filtered.some((group) =>
      group.entries.some((entry) => entry.id === selected.entry.id));
    if (selected.entry.coordinates && selectedIsVisible && mapNode.current) {
      currentMap.panInside(
        selected.entry.coordinates,
        mapViewportPadding(mapNode.current, intelCard.current),
      );
    }
  }, [filtered, mapReady, selected]);

  useEffect(() => {
    if (!mapReady || !map.current || !leaflet.current) return;
    if (!selectedMapOverlay) {
      mapImageOverlay.current?.remove();
      mapImageOverlay.current = null;
      mapImageOverlayLevelId.current = null;
      return;
    }
    if (mapImageOverlay.current && mapImageOverlayLevelId.current === selected.entry.levelId) {
      mapImageOverlay.current.setOpacity(selectedMapOverlayEnabled ? selectedMapOverlay.opacity : 0);
      return;
    }
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
    requestAnimationFrame(() => overlay.setOpacity(selectedMapOverlayEnabled ? selectedMapOverlay.opacity : 0));
  }, [mapReady, selected.entry.levelId, selected.entry.title, selectedMapOverlay, selectedMapOverlayEnabled]);

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
    <main className="atlas-shell">
      <header className="atlas-header">
        <div className="brand-mark" aria-hidden="true">◎</div>
        <div>
          <h1>CoD Atlas</h1>
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search missions, maps, countries…"
            aria-label="Search locations"
          />
        </label>

        <div className="filter-grid">
          <label className="game-filter">
            <span>Game <small>Oldest to newest</small></span>
            <select
              value={game}
              onChange={(event) => setGame(event.target.value)}
              aria-label="Filter by game, ordered by release date"
            >
              <option value="all">All games</option>
              {games.map((item) => (
                <option key={item.id} value={item.code}>
                  {item.released.slice(0, 4)} · {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="filter-field">
            <span>Country</span>
            <CountrySelect countries={countries} value={country} onValueChange={setCountry} />
          </div>
        </div>

        <div className="precision-filter" aria-label="Location precision">
          <button className={precision === "all" ? "is-active" : ""} onClick={() => setPrecision("all")}>All</button>
          <button className={precision === "localized" ? "is-active" : ""} onClick={() => setPrecision("localized")}>Localized</button>
          <button className={precision === "country" ? "is-active" : ""} onClick={() => setPrecision("country")}>Country fallback</button>
        </div>

        <div className="mode-filter" aria-label="Game mode visibility">
          <button
            className={showSingleplayer ? "is-active" : ""}
            aria-pressed={showSingleplayer}
            onClick={() => setShowSingleplayer((visible) => !visible)}
          >
            <span aria-hidden="true">{showSingleplayer ? "✓" : "○"}</span> Singleplayer
          </button>
          <button
            className={showMultiplayer ? "is-active" : ""}
            aria-pressed={showMultiplayer}
            onClick={() => setShowMultiplayer((visible) => !visible)}
          >
            <span aria-hidden="true">{showMultiplayer ? "✓" : "○"}</span> Multiplayer
          </button>
        </div>

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
          <div className="section-title">
            <span>Locations</span><small>{filtered.length} groups</small>
          </div>
          <div className="scroll-list">
            {filtered.map((group, index) => (
              <button
                key={`${group.name}-${index}`}
                className={group.name === selected.group.name ? "location-row is-selected" : "location-row"}
                onClick={() => selectEntry(group, group.entries[0])}
              >
                <i className="location-marker-icon" aria-hidden="true" />
                <span><b>{group.name}</b><small>{group.entries.length} appearances</small></span>
                <em>{group.coordinates ? "MAP" : "ORBIT"}</em>
              </button>
            ))}
          </div>
        </section>

        <footer>
          <span className="legend-dot" /> Localized <span className="legend-dot is-fallback" /> Country fallback
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
          </p>
        </footer>
      </aside>

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

        {levelNotesExpanded && (
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
                  }}
                >
                  {selectedLevelNotes.content}
                </ReactMarkdown>
              )}
            </div>
          </aside>
        )}

        <article className={`intel-card${levelNotesExpanded ? " has-open-briefing" : ""}`} ref={intelCard}>
          <div className="mission-heading">
            <LevelModeIcon multiplayer={selected.entry.modes.includes("multiplayer")} />
            <FittedLevelTitle>{selected.entry.title}</FittedLevelTitle>
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
              {/* Preserve the reviewed external thumbnail instead of proxying or transforming it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={selectedImageLoaded ? "is-loaded" : ""}
                src={selectedImage.thumbnailUrl}
                alt={`${selected.entry.title} media from the Call of Duty Wiki`}
                referrerPolicy="no-referrer"
                onLoad={() => setLoadedImageKey(selectedImageKey)}
                onError={() => setFailedImageKey(selectedImageKey)}
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
          <div className="intel-kicker">
            {selected.group.flagCode ? (
              <span
                className={`flag:${selected.group.flagCode} intel-country-flag`}
                role="img"
                aria-label={`${selected.entry.country} flag`}
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
            <span className="intel-country-name">{selected.entry.country}</span>
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
              <a href={selectedGoogleMapsUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon name="googleMaps" />
                <span>Google Maps</span>
              </a>
            )}
            {selectedWikipediaUrl && (
              <a href={selectedWikipediaUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon name="wikipedia" />
                <span>Wikipedia</span>
              </a>
            )}
            <a href={selected.entry.wiki} target="_blank" rel="noreferrer">
              <ExternalLinkIcon name="fandom" />
              <span>CoD Wiki</span>
            </a>
          </div>
          {selectedMapOverlay && (
            <div className="map-overlay-control">
              <button
                className={selectedMapOverlayEnabled ? "is-enabled" : ""}
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
              <a href={selectedMapOverlay.attribution.sourceUrl} target="_blank" rel="noreferrer" title={selectedMapOverlay.attribution.rightsNotice}>
                Image source
              </a>
            </div>
          )}
          <section className="level-briefing">
            <button
              className="level-briefing-toggle"
              type="button"
              aria-expanded={levelNotesExpanded}
              aria-controls="selected-level-briefing"
              onClick={toggleLevelNotes}
            >
              <b aria-hidden="true">{levelNotesExpanded ? "›" : "‹"}</b>
              <span><small>Level briefing</small><strong>Research &amp; historical context</strong></span>
            </button>
          </section>
          {regionalLevels.length > 0 && (
            <div
              className={`intel-entries${regionLevelsExpanded ? " is-expanded" : ""}`}
              id="regional-level-list"
            >
              {visibleRegionalLevels.map((entry) => (
                <div className="intel-entry" key={entry.levelId}>
                  <button onClick={() => selectEntry(selected.group, entry)}><strong>{entry.title}</strong><span>{locationName(entry)} · {entry.game}</span></button>
                  <a href={entry.wiki} target="_blank" rel="noreferrer" aria-label={`Open ${entry.title} on CoD Wiki`}>↗</a>
                </div>
              ))}
              {hiddenRegionalLevelCount > 0 && (
                <button
                  className="more-row"
                  type="button"
                  aria-expanded="false"
                  aria-controls="regional-level-list"
                  onClick={() => setExpandedRegionEntryId(selected.entry.id)}
                >
                  + {hiddenRegionalLevelCount} more {hiddenRegionalLevelCount === 1 ? "level" : "levels"} in this region
                </button>
              )}
              {regionLevelsExpanded && regionalLevels.length > 8 && (
                <button
                  className="more-row is-collapse"
                  type="button"
                  aria-expanded="true"
                  aria-controls="regional-level-list"
                  onClick={() => setExpandedRegionEntryId(null)}
                >
                  Show fewer
                </button>
              )}
            </div>
          )}
        </article>

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
                  <span>{selectedImage.rights.status === "non-free" ? "Copyrighted media" : "Licensed media"}</span>
                  <h2 id="media-info-title">Image information</h2>
                </div>
                <form method="dialog">
                  <button aria-label="Close image information">×</button>
                </form>
              </header>
              {selectedImage.rights.notice && (
                <div className="media-rights-notice">{selectedImage.rights.notice}</div>
              )}
              <dl>
                <div>
                  <dt>{selectedImage.author.role === "uploader" ? "Uploaded by" : "Author"}</dt>
                  <dd><a href={selectedImage.author.userUrl} target="_blank" rel="noreferrer">{selectedImage.author.name}</a></dd>
                </div>
                {selectedImage.license.name && selectedImage.license.url && (
                  <div>
                    <dt>License</dt>
                    <dd><a href={selectedImage.license.url} target="_blank" rel="noreferrer">{selectedImage.license.name}</a></dd>
                  </div>
                )}
                {selectedImage.rights.noticeUrl && (
                  <div>
                    <dt>Rights notice</dt>
                    <dd><a href={selectedImage.rights.noticeUrl} target="_blank" rel="noreferrer">Read on CoD Wiki</a></dd>
                  </div>
                )}
                <div>
                  <dt>Source</dt>
                  <dd><a href={selectedImage.detailPageUrl} target="_blank" rel="noreferrer">Open file page</a></dd>
                </div>
              </dl>
              <p className="media-notice-credit">Notice reproduced from the Call of Duty Wiki; the image remains subject to its original copyright status.</p>
            </div>
          </dialog>
        )}
      </section>
    </main>
  );
}
