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
  sidebarListMode: "locations" | "campaigns" | "updates";
  levelId: string | null;
  locationId: string | null;
};

export type AtlasUrlStatePort = {
  read: () => AtlasUrlState;
  subscribe: (listener: () => void) => () => void;
  write: (state: AtlasUrlState, mode: "push" | "replace") => void;
};
