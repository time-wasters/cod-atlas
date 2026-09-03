# Content editing instructions

These instructions apply to everything under `content/`.

- Treat files here as curated source data.
- Levels own their embedded marker locations. Games that have been organized
  by map type use `levels/<primary-game>/<map-type>/`; games not yet
  reorganized retain `levels/<primary-game>/<level-slug>.md`. Do not mix the
  two layouts within one game. `cod`, `cod-uo`, `cod-fh`, `cod2`, `cod2-bro`,
  `cod3`, `rtv`, `cod4`, `mw2`, `mw3`, `bo-nds`, `mw3-nds`, `wz`, `wz2`, and `mwiii` use `campaign`
  for records with `mode: singleplayer` and `multiplayer` for records with
  `mode: multiplayer`. `mw2` and `mw3` additionally use `special-ops` for
  records with `mode: special-ops`.
  `waw`, `bo`, `bo-nds`, and `bo6` additionally use `zombies` for records with
  `mode: zombies`.
- Campaign filenames are `<order>-<level-slug>.md`, starting at `1`, without
  leading zeros or gaps. Multiplayer, Special Ops, and Zombies filenames remain
  `<level-slug>.md`.
- Level media mirrors the level file's relative path under
  `public/images/levels/`, including its map-type directory and filename
  without the final `.md` extension.
- The stable `id` remains `<primary-game>-<level-slug>` in either layout; do
  not include the campaign order or map-type directory, and do not repeat the
  game prefix in the ID or filename.
- Canonical level files contain exactly one owner in `games`. Represent an
  unchanged appearance in another game with `<level-slug>.ref.md` under that
  game's directory. References may override only `title`, `wikiArticle`,
  `campaign`, `metadata`, and their Markdown body; all protected geographic
  and canonical fields inherit unchanged.
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
