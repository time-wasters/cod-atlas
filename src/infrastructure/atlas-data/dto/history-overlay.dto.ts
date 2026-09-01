import type { MapOverlayDto } from "./map-overlay.dto.js";

export type HistoryOverlayDto = {
  levelId: string;
  id: string;
  image: string;
  opacity: number;
  corners: MapOverlayDto["corners"];
  attribution: {
    title: string;
    source: string;
    sourceUrl: string;
    author: string;
    copyrightHolder: string;
    rights: "non-free";
    rightsNotice: string;
    rightsNoticeUrl: string;
  };
};
