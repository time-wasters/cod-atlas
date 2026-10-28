export type AtlasUrlState = {
  query: string;
  // null uses the default/template; "all" explicitly selects all; [] selects none.
  gameIds: string[] | "all" | null;
  country: string;
  series: string[];
  subseries: string[];
  developers: string[];
  continents: string[];
  precisions: string[];
  confidences: string[];
  methods: string[];
  showSingleplayer: boolean;
  showMultiplayer: boolean;
  showZombies: boolean;
  showOther: boolean;
  sidebarListMode: "locations" | "campaigns" | "updates";
  campaignKey: string | null;
  levelId: string | null;
  locationId: string | null;
};

export type AtlasUrlStatePort = {
  read: () => AtlasUrlState;
  subscribe: (listener: () => void) => () => void;
  write: (state: AtlasUrlState, mode: "push" | "replace") => void;
};
