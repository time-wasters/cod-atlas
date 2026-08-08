# Content editing instructions

These instructions apply to everything under `content/`.

- Treat files here as curated source data.
- Levels live in `levels/<primary-game>/<level-id>.md` and own their embedded
  marker locations.
- Do not create or reference a separate place entity.
- Every `games` ID must resolve to `games/<id>.yaml`.
- Every `wikiArticle` ID must resolve to
  `wiki-import/articles/<id>.json`.
- Keep historical/editorial notes in the Markdown body, not in generated JSON.
- Wiki import files are machine-oriented snapshots. Preserve their source URL,
  attribution fields, and stable ID when refreshing them.
- Use `precision: approximate` whenever coordinates represent a researched
  estimate rather than a verified point.
- Run `npm run data:build` after every content change.
