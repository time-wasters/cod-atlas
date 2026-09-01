import process from "node:process";

export class WikiConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "WikiConfigurationError";
  }
}

export function formatWikiConfigurationError(error) {
  return `Wiki import configuration required

${error.message}

Add these values to .env and replace the contact details:

  COD_ATLAS_WIKI_ORIGIN=https://callofduty.fandom.com
  COD_ATLAS_WIKI_USER_AGENT=CoDAtlasWikiImporter/0.1 (you@example.com; https://github.com/time-wasters/cod-atlas)

See .env.example for details.`;
}

export function resolveWikiConfiguration(environment = process.env) {
  const originValue = environment.COD_ATLAS_WIKI_ORIGIN?.trim().replace(/\/+$/, "");
  const userAgent = environment.COD_ATLAS_WIKI_USER_AGENT?.trim();
  if (!originValue) throw new WikiConfigurationError("COD_ATLAS_WIKI_ORIGIN is not configured.");
  if (!userAgent) {
    throw new WikiConfigurationError("COD_ATLAS_WIKI_USER_AGENT is not configured; include maintainer contact information.");
  }
  let origin;
  try {
    origin = new URL(originValue);
  } catch {
    throw new WikiConfigurationError("COD_ATLAS_WIKI_ORIGIN must be a valid HTTP(S) origin without a path.");
  }
  if (!["http:", "https:"].includes(origin.protocol) || origin.pathname !== "/") {
    throw new WikiConfigurationError("COD_ATLAS_WIKI_ORIGIN must be an HTTP(S) origin without a path.");
  }
  return { origin: origin.origin, apiUrl: new URL("/api.php", origin), userAgent };
}
