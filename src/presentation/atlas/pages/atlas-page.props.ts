import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import type { AtlasDataIndexPort } from "../ports/atlas-data-index.port.js";

export type AtlasPageProps = {
  data: AtlasDataDto;
  dataIndex: AtlasDataIndexPort;
  historyOverlays: Record<string, HistoryOverlayDto[]>;
  mapOverlays: Record<string, MapOverlayDto>;
};
