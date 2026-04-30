# Typegen Export Test Page

Use the generated ZIP to verify that all Typegen board weights can load in a normal browser.

## Flow

1. Draw and scan at least one valid glyph.
2. Enter preview text that includes exported glyphs, such as `ABC, 123!` or `A-B: 10`.
3. Adjust `Letter spacing`, `Space width`, or a selected glyph's advance override if testing V2 spacing behavior.
4. Review the `Ready to export` diagnostics for non-blocking metrics warnings.
5. Click `Generate font`.
6. Open the downloaded ZIP.
7. Confirm it contains `fonts/*.otf` files for each valid board weight plus `index.html`.
8. Open `index.html` in a browser.
9. Confirm it shows one specimen row per generated weight.
10. Confirm representative v9 glyphs from uppercase, lowercase, numbers, punctuation, symbols, currency, math, marks, and Latin extended sections render with the exported outlines.
11. Confirm spacing in the test page matches the generated settings.

## Expected Result

- The exported ZIP includes one OTF file per verified generated weight in the current session.
- The ZIP `index.html` includes inline `@font-face` CSS and one row per generated weight.
- The ZIP page opens without extra setup after extraction.
- Supported v9 catalog glyphs use the Typegen font when available.
- Spaces use the generated font's space glyph width.
- Supported glyph advances include the selected letter spacing.
- Supported glyph advances include any selected per-glyph advance overrides.
- Extreme spacing or advance values may show diagnostics warnings, but verified exports should still be possible.
- Inspector metrics should match the generated settings before export.
- Generated-font verification should report matching unicode, advance width, and outline data before export.
- ZIP package creation should skip board weights that do not verify cleanly.
- Regression checks parse synthetic generated fonts, but browser smoke testing is still required for visual rendering confidence.
- Restored settings should match the smoke-test settings after closing and reopening the plugin, then regenerating.
- Missing supported glyphs and unsupported characters may fall back, but the page should not fail to load.
- Missing glyph fallback should not show Typegen box/cross fragments.

## Notes

- The ZIP HTML is a QA helper, not a production web export package.
- The sample text is based on the current preview text when possible.
- Typegen V5.0 still exports one static OTF font only.
- The ZIP does not create missing weights automatically; it packages valid Typegen boards found on the page.
- WOFF and WOFF2 remain out of scope until separately scoped.
- For counter glyphs such as `O`, `P`, `B`, and `R`, compare plugin preview and test HTML carefully; both should keep counters open.
- Export normalizes contour direction for compound counters, but if counters still fill unexpectedly, record whether the source glyph used flattened contours, compound paths, or live booleans.
- Newly generated Inter starter glyphs should not show even-odd overlap holes where contours meet, such as the lowercase `f` stem and crossbar.
