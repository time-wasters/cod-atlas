export type SolarPlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "deep-space";

export type SolarBody = {
  id: SolarPlanetId;
  name: string;
  x: number;
  radius: number;
};

export function SolarPlanet({ body }: { body: SolarBody }) {
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
