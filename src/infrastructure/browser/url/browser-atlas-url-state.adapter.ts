import type { AtlasUrlStatePort } from "../../../application/atlas/ports/atlas-url-state.port.js";
import { parseAtlasUrlState } from "./atlas-url-state.parser.js";
import { serializeAtlasUrlState } from "./atlas-url-state.serializer.js";

export const browserAtlasUrlStateAdapter: AtlasUrlStatePort = {
  read: () => parseAtlasUrlState(window.location.href),
  subscribe: (listener) => {
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  },
  write: (state, mode) => {
    const nextUrl = serializeAtlasUrlState(window.location.href, state);
    const currentRelativeUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const nextRelativeUrl = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    if (nextRelativeUrl === currentRelativeUrl) return;
    const method = mode === "replace" ? "replaceState" : "pushState";
    window.history[method](window.history.state, "", nextRelativeUrl);
  },
};
