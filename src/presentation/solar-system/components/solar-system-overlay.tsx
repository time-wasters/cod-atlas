import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import { SolarPlanet, type SolarBody } from "./solar-planet.js";

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

type SolarSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };

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

function solarTargetForEntry(entry: AtlasEntryDto): SolarTargetId {
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

type SolarSystemOverlayProps = {
  locations: SolarSelection[];
  selectedEntryId: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onSelect: (group: AtlasGroupDto, entry: AtlasEntryDto) => void;
};

export function SolarSystemOverlay({
  locations,
  selectedEntryId,
  expanded,
  onExpandedChange,
  onSelect,
}: SolarSystemOverlayProps) {
  const locationsByTarget = new Map<SolarTargetId, SolarSelection[]>();
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

          {([...locationsByTarget] as [SolarTargetId, SolarSelection[]][]).map(([target, targetLocations]) => {
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
