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

  assert.equal(campaigns.length, 7);
  assert.deepEqual(
    campaigns.map(({ mode, modeSub }) => mode === "other" ? modeSub : mode),
    ["singleplayer", "singleplayer", "multiplayer", "zombies", "special-ops", "survival", "challenge"],
  );
  assert.deepEqual(
    new Set(campaigns.map(({ key }) => key)),
    new Set([
      "cod:default:singleplayer",
      "cod:singleplayer:shared",
      "cod:multiplayer:shared",
      "cod:zombies:shared",
      "cod:other:special-ops:shared",
      "cod:other:survival:shared",
      "cod:other:challenge:shared",
    ]),
  );
});

test("all ordered singleplayer levels form an In-Game Order campaign alongside named campaigns", () => {
  const games = [
    { id: "cod", code: "COD", label: "Call of Duty", released: "2003-10-29" },
    { id: "fixture-other", code: "OTHER", label: "Other", released: "2004-01-01" },
  ];
  const missions = [3, 1, 2].map((order) => ({
    ...campaignEntry(`mission-${order}`, "singleplayer"),
    campaign: order === 2 ? undefined : null,
    campaignOrder: order,
    coordinates: order === 2 ? null : [10, 20],
  }));
  const entries = [
    { ...missions[1], id: "mission-1:secondary", primary: false, coordinates: [30, 40] },
    ...missions,
    {
      ...campaignEntry("named-mission", "singleplayer"),
      campaign: { id: "singleplayer", label: "Named Campaign" },
      campaignOrder: 4,
    },
    ...["singleplayer", "multiplayer", "zombies", "other"].map((mode) => ({
      ...campaignEntry(`excluded-${mode}`, mode, mode === "other" ? "challenge" : undefined),
      campaign: null,
      campaignOrder: mode === "singleplayer" ? undefined : 1,
    })),
    {
      ...campaignEntry("other-game-mission", "singleplayer"),
      gameIds: ["fixture-other"],
      campaign: null,
    },
  ];
  const snapshot = structuredClone(entries);
  const options = (gameCode) => buildCampaignOptions({ gameCode, games, groups: [{ entries }] });
  const campaigns = options("COD");
  const campaign = campaigns.find(({ label }) => label === "In-Game Order");

  assert.equal(campaigns.length, 2);
  assert.equal(campaign.key, "cod:default:singleplayer");
  assert.equal(campaign.mode, "singleplayer");
  assert.deepEqual(campaign.levels.map(({ entry }) => entry.levelId), ["mission-1", "mission-2", "mission-3", "named-mission"]);
  assert.deepEqual(campaign.routeLevels.map(({ order }) => order), [1, 2, 3, 4]);
  assert.equal(campaign.levels[0].entry.id, "mission-1");
  assert.deepEqual(campaign.routeLevels[0].coordinates, [10, 20]);
  assert.equal(campaign.routeLevels[1].coordinates, null);
  assert.deepEqual(campaigns.find(({ label }) => label === "Named Campaign").levels
    .map(({ entry }) => entry.levelId), ["named-mission"]);
  assert.deepEqual(options("OTHER").map(({ key, levels }) => ({
    key, levelIds: levels.map(({ entry }) => entry.levelId),
  })), [{ key: "fixture-other:default:singleplayer", levelIds: ["other-game-mission"] }]);
  assert.deepEqual(options("all"), []);
  assert.deepEqual(options("UNKNOWN"), []);
  assert.deepEqual(entries, snapshot, "default campaigns must not modify source entries");
});

test("default campaigns use the selected appearance's title and play order", () => {
  const games = [
    { id: "fixture-owner", code: "OWNER", label: "Owner", released: "2000-01-01" },
    { id: "fixture-returning", code: "RETURNING", label: "Returning", released: "2001-01-01" },
  ];
  const entries = [1, 2].map((order) => ({
    ...campaignEntry(`fixture-mission-${order}`, "singleplayer"),
    gameIds: games.map(({ id }) => id),
    campaignOrder: order,
    appearances: [{
      gameId: "fixture-returning",
      title: `Returning Mission ${3 - order}`,
      campaignOrder: 3 - order,
    }],
  }));
  const snapshot = structuredClone(entries);
  const options = (gameCode) => buildCampaignOptions({ gameCode, games, groups: [{ entries }] });
  const [campaign] = options("RETURNING");

  assert.equal(campaign.label, "In-Game Order");
  assert.deepEqual(campaign.levels.map(({ entry }) => entry.levelId), ["fixture-mission-2", "fixture-mission-1"]);
  assert.deepEqual(campaign.routeLevels.map(({ title, order }) => ({ title, order })), [
    { title: "Returning Mission 1", order: 1 },
    { title: "Returning Mission 2", order: 2 },
  ]);
  assert.equal(options("OWNER").find(({ sequence }) => !sequence).label, "Shared campaign ID");
  assert.deepEqual(entries, snapshot);
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

  const campaign = options("RETURNING").find(({ id }) => id === "returning");
  assert.equal(campaign.key, "fixture-returning:singleplayer:returning");
  assert.equal(campaign.label, returning.label);
  assert.deepEqual(campaign.levels.map(({ entry }) => entry.levelId),
    ["fixture-mission-2", "fixture-mission-1"]);
  assert.deepEqual(campaign.levels.map(({ entry }) => entry.campaignOrder), [1, 2]);
  assert.deepEqual(campaign.routeLevels.map(({ title, order }) => ({ title, order })), [
    { title: "Returning Mission 1", order: 1 },
    { title: "Returning Mission 2", order: 2 },
  ]);
  const ownerCampaign = options("OWNER").find(({ id }) => id === "original");
  assert.equal(ownerCampaign.label, original.label);
  assert.deepEqual(ownerCampaign.levels.map(({ entry }) => entry.levelId),
    ["fixture-mission-1", "fixture-mission-2"]);
  assert.deepEqual(options("UNGROUPED"), []);
  assert.deepEqual(options("UNKNOWN"), []);
  assert.deepEqual(entries, snapshot, "appearance selection must not modify canonical entries");
});

