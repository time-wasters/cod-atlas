export type MapOverlayOpacityPreferencePort = {
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
  subscribe: (listener: () => void) => () => void;
  setEnabled: (enabled: boolean) => void;
};
