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
    campaignEntry("survival", "other", "survival"),
    campaignEntry("singleplayer", "singleplayer"),
    campaignEntry("zombies", "zombies"),
    campaignEntry("special-ops", "other", "special-ops"),
  ];
  const campaigns = buildCampaignOptions({
    gameCode: "COD",
    games: [{ id: "cod", code: "COD", label: "Call of Duty", released: "2003-10-29" }],
    groups: [{ entries }],
  });

  assert.equal(campaigns.length, 6);
  assert.deepEqual(
    campaigns.map(({ mode, modeSub }) => mode === "other" ? modeSub : mode),
    ["singleplayer", "multiplayer", "zombies", "special-ops", "survival", "challenge"],
  );
  assert.deepEqual(
    new Set(campaigns.map(({ key }) => key)),
    new Set([
      "cod:singleplayer:shared",
      "cod:multiplayer:shared",
      "cod:zombies:shared",
      "cod:other:special-ops:shared",
      "cod:other:survival:shared",
      "cod:other:challenge:shared",
    ]),
  );
});

test("campaign grouping, titles and mission order use the selected game appearance", () => {
  const original = { id: "original", label: "Original Campaign" };
  const returning = { id: "returning", label: "Returning Campaign" };
  const games = [
    { id: "fixture-owner", code: "OWNER", label: "Owner", released: "2000-01-01" },
    { id: "fixture-returning", code: "RETURNING", label: "Returning", released: "2001-01-01" },
    { id: "fixture-ungrouped", code: "UNGROUPED", label: "Ungrouped", released: "2002-01-01" },
  ];
  const entries = [1, 2].map((order) => ({
    ...campaignEntry(`fixture-mission-${order}`, "singleplayer"),
    gameIds: games.map(({ id }) => id),
    campaign: original,
    campaignOrder: order,
    appearances: [
      { gameId: "fixture-owner", campaign: original, campaignOrder: order },
      {
        gameId: "fixture-returning",
        title: `Returning Mission ${3 - order}`,
        campaign: returning,
        campaignOrder: 3 - order,
      },
      { gameId: "fixture-ungrouped" },
    ],
  }));
  const snapshot = structuredClone(entries);
  const options = (gameCode) => buildCampaignOptions({ gameCode, games, groups: [{ entries }] });

  const [campaign] = options("RETURNING");
  assert.equal(campaign.key, "fixture-returning:singleplayer:returning");
  assert.equal(campaign.label, returning.label);
  assert.deepEqual(campaign.levels.map(({ entry }) => entry.levelId),
    ["fixture-mission-2", "fixture-mission-1"]);
  assert.deepEqual(campaign.levels.map(({ entry }) => entry.campaignOrder), [1, 2]);
  assert.deepEqual(campaign.routeLevels.map(({ title, order }) => ({ title, order })), [
    { title: "Returning Mission 1", order: 1 },
    { title: "Returning Mission 2", order: 2 },
  ]);
  assert.equal(options("OWNER")[0].label, original.label);
  assert.deepEqual(options("OWNER")[0].levels.map(({ entry }) => entry.levelId),
    ["fixture-mission-1", "fixture-mission-2"]);
  assert.deepEqual(options("UNGROUPED"), []);
  assert.deepEqual(options("UNKNOWN"), []);
  assert.deepEqual(entries, snapshot, "appearance selection must not modify canonical entries");
});

test("a reference can supply campaign information when its canonical entry has none", () => {
  const entry = {
    ...campaignEntry("fixture-mission", "singleplayer"),
    gameIds: ["fixture-owner", "fixture-returning"],
    campaign: null,
    appearances: [{
      gameId: "fixture-returning",
      campaign: { id: "returning", label: "Returning Campaign" },
      campaignOrder: 1,
    }],
  };
  const campaigns = buildCampaignOptions({
    gameCode: "RETURNING",
    games: [{ id: "fixture-returning", code: "RETURNING", label: "Returning", released: "2001-01-01" }],
    groups: [{ entries: [entry] }],
  });

  assert.equal(campaigns.length, 1);
  assert.equal(campaigns[0].key, "fixture-returning:singleplayer:returning");
  assert.equal(campaigns[0].levels[0].entry.levelId, entry.levelId);
});
