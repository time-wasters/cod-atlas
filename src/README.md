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
|   |-- campaigns/
|   |   `-- use-cases/
|   |-- export/
|   |   |-- ports/
|   |   `-- use-cases/
|   |-- game-catalog/
|   |   `-- ports/
|   |-- level-briefing/
|   |   `-- ports/
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
|   |   |-- http/
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
|   |   |-- hooks/
|   |   `-- styles/
|   |-- map/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- policies/
|   |   `-- styles/
|   |-- settings/
|   |   |-- components/
|   |   |-- hooks/
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
normally owns its embedded locations, campaign metadata, and geographic
overlays. A distinct canonical variant may inherit locations from another
canonical level through `metadata.variantOf`; the content and compilation
layers resolve that link without creating a place entity. Curated records
remain under `content/`; `src/` is for executable source code and its contracts,
not a replacement data store.

The placeholder files exist only so Git records the planned directories. They
can be removed one at a time as real source files are introduced.

## Configuration files

Browser behavior settings live under [`shared/config/`](shared/config/).
Edit the relevant module's config and reload development or rebuild the site.
The extracted defaults preserve the existing behavior. Durations use the units
in their field names (`Ms`, `Seconds`); screen distances are pixels and travel
distances are meters.

| Config | Settings |
| --- | --- |
| [`campaign-playback.config.js`](shared/config/campaign-playback.config.js) | Default mission time (15 seconds) and available choices (10, 15, 30, 60 seconds) |
| [`campaign-route.config.js`](shared/config/campaign-route.config.js) | Route appearance, curve height/sampling, marching-ants speed/FPS, stop markers, initial fit, reveal delays/retries |
| [`map-camera.config.js`](shared/config/map-camera.config.js) | Initial view and zoom limits, viewport padding, filter fits, travel timing, focus presets, campaign overviews, sidebar transition/settling |
| [`location-zoom.config.js`](shared/config/location-zoom.config.js) | Location precision zooms and verified landmark close-ups |
| [`map-markers.config.js`](shared/config/map-markers.config.js) | Marker sizes, clustering radius/count bands, spider legs, selection pulse timing |
| [`map-overlay.config.js`](shared/config/map-overlay.config.js) | Browsing/campaign/history fades, stationary crossfades, decoded-image cache capacity, zoom-adaptive opacity curve |
| [`basemap.config.js`](shared/config/basemap.config.js) | Vector style URL, raster fallback URL, paired attribution, fallback timeout |
| [`related-levels.config.js`](shared/config/related-levels.config.js) | Collapsed list limit shared by the view model and expand/collapse control |
| [`tooltip.config.js`](shared/config/tooltip.config.js) | Hover delay, viewport margin, gap from the trigger |
| [`level-media.config.js`](shared/config/level-media.config.js) | Image/video crossfade and retention buffer |
| [`app-defaults.config.js`](shared/config/app-defaults.config.js) | Initial mode filters, open panels, defaults for persisted settings |

CSS animation durations and marker dimensions are supplied from these configs
through CSS custom properties. Cleanup timers use the same duration plus their
configured buffer. Change the config value rather than adding a second CSS
duration. Persisted settings still take precedence over defaults; mode defaults
also determine what a URL without `mode` selects. Explicit mode URLs retain
their meaning.

Tooling configuration stays beside its implementation and is not imported by
the browser:

- [`image-optimization.config.mjs`](infrastructure/media/sharp/image-optimization.config.mjs)
  controls JPEG/WebP quality, PNG compression/palette settings, encoder effort,
  and the minimum savings needed to replace an opaque main PNG with JPEG.
  Format, size, and dimension policies remain in the existing
  [`level-image.policy.mjs`](domain/level/level-image.policy.mjs).
- `WIKI_IMPORT_CONFIG` in
  [`wiki-configuration.mjs`](infrastructure/external/call-of-duty-wiki/wiki-configuration.mjs)
  controls batching, request timeout, attempt count, default/minimum pacing,
  retry backoff, and permitted server lag. The CLI's `--delay-ms` overrides the
  default pacing subject to its configured minimum. Wiki origin/contact details
  and optional game-icon providers continue to use the documented environment
  settings.

## Map camera configuration

Configure location zoom defaults in
[`shared/config/location-zoom.config.js`](shared/config/location-zoom.config.js).
Higher zoom values show a closer view.

| Location precision | Default zoom |
| --- | --- |
| `country` | 5 |
| `region` | 6 |
| `city` | 12 |
| `approximate` | 14 |
| `exact` | 17 |

City views use a fixed scale with surrounding context, rather than measured
city boundaries. Off-world locations do not request an Earth camera target.

Campaign playback chooses a fresh zoom for each stop from these defaults.
Manual marker focus uses the country, region, and city defaults; precise
markers retain the current zoom subject to the marker preset's limits.
Sidebar selection fits all locations in a group, capped at the lowest configured
zoom among them. The map's maximum zoom also limits camera movement.

