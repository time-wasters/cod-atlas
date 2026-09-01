"use client";

import { AtlasPage } from "../../../presentation/atlas/pages/atlas-page.js";
import { AtlasDataIndex } from "../../atlas-data/static-json/atlas-data.index.js";
import { loadStaticAtlasData } from "../../atlas-data/static-json/static-atlas-data.loader.js";
import { loadStaticHistoryOverlays } from "../../atlas-data/static-json/static-history-overlay.loader.js";
import { loadStaticMapOverlays } from "../../atlas-data/static-json/static-map-overlay.loader.js";
import { kmlFileDownloader } from "../../browser/downloads/kml-file.downloader.js";
import { externalGameIconManifestClient } from "../../browser/http/external-game-icon-manifest.client.js";
import { levelBriefingClient } from "../../browser/http/level-briefing.client.js";
import { externalGameIconsPreferenceStore } from "../../browser/local-storage/external-game-icons-preference.store.js";
import { mapOverlayOpacityPreferenceStore } from "../../browser/local-storage/map-overlay-opacity-preference.store.js";
import { browserAtlasUrlStateAdapter } from "../../browser/url/browser-atlas-url-state.adapter.js";

const data = loadStaticAtlasData();
const dataIndex = new AtlasDataIndex(data);
const historyOverlays = loadStaticHistoryOverlays();
const mapOverlays = loadStaticMapOverlays();

export function AtlasPageClient() {
  return (
    <AtlasPage
      atlasUrlStatePort={browserAtlasUrlStateAdapter}
      data={data}
      dataIndex={dataIndex}
      externalGameIconManifestPort={externalGameIconManifestClient}
      externalGameIconsPreferencePort={externalGameIconsPreferenceStore}
      historyOverlays={historyOverlays}
      kmlFileDownloaderPort={kmlFileDownloader}
      levelBriefingPort={levelBriefingClient}
      mapOverlays={mapOverlays}
      mapOverlayOpacityPreferencePort={mapOverlayOpacityPreferenceStore}
    />
  );
}
