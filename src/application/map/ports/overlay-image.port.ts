export type OverlayImagePort = {
  preload: (image: string) => Promise<boolean>;
  // Each acquired image belongs to one rendered overlay, including during fades.
  acquire: (image: string) => Promise<HTMLImageElement | null>;
};
