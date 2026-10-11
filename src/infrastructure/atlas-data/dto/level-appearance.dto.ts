import type { MultiplayerModeSubValue } from "../../../domain/level/level-mode-sub.types.js";

export type LevelAppearanceDto = {
  gameId: string;
  title: string;
  wiki: string;
  wikiArticle: string;
  notesId: string;
  hasLevelNotes: boolean;
  bannerKey: string;
  modeSub?: MultiplayerModeSubValue;
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
