export type KmlFileDownloaderPort = {
  download: (kml: string, filename?: string) => void;
};
