import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";

export type AtlasSelection = {
  group: AtlasGroupDto;
  entry: AtlasEntryDto;
};

export function initialAtlasSelection(data: AtlasDataDto): AtlasSelection {
  const group = data.groups[0];
  if (!group) throw new Error("Generated atlas contains no groups");
  const entry = group.entries[0];
  if (!entry) throw new Error("Generated atlas contains an empty group");
  return { group, entry };
}
