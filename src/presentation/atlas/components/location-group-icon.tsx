import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import { CountryFlag } from "../../shared/components/country-flag.js";

export function LocationGroupIcon({ group }: {
  group: Pick<AtlasGroupDto, "flagCode" | "continent" | "kind">;
}) {
  if (group.kind === "off-world") return (
    <svg className="location-group-icon is-orbit" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
      <ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(-25 12 12)" />
    </svg>
  );

  if (group.continent === "Oceans") return (
    <svg className="location-group-icon is-ocean" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 6c2.5-3 5 3 7.5 0s5 3 7.5 0 4 1 5 0M2 12c2.5-3 5 3 7.5 0s5 3 7.5 0 4 1 5 0M2 18c2.5-3 5 3 7.5 0s5 3 7.5 0 4 1 5 0" />
    </svg>
  );

  return <CountryFlag code={group.flagCode} />;
}
