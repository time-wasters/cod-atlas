export type WikiLocationImport = {
  label: string;
  url: string | null;
  sourceField: string;
  sortOrder: number;
};

export type WikiFileCreditImport = {
  role: "uploader" | "author" | "copyright-holder" | "other";
  displayName: string | null;
  userUrl: string | null;
  creditText: string;
  sortOrder: number;
};

export type WikiFileImport = {
  fandomPageId: number | null;
  fileTitle: string;
  detailPageUrl: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sha1: string | null;
  copyrightText: string | null;
  licenseName: string | null;
  licenseUrl: string | null;
  credits: WikiFileCreditImport[];
  rawPayload: unknown;
};

export type WikiArticleImageImport = {
  role: "main" | "map" | "gallery" | "other";
  sourceField: string | null;
  sortOrder: number;
  file: WikiFileImport;
};

export type WikiArticleImport = {
  fandomPageId: number;
  title: string;
  sourceUrl: string;
  canonicalUrl: string;
  latestRevisionId: number | null;
  latestRevisionAt: string | null;
  contentSha1: string | null;
  locations: WikiLocationImport[];
  images: WikiArticleImageImport[];
  rawPayload: unknown;
};
