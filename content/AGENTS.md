# Content editing instructions

These instructions apply to everything under `content/`.

- Treat files here as curated source data.
- Levels normally own their embedded marker locations. A canonical variant may
  omit `locations` and inherit them through `metadata.variantOf`; an explicit
  `locations: []` remains empty. Games that have been organized
  by map type use `levels/<primary-game>/<map-type>/`; games not yet
  reorganized retain `levels/<primary-game>/<level-slug>.md`. Do not mix the
  two layouts within one game. `cod`, `cod-uo`, `cod-fh`, `cod2`, `cod2-bro`,
  `cod3`, `rtv`, `cod4`, `cod4-nds`, `waw-nds`, `mw2`, `mw3`, `bo-nds`, `mw3-nds`, `bo-d`, `wz`, `wz2`, `mwiii`, `bo7`, and `mw4` use `campaign`
  for records with `mode: singleplayer` and `multiplayer` for records with
  `mode: multiplayer`. `mw2`, `mw3`, and `bo7` additionally use `special-ops` for
  records with `mode: other` and `modeSub: special-ops`.
  BO7 Endgame uses that broad subtype and adds `metadata.activityType: endgame`.
  `waw`, `bo`, `bo-nds`, `bo6`, and `bo7` additionally use `zombies` for records with
  `mode: zombies`.
  `waw-nds` additionally uses `challenge` for its separately selectable
  Challenge records with `mode: other` and `modeSub: challenge`.
- Campaign filenames are `<order>-<level-slug>.md`, starting at `1`, without
  leading zeros or gaps. Multiplayer, Special Ops, Zombies, and Challenge
  filenames remain `<level-slug>.md`.
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
