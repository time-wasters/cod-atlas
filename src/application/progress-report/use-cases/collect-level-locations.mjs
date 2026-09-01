export function collectLevelLocations(levels) {
  return levels.flatMap((level) => level.locations.map((location) => ({
    ...location,
    gameId: level.gameId,
    mode: level.mode,
    verified: level.verified.locations,
  })));
}
