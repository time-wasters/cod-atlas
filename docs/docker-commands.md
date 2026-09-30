# Running npm commands through Docker

Host Node/npm is optional. The `cod-atlas-tools` Compose service uses the locked
`Dockerfile` builder stage, bind-mounts the repository at `/app`, and preserves
dependencies in the `cod-atlas-node-modules` volume. Outputs reach the working
tree; `app/data/*.generated.json` stays ignored and must not be committed.
The production `cod-atlas` service does not attach this dependency volume.

Copy `.env.example` to ignored `.env` for local configuration. Default ports
work without changes; Wiki access requires explicitly enabling the commented values.

Build tooling instead of host `npm ci`; rebuild after changes to `package.json`,
`package-lock.json`, or `Dockerfile`:

```sh
docker compose build cod-atlas-tools
```

For every other `npm ...` command, preserve its arguments and prepend
`docker compose run --rm cod-atlas-tools`:

```sh
docker compose run --rm cod-atlas-tools npm run data:check
docker compose run --rm cod-atlas-tools npm test
docker compose run --rm cod-atlas-tools npm run wiki:import -- <options>
```

This also covers `data:build`, `progress:update`, `icons:import`,
`images:prepare`, `images:check`, `lint`, `build`, and `build:static`.
Level images are optimized before commit, not during builds. Both image commands
scan all level images by default and accept paths under `public/images/levels/`;
`images:check` is read-only. See [image workflow](image-workflow.md) for dry runs,
conversion rules, limits, and strict checking.

Publish the tooling service's port for development:

```sh
docker compose run --rm --service-ports cod-atlas-tools npm run dev -- --port 3000
```

Open <http://localhost:3000>. Set `COD_ATLAS_DEV_PORT` beforehand to change the
host port; the container still listens on 3000.

## External game icon cache

`npm run icons:import` reads optional Steam, SteamGridDB, and MobyGames metadata
from `content/games/*.yaml`. It does nothing unless `STEAM_ICON_URL`,
`STEAMGRIDDB_ICON_URL`, or `MOBYGAMES_ICON_URL` is configured.

Enabled providers populate ignored `public/images/games_external/` and its
`manifest.json`. Steam imports `icon` as JPEG and optional `clienticon` as ICO
using `%extension%` in its URL template. SteamGridDB/MobyGames use `%file%` and
the source extension. Valid matching image signatures permit cache reuse without
requests; missing/invalid files are downloaded.

Regular and static builds run the importer automatically. Unavailable images
are reported and omitted from the manifest, allowing the local game icon fallback.
