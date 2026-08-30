import type { WikiImageDto } from "./wiki-image.dto.js";

export type WikiMediaDto = {
  main: WikiImageDto | null;
  map: WikiImageDto | null;
};
