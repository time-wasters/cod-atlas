import { validateGameImageSource } from "../../../domain/game/game-image-source.policy.mjs";
import { createSteamGridDbIconRequest } from "./create-steam-grid-db-icon-request.mjs";
import { createSteamIconRequests } from "./create-steam-icon-requests.mjs";

export function createGameIconRequests(game, configuration) {
  validateGameImageSource(game);
  if (game.images?.steam) return createSteamIconRequests(game, configuration.steamTemplate);
  if (game.images?.steamgriddb) {
    return createSteamGridDbIconRequest(game, configuration.steamGridDbTemplate);
  }
  return [];
}
