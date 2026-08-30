export type WikiImageDto = {
  origin?: "local";
  mediaType?: "image" | "video";
  sourceUrl: string;
  thumbnailUrl: string;
  detailPageUrl: string;
  author: {
    name: string | null;
    userUrl: string | null;
    role: "author" | "uploader" | null;
  };
  license: {
    name: string | null;
    url: string | null;
  };
  rights: {
    status: "licensed" | "non-free" | "unknown";
    notice: string | null;
    noticeUrl: string | null;
  };
};
