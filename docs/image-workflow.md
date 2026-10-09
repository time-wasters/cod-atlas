# Preparing and checking level images

Optimize before commit; static builds serve committed files unchanged, without
conversion or image caching. Keep reusable archival originals outside the repo.
Both commands handle PNG/JPEG/WebP only under `public/images/levels/` and reject
symlinks. Existing WebM banners are outside this workflow.

Use the [Docker command prefix](docker-commands.md) without host npm.

## Prepare images

Default scope: all raster level images. Preview first, then write:

```sh
npm run images:prepare -- --dry-run
npm run images:prepare
```

Optional file/directory arguments narrow either operation, for example:

```sh
npm run images:prepare -- public/images/levels/cod2-bro/campaign
npm run images:prepare -- public/images/levels/cod2-bro/campaign/1-we-ve-been-through-worse/main.png
```

Rules:

- `main.png`: compress; if no alpha channel, compare with quality-85 JPEG,
  4:4:4 chroma. Convert to `main.jpg` only if at least 10% smaller.
  Main images: longest edge 2560 px.
- `maps/overlay.png`: retain PNG, palette-optimize at quality 92.
  `maps/overlay.jpg`: retain JPEG, quality 85. Both: longest edge 4096 px.
- Other PNGs (including `extra/`): lossless compression. Existing JPEG/WebP: quality 85.
- Markdown images accept PNG/JPEG/WebP; clickable historical overlays require
  canonical `.png` or `.jpg` filenames.
- Replace same-format files only if smaller or resizing is needed to meet limits.
- Strip embedded metadata; preserve required source/author/rights in curated
  level or Wiki-import metadata.
- Write through a temporary sibling file. PNG-to-JPEG conversion refuses an
  existing `main.jpg`, preventing silent replacement.

## Check committed images

Read-only; defaults to all raster level images. Paths narrow the check:

```sh
npm run images:check
npm run images:check -- public/images/levels/cod2-bro
npm run images:check -- --strict public/images/levels/cod2-bro
```

Each file is decoded, checked against its extension, and subject to these limits:

| Image role | Formats | Recommended maximum | Hard maximum | Longest edge |
| --- | --- | ---: | ---: | ---: |
| `main` | PNG, JPEG | 512 KiB | 1 MiB | 2560 px |
| `maps/overlay.png` or `maps/overlay.jpg` | PNG, JPEG | 1 MiB | 3 MiB | 4096 px |
| Other raster media | PNG, JPEG, WebP | 1 MiB | 2 MiB | 4096 px |

Recommended-size excess warns; `--strict` makes it fail. Invalid images,
mismatched extensions, unsupported formats, excessive dimensions, or hard-size
excess always fail. CI uses normal mode to allow gradual legacy-image improvement.