The same config file defines verified campaign landmark close-ups: zoom 16
for approximate locations and 18 for exact locations. These require a named
landmark, high confidence, and human location verification.

Manual game overlay focus fits the overlay and marker bounds. Campaign
playback stops at the wider of the configured location view and the view needed
to fit the attached overlay and marker. The fit accounts for viewport space
covered by details and briefing panels. Sidebar group selection also includes
attached overlays in its bounds. These limits apply to automatic camera focus;
users can still zoom closer manually.
Animation timing, campaign overview stops, and overlay zoom ceilings live in
[`shared/config/map-camera.config.js`](shared/config/map-camera.config.js).
Configuration changes take effect on the next development reload or site build.

## Map overlay transitions

Configure game overlay fades separately in
[`shared/config/map-overlay.config.js`](shared/config/map-overlay.config.js).
All durations are in milliseconds.

| Setting | Default browsing | Campaign playback |
| --- | --- | --- |
| `fadeOutMs` | 100 | 500 |
| `fadeInMs` | 100 | 1000 |
| `fadeInBeforeArrivalMs` | Immediate fade-in | 1000 |
| `sameAreaCrossfadeMs` | Not used | 500 |

When changing campaign stops, the outgoing overlay fades out while the camera
starts moving. The destination overlay stays hidden during travel and any
intermediate overview wait. Its fade-in begins `fadeInBeforeArrivalMs` before
the final camera stage finishes, blending it in as the camera arrives. For
shorter flights the fade starts with the final stage. Disabling an overlay
keeps it hidden.

Consecutive campaign overlays with matching or nearly matching footprints use
a simultaneous `sameAreaCrossfadeMs` image crossfade when the destination image
and marker already fit the unobstructed viewport at the desired zoom. The camera
stays still, skipping travel/overview waits and keeping the route's marching
ants moving. The outgoing image stays visible until its decoded replacement is
ready. `sameAreaTolerancePixels` (24 by default) limits how far corresponding
overlay corners may shift on screen. Other transitions retain the normal
campaign fades; camera travel timing uses the fitted bounds' center.

Early arrival starts the fade-in immediately; cancellation clears the pending
fade-in timer and restores the selected overlay. Reduced-motion visits reveal
the overlay on arrival without an animated fade. Replaced overlays are removed
only after their fade-out completes. Zoom-based opacity still applies.

## Map overlay preloading

The injected `OverlayImagePort` loads and decodes the selected overlay, the
first stop of a selected campaign, and the previous/next campaign stops as soon
as those selections are known. This also runs while a campaign is paused.
Automatic playback starts its mission timer after the next overlay's preload
attempt has completed, so the next transition has a prepared image. Download
or decode failures do not block playback and can be retried later.

The browser image cache retains up to `cache.maximumEntries` upcoming decoded
images (eight by default), deduplicates
requests by URL, and respects the deployment's base path. Rendering acquires
the decoded image itself and gives it directly to Leaflet. Each acquisition
consumes its cache entry so overlapping fades use independent image elements.
An unexpectedly slow manual selection waits for decoding before its overlay
can fade in; stale loads cannot add an overlay after selection changes.
Previously fetched files also remain eligible for the browser's HTTP cache.

## Migration status

The Wiki importer, external game-icon importer, level-image manager, progress
reporter, atlas URL-state adapter, generated atlas-data DTOs and read-only JSON
adapters, atlas filtering, campaign option building, related-level and media
selection, KML generation and downloading, browser HTTP clients, local-storage
preference stores, focused atlas selection, URL synchronization, filter,
settings, and level-briefing hooks, MapLibre label and worker-URL adapters,
campaign-route builder, and map-overlay opacity behavior are the first features
organized here. Shared link and flag primitives, atlas title and mode display,
game catalogue controls, filter controls, and the solar-system overlay now live
in focused presentation component files rather than `app/page.tsx`. The atlas
header, sidebar, footer, map stage, level details, level media, related-level
panel, project information, settings, and level briefing are also isolated as
feature-owned presentation components with focused view models and callbacks.
`app/page.tsx` is now only the Next.js route entrypoint. The Next client
composition root under `infrastructure/framework/next/` loads and indexes the
generated JSON before injecting it into the presentation-owned atlas page.
The presentation page now delegates filter-catalog construction, filtered-data
derivation, campaign selection, selected media state, overlay selection, entry
link formatting, and sidebar/detail view-model assembly to concept-focused
files. This keeps `atlas-page.tsx` as an explicit composition boundary without
hiding the page behind a single catch-all hook.
Browser-facing dependencies now follow explicit application ports for atlas
URL state, static-data indexing, KML downloads, level briefings, external game
icon manifests, and both stored display preferences. Their browser and static
JSON implementations live in `infrastructure/` and are injected by the Next
client composition root; presentation code no longer imports these concrete
browser adapters.
Leaflet map
lifecycle, marker, campaign-route, overlay, and viewport orchestration is split
between focused presentation hooks and infrastructure renderers. Pure Wiki
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
