export type AtlasUrlState = {
  query: string;
  gameId: string;
  country: string;
  series: string[];
  subseries: string[];
  continents: string[];
  precisions: string[];
  confidences: string[];
  methods: string[];
  showSingleplayer: boolean;
  showMultiplayer: boolean;
  showZombies: boolean;
  sidebarListMode: "locations" | "campaigns";
  levelId: string | null;
  locationId: string | null;
};
