---
# Read docs/templates/README.md and docs/contributing-data.md before using this template.
# Replace example values and remove instructional comments and unused optional fields.
# Use documented keys only; do not add custom metadata for research or sources.
# For frontmatter-only requests, omit everything after the closing delimiter.
id: example-game-example-level
title: Example Level
games:
  - example-game
mode: multiplayer
# modeSub: challenge # other requires special-ops, survival or challenge; multiplayer optionally accepts battle-royale or dmz.
# modeSub: [battle-royale, dmz] # Multiplayer only: one or more unique subtypes; omit for standard MP.
wikiArticle: codwiki-example-level
# metadata:
#   variantOf: example-game-source-level # Omit locations below to inherit them.
locations:
  - id: main
    country: Virtual
    precision: off-world
    confidence: fallback
    method: region-fallback
    primary: true
---

<!-- For an AI research body, use the disclosure and mode-appropriate headings
     in docs/map-research-ai-instructions.md. Explain why this setting has no
     terrestrial coordinates. -->
