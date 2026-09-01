export type ExternalGameIconsPreferencePort = {
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
  subscribe: (listener: () => void) => () => void;
  setEnabled: (enabled: boolean) => void;
};
