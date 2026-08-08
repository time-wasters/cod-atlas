"use client";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import atlasSource from "./data/atlas.generated.json";

type Entry = {
  id: string;
  levelId: string;
  locationId: string;
  title: string;
  game: string;
  wiki: string;
  overlay: null;
  city?: string | null;
  coordinates?: [number, number] | null;
  precision: "exact" | "approximate" | "city" | "region" | "country" | "off-world";
  confidence?: "high" | "medium" | "fallback";
  method?: string;
  modes: ("singleplayer" | "multiplayer")[];
};
type Group = {
  name: string;
  coordinates: [number, number] | null;
  kind: "terrestrial" | "off-world";
  entries: Entry[];
};
type AtlasData = {
  games: { id: string; code: string; label: string; released: string }[];
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

const data = atlasSource as AtlasData;
const gameMetadata: Record<string, { label: string; released: string }> = Object.fromEntries(
  data.games.map((item) => [item.code, { label: item.label, released: item.released }]),
);

function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

function gameLabel(code: string) {
  return gameMetadata[code]?.label ?? code;
}

function compareGames(a: string, b: string) {
  const releaseDifference = (gameMetadata[a]?.released ?? "9999").localeCompare(
    gameMetadata[b]?.released ?? "9999",
  );
  return releaseDifference || gameLabel(a).localeCompare(gameLabel(b));
}

const initialGroup = data.groups.find((group) =>
  group.entries.some((entry) => entry.title === "Brecourt Manor"),
) ?? data.groups[0];
const initialEntry = initialGroup.entries.find((entry) => entry.title === "Brecourt Manor")
  ?? initialGroup.entries[0];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[char]!,
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [game, setGame] = useState("all");
  const [region, setRegion] = useState("all");
  const [precision, setPrecision] = useState("all");
  const [showSingleplayer, setShowSingleplayer] = useState(true);
  const [showMultiplayer, setShowMultiplayer] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<Selection>({
    group: initialGroup,
    entry: initialEntry,
  });
  const mapNode = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);

  const groups = data.groups;
  const games = useMemo(
    () =>
      [...new Set(groups.flatMap((group) => group.entries.flatMap((entry) => gameCodes(entry.game))))]
        .filter(Boolean)
        .sort(compareGames),
    [groups],
  );
  const regions = useMemo(
    () => groups.map((group) => group.name).sort((a, b) => a.localeCompare(b)),
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
            entry.title.toLowerCase().includes(needle) ||
            entry.game.toLowerCase().includes(needle);
          return matchesGame && matchesPrecision && matchesMode && matchesText;
        }),
      }))
      .filter((group) => group.entries.length && (region === "all" || group.name === region));
  }, [groups, game, precision, query, region, showMultiplayer, showSingleplayer]);
  const resultCount = filtered.reduce((sum, group) => sum + group.entries.length, 0);

  const selectEntry = useCallback((group: Group, entry: Entry) => setSelected({ group, entry }), []);

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
          title: `${entry.title} — ${entry.city ?? group.name}`,
          keyboard: true,
        });
        marker.on("click", () => selectEntry(group, entry));
        marker.bindTooltip(`${entry.title} · ${entry.city ?? group.name}`, {
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
          `${entry.game} · ${entry.city ?? group.name}, ${group.name} · ${entry.method === "manual-approximate" ? "approximate historical position" : entry.precision === "city" ? "city-level" : "country fallback"} · ${entry.wiki}`,
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
          <label>
            <span>Game</span>
            <select value={game} onChange={(event) => setGame(event.target.value)}>
              <option value="all">All games</option>
              {games.map((item) => <option key={item} value={item}>{gameLabel(item)}</option>)}
            </select>
          </label>
          <label>
            <span>Country / region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="all">All regions</option>
              {regions.map((item, index) => <option key={`${item}-${index}`}>{item}</option>)}
            </select>
          </label>
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
          <p>Versioned level files are compiled into this static atlas; ambiguous entries stay at country level.</p>
          <p className="source-credit">
            Inspired by <a href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">the original Reddit post by u/robracer97 ↗</a>
          </p>
          <p className="source-credit">
            <a href="https://github.com/PLP-GTR/call-of-duty-atlas" target="_blank" rel="noreferrer">Source code · AGPL-3.0 ↗</a>
          </p>
        </footer>
      </aside>

      <section className="map-stage" aria-label="Interactive world map">
        <div ref={mapNode} className="map-canvas" />
        <div className="map-grid" aria-hidden="true" />
        <div className="map-label" aria-hidden="true">TACTICAL GEOGRAPHY // GLOBAL</div>

        <article className="intel-card">
          <div className="intel-kicker"><span>◎</span> Selected location</div>
          <h2>{selected.entry.title}</h2>
          <p>{selected.entry.city ? `${selected.entry.city}, ${selected.group.name}` : selected.group.name} · {selected.entry.game}</p>
          <div className={`precision-badge ${selected.entry.precision === "approximate" ? "is-approximate" : !["country", "off-world"].includes(selected.entry.precision) ? "is-city" : "is-country"}`}>
            {selected.entry.precision === "approximate" ? "Approximate historical position" : !["country", "off-world"].includes(selected.entry.precision) ? `Localized · ${selected.entry.confidence} confidence` : selected.entry.precision === "off-world" ? "Off-world location" : "No city evidence · country fallback"}
          </div>
          <div className="intel-entries">
            {selected.group.entries.slice(0, 8).map((entry, index) => (
              <div className="intel-entry" key={`${entry.title}-${index}`}>
                <button onClick={() => setSelected({ group: selected.group, entry })}><strong>{entry.title}</strong><span>{entry.city ?? selected.group.name} · {entry.game}</span></button>
                <a href={entry.wiki} target="_blank" rel="noreferrer" aria-label={`Open ${entry.title} on CoD Wiki`}>↗</a>
              </div>
            ))}
            {selected.group.entries.length > 8 && <div className="more-row">+ {selected.group.entries.length - 8} more in this region</div>}
          </div>
          <a className="wiki-button" href={selected.entry.wiki} target="_blank" rel="noreferrer">Open this Wiki entry ↗</a>
          <button className="overlay-button" disabled title="Prepared for a later development phase">▱ Screenshot overlay — prepared</button>
        </article>
      </section>
    </main>
  );
}
