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

export function buildAtlasKml<
  TEntry extends KmlAtlasEntry,
  TGroup extends KmlAtlasGroup<TEntry>,
>(groups: readonly TGroup[]) {
  const placemarks = groups.flatMap((group) => group.entries.flatMap((entry) => {
    if (!entry.coordinates) return [];
    const [latitude, longitude] = entry.coordinates;
    const description = [entry.game, locationPath(entry), locationPrecision(entry), entry.wiki].join(" \u00b7 ");

    return `<Placemark><name>${escapeXml(entry.title)}</name><description>${escapeXml(description)}</description><Point><coordinates>${longitude},${latitude},0</coordinates></Point></Placemark>`;
  }));

  return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>CoD Atlas</name>${placemarks.join("")}</Document></kml>`;
}
