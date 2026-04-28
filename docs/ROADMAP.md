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

V3.x has begun after the V2.x closeout. The key change is moving from a cap-height-only display workflow toward a fuller static font workflow.

Recommended first V3 theme:

- Lowercase planning and implementation.

Why lowercase belongs in V3:

- It needs x-height, ascender, and descender guides.
- It changes the board model and scan expectations.
- It changes preview QA beyond cap-height glyphs.
- It raises new metrics questions that should not be squeezed into the V2 punctuation track.

V3.0 alpha started with a lowercase pilot:

- `glyph-a`
- `glyph-b`
- `glyph-g`
- `glyph-o`
- `glyph-x`

V3.1 alpha expands that pilot to full lowercase `glyph-a` through `glyph-z` while preserving old pilot board artwork and repositioning slots into canonical order.

V3.2 adds a small common-symbol expansion, not a broad Unicode or OpenType feature push.

V3.3 should focus on metrics/readability polish for the expanded character set before more glyph scope is added.

V3 alpha should close after V3.3 verification before starting a new feature track.

V3 planning and implementation outputs:

- Lowercase slot naming convention, likely `glyph-a` through `glyph-z`.
- Updated board layout with lowercase slots.
- x-height, ascender, descender, baseline, and side-boundary guide model.
- Lowercase validation and normalization rules.
- Manual QA words that exercise ascenders, descenders, and x-height, such as `type`, `glyph`, `font`, and `quick`.
- Migration-safe board updates for existing V3 alpha boards.
- A deliberately small common-symbol set after lowercase signoff: `'`, `"`, `/`, `(`, `)`, `&`, `+`, `=`, and `@`.
- A metrics/readability review once lowercase and common symbols are both working.
- A clean V3 alpha closeout before preview, export, validation, or additional glyph work resumes.

See `docs/V3_ROADMAP.md` for the starting V3 plan and `docs/V3_LOWERCASE_GEOMETRY.md` for the first lowercase guide spec.

V3.x should still avoid professional font-editor sprawl unless the current pipeline remains stable.
