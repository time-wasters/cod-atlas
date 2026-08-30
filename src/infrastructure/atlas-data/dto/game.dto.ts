export type GameDto = {
  id: string;
  code: string;
  label: string;
  labelLong: string;
  released: string;
  series: "world-war-ii" | "modern-warfare" | "black-ops" | "standalone";
  subseries: "main" | "reboot" | "remaster" | "add-on" | "spin-off" | null;
  remasterOf: string | null;
  icon?: string;
};
