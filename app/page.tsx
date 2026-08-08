"use client";

import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Entry = {
  title: string;
  game: string;
  wiki: string;
  overlay: null;
  city?: string | null;
  coordinates?: [number, number] | null;
  precision?: "city" | "country";
  confidence?: "high" | "medium" | "fallback";
  modes: ("singleplayer" | "multiplayer")[];
};
type Group = {
  name: string;
  coordinates: [number, number] | null;
  kind: "terrestrial" | "off-world";
  entries: Entry[];
};
type AtlasData = {
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

const gameMetadata: Record<string, { label: string; released: number }> = {
  COD: { label: "Call of Duty", released: 20031029 },
  UO: { label: "United Offensive", released: 20040914 },
  FH: { label: "Finest Hour", released: 20041116 },
  COD2: { label: "Call of Duty 2", released: 20051025 },
  BR1: { label: "Big Red One", released: 20051101 },
  COD3: { label: "Call of Duty 3", released: 20061107 },
  RTV: { label: "Roads to Victory", released: 20070313 },
  COD4: { label: "Modern Warfare (2007)", released: 20071105 },
  WAW: { label: "World at War", released: 20081111 },
  "WAW:FF": { label: "Final Fronts", released: 20081111 },
  MW2: { label: "Modern Warfare 2 (2009)", released: 20091110 },
  BO: { label: "Black Ops", released: 20101109 },
  MW3: { label: "Modern Warfare 3 (2011)", released: 20111108 },
  "MW3:D": { label: "MW3: Defiance", released: 20111108 },
  BO2: { label: "Black Ops II", released: 20121113 },
  "BO:D": { label: "Black Ops: Declassified", released: 20121113 },
  G: { label: "Ghosts", released: 20131105 },
  AW: { label: "Advanced Warfare", released: 20141104 },
  BO3: { label: "Black Ops III", released: 20151106 },
  IW: { label: "Infinite Warfare", released: 20161104 },
  "COD4:R": { label: "Modern Warfare Remastered", released: 20161104 },
  WWII: { label: "WWII", released: 20171103 },
  BO4: { label: "Black Ops 4", released: 20181012 },
  MW19: { label: "Modern Warfare (2019)", released: 20191025 },
  "MW19-WZ": { label: "Warzone (2020)", released: 20200310 },
  BOCW: { label: "Black Ops Cold War", released: 20201113 },
  V: { label: "Vanguard", released: 20211105 },
  MWII: { label: "Modern Warfare II (2022)", released: 20221028 },
  "MWII-WZ": { label: "Warzone 2.0", released: 20221116 },
};

function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

function gameLabel(code: string) {
  return gameMetadata[code]?.label ?? code;
}

function compareGames(a: string, b: string) {
  const releaseDifference = (gameMetadata[a]?.released ?? Number.MAX_SAFE_INTEGER)
    - (gameMetadata[b]?.released ?? Number.MAX_SAFE_INTEGER);
  return releaseDifference || gameLabel(a).localeCompare(gameLabel(b));
}

const fallbackGroups: Group[] = [
  {
    name: "France",
    coordinates: [46.2, 2.2],
    kind: "terrestrial",
    entries: [
      {
        title: "Brecourt Manor",
        game: "COD",
        wiki: "https://callofduty.fandom.com/wiki/Brecourt_Manor",
        overlay: null,
        city: null,
        coordinates: [46.2, 2.2],
        precision: "country",
        confidence: "fallback",
        modes: ["singleplayer"],
      },
    ],
  },
  {
    name: "Afghanistan",
    coordinates: [33, 65],
    kind: "terrestrial",
    entries: [
      {
        title: "S.S.D.D.",
        game: "MW2",
        wiki: "https://callofduty.fandom.com/wiki/S.S.D.D.",
        overlay: null,
        city: null,
        coordinates: [33, 65],
        precision: "country",
        confidence: "fallback",
        modes: ["singleplayer"],
      },
    ],
  },
  {
    name: "Brazil",
    coordinates: [-10, -55],
    kind: "terrestrial",
    entries: [
      {
        title: "Takedown",
        game: "MW2",
        wiki: "https://callofduty.fandom.com/wiki/Takedown_(mission)",
        overlay: null,
        city: "Rio de Janeiro",
        coordinates: [-22.9068, -43.1729],
        precision: "city",
        confidence: "high",
        modes: ["singleplayer"],
      },
    ],
  },
];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[char]!,
  );
}

