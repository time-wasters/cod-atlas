# Content editing instructions

These instructions apply to everything under `content/`.

- Treat files here as curated source data.
- Levels own their embedded marker locations. Games that have been organized
  by map type use `levels/<primary-game>/<map-type>/`; games not yet
  reorganized retain `levels/<primary-game>/<level-slug>.md`. Do not mix the
  two layouts within one game. `cod`, `cod-uo`, `cod-fh`, and `cod2` use
  `campaign` for records with `mode: singleplayer` and `multiplayer` for
  records with `mode: multiplayer`.
- Campaign filenames are `<order>-<level-slug>.md`, starting at `1`, without
  leading zeros or gaps. Multiplayer filenames remain `<level-slug>.md`.
- The stable `id` remains `<primary-game>-<level-slug>` in either layout; do
  not include the campaign order or map-type directory, and do not repeat the
  game prefix in the ID or filename.
- Do not create or reference a separate place entity.
- Every `games` ID must resolve to `games/<id>.yaml`.
- Every `wikiArticle` ID must resolve to
  `wiki-import/articles/<id>.json`.
- Keep historical/editorial notes in the Markdown body, not in generated JSON.
- Wiki import files are machine-oriented snapshots. Preserve their source URL,
  attribution fields, and stable ID when refreshing them.
- Use `precision: approximate` whenever coordinates represent a researched
  estimate rather than a verified point.
- Run `npm run data:build` after every content change. If host npm is
  unavailable, run
  `docker compose run --rm cod-atlas-tools npm run data:build` instead.
