import { execFile, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import countries from "world-countries";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(root, "app/data/locations.json");
const outputPath = resolve(root, "app/data/city-enrichment.json");
const cacheDir = resolve(root, ".research-cache/wiki");
const geonamesDir = resolve(root, ".research-cache/geonames");
const geonamesZip = resolve(geonamesDir, "cities500.zip");
const data = JSON.parse(readFileSync(inputPath, "utf8"));
const offline = process.env.CITY_ENRICHMENT_OFFLINE === "1";

const countryAliases = new Map([
  ["czech republic (czechia)", "CZ"], ["gibraltar (uk)", "GI"],
  ["myanmar (burma)", "MM"], ["scotland (uk)", "GB"],
  ["okinawa (japan)", "JP"], ["midway atoll (u.s.a)", "US"],
  ["northern mariana islands (u.s.a)", "MP"], ["south korea", "KR"],
  ["taiwan", "TW"], ["micronesia", "FM"], ["polynesia", "PF"],
]);
const usStates = new Set([
  "alaska", "arizona", "california", "colorado", "florida", "hawaii",
  "illinois", "kansas", "louisiana", "maryland", "michigan", "nebraska",
  "nevada", "new jersey", "new mexico", "new york", "north carolina",
  "south dakota", "texas", "virginia", "washington", "washington d.c.", "wyoming",
]);
const nonCityGroups = new Set([
  "adriatic sea", "arctic circle", "atlantic ocean", "baltic sea", "bering strait",
  "caribbean sea", "cygnus x-3's orbit", "dead sea", "earth’s orbit",
  "english channel", "europa (jupiter moon)", "gulf of mexico", "indian ocean",
  "mars", "moon", "neptune’s orbit", "pacific ocean", "philippine sea",
  "pluto’s orbit", "sun’s orbit", "titan (saturn moon)", "uranus’ orbit",
  "venus’ orbit",
]);
const noisyAliases = new Set([
  "airport", "base", "battle", "beach", "bridge", "camp", "castle", "center",
  "central", "city", "crossroads", "depot", "district", "forest", "harbor", "hotel",
  "island", "junction", "market", "mission", "palace", "park", "port", "station",
  "village", "west", "east", "north", "south", "reading", "nice", "mobile",
  "saint etienne",
]);
const genericPlaceTitles = new Set([
  "armada", "atlas", "bayview", "champs", "chinatown", "convoy", "liberation",
  "holiday", "piano", "piazza", "recovery", "redwood", "rush", "shangri la",
]);
const noisyCityResults = new Set(["saint etienne"]);
const strongHistoricAliases = new Set([
  "betio", "el alamein", "kharkov", "leningrad", "marseilles", "stalingrad",
]);
const manualOverrides = new Map([
  ["Norway::Battleship Tirpitz", {
    name: "Håkøya (Tromsø)",
    lat: 69.65818,
    lng: 18.79948,
    confidence: "high",
    method: "wiki-location",
  }],
  ["Okinawa (Japan)::Shuri Castle", {
    name: "Shuri Castle (Naha)",
    lat: 26.217031,
    lng: 127.719475,
    confidence: "high",
    method: "verified-landmark",
  }],
]);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[^a-zA-Z0-9']+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function countryCodeFor(groupName, georgiaOccurrence) {
  const key = groupName.toLowerCase();
  if (nonCityGroups.has(key)) return null;
  if (key === "georgia" && georgiaOccurrence > 0) return "US";
  if (usStates.has(key)) return "US";
  if (countryAliases.has(key)) return countryAliases.get(key);
  const country = countries.find((item) =>
    [item.name.common, item.name.official].some((name) => normalize(name) === normalize(groupName)),
  );
  return country?.cca2 ?? null;
}

function cachePath(url) {
  return resolve(cacheDir, `${createHash("sha1").update(url).digest("hex")}.md`);
}

let nextRequestAt = Date.now();
async function waitForReaderSlot() {
  const now = Date.now();
  const wait = Math.max(0, nextRequestAt - now);
  nextRequestAt = Math.max(nextRequestAt, now) + 3200;
  if (wait) await new Promise((resolvePromise) => setTimeout(resolvePromise, wait));
}

async function fetchWiki(url) {
  const clean = url.split("#")[0].replace("https://", "http://");
  const target = `https://r.jina.ai/${clean}`;
  const path = cachePath(url.split("#")[0]);
  if (existsSync(path) && readFileSync(path, "utf8").length > 800) return { ok: true, path };
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await waitForReaderSlot();
    try {
      const { stdout } = await execFileAsync(
        "curl",
        [
          "-L", "--fail", "--silent", "--show-error", "--max-time", "55",
          "-H", "X-Target-Selector: .mw-parser-output",
          "-H", "X-Token-Budget: 5000",
          target,
        ],
        { encoding: "utf8", maxBuffer: 5 * 1024 * 1024 },
      );
      if (stdout.length > 800 && !stdout.includes("Please contact the site owner for access")) {
        writeFileSync(path, stdout, "utf8");
        return { ok: true, path };
      }
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 1300));
  }
  return { ok: false, path };
}

