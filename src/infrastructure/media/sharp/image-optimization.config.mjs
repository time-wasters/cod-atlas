export const IMAGE_OPTIMIZATION_CONFIG = {
  minimumJpegSavingsRatio: .1,
  png: { compressionLevel: 9, adaptiveFiltering: true, effort: 10 },
  pngPalette: { palette: true, quality: 92, dither: .5 },
  jpeg: { quality: 85, chromaSubsampling: "4:4:4", mozjpeg: true },
  webp: { quality: 85, effort: 6 },
};
