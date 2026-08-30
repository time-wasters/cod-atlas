import assert from "node:assert/strict";
import test from "node:test";
import { createGameIconRequests } from "../src/application/media/use-cases/create-game-icon-requests.mjs";

const configuration = {
  steamTemplate: "https://steam.example.test/%app%/%icon%.%extension%",
  steamGridDbTemplate: "https://steamgriddb.example.test/%game%/%icon%/%file%",
};

test("Steam icon is preferred and client icon is imported when present", () => {
  const requests = createGameIconRequests({
    id: "cod",
    images: { steam: { app: 2620, icon: "a".repeat(40), clienticon: "b".repeat(40) } },
  }, configuration);
  assert.deepEqual(requests.map(({ kind, relativePath }) => ({ kind, relativePath })), [
    { kind: "icon", relativePath: "steam/cod/icon.jpg" },
    { kind: "clienticon", relativePath: "steam/cod/clienticon.ico" },
  ]);
});

test("SteamGridDB identifiers produce a local icon request", () => {
  const [request] = createGameIconRequests({
    id: "cod3",
    images: { steamgriddb: { game: 12, icon: 34, file: `${"a".repeat(32)}.png` } },
  }, configuration);
  assert.equal(request.url, `https://steamgriddb.example.test/12/34/${"a".repeat(32)}.png`);
  assert.equal(request.relativePath, "steamgriddb/cod3/icon.png");
});
