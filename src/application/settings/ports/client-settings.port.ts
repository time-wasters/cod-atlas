export type ClientSettings = Readonly<{
  campaignRouteAnimationEnabled: boolean;
  externalGameIconsEnabled: boolean;
  zoomAdaptiveMapOverlaysEnabled: boolean;
}>;

export type ClientSettingsPort = {
  getSnapshot: () => ClientSettings;
  getServerSnapshot: () => ClientSettings;
  subscribe: (listener: () => void) => () => void;
  update: (settings: Partial<ClientSettings>) => void;
};
