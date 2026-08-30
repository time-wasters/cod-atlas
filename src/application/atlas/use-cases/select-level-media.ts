type SelectableLevelAppearance = {
  gameId: string;
  wikiArticle: string;
  bannerKey: string;
};

type SelectableLevelImage = {
  origin?: string;
  thumbnailUrl: string;
};

type SelectableLevelMedia<TImage extends SelectableLevelImage> = {
  main: TImage | null;
  map: TImage | null;
};

type SelectLevelMediaInput<
  TAppearance extends SelectableLevelAppearance,
  TImage extends SelectableLevelImage,
  TMedia extends SelectableLevelMedia<TImage>,
> = {
  entryId: string;
  appearances: readonly TAppearance[];
  selectedGameId: string | null;
  levelBanners: Readonly<Record<string, TImage>>;
  wikiMedia: Readonly<Record<string, TMedia>>;
  failedLevelBanners: ReadonlySet<string>;
};

export function selectLevelMedia<
  TAppearance extends SelectableLevelAppearance,
  TImage extends SelectableLevelImage,
  TMedia extends SelectableLevelMedia<TImage>,
>({
  entryId,
  appearances,
  selectedGameId,
  levelBanners,
  wikiMedia,
  failedLevelBanners,
}: SelectLevelMediaInput<TAppearance, TImage, TMedia>): {
  selectedAppearance: TAppearance;
  selectedMedia: TMedia | undefined;
  selectedLevelBanner: TImage | null;
  selectedImage: TImage | null;
  selectedImageIsLocal: boolean;
  selectedImageKey: string | null;
} {
  const ownerAppearance = appearances[0];
  if (!ownerAppearance) throw new Error(`Atlas entry ${entryId} has no appearances`);

  const selectedAppearance = appearances.find((appearance) => appearance.gameId === selectedGameId)
    ?? ownerAppearance;
  const selectedMedia = wikiMedia[selectedAppearance.wikiArticle];
  const selectedAppearanceBanner = failedLevelBanners.has(selectedAppearance.bannerKey)
    ? null
    : levelBanners[selectedAppearance.bannerKey] ?? null;
  const ownerLevelBanner = failedLevelBanners.has(ownerAppearance.bannerKey)
    ? null
    : levelBanners[ownerAppearance.bannerKey] ?? null;
  const selectedLevelBanner = selectedAppearanceBanner ?? ownerLevelBanner;
  const selectedImage = selectedLevelBanner ?? selectedMedia?.main ?? selectedMedia?.map ?? null;

  return {
    selectedAppearance,
    selectedMedia,
    selectedLevelBanner,
    selectedImage,
    selectedImageIsLocal: selectedImage?.origin === "local",
    selectedImageKey: selectedImage ? `${entryId}:${selectedImage.thumbnailUrl}` : null,
  };
}
