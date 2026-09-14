import assert from "node:assert/strict";
import test from "node:test";
import { buildCampaignOptions } from "../src/application/campaigns/use-cases/build-campaign-options.ts";

function campaignEntry(id, mode, modeSub) {
  return {
    id,
    levelId: id,
    title: id,
    primary: true,
    gameIds: ["cod"],
    modes: [mode],
    ...(modeSub ? { modeSub } : {}),
    campaign: { id: "shared", label: "Shared campaign ID" },
    campaignOrder: 1,
    coordinates: [10, 20],
  };
}

test("campaigns with the same ID remain separate across game modes", () => {
  const entries = [
    campaignEntry("multiplayer", "multiplayer"),
    campaignEntry("challenge", "other", "challenge"),
    campaignEntry("singleplayer", "singleplayer"),
    campaignEntry("zombies", "zombies"),
    campaignEntry("special-ops", "other", "special-ops"),
  ];
  const campaigns = buildCampaignOptions({
    gameCode: "COD",
    games: [{ id: "cod", code: "COD", label: "Call of Duty", released: "2003-10-29" }],
    groups: [{ entries }],
  });

  assert.equal(campaigns.length, 5);
  assert.deepEqual(
    campaigns.map(({ mode, modeSub }) => mode === "other" ? modeSub : mode),
    ["singleplayer", "multiplayer", "zombies", "special-ops", "challenge"],
  );
  assert.deepEqual(
    new Set(campaigns.map(({ key }) => key)),
    new Set([
      "cod:singleplayer:shared",
      "cod:multiplayer:shared",
      "cod:zombies:shared",
      "cod:other:special-ops:shared",
      "cod:other:challenge:shared",
    ]),
  );
});
