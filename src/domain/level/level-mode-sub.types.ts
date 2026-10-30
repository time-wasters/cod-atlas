export type MultiplayerModeSub = "battle-royale" | "dmz";
export type MultiplayerModeSubValue = MultiplayerModeSub | MultiplayerModeSub[];
export type LevelModeSub = "special-ops" | "survival" | "challenge" | MultiplayerModeSub;
export type LevelModeSubValue = LevelModeSub | MultiplayerModeSub[];
