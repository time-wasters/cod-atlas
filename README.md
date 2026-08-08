# Call of Duty Atlas

An interactive world map of locations featured across the Call of Duty franchise. Browse markers by country or city, filter by game and by singleplayer/multiplayer mode, and open the matching Call of Duty Wiki article from each location.

**Live map:** [call-of-duty-atlas.plp-gtr.chatgpt.site](https://call-of-duty-atlas.plp-gtr.chatgpt.site)

## Features

- Interactive Leaflet map with clustered markers
- City-level positioning when reliable location evidence is available
- Country-level fallback for ambiguous locations
- Singleplayer and multiplayer visibility filters
- Human-readable game names ordered by release date
- Direct links to the relevant Call of Duty Wiki pages
- Responsive tactical field-map interface

## Run locally

Requirements:

- Node.js 22.13 or newer
- npm
- Linux or WSL for the included build helper scripts

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build or run the test suite:

```bash
npm run build
npm test
```

## Project structure

- `app/page.tsx` — interactive map and filtering interface
- `app/data/locations.json` — map location records and Wiki links
- `app/data/city-enrichment.json` — evidence-backed city coordinate enrichment
- `app/globals.css` — application styling
- `db/schema.ts` — normalized atlas and Wiki-import database schema
- `db/wiki-import-types.ts` — scraper/import payload contract
- `docs/data-model.md` — entity relationships and import rules
- `scripts/` — data preparation and build utilities
- `tests/` — rendered output checks

## Data maintenance

The checked-in JSON files are the source used by the application. They are not automatically re-synced from the original Google document. Review generated or bulk-edited location data before committing it, especially mode classifications, Wiki targets, and city coordinates.

## Credits and data sources

The project was inspired by [the original r/CallOfDuty post by u/robracer97](https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/).

- Level and location research links point to the community-run [Call of Duty Wiki](https://callofduty.fandom.com/wiki/Call_of_Duty_Wiki).
- Map tiles and geographic data are provided by [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- City matching uses [GeoNames](https://www.geonames.org/) geographic data.

This is an unofficial fan project. Call of Duty and related names, marks, and imagery are trademarks or copyrighted material of their respective owners. This project is not affiliated with or endorsed by Activision, Microsoft, or the Call of Duty Wiki.

## License

The source code is available under the [MIT License](LICENSE). Third-party data, map tiles, Wiki content, game names, trademarks, and imagery remain subject to their respective owners' terms and licenses.