test("multiplayer campaigns with the same ID remain separate by subtype", () => {
  const campaigns = buildCampaignOptions({
    gameCode: "COD",
    games: [{ id: "cod", code: "COD", label: "Call of Duty", released: "2003-10-29" }],
    groups: [{ entries: [
      campaignEntry("dmz", "multiplayer", "dmz"),
      campaignEntry("standard", "multiplayer"),
      campaignEntry("br", "multiplayer", "battle-royale"),
    ] }],
  });

  assert.deepEqual(campaigns.map(({ key }) => key), [
    "cod:multiplayer:shared",
    "cod:multiplayer:battle-royale:shared",
    "cod:multiplayer:dmz:shared",
  ]);
  assert.deepEqual(campaigns.map(({ levels }) => levels.map(({ entry }) => entry.levelId)),
    [["standard"], ["br"], ["dmz"]]);
});

test("a combined appearance belongs to both subtype campaigns without changing its owner", () => {
  const games = [
    { id: "cod", code: "COD", label: "Owner", released: "2000-01-01" },
    { id: "returning", code: "RETURNING", label: "Returning", released: "2001-01-01" },
  ];
  const entry = {
    ...campaignEntry("shared-map", "multiplayer", "battle-royale"),
    gameIds: ["cod", "returning"],
    appearances: [{
      gameId: "returning",
      campaign: { id: "shared", label: "Shared campaign ID" },
      modeSub: ["battle-royale", "dmz"],
    }],
  };
  const snapshot = structuredClone(entry);
  const options = (gameCode) => buildCampaignOptions({ gameCode, games, groups: [{ entries: [entry] }] });
  const returning = options("RETURNING");
  assert.deepEqual(returning.map(({ modeSub }) => modeSub), ["battle-royale", "dmz"]);
  assert.deepEqual(returning.map(({ levels }) => levels.map(({ entry }) => entry.levelId)),
    [["shared-map"], ["shared-map"]]);
  assert.deepEqual(returning[0].levels[0].entry.modeSub, ["battle-royale", "dmz"]);
  assert.deepEqual(options("COD").map(({ modeSub }) => modeSub), ["battle-royale"]);
  assert.deepEqual(entry, snapshot);
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

  assert.equal(campaigns.length, 2);
  const returningCampaign = campaigns.find(({ id }) => id === "returning");
  assert.equal(returningCampaign.key, "fixture-returning:singleplayer:returning");
  assert.equal(returningCampaign.levels[0].entry.levelId, entry.levelId);
});

test("Chronological reorders the complete singleplayer campaign and its route without changing source data", () => {
  const games = [{ id: "cod", code: "COD", label: "Call of Duty", released: "2003-10-29" }];
  const entries = [1, 2, 3].map((order) => ({
    ...campaignEntry(`mission-${order}`, "singleplayer"),
    campaignOrder: order,
    coordinates: order === 2 ? null : [10 + order, 20],
    appearances: [{ gameId: "cod", campaignOrder: order, chronologicalOrder: order === 1 ? 3 : order - 1 }],
  }));
  const snapshot = structuredClone(entries);
  const campaigns = buildCampaignOptions({ gameCode: "COD", games, groups: [{ entries }] });

  assert.deepEqual(campaigns.map(({ label }) => label), ["In-Game Order", "Chronological"]);
  assert.ok(campaigns.every(({ mode }) => mode === "singleplayer"));
  assert.deepEqual(campaigns[0].levels.map(({ entry }) => entry.levelId), ["mission-1", "mission-2", "mission-3"]);
  const chronological = campaigns[1];
  assert.equal(chronological.key, "cod:default:singleplayer:chronological");
  assert.deepEqual(chronological.levels.map(({ entry }) => entry.levelId), ["mission-2", "mission-3", "mission-1"]);
  assert.deepEqual(chronological.levels.map(({ entry }) => entry.campaignOrder), [1, 2, 3]);
  assert.deepEqual(chronological.routeLevels.map(({ levelId, order, coordinates }) => ({ levelId, order, coordinates })), [
    { levelId: "mission-2", order: 1, coordinates: null },
    { levelId: "mission-3", order: 2, coordinates: [13, 20] },
    { levelId: "mission-1", order: 3, coordinates: [11, 20] },
  ]);
  assert.deepEqual(entries, snapshot);
});

test("Chronological is hidden when the selected appearance's ordering is missing or incomplete", () => {
  const games = [
    { id: "cod", code: "COD", label: "Owner", released: "2000-01-01" },
    { id: "returning", code: "RETURNING", label: "Returning", released: "2001-01-01" },
  ];
  for (const chronologicalOrders of [[undefined, undefined], [1, undefined], [1, 1], [1, 3]]) {
    const entries = [1, 2].map((order) => ({
      ...campaignEntry(`mission-${order}`, "singleplayer"),
      gameIds: ["cod", "returning"],
      appearances: [
        { gameId: "cod", campaignOrder: order, chronologicalOrder: 3 - order },
        { gameId: "returning", campaignOrder: order, chronologicalOrder: chronologicalOrders[order - 1] },
      ],
    }));
    const campaigns = buildCampaignOptions({ gameCode: "RETURNING", games, groups: [{ entries }] });
    assert.deepEqual(campaigns.map(({ label }) => label), ["In-Game Order"]);
  }
});
