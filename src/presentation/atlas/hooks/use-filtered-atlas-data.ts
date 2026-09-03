"use client";

import { useMemo } from "react";
import { collectMapFitCoordinates } from "../../../application/atlas/use-cases/collect-map-fit-coordinates.js";
import {
  filterAtlasGroups,
  type AtlasFilterCriteria,
} from "../../../application/atlas/use-cases/filter-atlas-groups.js";
import { listRepresentedGames } from "../../../application/atlas/use-cases/list-represented-games.js";
import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";

export function useFilteredAtlasData({
  criteria,
  data,
}: {
  criteria: AtlasFilterCriteria;
  data: AtlasDataDto;
}) {
  const {
    confidences,
    continents,
    country,
    gameCode,
    gameSeries,
    gameSubseries,
    methods,
    precisions,
    query,
    showMultiplayer,
    showSingleplayer,
    showSpecialOps,
    showZombies,
  } = criteria;
  const games = useMemo(
    () => listRepresentedGames(data.games, data.groups),
    [data.games, data.groups],
  );
  const { groups, countries } = useMemo(
    () => filterAtlasGroups<AtlasEntryDto, AtlasGroupDto>({
      groups: data.groups,
      games: data.games,
      criteria: {
        confidences,
        continents,
        country,
        gameCode,
        gameSeries,
        gameSubseries,
        methods,
        precisions,
        query,
        showMultiplayer,
        showSingleplayer,
        showSpecialOps,
        showZombies,
      },
    }),
    [
      confidences,
      continents,
      country,
      data.games,
      data.groups,
      gameCode,
      gameSeries,
      gameSubseries,
      methods,
      precisions,
      query,
      showMultiplayer,
      showSingleplayer,
      showSpecialOps,
      showZombies,
    ],
  );
  const mapFitCoordinates = useMemo(() => collectMapFitCoordinates(groups), [groups]);
  const spaceLocations = useMemo(
    () => groups.flatMap((group) => group.entries
      .filter((entry) => entry.precision === "off-world")
      .map((entry) => ({ group, entry }))),
    [groups],
  );

  return {
    countries,
    games,
    groups,
    mapFitCoordinates,
    spaceLocations,
  };
}
