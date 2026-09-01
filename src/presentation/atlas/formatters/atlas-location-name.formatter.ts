type NamedAtlasLocation = {
  country: string;
  region?: string | null;
  city?: string | null;
  landmark?: string | null;
};

export function formatAtlasLocationName(location: NamedAtlasLocation) {
  return location.landmark ?? location.city ?? location.region ?? location.country;
}
