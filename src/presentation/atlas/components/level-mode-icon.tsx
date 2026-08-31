import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";

export function LevelModeIcon({ mode }: { mode: AtlasEntryDto["modes"][number] }) {
  if (mode === "zombies") return (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" role="img" aria-label="Zombies">
      <path d="M5 10a7 7 0 1 1 14 0v5l-2 2h-2v3h-2v-3h-2v3H9v-3H7l-2-2Z" />
      <circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="m10 14 2-2 2 2" />
    </svg>
  );
  return mode === "multiplayer" ? (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" role="img" aria-label="Multiplayer">
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" />
      <path d="M2.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M13 14c.8-.7 1.8-1 3-1 3 0 4.7 2 5 5.5" />
    </svg>
  ) : (
    <svg className="mission-mode-icon" viewBox="0 0 24 24" role="img" aria-label="Campaign">
      <circle cx="12" cy="7.5" r="3.5" /><path d="M5 20c.5-5 2.8-7.5 7-7.5s6.5 2.5 7 7.5" />
    </svg>
  );
}
