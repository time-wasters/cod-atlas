# Codex repository instructions

These instructions apply to the entire repository. A more specific
`AGENTS.md` in a subdirectory takes precedence for files below it.

## Project goal

CoD Atlas is a database-free, statically deployable map of real-world
locations represented in CoD. Git is the source of truth and data
changes are intended to be reviewable through pull requests.

## Non-negotiable architecture

- Curated source data lives under `content/`.
- A level owns its coordinates through its embedded `locations` array.
- Do not create a shared places table, places YAML file, or place foreign key.
  Two levels in the same city may represent different buildings or coordinates.
- Nearby markers may be clustered dynamically by the map at render time; never
  merge source coordinates merely to simplify display.
- Keep Wiki import records separate from curated level records and connect them
  with `wikiArticle` IDs.
- Never let a Wiki refresh overwrite curated coordinates, precision, mode, or
  editorial notes without an explicit, reviewed change.
- Do not re-synchronize from the original Google document. It is historical
  provenance, not an active data source.
- Do not introduce a database, Supabase, or a runtime locations API unless the
  user explicitly changes the architecture.
- Preserve the plain static build produced by `npm run build:static` (Docker:
  `docker compose run --rm cod-atlas-tools npm run build:static`).

## Generated data

- `app/data/atlas.generated.json` is generated; never edit it manually.
- After changing `content/`, run `npm run data:build` (Docker:
  `docker compose run --rm cod-atlas-tools npm run data:build`) and commit the
  regenerated file together with the source change.
- The current regression baseline is 987 marker locations. A count change must
  be intentional and accompanied by an appropriate test update.

## Working procedure

### Command execution environment

- Do not assume Node.js or npm is installed on the host. Check availability
  before using host-side Node/npm commands.
- Prefer Docker for installs, data commands, linting, tests, and builds. Use the
  `builder` stage in `Dockerfile`, which contains the locked Node/npm toolchain.
- When a command must update a tracked file (for example `npm run data:build`),
  run the builder with the repository bind-mounted at `/app` and preserve the
  image's `/app/node_modules` separately so generated output is written back to
  the workspace without hiding installed dependencies.
- Do not install Node.js or npm on the host merely to run repository commands.
- Prefer `docker compose run --rm cod-atlas-tools npm ...` as the Docker
  equivalent of a local npm command. See `docs/docker-commands.md`.

1. Read `README.md`, `CONTRIBUTING.md`, and `docs/data-model.md` when relevant.
2. Make the smallest coherent change.
3. Run the focused check while iterating.
4. Before handing off a completed change, run:

   ```sh
   npm run data:check
   npm run lint
   npm test
   npm run build:static
   ```

   Docker equivalents:

   ```sh
   docker compose run --rm cod-atlas-tools npm run data:check
   docker compose run --rm cod-atlas-tools npm run lint
   docker compose run --rm cod-atlas-tools npm test
   docker compose run --rm cod-atlas-tools npm run build:static
   ```

5. Do not deploy, publish, push to a different remote, or change site access
   unless the user explicitly requests it.

## Code and content conventions

- Use TypeScript/React patterns already present in the repository.
- For AI-assisted research or editing of level locations and historical notes,
  read and follow `docs/map-research-ai-instructions.md` in full.
- Keep game labels short, human-readable, and ordered by release date.
- A level may contain more than one location.
- Valid modes are `singleplayer` and `multiplayer`.
- Valid precision values are `exact`, `approximate`, `city`, `region`,
  `country`, and `off-world`.
- Preserve source links and attribution for imported material.
- Do not add copyrighted screenshots or Wiki media unless their source,
  detail page, author, user link, and license are recorded.

## Licensing

- Source code is `AGPL-3.0-only`.
- Original project data and editorial content are `CC-BY-SA-4.0`.
- Third-party material retains its original license and must be documented in
  `NOTICE.md`; never imply that the project relicenses it.
