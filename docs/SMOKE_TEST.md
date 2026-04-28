# Typegen Export Smoke Test

Use the smoke-test HTML export to verify that the generated font can load in a normal browser.

## Flow

1. Draw and scan at least one valid glyph.
2. Enter preview text that includes exported glyphs, such as `ABC, 123!` or `A-B: 10`.
3. Adjust `Letter spacing`, `Space width`, or a selected glyph's advance override if testing V2 spacing behavior.
4. Review the `Ready to export` diagnostics for non-blocking metrics warnings.
5. Click `Generate font file`.
6. Click `Export OTF`.
7. Click `Export smoke test HTML`.
8. Open the downloaded HTML file in a browser.
9. Confirm supported A-Z, 0-9, and punctuation glyphs render with the exported outlines.
10. Confirm spacing in the smoke-test page matches the generated settings.

## Expected Result

- The page opens without extra setup.
- The generated font is embedded in the HTML through `@font-face`.
- Supported A-Z, 0-9, and punctuation glyphs use the Typegen font.
- Spaces use the generated font's space glyph width.
- Supported glyph advances include the selected letter spacing.
- Supported glyph advances include any selected per-glyph advance overrides.
- Extreme spacing or advance values may show diagnostics warnings, but verified exports should still be possible.
- Inspector metrics should match the generated settings before export.
- Generated-font verification should report matching unicode, advance width, and outline data before export.
- Export actions should only enable after generated-font verification passes.
- Regression checks parse synthetic generated fonts, but browser smoke testing is still required for visual rendering confidence.
- Restored settings should match the smoke-test settings after closing and reopening the plugin, then regenerating.
- Missing supported glyphs and unsupported characters may fall back, but the page should not fail to load.

## Notes

- The smoke-test HTML is a QA helper, not a production web export package.
- The sample text is based on the current preview text when possible.
- Typegen V2 still exports one static OTF font only.
- For counter glyphs such as `O`, `P`, `B`, and `R`, compare plugin preview and smoke-test HTML carefully; both should keep counters open.
- If counters fill unexpectedly, record whether the source glyph used flattened contours, compound paths, or live booleans.
