# Codex repository instructions

Applies repository-wide; a deeper `AGENTS.md` overrides this for its subtree.

## Project and architecture

CoD Atlas maps real-world CoD locations without a database. Git is the source
of truth; data changes must be reviewable in PRs. Preserve the plain static
output of `npm run build:static`.

- Curated data lives in `content/`. Canonical levels own embedded `locations`.
  A canonical variant may omit `locations` to inherit via `metadata.variantOf`;
  explicit `locations: []` never inherits. Levels may have multiple locations.
- Never create shared places tables/YAML/foreign keys or merge source
  coordinates for display: levels in one city may depict different sites.
  Cluster nearby markers only at render time.
- Keep Wiki imports separate, linked by `wikiArticle`. Refreshes must not
  overwrite curated coordinates, precision, mode, or notes without explicit review.
- No database, Supabase, or runtime locations API unless the user explicitly
  changes the architecture.

## Workflow

1. Read `README.md`, `CONTRIBUTING.md`, and `docs/data-model.md` when relevant.
   For AI research/editing of locations or historical notes, read and follow
   `docs/map-research-ai-instructions.md` in full.
2. Make the smallest coherent change using existing TypeScript/React patterns.
3. Run data checks, lint, tests, builds, or other validation **only when the
   user explicitly requests it**, including where contributor docs list checks.
4. At handoff, give the smallest relevant validation commands for the user to
   run; state they were not run. Recommend focused checks when sufficient.
   Fix returned errors using the user's output and give the updated rerun command.
   For changes warranting the full suite: `npm run data:check`, `npm run lint`,
   `npm test`, `npm run build:static`.
5. Do not deploy, publish, push to a different remote, or change site access
   without an explicit user request.

### Commands and generated data

- Prefer Docker for installs, data, lint, tests, and builds. Use the locked
  `Dockerfile` builder stage through `docker compose run --rm cod-atlas-tools npm ...`
  in place of `npm ...`; for installation use `docker compose build cod-atlas-tools`.
  See `docs/docker-commands.md`.
- Check host Node/npm availability before using them; never install them merely
  for repository commands.
- To write generated output, bind-mount the repository at `/app` and preserve
  the image's `/app/node_modules` separately (the tooling Compose service does this).
- Never edit or commit ignored `app/data/*.generated.json`; commands generate
  them as needed. After `content/` changes, recommend `npm run data:check`, which
  validates without generating artifacts.
- Regression baseline: **1277 marker locations**. Count changes must be
  intentional and include the appropriate test update.

## Content conventions

- Game labels: short, readable, ordered by release date.
- Modes: `singleplayer`, `multiplayer`, `zombies`, `other`. Only `other` requires
  `modeSub`: `special-ops`, `survival`, or `challenge`; all other modes omit it.
- `content-update` supports every mode/subtype with a documented release grouping.
- Prefer map-type directories: `campaign/`, `multiplayer/`, `special-ops/`,
  `survival/`, `zombies/`, `challenge/`. Only campaign filenames carry play-order prefixes.
- Roster audits must cover all applicable categories: Campaign, Multiplayer,
  Zombies, Challenge, Special Ops, Survival/Hostiles/Safeguard/Exo Survival,
  Nightmares, Strike Force, War, Extinction.
- Precision: `exact`, `approximate`, `city`, `region`, `country`, `off-world`.
- Preserve imported source links and attribution. Copyrighted screenshots/Wiki
  media require recorded source, detail page, author, user link, and license.

## Licensing

Code: `AGPL-3.0-only`. Original data/editorial content: `CC-BY-SA-4.0`.
Third-party material retains its original license; document it in `NOTICE.md`
and never imply project relicensing.
