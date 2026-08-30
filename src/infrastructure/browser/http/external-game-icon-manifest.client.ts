export type ExternalGameIconManifest = Record<string, {
  icon?: { provider: "steam" | "steamgriddb"; path: string };
  clienticon?: { provider: "steam"; path: string };
}>;

export async function loadExternalGameIconManifest(signal?: AbortSignal) {
  const manifestUrl = new URL("images/games_external/manifest.json", document.baseURI);
  const response = await fetch(manifestUrl, { signal });
  if (!response.ok) throw new Error(`External icon manifest returned ${response.status}`);
  return response.json() as Promise<ExternalGameIconManifest>;
}

export function resolveExternalGameIconUrl(path: string) {
  return new URL(path.replace(/^\/+/, ""), document.baseURI).href;
}
