"use client";

import { AtlasPage } from "../../../presentation/atlas/pages/atlas-page.js";
import { AtlasDataIndex } from "../../atlas-data/static-json/atlas-data.index.js";
import { loadStaticAtlasData } from "../../atlas-data/static-json/static-atlas-data.loader.js";
import { loadStaticHistoryOverlays } from "../../atlas-data/static-json/static-history-overlay.loader.js";
import { loadStaticMapOverlays } from "../../atlas-data/static-json/static-map-overlay.loader.js";

const data = loadStaticAtlasData();
const dataIndex = new AtlasDataIndex(data);
const historyOverlays = loadStaticHistoryOverlays();
const mapOverlays = loadStaticMapOverlays();

export function AtlasPageClient() {
  return (
    <AtlasPage
      data={data}
      dataIndex={dataIndex}
      historyOverlays={historyOverlays}
      mapOverlays={mapOverlays}
    />
  );
}
