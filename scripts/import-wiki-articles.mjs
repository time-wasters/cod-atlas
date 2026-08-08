import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const DEFAULT_DELAY_MS = 5_000;
const MIN_DELAY_MS = 2_000;
const BATCH_SIZE = 10;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const COPYRIGHTED_MEDIA_TEMPLATE = /{{\s*Copyrighted[ _]Media(?:\s*[|}])/i;
const COPYRIGHTED_MEDIA_NOTICE = `This is an image/video/audio file of a non-free copyrighted video or computer game, and the copyright for it is most likely held by the company or person that developed the game. It is believed that the use of a limited number of web-resolution screenshots

for identification and critical commentary on
  • the computer or video game in question or
  • the copyrighted character(s) or item(s) depicted on the screenshot in question
on the Call of Duty Wiki, hosted on servers in the United States by the non-profit Fandom,

qualifies as fair use under United States copyright law, as such display does not significantly impede the right of the copyright holder to sell the copyrighted material, is not being used to generate profit in this context, and presents ideas that cannot be exhibited otherwise. See Non-free content.`;

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

function usage() {
  return `Usage:
  npm run wiki:import -- --id codwiki-88-ridge
  npm run wiki:import -- --game cod3
  npm run wiki:import -- --limit 10
  npm run wiki:import -- --all

Options:
  --id <id>       Import one record; repeat for several records
  --game <id>     Import records used by every level of a game; repeatable
  --limit <n>     Import the first n incomplete records
  --all           Check every Wiki import record
  --force         Rewrite records whose revision is unchanged
  --dry-run       Fetch and report without writing files
  --delay-ms <n>  Delay between API calls (minimum 2000; default 5000)
  --help          Show this message

Configure COD_ATLAS_WIKI_ORIGIN and COD_ATLAS_WIKI_USER_AGENT in .env first.`;
}

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
  if (!userAgent) throw new WikiConfigurationError("COD_ATLAS_WIKI_USER_AGENT is not configured; include maintainer contact information.");
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

export function parseArguments(argv) {
  const options = { ids: [], gameIds: [], limit: null, all: false, force: false, dryRun: false, delayMs: DEFAULT_DELAY_MS };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--id" || argument === "--game") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      if (argument === "--id") options.ids.push(value);
      else options.gameIds.push(value);
      index += 1;
    }
    else if (argument === "--limit") options.limit = Number(argv[++index]);
    else if (argument === "--delay-ms") options.delayMs = Number(argv[++index]);
    else if (argument === "--all") options.all = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--help") options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (options.help) return options;
  if (!options.ids.length && !options.gameIds.length && options.limit === null && !options.all) throw new Error("Select records with --id, --game, --limit, or --all");
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) throw new Error("--limit must be a positive integer");
  if (!Number.isInteger(options.delayMs) || options.delayMs < MIN_DELAY_MS) throw new Error(`--delay-ms must be at least ${MIN_DELAY_MS}`);
  return options;
}

async function filesBelow(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target, extension);
    return entry.name.endsWith(extension) ? [target] : [];
  }));
  return nested.flat();
}

function frontmatter(text, filename) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  return YAML.parse(match[1]);
}

export function wikiArticleIdsForGames(levels, gameIds) {
  const selectedGames = new Set(gameIds);
  return [...new Set(levels
    .filter((level) => level.games?.some((gameId) => selectedGames.has(gameId)))
    .map((level) => level.wikiArticle)
    .filter(Boolean))].sort();
}

export async function loadWikiArticleIdsForGames(gameIds) {
  const contentRoot = path.join(process.cwd(), "content");
  const gameFilenames = await filesBelow(path.join(contentRoot, "games"), ".yaml");
  const knownGameIds = new Set(await Promise.all(gameFilenames.map(async (filename) =>
    YAML.parse(await readFile(filename, "utf8")).id)));
  const unknownGameIds = [...new Set(gameIds)].filter((gameId) => !knownGameIds.has(gameId));
  if (unknownGameIds.length) throw new Error(`Unknown game IDs: ${unknownGameIds.join(", ")}`);

  const levelFilenames = await filesBelow(path.join(contentRoot, "levels"), ".md");
  const levels = await Promise.all(levelFilenames.map(async (filename) =>
    frontmatter(await readFile(filename, "utf8"), filename)));
  return wikiArticleIdsForGames(levels, gameIds);
}

