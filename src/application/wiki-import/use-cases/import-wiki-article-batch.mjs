import { hasSequenceMetadata } from "../../../domain/wiki-article/wiki-sequence-metadata.policy.mjs";
import { wikiTitleFromSource } from "../../../domain/wiki-article/wiki-title.value-object.mjs";
import { writeWikiArticleFile } from "../../../infrastructure/content/filesystem/wiki-article-file.repository.mjs";
import { requestWikiApi } from "../../../infrastructure/external/call-of-duty-wiki/wiki-api.client.mjs";
import {
  emptyWikiImage,
  hasUsableWikiImage,
  mapWikiImage,
} from "../../../infrastructure/external/call-of-duty-wiki/wiki-image.mapper.mjs";
import { extractInfobox } from "../../../infrastructure/external/call-of-duty-wiki/wiki-infobox.parser.mjs";
import { parseWikiLink } from "../../../infrastructure/external/call-of-duty-wiki/wiki-link.parser.mjs";
import { parseWikiReferences } from "../../../infrastructure/external/call-of-duty-wiki/wiki-references.parser.mjs";
import { parseWikiValue } from "../../../infrastructure/external/call-of-duty-wiki/wiki-value.parser.mjs";

function fileTitle(value) {
  if (!value) return null;
  const link = value.match(/\[\[(?:File|Image):([^\]|]+)/i)?.[1];
  const bare = link ?? value.split("|")[0].trim();
  if (!bare || /^(none|n\/a|null)$/i.test(bare)) return null;
  return `File:${bare.replace(/^(?:File|Image):/i, "").trim().replace(/ /g, "_")}`;
}

const firstValue = (object, names) => names.map((name) => object[name]).find(Boolean) ?? null;

export async function importWikiArticleBatch(records, options, state, configuration, articleLookup) {
  const titles = records.map(({ article }) => wikiTitleFromSource(article.sourceUrl, configuration.origin));
  const payload = await requestWikiApi({
    redirects: "1",
    prop: "info|revisions|pageimages",
    inprop: "url",
    rvprop: "ids|timestamp|sha1|content",
    rvslots: "main",
    piprop: "name",
    titles: titles.join("|"),
  }, options, state, configuration);
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
    if (page.missing) {
      console.warn(`missing ${record.article.id}: ${record.article.sourceUrl}`);
      continue;
    }
    const revision = page.revisions?.[0];
    if (!revision) {
      console.warn(`no revision ${record.article.id}`);
      continue;
    }
    if (!options.force
      && record.article.latestRevisionId === revision.revid
      && hasSequenceMetadata(record.article, articleLookup)) {
      console.log(`unchanged ${record.article.id} (revision ${revision.revid})`);
      continue;
    }
    const infobox = extractInfobox(revision.slots?.main?.content ?? "");
    const mainTitle = page.pageimage
      ? fileTitle(page.pageimage)
      : fileTitle(firstValue(infobox, ["image", "image1", "cover"]));
    const mapTitle = fileTitle(firstValue(infobox, ["map", "map_image", "mapimage", "layout"]));
    if (mainTitle) imageTitles.add(mainTitle);
    if (mapTitle) imageTitles.add(mapTitle);
    updates.push({ record, page, revision, infobox, mainTitle, mapTitle });
  }

  const images = new Map();
  if (imageTitles.size) {
    const imagePayload = await requestWikiApi({
      redirects: "1",
      prop: "info|imageinfo|revisions",
      inprop: "url",
      iiprop: "url|mime|size|sha1|user|extmetadata",
      iiurlwidth: "800",
      rvprop: "content",
      rvslots: "main",
      titles: [...imageTitles].join("|"),
    }, options, state, configuration);
    for (const page of imagePayload.query?.pages ?? []) {
      const image = mapWikiImage(page, configuration.origin);
      const title = page.title.replace(/ /g, "_");
      if (hasUsableWikiImage(image)) images.set(title, image);
      else console.warn(`skipping media without a usable display URL: ${page.title}`);
    }
  }

  for (const update of updates) {
    const { article } = update.record;
    const next = {
      ...article,
      fandomPageId: update.page.pageid ?? null,
      sourceUrl: update.page.fullurl ?? article.sourceUrl,
      canonicalUrl: update.page.canonicalurl ?? update.page.fullurl ?? article.canonicalUrl,
      latestRevisionId: update.revision.revid,
      importedAt: new Date().toISOString(),
      levelLocation: parseWikiLink(
        firstValue(update.infobox, ["location", "place", "setting"]),
        configuration.origin,
      ),
      previousLevels: parseWikiReferences(
        firstValue(update.infobox, ["previous_level", "previouslevel", "previous", "prev"]),
        configuration.origin,
        articleLookup,
      ),
      nextLevels: parseWikiReferences(
        firstValue(update.infobox, ["next_level", "nextlevel", "next"]),
        configuration.origin,
        articleLookup,
      ),
      games: parseWikiReferences(
        firstValue(update.infobox, ["game", "games"]),
        configuration.origin,
      ),
      date: parseWikiValue(firstValue(update.infobox, ["date"])),
      images: {
        main: images.get(update.mainTitle?.replace(/ /g, "_")) ?? article.images?.main ?? emptyWikiImage(),
        map: images.get(update.mapTitle?.replace(/ /g, "_")) ?? article.images?.map ?? emptyWikiImage(),
      },
      rawPayload: {
        revisionTimestamp: update.revision.timestamp ?? null,
        revisionSha1: update.revision.sha1 ?? null,
        resolvedTitle: update.page.title,
        mainImageTitle: update.mainTitle,
        mapImageTitle: update.mapTitle,
      },
    };
    console.log(`${options.dryRun ? "would update" : "updated"} ${article.id} to revision ${update.revision.revid}`);
    if (options.dryRun) console.log(JSON.stringify(next, null, 2));
    else await writeWikiArticleFile(update.record.filename, next);
  }
  return updates.length;
}
