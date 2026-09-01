import type { AtlasEntryDto } from "./atlas-entry.dto.js";

export type AtlasGroupDto = {
  name: string;
  continent: string;
  coordinates: [number, number] | null;
  kind: "terrestrial" | "off-world";
  flagCode: string | null;
  entries: AtlasEntryDto[];
};