function splitTopLevel(value, separator) {
  const parts = [];
  let start = 0;
  let curly = 0;
  let square = 0;
  for (let index = 0; index < value.length; index += 1) {
    const pair = value.slice(index, index + 2);
    if (pair === "{{") { curly += 1; index += 1; }
    else if (pair === "}}") { curly = Math.max(0, curly - 1); index += 1; }
    else if (pair === "[[") { square += 1; index += 1; }
    else if (pair === "]]" ) { square = Math.max(0, square - 1); index += 1; }
    else if (value[index] === separator && curly === 0 && square === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

export function extractInfobox(wikitext) {
  const match = /{{\s*infobox\b/i.exec(wikitext);
  if (!match) return {};
  let depth = 0;
  let end = wikitext.length;
  for (let index = match.index; index < wikitext.length - 1; index += 1) {
    const pair = wikitext.slice(index, index + 2);
    if (pair === "{{") { depth += 1; index += 1; }
    else if (pair === "}}") {
      depth -= 1;
      index += 1;
      if (depth === 0) { end = index + 1; break; }
    }
  }
  const parameters = {};
  for (const part of splitTopLevel(wikitext.slice(match.index + 2, end - 2), "|").slice(1)) {
    const pieces = splitTopLevel(part, "=");
    if (pieces.length < 2) continue;
    const name = pieces.shift().trim().toLowerCase().replace(/[ _-]+/g, "_");
    parameters[name] = pieces.join("=").trim();
  }
  return parameters;
}

function stripMarkup(value) {
  if (!value) return null;
  const text = value.replace(/<!--[^]*?-->/g, " ").replace(/<br\s*\/?\s*>/gi, ", ")
    .replace(/<ref\b[^>]*>[^]*?<\/ref>|<ref\b[^>]*\/>/gi, " ")
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1").replace(/{{[^{}]*}}/g, " ")
    .replace(/'{2,}/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

export function parseWikiLink(value, wikiOrigin) {
  if (!value) return { raw: null, label: null, url: null };
  const match = value.match(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/);
  const target = match?.[1]?.trim();
  return {
    raw: value.trim(),
    label: stripMarkup(match?.[2] ?? match?.[1] ?? value),
    url: target ? `${wikiOrigin}/wiki/${encodeURIComponent(target.replace(/ /g, "_"))}` : null,
  };
}

function fileTitle(value) {
  if (!value) return null;
  const link = value.match(/\[\[(?:File|Image):([^\]|]+)/i)?.[1];
  const bare = link ?? value.split("|")[0].trim();
  if (!bare || /^(none|n\/a|null)$/i.test(bare)) return null;
  return `File:${bare.replace(/^(?:File|Image):/i, "").trim().replace(/ /g, "_")}`;
}

const firstValue = (object, names) => names.map((name) => object[name]).find(Boolean) ?? null;
const htmlText = (value) => stripMarkup(value?.value?.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"));
function htmlUrl(value, wikiOrigin) {
  const href = value?.value?.match(/href=["']([^"']+)/i)?.[1];
  return href?.startsWith("/") ? `${wikiOrigin}${href}` : href ?? null;
}

export function imageRecord(page, wikiOrigin) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const metadata = info.extmetadata ?? {};
  const artist = htmlText(metadata.Artist) ?? htmlText(metadata.Credit);
  const artistUrl = htmlUrl(metadata.Artist, wikiOrigin) ?? htmlUrl(metadata.Credit, wikiOrigin);
  const licenseName = htmlText(metadata.LicenseShortName) ?? htmlText(metadata.License);
  const licenseUrl = metadata.LicenseUrl?.value ?? null;
  const wikitext = page.revisions?.[0]?.slots?.main?.content ?? "";
  const copyrightedMedia = COPYRIGHTED_MEDIA_TEMPLATE.test(wikitext);
  return {
    sourceUrl: info.url ?? null,
    thumbnailUrl: info.thumburl ?? info.url ?? null,
    detailPageUrl: page.canonicalurl ?? page.fullurl ?? null,
    author: {
      name: artist ?? info.user ?? null,
      userUrl: artistUrl
        ?? (info.user ? `${wikiOrigin}/wiki/User:${encodeURIComponent(info.user.replace(/ /g, "_"))}` : null),
      role: artist ? "author" : info.user ? "uploader" : null,
    },
    license: { name: licenseName, url: licenseUrl },
    rights: copyrightedMedia ? {
      status: "non-free",
      notice: COPYRIGHTED_MEDIA_NOTICE,
      noticeUrl: `${wikiOrigin}/wiki/Template:Copyrighted_Media`,
    } : {
      status: licenseName && licenseUrl ? "licensed" : "unknown",
      notice: null,
      noticeUrl: licenseUrl,
    },
  };
}

export function hasCompleteAttribution(image) {
  const sourced = image?.sourceUrl && image.thumbnailUrl && image.detailPageUrl
    && image.author?.name && image.author.userUrl;
  const licensed = image?.license?.name && image.license.url;
  const nonFreeNotice = image?.rights?.status === "non-free"
    && image.rights.notice && image.rights.noticeUrl;
  return Boolean(sourced && (licensed || nonFreeNotice));
}

function titleFromSource(sourceUrl, wikiOrigin) {
  const url = new URL(sourceUrl);
  if (url.origin !== wikiOrigin) throw new Error(`Wiki record origin does not match COD_ATLAS_WIKI_ORIGIN: ${sourceUrl}`);
  const index = url.pathname.indexOf("/wiki/");
  if (index < 0) throw new Error(`Unsupported Wiki URL: ${sourceUrl}`);
  return decodeURIComponent(url.pathname.slice(index + 6));
}

function apiUrl(parameters, configuration) {
  const url = new URL(configuration.apiUrl);
  for (const [name, value] of Object.entries({ action: "query", format: "json", formatversion: "2", maxlag: "1", ...parameters })) url.searchParams.set(name, String(value));
  return url;
}

async function request(parameters, options, state, configuration) {
  if (state.count) await sleep(options.delayMs);
  state.count += 1;
  const url = apiUrl(parameters, configuration);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": configuration.userAgent }, signal: AbortSignal.timeout(30_000) });
    const payload = response.ok ? await response.json() : null;
    const temporary = response.status === 429 || response.status === 503 || ["maxlag", "ratelimited"].includes(payload?.error?.code);
    if (!temporary) {
      if (!response.ok) throw new Error(`Wiki API returned HTTP ${response.status}; stopping without retrying`);
      if (payload.error) throw new Error(`Wiki API error ${payload.error.code}: ${payload.error.info}`);
      return payload;
    }
    if (attempt === 3) throw new Error("Wiki API remained busy after four attempts; stopping");
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader === null ? Number.NaN : Number(retryAfterHeader);
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1_000 : options.delayMs * (2 ** (attempt + 1)));
  }
}

const emptyImage = () => ({
  sourceUrl: null,
  thumbnailUrl: null,
  detailPageUrl: null,
  author: { name: null, userUrl: null, role: null },
  license: { name: null, url: null },
  rights: { status: "unknown", notice: null, noticeUrl: null },
});
async function writeJsonAtomic(filename, value) {
  const temporary = `${filename}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, filename);
}

async function importBatch(records, options, state, configuration) {
  const titles = records.map(({ article }) => titleFromSource(article.sourceUrl, configuration.origin));
  const payload = await request({ redirects: "1", prop: "info|revisions|pageimages", inprop: "url", rvprop: "ids|timestamp|sha1|content", rvslots: "main", piprop: "name", titles: titles.join("|") }, options, state, configuration);
  const aliases = new Map(titles.map((title) => [title.replace(/_/g, " "), title]));
  for (const item of payload.query?.normalized ?? []) aliases.set(item.to, aliases.get(item.from) ?? item.from);
  for (const item of payload.query?.redirects ?? []) aliases.set(item.to, aliases.get(item.from) ?? item.from);
  const recordsByTitle = new Map(records.map((record, index) => [titles[index], record]));
  const updates = [];
  const imageTitles = new Set();
  for (const page of payload.query?.pages ?? []) {
    const requested = aliases.get(page.title) ?? page.title;
    const record = recordsByTitle.get(requested) ?? recordsByTitle.get(requested.replace(/ /g, "_"));
    if (!record) continue;
    if (page.missing) { console.warn(`missing ${record.article.id}: ${record.article.sourceUrl}`); continue; }
    const revision = page.revisions?.[0];
    if (!revision) { console.warn(`no revision ${record.article.id}`); continue; }
    if (!options.force && record.article.latestRevisionId === revision.revid) { console.log(`unchanged ${record.article.id} (revision ${revision.revid})`); continue; }
    const infobox = extractInfobox(revision.slots?.main?.content ?? "");
    const mainTitle = page.pageimage ? fileTitle(page.pageimage) : fileTitle(firstValue(infobox, ["image", "image1", "cover"]));
    const mapTitle = fileTitle(firstValue(infobox, ["map", "map_image", "mapimage", "layout"]));
    if (mainTitle) imageTitles.add(mainTitle);
    if (mapTitle) imageTitles.add(mapTitle);
    updates.push({ record, page, revision, infobox, mainTitle, mapTitle });
  }
  const images = new Map();
  if (imageTitles.size) {
    const imagePayload = await request({ redirects: "1", prop: "info|imageinfo|revisions", inprop: "url", iiprop: "url|mime|size|sha1|user|extmetadata", iiurlwidth: "800", rvprop: "content", rvslots: "main", titles: [...imageTitles].join("|") }, options, state, configuration);
    for (const page of imagePayload.query?.pages ?? []) {
      const image = imageRecord(page, configuration.origin);
      const title = page.title.replace(/ /g, "_");
      if (hasCompleteAttribution(image)) images.set(title, image);
      else console.warn(`skipping media without a reusable license or recognized non-free notice: ${page.title}`);
    }
  }
  for (const update of updates) {
    const { article } = update.record;
    const next = { ...article,
      fandomPageId: update.page.pageid ?? null,
      sourceUrl: update.page.fullurl ?? article.sourceUrl,
      canonicalUrl: update.page.canonicalurl ?? update.page.fullurl ?? article.canonicalUrl,
      latestRevisionId: update.revision.revid,
      importedAt: new Date().toISOString(),
      levelLocation: parseWikiLink(firstValue(update.infobox, ["location", "place", "setting"]), configuration.origin),
      images: {
        main: images.get(update.mainTitle?.replace(/ /g, "_")) ?? article.images?.main ?? emptyImage(),
        map: images.get(update.mapTitle?.replace(/ /g, "_")) ?? article.images?.map ?? emptyImage(),
      },
      rawPayload: { revisionTimestamp: update.revision.timestamp ?? null, revisionSha1: update.revision.sha1 ?? null, resolvedTitle: update.page.title, mainImageTitle: update.mainTitle, mapImageTitle: update.mapTitle },
    };
    console.log(`${options.dryRun ? "would update" : "updated"} ${article.id} to revision ${update.revision.revid}`);
    if (options.dryRun) console.log(JSON.stringify(next, null, 2));
    else await writeJsonAtomic(update.record.filename, next);
  }
  return updates.length;
}

async function main() {
  let options;
  try { options = parseArguments(process.argv.slice(2)); }
  catch (error) { console.error(error.message); console.error(usage()); process.exitCode = 1; return; }
  if (options.help) { console.log(usage()); return; }
  const configuration = resolveWikiConfiguration();
  const directory = path.join(process.cwd(), "content/wiki-import/articles");
  const filenames = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  const records = await Promise.all(filenames.map(async (name) => {
    const filename = path.join(directory, name);
    return { filename, article: JSON.parse(await readFile(filename, "utf8")) };
  }));
  const ids = new Set(options.ids);
  if (options.gameIds.length) {
    for (const id of await loadWikiArticleIdsForGames(options.gameIds)) ids.add(id);
  }
  let selected = ids.size ? records.filter(({ article }) => ids.has(article.id)) : records;
  const missing = [...ids].filter((id) => !selected.some(({ article }) => article.id === id));
  if (missing.length) throw new Error(`Unknown Wiki import IDs: ${missing.join(", ")}`);
  if (options.limit !== null) selected = selected.filter(({ article }) => options.force || !article.importedAt).slice(0, options.limit);
  if (!selected.length) { console.log("No records selected."); return; }
  console.log(`Checking ${selected.length} record(s) in batches of ${BATCH_SIZE}; API delay ${options.delayMs}ms.`);
  const state = { count: 0 };
  let changed = 0;
  for (let index = 0; index < selected.length; index += BATCH_SIZE) changed += await importBatch(selected.slice(index, index + BATCH_SIZE), options, state, configuration);
  console.log(`Finished: ${changed} changed record(s), ${state.count} API request(s).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof WikiConfigurationError ? formatWikiConfigurationError(error) : error.stack ?? error);
    process.exitCode = 1;
  });
}
