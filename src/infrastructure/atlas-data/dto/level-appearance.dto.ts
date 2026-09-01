export type LevelAppearanceDto = {
  gameId: string;
  title: string;
  wiki: string;
  wikiArticle: string;
  notesId: string;
  hasLevelNotes: boolean;
  bannerKey: string;
  campaign?: {
    id: string;
    label: string;
  } | null;
  campaignOrder?: number;
  metadata?: Record<string, unknown>;
};