function articleExcerpt(markdown, title) {
  const bold = `**${title}**`;
  let start = markdown.indexOf(bold, Math.min(9000, Math.floor(markdown.length / 4)));
  if (start < 0) start = markdown.indexOf(bold);
  if (start < 0) {
    const marker = "Markdown Content:";
    start = Math.max(0, markdown.indexOf(marker) + marker.length);
  }
  return markdown
    .slice(start, start + 2000)
    .replace(/\[([^\]]+)\]\([^\n]+?\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[_*#|`>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadCities() {
  mkdirSync(geonamesDir, { recursive: true });
  if (!existsSync(geonamesZip)) {
    console.log("Downloading GeoNames cities500 gazetteer…");
    execFileSync("curl", [
      "-L", "--fail", "--silent", "--show-error",
      "-o", geonamesZip,
      "https://download.geonames.org/export/dump/cities500.zip",
    ]);
  }
  const text = execFileSync("unzip", ["-p", geonamesZip, "cities500.txt"], {
    encoding: "utf8",
    maxBuffer: 180 * 1024 * 1024,
  });
  const byCountry = new Map();
  for (const line of text.split("\n")) {
    const parts = line.split("\t");
    if (parts.length < 15) continue;
    const city = {
      name: parts[1],
      ascii: parts[2],
      alternates: parts[3].split(","),
      lat: Number(parts[4]),
      lng: Number(parts[5]),
      country: parts[8],
      population: Number(parts[14]) || 0,
    };
    if (!byCountry.has(city.country)) byCountry.set(city.country, new Map());
    const aliases = new Set([city.name, city.ascii, ...city.alternates.slice(0, 80)]);
    for (const rawAlias of aliases) {
      const alias = normalize(rawAlias);
      if (alias.length < 4 || alias.length > 55 || noisyAliases.has(alias)) continue;
      const map = byCountry.get(city.country);
      const current = map.get(alias);
      if (!current) map.set(alias, city);
      else if (current.lat !== city.lat || current.lng !== city.lng) {
        map.set(alias, {
          ...(city.population > current.population ? city : current),
          ambiguous: true,
        });
      }
    }
  }
  return byCountry;
}

function findCity(title, excerpt, countryCities) {
  if (!countryCities) return null;
  const titleKey = normalize(title);
  if (!genericPlaceTitles.has(titleKey) && countryCities.has(titleKey) && !countryCities.get(titleKey).ambiguous) {
    const city = countryCities.get(titleKey);
    return { ...city, confidence: "high", method: "title" };
  }

  const titleWords = titleKey.split(" ").filter(Boolean);
  const titleCandidates = [];
  for (let index = 0; index < titleWords.length; index += 1) {
    for (let length = 1; length <= 5 && index + length <= titleWords.length; length += 1) {
      const alias = titleWords.slice(index, index + length).join(" ");
      const city = countryCities.get(alias);
      const canonical = city && [city.name, city.ascii].some((name) => normalize(name) === alias);
      if (
        !city || city.ambiguous || city.population < 5000 || alias.length < 5 ||
        (!canonical && !strongHistoricAliases.has(alias)) || noisyAliases.has(alias) ||
        genericPlaceTitles.has(alias) || noisyCityResults.has(normalize(city.name))
      ) continue;
      titleCandidates.push({ city, length, aliasLength: alias.length });
    }
  }
  const titleMatch = titleCandidates.sort((a, b) => b.length - a.length || b.aliasLength - a.aliasLength || b.city.population - a.city.population)[0];
  if (titleMatch) return { ...titleMatch.city, confidence: "high", method: "title-mention" };

  const words = normalize(excerpt).split(" ").filter(Boolean);
  const candidates = new Map();
  for (let index = 0; index < words.length; index += 1) {
    for (let length = 1; length <= 5 && index + length <= words.length; length += 1) {
      const alias = words.slice(index, index + length).join(" ");
      const city = countryCities.get(alias);
      if (!city || city.ambiguous || noisyCityResults.has(normalize(city.name))) continue;
      const previous = words.slice(Math.max(0, index - 7), index).join(" ");
      const contextual = /(?:takes? place|set|located|based|location is|outside|outskirts|city|town|village)(?: in| at| near| outside| of| on the outskirts of)*$/.test(previous);
      const score =
        (contextual ? 70 : 0) +
        (index < 170 ? 35 : index < 420 ? 15 : 0) +
        Math.min(22, Math.log10(Math.max(10, city.population)) * 3) +
        Math.min(12, length * 2);
      const key = `${city.lat},${city.lng}`;
      const current = candidates.get(key);
      if (!current || score > current.score) candidates.set(key, { city, score, index, contextual });
    }
  }
  const best = [...candidates.values()].sort((a, b) => b.score - a.score || a.index - b.index)[0];
  if (!best || !best.contextual || best.score < 95) return null;
  return {
    ...best.city,
    confidence: best.index < 420 ? "high" : "medium",
    method: "article-context",
  };
}

mkdirSync(cacheDir, { recursive: true });
console.log("Loading GeoNames city gazetteer…");
const citiesByCountry = loadCities();
let preparationGeorgiaOccurrence = 0;
const preparedGroups = data.groups.map((group) => {
  const occurrence = group.name.toLowerCase() === "georgia" ? preparationGeorgiaOccurrence++ : 0;
  return { ...group, countryCode: countryCodeFor(group.name, occurrence) };
});
const uniqueUrls = [...new Set(preparedGroups.flatMap((group) => {
  const countryCities = group.countryCode ? citiesByCountry.get(group.countryCode) : null;
  return group.entries.flatMap((entry) =>
    manualOverrides.has(`${group.name}::${entry.title}`) || findCity(entry.title, entry.title, countryCities)
      ? []
      : [entry.wiki.split("#")[0]],
  );
}))];
console.log(`Researching ${uniqueUrls.length} Wiki articles that need city evidence…`);
let completed = 0;
let failures = 0;
const queue = [...uniqueUrls];
const workers = offline ? [] : Array.from({ length: 2 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    const result = await fetchWiki(url);
    completed += 1;
    if (!result.ok) failures += 1;
    if (completed % 25 === 0 || completed === uniqueUrls.length) {
      console.log(`Wiki research: ${completed}/${uniqueUrls.length} (${failures} unavailable)`);
    }
  }
});
await Promise.all(workers);
if (offline) console.log("Offline mode: using the completed Wiki article cache and conservative country fallbacks.");

console.log("Matching article evidence against GeoNames…");
let cityMatches = 0;
let highConfidence = 0;
let unavailable = 0;
const records = [];

for (const group of preparedGroups) {
  const countryCities = group.countryCode ? citiesByCountry.get(group.countryCode) : null;
  for (const entry of group.entries) {
    const path = cachePath(entry.wiki.split("#")[0]);
    let match = manualOverrides.get(`${group.name}::${entry.title}`) ?? findCity(entry.title, entry.title, countryCities);
    if (!match && existsSync(path)) {
      const markdown = readFileSync(path, "utf8");
      match = findCity(entry.title, articleExcerpt(markdown, entry.title), countryCities);
    } else if (!match && !existsSync(path)) {
      unavailable += 1;
    }
    if (match) {
      cityMatches += 1;
      if (match.confidence === "high") highConfidence += 1;
    }
    records.push({
      key: `${group.name}::${entry.game}::${entry.wiki}`,
      country: group.name,
      title: entry.title,
      wiki: entry.wiki,
      city: match?.name ?? null,
      coordinates: match ? [match.lat, match.lng] : null,
      precision: match ? "city" : "country",
      confidence: match?.confidence ?? "fallback",
      method: match?.method ?? (group.countryCode ? "country-fallback" : "region-fallback"),
    });
  }
}

writeFileSync(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  sources: {
    wiki: "https://callofduty.fandom.com/wiki/Call_of_Duty_Wiki",
    geocoding: "https://www.geonames.org/",
  },
  stats: { total: records.length, cityMatches, highConfidence, unavailable },
  records,
}, null, 2)}\n`);
console.log(`Enriched ${records.length} entries: ${cityMatches} city matches (${highConfidence} high confidence), ${records.length - cityMatches} country fallbacks.`);
