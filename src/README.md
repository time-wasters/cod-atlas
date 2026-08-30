# Planned source architecture

This directory is a tracked scaffold for gradually modularizing CoD Atlas.
Creating it does not move or replace any current runtime, build, content, or
test files. The application continues to run from `app/`, `static/`, `worker/`,
`build/`, and `scripts/` until code is migrated in focused changes.

## Structure

```text
src/
|-- domain/                         # Pure atlas concepts and rules
|   |-- atlas/
|   |-- game/
|   |-- level/                      # Owns locations, campaigns, and overlays
|   `-- wiki-article/               # Separate imported Wiki records
|-- application/                    # Use cases and environment-facing ports
|   |-- atlas/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- atlas-compilation/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- export/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- map/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- media/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- preferences/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- progress-report/
|   |   |-- ports/
|   |   `-- use-cases/
|   `-- wiki-import/
|       |-- ports/
|       `-- use-cases/
|-- infrastructure/                 # Browser, build, framework, and service adapters
|   |-- atlas-data/
|   |   |-- dto/                    # Generated JSON transport contracts
|   |   `-- static-json/            # Read-only generated-data adapter
|   |-- browser/
|   |   |-- animation/
|   |   |-- downloads/
|   |   |-- local-storage/
|   |   `-- url/
|   |-- content/
|   |   |-- filesystem/
|   |   |-- markdown/
|   |   `-- yaml/
|   |-- external/
|   |   |-- call-of-duty-wiki/
|   |   `-- world-countries/
|   |-- framework/
|   |   |-- cloudflare/
|   |   |-- next/
|   |   `-- vite/
|   |-- mapping/
|   |   |-- leaflet/
|   |   `-- maplibre/
|   |-- media/
|   |   `-- sharp/
|   `-- reporting/
|       `-- markdown/
|-- presentation/                   # React UI grouped by visible feature
|   |-- atlas/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- state/
|   |   `-- styles/
|   |-- campaigns/
|   |   |-- components/
|   |   |-- formatters/
|   |   `-- styles/
|   |-- filters/
|   |   |-- components/
|   |   |-- state/
|   |   `-- styles/
|   |-- game-catalog/
|   |   |-- components/
|   |   `-- styles/
|   |-- level-briefing/
|   |   |-- components/
|   |   `-- styles/
|   |-- map/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- policies/
|   |   `-- styles/
|   |-- settings/
|   |   |-- components/
|   |   `-- styles/
|   |-- solar-system/
|   |   |-- components/
|   |   `-- styles/
|   `-- shared/
|       |-- components/
|       `-- styles/
`-- shared/                          # Truly cross-cutting, non-domain helpers
    |-- constants/
    |-- types/
    `-- utils/
```

## Current-to-planned mapping

| Current responsibility | Planned destination |
| --- | --- |
| Types and pure atlas rules in `app/page.tsx` | `domain/` |
| Filtering, selection, campaign routes, export, and preferences | `application/` |
| Progress calculations and report-update workflow | `application/progress-report/` |
| Generated atlas, map-overlay, and history-overlay JSON shapes | `infrastructure/atlas-data/dto/` |
| Generated JSON loading and indexing | `infrastructure/atlas-data/static-json/` |
| Leaflet and MapLibre integration | `infrastructure/mapping/` |
| URL, local-storage, and browser-download behavior | `infrastructure/browser/` |
| Markdown/YAML/filesystem compilation from `scripts/` | `infrastructure/content/` |
| Generated Markdown progress tables | `infrastructure/reporting/markdown/` |
| Wiki, country, and image-tool integrations | `infrastructure/external/` and `infrastructure/media/` |
| Next, Vite, static, and Cloudflare entrypoints | `infrastructure/framework/` |
| React sections currently in `app/page.tsx` | `presentation/` feature folders |

There is intentionally no shared place or standalone location domain. A level
continues to own its embedded locations, campaign metadata, and geographic
overlays. Curated records remain under `content/`; `src/` is for executable
source code and its contracts, not a replacement data store.

The placeholder files exist only so Git records the planned directories. They
can be removed one at a time as real source files are introduced.

## Migration status

The Wiki importer, external game-icon importer, level-image manager, progress
reporter, atlas URL-state adapter, generated atlas-data DTOs and read-only JSON
adapters, MapLibre label and worker-URL adapters, campaign-route builder, and
map-overlay opacity behavior are the first features organized here. Pure Wiki
article, level-media,
research-completion, level-mode, and location-precision rules live in `domain/`;
import, checking, preparation, report-update, and campaign-route workflows live
in `application/`; campaign route display formatting and the
environment-independent overlay-opacity display policy live in `presentation/`;
provider-specific validation, filesystem safety, Sharp processing, Markdown
reporting, browser URL transport, Leaflet animation and viewport adaptation,
MapLibre integration, and CLI details live in `infrastructure/`. Stable npm
commands still enter through their existing files under `scripts/`. Global CSS
is composed from concept-focused stylesheets owned by these presentation
features; `app/globals.css` remains the framework entrypoint only.
