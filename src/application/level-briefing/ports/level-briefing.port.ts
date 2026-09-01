export type LevelBriefingResponse =
  | { levelId: string; status: "ready"; content: string }
  | { levelId: string; status: "missing"; content: string | null };

export type LevelBriefingPort = {
  load: (levelId: string) => Promise<LevelBriefingResponse>;
};
