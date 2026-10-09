# Content templates

Read the applicable template before creating or editing a level. Start new
records from it, replace all example values, and remove unused optional fields
and instructional comments. For existing records, use the template as a guide
and preserve unrelated curated data.

| Record | Starting point |
| --- | --- |
| Level with terrestrial locations, any mode | [level-terrestrial.md](level-terrestrial.md) |
| Level without an Earth location, any mode | [level-off-world.md](level-off-world.md) |
| Unchanged appearance in another game | Minimal reference in the [field guide](../contributing-data.md#roster-completeness-audit) |
| Game | [game.yaml](game.yaml) |
| Wiki article | [wiki-article.json](wiki-article.json) |

Templates show structure, not researched facts. Set mode/subtype, file path,
precision, confidence, and method from the actual entry. An unresearched
terrestrial level is not off-world; `locations: []` can represent an intentional
lack of curated locations. A documented `metadata.variantOf` may instead allow
locations to be omitted for inheritance.

Use only fields and nested keys defined in the [field guide](../contributing-data.md#level-fields)
or [data model](../data-model.md#level-record). Documented optional fields may be
added even when absent from a minimal template. Arbitrary keys accepted by the
parser or found in older records do not establish a supported convention.
For new canonical metadata, use `variantOf` only; extending that vocabulary
requires an explicit data-model change from the user.

When the user requests metadata/frontmatter only, retain the documented YAML
between `---` delimiters and leave the body empty. Do not add placeholder
headings, template instructions, or custom fields such as `gameMode`,
`campaignLevel`, `aiAssisted`, `markerExplanation`, `sources`, or `feature`.
Research prose and citation lists belong in the Markdown body when requested;
otherwise report sources and limitations in the handoff. Location `urls` are
documented outbound place links, not a general research bibliography.

For AI research bodies, follow the [research instructions](../map-research-ai-instructions.md#required-markdown-body)
for disclosure and heading order. Adapt the first heading to the mode and
write only supported claims. User instructions restricting body content take
precedence over the template's sample body.
