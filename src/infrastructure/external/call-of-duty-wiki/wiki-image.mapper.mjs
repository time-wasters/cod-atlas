import { parseWikiMarkupText } from "./wiki-markup-text.parser.mjs";

const COPYRIGHTED_MEDIA_TEMPLATE = /{{\s*Copyrighted[ _]Media(?:\s*[|}])/i;
const COPYRIGHTED_MEDIA_NOTICE = `This is an image/video/audio file of a non-free copyrighted video or computer game, and the copyright for it is most likely held by the company or person that developed the game. It is believed that the use of a limited number of web-resolution screenshots

for identification and critical commentary on
  â€¢ the computer or video game in question or
  â€¢ the copyrighted character(s) or item(s) depicted on the screenshot in question
on the Call of Duty Wiki, hosted on servers in the United States by the non-profit Fandom,

qualifies as fair use under United States copyright law, as such display does not significantly impede the right of the copyright holder to sell the copyrighted material, is not being used to generate profit in this context, and presents ideas that cannot be exhibited otherwise. See Non-free content.`;

function htmlText(value) {
  return parseWikiMarkupText(value?.value?.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&"));
}

function htmlUrl(value, wikiOrigin) {
  const href = value?.value?.match(/href=["']([^"']+)/i)?.[1];
  return href?.startsWith("/") ? `${wikiOrigin}${href}` : href ?? null;
}

export function mapWikiImage(page, wikiOrigin) {
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

export function hasUsableWikiImage(image) {
  return Boolean(image?.sourceUrl && image.thumbnailUrl && image.detailPageUrl);
}

export function emptyWikiImage() {
  return {
    sourceUrl: null,
    thumbnailUrl: null,
    detailPageUrl: null,
    author: { name: null, userUrl: null, role: null },
    license: { name: null, url: null },
    rights: { status: "unknown", notice: null, noticeUrl: null },
  };
}
