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

## V4.x Direction

V4.x starts a workflow-acceleration track after the V3 alpha character expansion.

The first V4 feature is Inter-based starter glyph generation:

- Add a `Generate starter glyphs` action.
- Create editable filled vector outlines inside empty supported slots.
- Seed outlines from Figma's Inter Regular font and flatten them into vectors.
- Preserve existing user artwork by default.
- Reuse the existing board, scan, preview, spacing, verification, and static OTF export pipeline.
- Keep the generated outlines intentionally simple to use: real font outlines are still just editable Figma vectors after generation.

V4.0 should remain a canvas helper, not a new font engine path. Once generated outlines exist in slots, scanning should treat them the same as user-drawn vectors.

Manual V4.0 QA should confirm:

- Fresh board -> generate starters -> scan -> preview -> export works end to end.
- Re-running starter generation does not duplicate artwork.
- Partially edited boards keep existing artwork and only fill empty slots.
- Inter-based lowercase starters respect ascender, x-height, baseline, and descender guides.
- Generated punctuation and common symbols scan as valid filled vectors.

## V4.1 Preview Presets

V4.1 should make the full generated starter set easier to inspect after scanning.

Scope:

- Add preset buttons beside the preview text input.
- Keep presets as editable text changes, not a separate preview engine.
- Cover mixed text, headline text, lowercase word lists, paragraph-style samples, and numbers/symbols.
- Reuse existing missing-glyph, unsupported-character, diagnostics, font generation, and smoke-test export behavior.

Out of scope:

- Multi-panel specimen layouts.
- Font-size, line-height, and theme controls.
- Kerning or OpenType feature previews.
- Any export behavior changes.

## V4.2 Starter Style Controls

V4.2 should add a small amount of control to starter generation without changing scan, preview, or export.

Scope:

- Add a starter style selector for Inter Regular and Inter Bold.
- Pass the selected style to board creation and starter generation.
- Keep Regular and Bold starter boards separate.
- Prefer the selected board or selected slot's parent board over the UI style when running board, starter, and scan actions.
- Preserve existing artwork and fill empty slots only.
- Fall back from Bold to Regular if the selected style cannot load.

Out of scope:

- Importing arbitrary user font files.
- Multiple font families.
- Replacing existing starter artwork automatically.
- Weight interpolation, variable fonts, or generated style axes.

## V4.3 Board / Weight Clarity

V4.3 should reduce confusion once multiple boards can coexist.

Scope:

- Show the active board and weight in the plugin UI.
- Return active board metadata from board creation, starter generation, and scanning.
- Keep the starter style selector synced to the active board weight after context-aware actions.
- Make action messages clearer about the board being used.

Out of scope:

- Multi-board comparison UI.
- Bulk generation across all weights.
- Board-specific persisted settings.
- Exporting multiple font files at once.

## V5.0 Export Package Polish

V5.0 starts with small export usability improvements, not new font formats.

Scope:

- Keep OTF as the only font binary format.
- Keep one output action: `Generate font`.
- Have `Generate font` scan every Typegen glyph board on the page.
- Download a ZIP containing OTF files for every valid generated board weight.
- Include a single `index.html` test page in the ZIP with inline `@font-face` CSS and one row per generated weight.

Out of scope until separately scoped:

- WOFF and WOFF2 export.
- Separate single-font export buttons.
- Automatically creating missing board weights.
- Production specimen pages.
