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
  contentUpdate?: {
    id: string;
    label: string;
  } | null;
  metadata?: Record<string, unknown>;
};
