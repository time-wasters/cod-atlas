import type {
  LevelBriefingPort,
  LevelBriefingResponse,
} from "../../../application/level-briefing/ports/level-briefing.port.js";

export async function loadLevelBriefing(levelId: string): Promise<LevelBriefingResponse> {
  try {
    const notesUrl = new URL(`level-notes/${levelId}.md`, document.baseURI);
    const response = await fetch(notesUrl);
    if (!response.ok) throw new Error(`Level notes returned ${response.status}`);

    const content = await response.text();
    return {
      levelId,
      status: content.trim() ? "ready" : "missing",
      content,
    };
  } catch {
    return { levelId, status: "missing", content: null };
  }
}

export const levelBriefingClient: LevelBriefingPort = {
  load: loadLevelBriefing,
};
