# Release Notes

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
