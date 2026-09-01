import type { AtlasDataIndexPort } from "../../../application/atlas/ports/atlas-data-index.port.js";
import type { AtlasUrlStatePort } from "../../../application/atlas/ports/atlas-url-state.port.js";
import type { KmlFileDownloaderPort } from "../../../application/export/ports/kml-file-downloader.port.js";
import type { ExternalGameIconManifestPort } from "../../../application/game-catalog/ports/external-game-icon-manifest.port.js";
import type { LevelBriefingPort } from "../../../application/level-briefing/ports/level-briefing.port.js";
import type { ExternalGameIconsPreferencePort } from "../../../application/preferences/ports/external-game-icons-preference.port.js";
import type { MapOverlayOpacityPreferencePort } from "../../../application/preferences/ports/map-overlay-opacity-preference.port.js";
import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { AtlasSelection } from "../models/initial-atlas-selection.js";

export type AtlasPageProps = {
  atlasUrlStatePort: AtlasUrlStatePort;
  data: AtlasDataDto;
  dataIndex: AtlasDataIndexPort<GameDto, AtlasSelection>;
  externalGameIconManifestPort: ExternalGameIconManifestPort;
  externalGameIconsPreferencePort: ExternalGameIconsPreferencePort;
  historyOverlays: Record<string, HistoryOverlayDto[]>;
  kmlFileDownloaderPort: KmlFileDownloaderPort;
  levelBriefingPort: LevelBriefingPort;
  mapOverlays: Record<string, MapOverlayDto>;
  mapOverlayOpacityPreferencePort: MapOverlayOpacityPreferencePort;
};
