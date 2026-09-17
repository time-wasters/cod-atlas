export type GameSubseries = "main" | "reboot" | "remaster" | "add-on" | "spin-off";

export type GameDto = {
  id: string;
  code: string;
  label: string;
  labelLong: string;
  released: string;
  series: "world-war-ii" | "modern-warfare" | "black-ops" | "standalone";
  subseries: GameSubseries[];
  remasterOf: string | null;
  developer: { id: string; name: string }[];
  icon?: string;
};