export default function Home() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [query, setQuery] = useState("");
  const [game, setGame] = useState("all");
  const [region, setRegion] = useState("all");
  const [precision, setPrecision] = useState("all");
  const [showSingleplayer, setShowSingleplayer] = useState(true);
  const [showMultiplayer, setShowMultiplayer] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<Selection>({
    group: fallbackGroups[0],
    entry: fallbackGroups[0].entries[0],
  });
  const [sourceError, setSourceError] = useState(false);
  const mapNode = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<LayerGroup | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);

  useEffect(() => {
    fetch("/api/locations")
      .then((response) => {
        if (!response.ok) throw new Error("Source unavailable");
        return response.json();
      })
      .then((next: AtlasData) => {
        setData(next);
        const brecourt = next.groups.find((group) =>
          group.entries.some((entry) => entry.title === "Brecourt Manor"),
        );
        const entry = brecourt?.entries.find((item) => item.title === "Brecourt Manor");
        if (brecourt && entry) setSelected({ group: brecourt, entry });
      })
      .catch(() => setSourceError(true));
  }, []);

  const groups = data?.groups ?? fallbackGroups;
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
          const matchesPrecision = precision === "all" || entry.precision === precision;
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
        const active = entry.wiki === selected.entry.wiki && entry.game === selected.entry.game;
        const cityLevel = entry.precision === "city";
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
          `${entry.game} · ${entry.city ?? group.name}, ${group.name} · ${entry.precision === "city" ? "city-level" : "country fallback"} · ${entry.wiki}`,
        )}</description><Point><coordinates>${lng},${lat},0</coordinates></Point></Placemark>`;
      });
    });
    const kml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Call of Duty Atlas</name>${placemarks.join("")}</Document></kml>`;
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
          <h1>Call of Duty Atlas</h1>
          <p>Real-world geography of the series</p>
        </div>
        <div className="header-stat">
          <strong>{data?.totals.entries ?? "…"}</strong>
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
          <button className={precision === "city" ? "is-active" : ""} onClick={() => setPrecision("city")}>City</button>
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
            <div><dt>City-level</dt><dd>{filtered.flatMap((item) => item.entries).filter((item) => item.precision === "city").length}</dd></div>
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
          <span className="legend-dot" /> City-level <span className="legend-dot is-fallback" /> Country fallback
          <p>{sourceError ? "Location data unavailable — showing sample data." : "Wiki evidence matched to GeoNames; ambiguous entries stay at country level."}</p>
          <p className="source-credit">
            Inspired by <a href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">the original Reddit post by u/robracer97 ↗</a>
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
          <div className={`precision-badge ${selected.entry.precision === "city" ? "is-city" : "is-country"}`}>
            {selected.entry.precision === "city" ? `City-level · ${selected.entry.confidence} confidence` : "No city evidence · country fallback"}
          </div>
          <div className="intel-entries">
            {selected.group.entries.slice(0, 8).map((entry, index) => (
              <div className="intel-entry" key={`${entry.title}-${index}`}>
                <button onClick={() => setSelected({ group: selected.group, entry })}><strong>{entry.title}</strong><span>{entry.city ?? selected.group.name} · {entry.game}</span></button>
                <a href={entry.wiki} target="_blank" rel="noreferrer" aria-label={`Open ${entry.title} on Call of Duty Wiki`}>↗</a>
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
