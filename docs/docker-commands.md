# Running npm commands through Docker

Node.js and npm are optional on the host. The `cod-atlas-tools` Compose service
uses the locked builder stage from `Dockerfile`, mounts the repository at
`/app`, and keeps container dependencies in a named volume. Generated files
are therefore written back to the working tree.

Copy `.env.example` to the ignored `.env` for local configuration. The checked
out repository already works with the documented port defaults; Wiki access
remains disabled until its commented example values are explicitly enabled.

Replace any local command of the form `npm ...` with:

```sh
docker compose run --rm cod-atlas-tools npm ...
```

Common equivalents:

| Local command | Docker command |
| --- | --- |
| `npm ci` | `docker compose build cod-atlas-tools` |
| `npm run data:build` | `docker compose run --rm cod-atlas-tools npm run data:build` |
| `npm run data:check` | `docker compose run --rm cod-atlas-tools npm run data:check` |
| `npm run icons:import` | `docker compose run --rm cod-atlas-tools npm run icons:import` |
| `npm run lint` | `docker compose run --rm cod-atlas-tools npm run lint` |
| `npm test` | `docker compose run --rm cod-atlas-tools npm test` |
| `npm run build` | `docker compose run --rm cod-atlas-tools npm run build` |
| `npm run build:static` | `docker compose run --rm cod-atlas-tools npm run build:static` |
| `npm run wiki:import -- <options>` | `docker compose run --rm cod-atlas-tools npm run wiki:import -- <options>` |

For the development server, publish the tooling service's configured port:

```sh
docker compose run --rm --service-ports cod-atlas-tools \
  npm run dev -- --port 3000
```

Open <http://localhost:3000>. Set `COD_ATLAS_DEV_PORT` before running the
command to choose a different host port; the container still listens on 3000.

## External game icon cache

`npm run icons:import` reads optional Steam and SteamGridDB metadata from
`content/games/*.yaml`. It does nothing unless `STEAM_ICON_URL` or
`STEAMGRIDDB_ICON_URL` is configured. Enabled providers are downloaded into
the ignored `public/images/games_external/` build cache, together with a
`manifest.json`. Steam `icon` images are imported as JPEG and optional
`clienticon` images as ICO, using `%extension%` in the Steam URL template.
Existing files with a valid matching image signature are reused without a
network request; missing or invalid files are downloaded.

Both regular and static builds run this command automatically. An unavailable
external image is reported and omitted from the manifest so the existing local
game icon can remain the eventual frontend fallback.

Compose creates `cod-atlas-node-modules` for tooling dependencies. It does not
attach that volume to the production `cod-atlas` service. Rebuild the tooling
image after `package.json`, `package-lock.json`, or `Dockerfile` changes:

```sh
docker compose build cod-atlas-tools
```
