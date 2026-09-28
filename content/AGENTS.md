# Content editing instructions

These instructions apply to everything under `content/`.

- Treat files here as curated source data.
- Levels normally own their embedded marker locations. A canonical variant may
  omit `locations` and inherit them through `metadata.variantOf`; an explicit
  `locations: []` remains empty.
- Level rosters should generally use `levels/<primary-game>/<map-type>/`.
  Map `singleplayer` to `campaign`, `multiplayer` to `multiplayer`, and
  `zombies` to `zombies`. For `mode: other`, use the directory named by
  `modeSub`: `special-ops`, `survival`, or `challenge`.
- Keep one layout per game. A legacy flat roster may remain flat until the
  entire game is deliberately reorganized; never mix flat canonical records
  with map-type directories for the same game.
- Campaign filenames are `<order>-<descriptive-name>.md`, starting at `1`, without
  leading zeros or gaps. Multiplayer, Special Ops, Survival, Zombies, and Challenge
  filenames use `<descriptive-name>.md`.
- Level media mirrors the level file's relative path under
  `public/images/levels/`, including its map-type directory and filename
  without the final `.md` extension.
- Stable IDs are defined by frontmatter, remain prefixed by the primary game,
  and do not need to match filenames. Do not include the campaign order or
  map-type directory in the ID.
- Canonical level files contain exactly one owner in `games`. Represent an
  unchanged appearance in another game with `<descriptive-name>.ref.md` under that
  game's directory. References may override only `title`, `wikiArticle`,
  `campaign`, `metadata`, and their Markdown body; all protected geographic
  and canonical fields inherit unchanged.
- Use `metadata.variantOf` for a distinct canonical map or activity that is a
  variant of another canonical level. If `locations` is omitted, the build
  inherits the target's locations; if it is present, the variant keeps its own.
- Do not create or reference a separate place entity.
- Every `games` ID must resolve to `games/<id>.yaml`.
- Every `wikiArticle` ID must resolve to
  `wiki-import/articles/<id>.json`.
- Keep historical/editorial notes in the Markdown body, not in generated JSON.
- Wiki import files are machine-oriented snapshots. Preserve their source URL,
  attribution fields, and stable ID when refreshing them.
- Use `precision: approximate` whenever coordinates represent a researched
  estimate rather than a verified point.
- Use `npm run data:check` for focused validation after a content change. If
  host npm is unavailable, use
  `docker compose run --rm cod-atlas-tools npm run data:check`. Generated JSON
  is an ignored build artifact and must not be committed.
