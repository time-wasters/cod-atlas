"use client";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import * as Select from "@radix-ui/react-select";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import atlasSource from "./data/atlas.generated.json";

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

function locationName(entry: Entry) {
  return entry.landmark ?? entry.city ?? entry.region ?? entry.country;
}

function locationPath(entry: Entry) {
  return [entry.country, entry.region, entry.city, entry.landmark].filter(Boolean).join(" › ");
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
type CountryOption = Pick<Group, "name" | "flagCode">;

const data = atlasSource as AtlasData;
const gamesById = new Map(data.games.map((game) => [game.id, game]));

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
      <Select.Trigger className="country-select-trigger" aria-label="Filter by country">
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
              <Select.Item className="country-select-item" key={item.name} value={item.name}>
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
  const [showMultiplayer, setShowMultiplayer] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [solarSystemDisplay, setSolarSystemDisplay] = useState({
    hasSpaceLocations: true,
    expanded: true,
  });
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null);
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection>({
    group: initialGroup,
    entry: initialEntry,
  });
  const mapNode = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const mediaDialog = useRef<HTMLDialogElement>(null);

  const groups = data.groups;
  const games = useMemo(() => {
    const representedCodes = new Set(
      groups.flatMap((group) => group.entries.flatMap((entry) => gameCodes(entry.game))),
    );
    return data.games.filter((item) => representedCodes.has(item.code)).sort(compareGames);
  }, [groups]);
  const countries = useMemo(
    () => groups
      .map(({ name, flagCode }) => ({ name, flagCode }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
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
  const selectedGoogleMapsUrl = locationUrl(selected.entry, "googleMaps");
  const selectedWikipediaUrl = locationUrl(selected.entry, "wikipedia");
  const selectedMedia = data.wikiMedia[selected.entry.wikiArticle];
  const selectedImage = selectedMedia?.main ?? selectedMedia?.map ?? null;
  const selectedImageKey = selectedImage
    ? `${selected.entry.id}:${selectedImage.thumbnailUrl}`
    : null;
  const selectedImageLoaded = selectedImageKey !== null && loadedImageKey === selectedImageKey;
  const selectedImageFailed = selectedImageKey !== null && failedImageKey === selectedImageKey;

  const selectEntry = useCallback((group: Group, entry: Entry) => setSelected({ group, entry }), []);

  useEffect(() => {
    mediaDialog.current?.close();
  }, [selected.entry.id]);

  useEffect(() => {
    if (!mapNode.current || map.current) return;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapNode.current || map.current) return;
      const instance = L.map(mapNode.current, {
        center: [27, 8],
        zoom: 2,
        minZoom: 2,
        maxZoom: 9,
        zoomControl: false,
        worldCopyJump: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(instance);
      L.control.zoom({ position: "bottomright" }).addTo(instance);
      map.current = instance;
      markerLayer.current = L.layerGroup().addTo(instance);
      leaflet.current = L;
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markerLayer.current = null;
      leaflet.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !map.current || !markerLayer.current || !leaflet.current) return;
    const currentMap = map.current;
    const layer = markerLayer.current;
    const L = leaflet.current;
    layer.clearLayers();
    filtered.forEach((group) => {
      group.entries.forEach((entry) => {
        if (!entry.coordinates) return;
        const active = entry.id === selected.entry.id;
        const cityLevel = !["country", "off-world"].includes(entry.precision);
        const marker = L.marker(entry.coordinates, {
          icon: L.divIcon({
            className: "atlas-marker-wrap",
            html: `<span class="atlas-marker ${cityLevel ? "is-city" : "is-country"}${active ? " is-active" : ""}"><b></b></span>`,
            iconSize: [active ? 30 : 18, active ? 30 : 18],
            iconAnchor: [active ? 15 : 9, active ? 15 : 9],
          }),
          title: `${entry.title} — ${locationName(entry)}`,
          keyboard: true,
        });
        marker.on("click", () => selectEntry(group, entry));
        marker.bindTooltip(`${entry.title} · ${locationName(entry)}`, {
          direction: "top",
          offset: [0, -8],
        });
        marker.addTo(layer);
      });
    });
    if (selected.entry.coordinates) currentMap.panInside(selected.entry.coordinates, { padding: [80, 80] });
  }, [filtered, mapReady, selected, selectEntry]);

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
      </header>

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
                onClick={() => setSelected({ group, entry: group.entries[0] })}
              >
                <i aria-hidden="true">◎</i>
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

        <article className="intel-card">
          <div className="mission-heading">
            <h2>{selected.entry.title}</h2>
            <div className="mission-meta">
              <span className="mission-games">
                {selected.entry.gameIds.map((gameId) => {
                  const selectedGame = gamesById.get(gameId);
                  if (!selectedGame) return null;
                  return selectedGame.icon ? (
                    // Game icons are reviewed local public assets and do not need image optimization.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="mission-game-icon"
                      key={gameId}
                      src={selectedGame.icon}
                      alt={selectedGame.label}
                      title={selectedGame.label}
                    />
                  ) : (
                    <span className="mission-game-name" key={gameId}>{selectedGame.label}</span>
                  );
                })}
              </span>
              <span className="mission-meta-separator" aria-hidden="true">·</span>
              <span>{selected.entry.modes.includes("multiplayer") ? "Multiplayer map" : "Campaign mission"}</span>
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
          <div className="intel-entries">
            {selected.group.entries.slice(0, 8).map((entry, index) => (
              <div className="intel-entry" key={`${entry.title}-${index}`}>
                <button onClick={() => setSelected({ group: selected.group, entry })}><strong>{entry.title}</strong><span>{locationName(entry)} · {entry.game}</span></button>
                <a href={entry.wiki} target="_blank" rel="noreferrer" aria-label={`Open ${entry.title} on CoD Wiki`}>↗</a>
              </div>
            ))}
            {selected.group.entries.length > 8 && <div className="more-row">+ {selected.group.entries.length - 8} more in this region</div>}
          </div>
          {(selectedGoogleMapsUrl || selectedWikipediaUrl) && (
            <div className="place-links" aria-label="Place links">
              {selectedGoogleMapsUrl && (
                <a href={selectedGoogleMapsUrl} target="_blank" rel="noreferrer">Google Maps ↗</a>
              )}
              {selectedWikipediaUrl && (
                <a href={selectedWikipediaUrl} target="_blank" rel="noreferrer">Wikipedia ↗</a>
              )}
            </div>
          )}
          <a className="wiki-button" href={selected.entry.wiki} target="_blank" rel="noreferrer">Open on CoD Wiki ↗</a>
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
