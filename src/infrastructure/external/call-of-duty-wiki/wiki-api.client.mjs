import { WIKI_IMPORT_CONFIG } from "./wiki-configuration.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function wikiApiUrl(parameters, configuration) {
  const url = new URL(configuration.apiUrl);
  for (const [name, value] of Object.entries({
    action: "query",
    format: "json",
    formatversion: "2",
    maxlag: WIKI_IMPORT_CONFIG.maximumServerLagSeconds,
    ...parameters,
  })) {
    url.searchParams.set(name, String(value));
  }
  return url;
}

export async function requestWikiApi(parameters, options, state, configuration) {
  if (state.count) await sleep(options.delayMs);
  state.count += 1;
  const url = wikiApiUrl(parameters, configuration);
  for (let attempt = 0; attempt < WIKI_IMPORT_CONFIG.maximumAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": configuration.userAgent },
      signal: AbortSignal.timeout(WIKI_IMPORT_CONFIG.requestTimeoutMs),
    });
    const payload = response.ok ? await response.json() : null;
    const temporary = response.status === 429
      || response.status === 503
      || ["maxlag", "ratelimited"].includes(payload?.error?.code);
    if (!temporary) {
      if (!response.ok) throw new Error(`Wiki API returned HTTP ${response.status}; stopping without retrying`);
      if (payload.error) throw new Error(`Wiki API error ${payload.error.code}: ${payload.error.info}`);
      return payload;
    }
    if (attempt === WIKI_IMPORT_CONFIG.maximumAttempts - 1) {
      throw new Error(`Wiki API remained busy after ${WIKI_IMPORT_CONFIG.maximumAttempts} attempts; stopping`);
    }
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader === null ? Number.NaN : Number(retryAfterHeader);
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1_000
      : options.delayMs * (WIKI_IMPORT_CONFIG.retryBackoffFactor ** (attempt + 1)));
  }
}
