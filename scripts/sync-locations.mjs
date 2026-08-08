import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source =
  "https://docs.google.com/document/d/1wfhdv8jD_Uggr9fO1zATiCb1qynVj1bV76ujziHCZZE/mobilebasic";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = resolve(root, "app/data/locations.json");

function decodeHtml(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function wikiTarget(href, label) {
  try {
    const redirect = new URL(decodeHtml(href));
    let target = redirect.searchParams.get("q") ?? href;
    try { target = decodeURIComponent(target); } catch {}
    if (target.includes("callofduty.fandom.com/wiki/")) return target;
  } catch {}
  return `https://callofduty.fandom.com/wiki/${encodeURIComponent(label.replaceAll(" ", "_"))}`;
}

const html = execFileSync("curl", ["-L", "--fail", "--silent", "--show-error", source], {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => match[1]);
const groups = [];
let current = null;
const entryOverrides = new Map([
  ["Norway::Battleship Tirpitz", {
    wiki: "https://callofduty.fandom.com/wiki/Battleship_Tirpitz_(level)",
  }],
]);

for (const inner of paragraphs) {
  const rowText = decodeHtml(inner);
  if (!rowText) continue;
  const anchor = inner.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
  if (!anchor) {
    if (rowText.startsWith("*") || rowText.startsWith("(") || rowText.length > 80) continue;
    current = { name: rowText, entries: [] };
    groups.push(current);
    continue;
  }
  if (!current) continue;
  const label = decodeHtml(anchor[2]);
  const games = [...rowText.matchAll(/\(([^)]+)\)/g)].map((match) => match[1]);
  current.entries.push({
    title: label,
    game: games.join(" / ") || "Unknown game",
    wiki: wikiTarget(anchor[1], label),
    overlay: null,
  });
}

const populated = groups.filter((group) => group.entries.length > 0);
for (const group of populated) {
  for (const entry of group.entries) {
    Object.assign(entry, entryOverrides.get(`${group.name}::${entry.title}`) ?? {});
  }
}
if (!populated.some((group) => group.name === "Adriatic Sea")) {
  populated.unshift({
    name: "Adriatic Sea",
    entries: [{
      title: "Fortune’s Keep",
      game: "MW19-WZ",
      wiki: "https://callofduty.fandom.com/wiki/Fortune%27s_Keep",
      overlay: null,
    }],
  });
}
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(
  destination,
  `${JSON.stringify({ source, updatedAt: new Date().toISOString(), groups: populated }, null, 2)}\n`,
  "utf8",
);
console.log(`Wrote ${populated.length} groups and ${populated.reduce((n, g) => n + g.entries.length, 0)} entries.`);
