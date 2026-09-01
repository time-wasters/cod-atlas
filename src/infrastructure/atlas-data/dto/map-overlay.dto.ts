export type MapOverlayDto = {
  levelId: string;
  image: string;
  opacity: number;
  corners: {
    topLeft: [number, number];
    topRight: [number, number];
    bottomLeft: [number, number];
    bottomRight: [number, number];
  };
  attribution: {
    title: string;
    source: string;
    sourceUrl: string;
    extractedBy: string;
    extractedByUrl: string;
    copyrightHolder: string;
    rights: "non-free";
    rightsNotice: string;
    rightsNoticeUrl: string;
  };
};
