# Typegen Export Smoke Test

Use the smoke-test HTML export to verify that the generated font can load in a normal browser.

## Flow

1. Draw and scan at least one valid uppercase glyph.
2. Enter preview text that includes exported glyphs, such as `ABC CAB CODE`.
3. Adjust `Letter spacing`, `Space width`, or a selected glyph's advance override if testing V0.3/V0.5 spacing behavior.
4. Click `Generate font file`.
5. Click `Export OTF`.
6. Click `Export smoke test HTML`.
7. Open the downloaded HTML file in a browser.
8. Confirm supported uppercase glyphs render with the exported outlines.
9. Confirm spacing in the smoke-test page matches the generated settings.

## Expected Result

- The page opens without extra setup.
- The generated font is embedded in the HTML through `@font-face`.
- Supported uppercase glyphs use the Typegen font.
- Spaces use the generated font's space glyph width.
- Uppercase glyph advances include the selected letter spacing.
- Uppercase glyph advances include any selected per-glyph advance overrides.
- V0.4 inspector metrics should match the generated settings before export.
- V0.6 restored settings should match the smoke-test settings after closing and reopening the plugin, then regenerating.
- Missing uppercase glyphs and unsupported characters may fall back, but the page should not fail to load.

## Notes

- The smoke-test HTML is a QA helper, not a production web export package.
- The sample text is based on the current preview text when possible.
- Typegen V0.2 still exports one static OTF font only.
