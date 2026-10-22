import { MAP_OVERLAY_CONFIG } from "../../../shared/config/map-overlay.config.js";

/**
 * Retain a small set of decoded upcoming images. Acquiring consumes the cached
 * element so overlapping outgoing/incoming overlays never share one DOM node.
 * Browser globals are accessed lazily so importing this module is safe in SSR.
 * @param {{ createImage?: () => HTMLImageElement, baseUrl?: () => string, maximumEntries?: number }} [options]
 * @returns {import("../../../application/map/ports/overlay-image.port.js").OverlayImagePort}
 */
export function createOverlayImageCache({
  createImage = () => new Image(),
  baseUrl = () => document.baseURI,
  maximumEntries = MAP_OVERLAY_CONFIG.cache.maximumEntries,
} = {}) {
  const entries = new Map();

  const load = async (url) => {
    let image;
    try {
      image = createImage();
      image.decoding = "async";
      const loaded = await new Promise((resolve) => {
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = url;
        if (image.complete) resolve(image.naturalWidth > 0);
      });
      if (!loaded) return null;
      await image.decode?.();
      return image;
    } catch {
      return null;
    } finally {
      if (image) { image.onload = null; image.onerror = null; }
    }
  };

  const prepare = (path) => {
    const url = new URL(path.replace(/^\/+/, ""), baseUrl()).href;
    let entry = entries.get(url);
    if (entry) entries.delete(url);
    else {
      entry = { promise: load(url) };
      const requestedEntry = entry;
      void entry.promise.then((image) => {
        if (!image && entries.get(url) === requestedEntry) entries.delete(url);
      });
    }
    entries.set(url, entry);
    while (entries.size > Math.max(1, maximumEntries)) entries.delete(entries.keys().next().value);
    return { url, entry };
  };

  return {
    async preload(path) {
      try { return Boolean(await prepare(path).entry.promise); }
      catch { return false; }
    },
    async acquire(path) {
      try {
        const { url, entry } = prepare(path);
        entries.delete(url);
        return await entry.promise;
      } catch { return null; }
    },
  };
}

export const overlayImageCache = createOverlayImageCache();
