type KmlAtlasEntry = {
  title: string;
  game: string;
  country: string;
  region?: string | null;
  city?: string | null;
  landmark?: string | null;
  method?: string;
  precision: string;
  wiki: string;
  coordinates?: [number, number] | null;
};

type KmlAtlasGroup<TEntry extends KmlAtlasEntry> = {
  entries: TEntry[];
};

type KmlExportMetadata = {
  exportedAt?: Date;
  platformUrl: string;
  sourceUrl: string;
};

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '\"': "&quot;",
  })[character]!);
}

function locationPath(entry: KmlAtlasEntry) {
  return [entry.country, entry.region, entry.city, entry.landmark].filter(Boolean).join(" \u203a ");
}

function locationPrecision(entry: KmlAtlasEntry) {
  if (entry.method === "manual-approximate") return "approximate historical position";
  if (entry.precision === "city") return "city-level";
  return "country fallback";
}

function extendedData(name: string, value: string) {
  return [
    `      <Data name="${escapeXml(name)}">`,
    `        <value>${escapeXml(value)}</value>`,
    "      </Data>",
  ];
}

export function buildAtlasKml<
  TEntry extends KmlAtlasEntry,
  TGroup extends KmlAtlasGroup<TEntry>,
>(groups: readonly TGroup[], {
  exportedAt = new Date(),
  platformUrl,
  sourceUrl,
}: KmlExportMetadata) {
  const placemarks = groups.flatMap((group) => group.entries.flatMap((entry) => {
    if (!entry.coordinates) return [];
    const [latitude, longitude] = entry.coordinates;
    const description = [entry.game, locationPath(entry), locationPrecision(entry), entry.wiki].join(" \u00b7 ");

    return [
      "    <Placemark>",
      `      <name>${escapeXml(entry.title)}</name>`,
      `      <description>${escapeXml(description)}</description>`,
      "      <Point>",
      `        <coordinates>${longitude},${latitude},0</coordinates>`,
      "      </Point>",
      "    </Placemark>",
    ].join("\n");
  }));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <Document>",
    "    <name>CoD Atlas - Map Export</name>",
    "",
    "    <atom:author>",
    "      <atom:name>CoD Atlas</atom:name>",
    "    </atom:author>",
    `    <atom:link href="${escapeXml(sourceUrl)}"/>`,
    "",
    "    <description>Exported from CoD Atlas. See the source platform for attribution and licensing information.</description>",
    "",
    "    <ExtendedData>",
    ...extendedData("platform", "CoD Atlas"),
    ...extendedData("platformUrl", platformUrl),
    ...extendedData("copyright", "CoD Atlas contributors; third-party material remains copyright of its respective rights holders."),
    ...extendedData("license", "Original CoD Atlas data and editorial content: CC-BY-SA-4.0; third-party material retains its original license."),
    ...extendedData("exportedAt", exportedAt.toISOString()),
    ...extendedData("generator", "CoD Atlas KML Exporter v1.2"),
    "    </ExtendedData>",
    "",
    ...placemarks,
    "  </Document>",
    "</kml>",
    "",
  ].join("\n");
}
