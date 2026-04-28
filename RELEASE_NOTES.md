# Release Notes

## 2.x Closeout Notes

V2.x is considered the hardening track for the existing static-font MVP: A-Z, 0-9, six punctuation marks, preview, spacing, verified OTF export, smoke-test HTML, persistence, and regression checks.

V3.x should start with lowercase planning because lowercase requires a new vertical metrics model: x-height, ascenders, descenders, and updated board guides.

## 2.10.1

Typegen V2.10.1 punctuation side-bearing fix.

### Fixed

- Narrow punctuation outlines are now centered inside their advance width after slot-relative extraction.
- Periods and commas now get balanced side bearings instead of putting all spacing on one side.
- Regression checks cover period fitting inside its punctuation advance.

## 2.10.0

Typegen V2.10 punctuation metrics polish.

### Changed

- Added narrower default advance widths for supported punctuation.
- Periods and commas now default to narrower spacing in preview and exported fonts.
- Regression checks cover punctuation advance defaults, preview spacing, and OTF roundtrip advance widths.

## 2.9.3

Typegen V2.9.3 punctuation sizing fix.

### Fixed

- Glyph extraction now preserves slot-relative size and position when scanning glyph slots.
- Small punctuation such as periods and commas no longer scales up to cap height in preview/export.
- Regression checks cover a tiny baseline period staying small after normalization.

## 2.9.2

Typegen V2.9.2 punctuation scan compatibility.

### Fixed

- Scanner now accepts raw punctuation aliases such as `glyph-!`, `glyph-.`, and `glyph-?` in addition to the generated safe names.
- Board update checks treat raw punctuation aliases as existing glyph slots so they are not duplicated by safe-name slots.

## 2.9.1

Typegen V2.9.1 board update safety.

### Fixed

- `Create/update glyph board` now reuses an existing `Font Glyph Board` when one is selected or found on the current page.
- Re-running the board action preserves existing glyph artwork and adds only missing supported slots.

## 2.9.0

Typegen V2.9 basic punctuation support.

### Added

- Supported glyph set now includes `.`, `,`, `!`, `?`, `-`, and `:`.
- Starter board, scan, preview, spacing overrides, font generation, verification, and smoke-test export now support the new punctuation glyphs.
- Punctuation uses safe Figma slot names: `glyph-period`, `glyph-comma`, `glyph-exclamation`, `glyph-question`, `glyph-hyphen`, and `glyph-colon`.
- Regression checks cover punctuation naming, preview, generated font verification, and OTF roundtrip parsing.

## 2.8.0

Typegen V2.8 metrics sanity warnings.

### Added

- Ready-to-export diagnostics now warns about extreme letter spacing, space width, and glyph export advances.
- Metrics warnings are non-blocking and are meant to prompt manual preview/smoke-test review before export.
- Regression checks cover tight and loose metric warning thresholds.

## 2.7.0

Typegen V2.7 numeric workflow polish.

### Changed

- Default preview text now uses mixed letter/number text: `ABC 123`.
- Smoke-test fallback text now uses `ABC 123 2024`.
- QA guidance now includes focus/scroll stability checks for preview, spacing, and advance override inputs.

## 2.6.0

Typegen V2.6 interaction stability fix.

### Fixed

- Preserves focused input, caret position, and panel scroll position across UI re-renders.
- Fixes typing into preview, spacing, and advance override inputs causing focus loss and scroll reset.

## 2.5.0

Typegen V2.5 numeric glyph support.

### Added

- Supported glyph set expanded from uppercase A-Z to A-Z plus numbers 0-9.
- Starter board now creates `glyph-0` through `glyph-9` slots in addition to uppercase slots.
- Scan, preview, spacing overrides, generated-font verification, OTF export, and smoke-test HTML now support numeric glyphs.
- Regression checks cover numeric glyph naming, preview, font generation, and OTF roundtrip parsing.

### Still Out Of Scope

- Lowercase, punctuation, kerning, variable fonts, AI generation, and broad glyph-editor features remain outside the current MVP direction.

## 2.4.0

Typegen V2.4 verified-export gate.

### Added

- Export buttons now require generated-font verification to pass.
- Ready-to-export diagnostics now reports whether verified export actions are enabled or blocked.
- Regression checks assert generated-font verification metadata for normal and counter-style fixtures.

## 2.3.0

Typegen V2.3 generated-font verification pass.

### Added

- Font generation now parses the generated OTF back immediately and returns verification metadata.
- The UI shows parsed glyph count, verified glyph count, and sample verified glyph metrics after generation.
- Verification checks unicode, advance width, and outline command presence for each exported supported glyph.

## 2.2.0

Typegen V2.2 export roundtrip reliability pass.

### Added

- Regression checks now parse generated OTF buffers back through `opentype.js`.
- Roundtrip assertions verify generated glyph unicode values, advance widths, and outline commands for normal and counter-style glyph fixtures.

## 2.1.0

Typegen V2.1 counter/path reliability pass.

### Added

- Synthetic regression fixture for counter-style `O` and `P` glyphs.
- Inspector warning for multi-contour glyphs so users know to verify counters in preview and exported font.
- Diagnostics warning for mixed winding rules and multi-contour counter-risk glyphs.
- QA notes for supported counter construction and smoke testing.

## 2.0.0

Typegen V2.0 reliability baseline.

### Added

- Regression check script for glyph naming, spacing math, preview missing/unsupported handling, filename generation, smoke-test HTML generation, and synthetic OTF generation.
- `npm run test:regression`.
- `npm run check` now runs typecheck, regression checks, and build.
- Ready-to-export diagnostics panel summarizing valid, empty, missing, unsupported, preview-gap, override, generation, and saved-scan state before export.

### Changed

- Updated package metadata and in-plugin label to V2.0.
- Smoke-test HTML generation now uses `globalThis.btoa`, making it testable outside the plugin iframe while preserving browser behavior.

### Still Out Of Scope

- Lowercase, punctuation, kerning, variable fonts, AI generation, and broad glyph-editor features remain outside the current MVP direction.

## 1.0.0

Typegen V1.0 candidate.

### Added

- Figma plugin manifest and bundled plugin UI/controller.
- Starter A-Z glyph board generation.
- Selection scanning for glyph slots named `glyph-A` through `glyph-Z`.
- Validation for common unsupported glyph structures.
- Simple filled vector path extraction and normalization.
- SVG preview using the same normalized glyph model as export.
- OTF generation with `opentype.js`.
- Font export through browser download.
- Self-contained smoke-test HTML export.
- Global letter spacing and space width controls.
- Read-only glyph inspector.
- Per-glyph advance width overrides.
- Document-level persistence for settings.
- Last-scan restore using saved Figma node IDs.
- Saved-state panel and reset action.
- In-plugin supported glyph recipe.

### MVP Limitations

- Uppercase A-Z only.
- One static OTF export.
- No kerning, variable fonts, lowercase, numbers, punctuation, AI generation, or professional font-editor features.
- Glyph input is intentionally constrained to simple filled vector paths.
