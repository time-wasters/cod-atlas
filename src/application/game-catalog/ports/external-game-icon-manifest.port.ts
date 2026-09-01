export type ExternalGameIconManifest = Record<string, {
  icon?: { provider: "steam" | "steamgriddb"; path: string };
  clienticon?: { provider: "steam"; path: string };
}>;

export type ExternalGameIconManifestPort = {
  load: (signal?: AbortSignal) => Promise<ExternalGameIconManifest>;
  resolveUrl: (path: string) => string;
};
