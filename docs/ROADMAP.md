# Typegen Roadmap

## V2.x Closeout

V2.x is the reliability and usability track for the current static-font MVP.

Supported scope:

- Uppercase A-Z
- Numbers 0-9
- Basic punctuation: `.`, `,`, `!`, `?`, `-`, `:`
- One static OTF export
- Starter board creation and safe board updates
- Selection scanning and validation
- SVG preview
- Global letter spacing and space width
- Per-glyph advance width overrides
- Generated-font verification before export
- Smoke-test HTML export
- Document-level saved settings and scan restore
- Regression checks for naming, preview, metrics, export, and OTF roundtrip parsing

V2.x should close when:

- Manual QA passes for `ABC, 012.!`, `A-B: 10?`, `ABOPR PRO BAR`, and `2024 A10`.
- Preview and smoke-test HTML agree for supported glyphs.
- Punctuation size and side bearings feel usable without default overrides.
- Counter glyph limitations are documented if any remain.
- `npm.cmd run check` passes.
- README, release notes, QA, smoke-test docs, and tasks match the implemented behavior.

Do not add to V2.x unless it directly stabilizes the current loop:

- Lowercase
- Kerning
- Ligatures
- Variable fonts
- Multiple weights or styles
- AI generation
- Cloud or account features

## V3.x Direction

V3.x should begin only after V2.x is stable. The key change is moving from a cap-height-only display workflow toward a fuller static font workflow.

Recommended first V3 theme:

- Lowercase planning and implementation.

Why lowercase belongs in V3:

- It needs x-height, ascender, and descender guides.
- It changes the board model and scan expectations.
- It changes preview QA beyond cap-height glyphs.
- It raises new metrics questions that should not be squeezed into the V2 punctuation track.

Likely V3.0 planning outputs:

- Lowercase slot naming convention, likely `glyph-a` through `glyph-z`.
- Updated board layout with lowercase slots.
- x-height, ascender, descender, baseline, and side-boundary guide model.
- Lowercase validation and normalization rules.
- Manual QA words that exercise ascenders, descenders, and x-height, such as `type`, `glyph`, `font`, and `quick`.
- Decision on whether lowercase ships all at once or starts with a pilot subset.

See `docs/V3_ROADMAP.md` for the starting V3 plan.

V3.x should still avoid professional font-editor sprawl unless the current pipeline remains stable.
