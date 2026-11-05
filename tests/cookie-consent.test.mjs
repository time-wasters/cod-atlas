import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { COOKIE_CONSENT_KEY, createCookieConsentStore, cookieConsentStore } from "../src/infrastructure/browser/local-storage/cookie-consent.store.js";
import { canLoadResource } from "../src/application/settings/resource-consent.policy.js";

function browserStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const reads = [];
  const writes = [];
  const removed = [];
  return {
    values, reads, writes, removed,
    getItem(key) { reads.push(key); return values.get(key) ?? null; },
    setItem(key, value) { writes.push(key); values.set(key, value); },
    removeItem(key) { removed.push(key); values.delete(key); },
  };
}

test("pending consent and rejection never write storage or enable optional features", () => {
  const storage = browserStorage();
  const consent = createCookieConsentStore({ storage: () => storage });
  const pending = consent.getSnapshot();
  assert.deepEqual(pending, { decided: false, preferences: false, externalServices: false });
  assert.equal(consent.getSnapshot(), pending);
  assert.ok(storage.reads.length > 0);
  assert.ok(storage.reads.every((key) => key === COOKIE_CONSENT_KEY));
  consent.update({ preferences: false, externalServices: false });
  assert.deepEqual(consent.getSnapshot(), { decided: true, preferences: false, externalServices: false });
  assert.deepEqual(storage.writes, []);
  assert.deepEqual(storage.removed, []);
});

test("each purpose needs its own opt-in, survives reload, and can be withdrawn", () => {
  const storage = browserStorage();
  const consent = createCookieConsentStore({ storage: () => storage });
  consent.update({ preferences: true, externalServices: false });
  const reloaded = createCookieConsentStore({ storage: () => storage });
  assert.deepEqual(reloaded.getSnapshot(), { decided: true, preferences: true, externalServices: false });
  consent.update({ preferences: false, externalServices: true });
  assert.deepEqual(consent.getSnapshot(), { decided: true, preferences: false, externalServices: true });
  consent.update({ preferences: false, externalServices: false });
  assert.equal(storage.values.has(COOKIE_CONSENT_KEY), false);
  assert.equal(consent.getSnapshot().externalServices, false);
});

test("malformed consent never grants permission; unavailable storage supports consent for this visit", () => {
  for (const value of ["broken", "null", "{}", '{"preferences":"yes","externalServices":true}']) {
    const storage = browserStorage({ [COOKIE_CONSENT_KEY]: value });
    const consent = createCookieConsentStore({ storage: () => storage });
    assert.equal(consent.getSnapshot().preferences, false);
    assert.equal(consent.getSnapshot().externalServices, false);
  }
  const consent = createCookieConsentStore({ storage: () => { throw new Error("Storage blocked"); } });
  assert.equal(consent.getSnapshot().externalServices, false);
  consent.update({ preferences: false, externalServices: true });
  assert.equal(consent.getSnapshot().externalServices, true);
  consent.update({ preferences: false, externalServices: false });
  assert.equal(consent.getSnapshot().externalServices, false);
});

test("clearing consent in another tab immediately notifies subscribers and blocks optional features", () => {
  const storage = browserStorage();
  let storageListener;
  let notifications = 0;
  let stopped = false;
  const consent = createCookieConsentStore({ storage: () => storage, listen: (listener) => {
    storageListener = listener;
    return () => { stopped = true; };
  } });
  const unsubscribe = consent.subscribe(() => { notifications += 1; });
  consent.update({ preferences: true, externalServices: true });
  storage.values.delete(COOKIE_CONSENT_KEY);
  storageListener({ key: COOKIE_CONSENT_KEY });
  assert.deepEqual(consent.getSnapshot(), { decided: false, preferences: false, externalServices: false });
  assert.equal(notifications, 2);
  unsubscribe();
  assert.equal(stopped, true);
});

test("external image URLs fail closed before consent while same-origin resources remain available", () => {
  const base = "https://atlas.example/subpath/";
  for (const source of ["https://media.example/image.png", "//media.example/image.png", "\\\\media.example/image.png", "http://atlas.example/image.png"]) {
    assert.equal(canLoadResource(source, false, base), false, source);
    assert.equal(canLoadResource(source, true, base), true, source);
  }
  for (const source of ["images/banner.png", "/images/banner.png", "https://atlas.example/images/banner.png"]) {
    assert.equal(canLoadResource(source, false, base), true, source);
  }
  for (const source of ["", "javascript:alert(1)", "data:image/svg+xml,test", "https://user:pass@atlas.example/image.png"]) {
    assert.equal(canLoadResource(source, true, base), false, source);
  }
});

test("saved and legacy preferences are untouched until consent; withdrawal deletes only app preferences", async () => {
  // Transpile this TS adapter in memory so the test also works on Node 22.13.
  const sourceUrl = new URL("../src/infrastructure/browser/local-storage/client-settings.store.ts", import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
    .replace(/from "([^"]+)"/g, (_, specifier) => `from ${JSON.stringify(new URL(specifier, sourceUrl).href)}`);
  const { clientSettingsStore: settings } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  const storage = browserStorage({
    "cod-atlas:client-settings": JSON.stringify({ campaignRouteAnimationEnabled: false, externalGameIconsEnabled: true, zoomAdaptiveMapOverlaysEnabled: false }),
    "cod-atlas:external-game-icons": "true",
    "cod-atlas:zoom-adaptive-map-overlays": "false",
    "unrelated:key": "keep",
  });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage, addEventListener() {}, removeEventListener() {} } });
  let unsubscribe;
  try {
    cookieConsentStore.update({ preferences: false, externalServices: false });
    storage.reads.length = storage.writes.length = 0;
    unsubscribe = settings.subscribe(() => {});
    assert.equal(settings.getSnapshot().externalGameIconsEnabled, false);
    settings.update({ externalGameIconsEnabled: true });
    assert.equal(settings.getSnapshot().externalGameIconsEnabled, true);
    assert.deepEqual(storage.reads.filter((key) => key !== COOKIE_CONSENT_KEY), []);
    assert.deepEqual(storage.writes, []);
    cookieConsentStore.update({ preferences: true, externalServices: false });
    assert.equal(settings.getSnapshot().campaignRouteAnimationEnabled, false);
    assert.ok(storage.reads.includes("cod-atlas:client-settings"));
    settings.update({ externalGameIconsEnabled: false });
    assert.ok(storage.writes.includes("cod-atlas:client-settings"));
    cookieConsentStore.update({ preferences: false, externalServices: false });
    assert.equal(storage.values.has("cod-atlas:client-settings"), false);
    assert.equal(storage.values.has("cod-atlas:external-game-icons"), false);
    assert.equal(storage.values.has("cod-atlas:zoom-adaptive-map-overlays"), false);
    assert.equal(storage.values.get("unrelated:key"), "keep");
    storage.reads.length = storage.writes.length = 0;
    settings.update({ zoomAdaptiveMapOverlaysEnabled: false });
    assert.deepEqual(storage.reads.filter((key) => key !== COOKIE_CONSENT_KEY), []);
    assert.deepEqual(storage.writes, []);
  } finally {
    unsubscribe?.();
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  }
});
