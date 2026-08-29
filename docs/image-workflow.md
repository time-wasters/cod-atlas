# Preparing and checking level images

Level images are optimized before they are committed. The static build serves
the committed files as-is; it does not convert images or maintain an image
cache. Keep archival originals outside this repository when they may be needed
again.

Both commands are limited to raster files below `public/images/levels/` and
reject symbolic links. They support PNG, JPEG, and WebP files. Existing WebM
level banners remain outside this raster-image workflow.

## Prepare selected images

`images:prepare` rewrites only explicitly selected files or directories. Start
with a dry run:

```sh
npm run images:prepare -- --dry-run public/images/levels/cod2-bro/campaign
npm run images:prepare -- public/images/levels/cod2-bro/campaign
```

A single file can be selected instead:

```sh
npm run images:prepare -- public/images/levels/cod2-bro/campaign/1-we-ve-been-through-worse/main.png
```

Preparation applies the following rules:

- `main.png` is compressed and, when it has no alpha channel, compared with a
  quality-85 JPEG using 4:4:4 chroma. It becomes `main.jpg` only when that is at
  least 10% smaller. Main images are reduced to a longest edge of 2560 px.
- `maps/overlay.png` remains PNG, is palette-optimized at quality 92, and is
  reduced to a longest edge of 4096 px.
- Other PNGs, including files in `extra/`, receive lossless PNG compression.
  Existing JPEG and WebP files are recompressed at quality 85.
- A same-format file is replaced only when the result is smaller, unless it
  must be resized to meet the dimension limit.
- Embedded image metadata is removed. Preserve required source, author, and
  rights information in the curated level or Wiki-import metadata.

Writes use a temporary sibling file. A PNG-to-JPEG conversion refuses to run
when `main.jpg` already exists, so an existing file is never silently replaced.

Docker equivalent:

```sh
docker compose run --rm cod-atlas-tools npm run images:prepare -- --dry-run public/images/levels/cod2-bro/campaign
docker compose run --rm cod-atlas-tools npm run images:prepare -- public/images/levels/cod2-bro/campaign
```

## Check committed images

`images:check` is read-only and scans every raster level image by default:

```sh
npm run images:check
```

Files or directories can be supplied to narrow a local check. `--strict`
also treats recommended-size warnings as failures; CI uses the normal mode so
legacy images can be improved incrementally while hard limits remain enforced.

```sh
npm run images:check -- public/images/levels/cod2-bro
npm run images:check -- --strict public/images/levels/cod2-bro
```

The checker decodes each file, verifies that its extension matches its actual
format, and enforces these policies:

| Image role | Accepted formats | Recommended maximum | Hard maximum | Longest edge |
| --- | --- | ---: | ---: | ---: |
| `main` | PNG, JPEG | 512 KiB | 1 MiB | 2560 px |
| `maps/overlay.png` | PNG | 1 MiB | 3 MiB | 4096 px |
| Other raster media | PNG, JPEG, WebP | 1 MiB | 2 MiB | 4096 px |

Exceeding a recommended maximum emits a warning. Invalid images, mismatched
extensions, unsupported formats, excessive dimensions, and files over a hard
maximum make the command fail.

Docker equivalent:

```sh
docker compose run --rm cod-atlas-tools npm run images:check
```
