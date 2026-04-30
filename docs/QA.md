# Typegen V9 Alpha QA Checklist

## QA Goal

Validate that the smallest working Typegen loop remains stable and becomes reliable enough for a repeatable demo:

1. Create a categorized 209-glyph board in Figma.
2. Generate starter glyph outlines in empty slots or draw a few supported vector glyphs.
3. Refine generated vector outlines as needed.
4. Scan the selected board or glyph slots.
5. Preview available glyphs and missing glyphs.
6. Generate and export selected static font files.
7. Click `Generate font`, choose export settings, and export the weight ZIP.
8. Smoke test the exported font in a browser or font viewer.

V9 alpha QA should first re-run the V8 happy path, then focus on expanded glyph coverage, board/UI organization, and release export settings. OTF remains the native generated format; TTF, WOFF, and WOFF2 are converted package outputs. Scan-time flattening must preserve the original Figma artwork.

## Supported Glyph Recipe

- The v9 catalog supports 209 glyphs across uppercase, lowercase, numbers, punctuation, symbols, currency, math, standalone marks, and Latin extended letters.
- The generated board uses safe names for punctuation/symbol slots and Unicode fallback names for accented letters where needed.
- Glyphs may be simple filled vector shapes, filled live shape layers, or live boolean operations inside glyph slots.
- `Generate starter glyphs` may be used to create editable Inter-derived starting outlines in empty slots.
- Starter generation must skip slots that already contain non-helper artwork.
- Use vector outlines, not live text.
- Stroked lines and stroked vectors should be converted to filled outlines before scanning.
- Use solid fills only.
- Keep glyph artwork inside the slot bounds where possible.
- Draw counters, such as the holes in `O`, `B`, `P`, and `R`, as proper compound vector outlines when supported by Figma export/path data.
- Live boolean layers should scan through Typegen's temporary flatten step; manually flattened vector outlines remain the safest fallback for counter glyphs.
- Multi-contour glyphs should be checked in both preview and exported smoke-test HTML because path winding can affect whether counters stay open.
- Mixed winding rules in one glyph should be treated as a warning that needs manual smoke testing.
- Avoid mixed layer types inside a glyph slot during V2 testing unless intentionally testing validation.
- Text, images, gradients, effects, masks, and complex unsupported layers should be rejected with clear messages.
- Partial alphabets are allowed if at least one valid glyph exists.
- Preview spaces are allowed; characters outside the v9 catalog are unsupported.
- OTF, TTF, WOFF, and WOFF2 package formats are available from the export settings overlay.
- Global letter spacing and space width controls should affect both preview and exported font output.

## Test Environment

Record these before each QA pass:

- Date:
- Tester:
- OS:
- Figma desktop/browser version:
- Typegen build or commit:
- Export format tested:
- Browser/font viewer used for smoke test:

## V3 Alpha Demo Flow

1. Open a blank Figma file.
2. Load the Typegen plugin from its local manifest.
3. Confirm the plugin UI opens without errors.
4. Enter font name: `Typegen Demo`.
5. Click `Create/update glyph board`.
6. Confirm a parent frame named `Font Glyph Board` is created or updated.
7. Confirm it contains 209 glyph slots grouped into labeled category bands.
8. Confirm uppercase/numeric/punctuation slots show baseline, cap-height, width boundaries, and labels.
9. Confirm lowercase slots show ascender, x-height, baseline, descender, width boundaries, and labels.
10. Draw simple filled vector glyphs in `glyph-A`, `glyph-B`, `glyph-C`, `glyph-O`, `glyph-1`, `glyph-2`, `glyph-exclamation`, `glyph-question`, `glyph-a`, `glyph-b`, `glyph-g`, `glyph-o`, and `glyph-x`.
11. Select the parent `Font Glyph Board`.
12. Click `Scan selected glyphs`.
13. Confirm uppercase, lowercase, numeric, and punctuation glyphs scan as valid when drawn.
14. Confirm empty remaining slots are reported as empty or missing according to the implemented status model.
15. Enter preview text: `ABC box 012`.
16. Confirm mixed-case preview renders A, B, C, b, o, x, 0, 1, and 2 using scanned outlines.
17. Enter preview text: `bag go ox`.
18. Confirm `g` descends below the baseline while `a`, `o`, and `x` align around x-height.
19. Generate at least two different weight boards if testing the multi-weight path.
20. Click `Generate font`.
21. Confirm the export settings overlay opens.
22. Select the board weights, glyph sections, and font formats to export.
23. Confirm the ZIP filename is based on `Typegen Demo`.
24. Confirm the ZIP contains the selected `fonts/Typegen-Demo-{Weight}.{format}` files per valid board weight plus `index.html`.
23. Open the ZIP `index.html` in a browser.
24. Confirm it shows one row for each generated weight.
25. Smoke test `ABOPR PRO BAR`, `2024 A10`, `ABC, 123! OK?`, `box`, `go`, `bag`, `go ox`, `ABC box 012`, `type`, `glyph`, `font`, `quick`, `boxing glyph`, `a/b @2+2`, `A+B=C`, `font@example`, and `(quick)`.
26. Confirm counters remain open/transparent in preview and exported font rendering.
27. Confirm lowercase proportions match the board guides in preview and exported font rendering.

## V9.0 Expanded Glyph Checks

- [ ] Fresh board creates 209 supported slots in labeled category bands.
- [ ] Updating a V8 board adds the V9 slots without deleting existing artwork.
- [ ] Glyphs tab can filter by each category and search by character, safe glyph name, or status.
- [ ] Selecting a dense section glyph opens the existing detail overlay with preview, spacing, and kerning controls.
- [ ] Starter glyph generation fills empty slots across all categories where Inter can provide outlines.
- [ ] Scan returns 209 supported glyph rows.
- [ ] Preview presets cover mixed text, accented words, symbols, currency, math, and Latin extended samples.
- [ ] Exported OTF and smoke-test HTML preserve representative glyphs from every category.
- [ ] Standalone marks export as their own slots; automatic accent composition is not expected.

## V4.0 Starter Glyph Checks

- [ ] Fresh board plus `Generate starter glyphs` fills all 77 supported slots with editable Inter-derived vector outlines.
- [ ] Clicking `Generate starter glyphs` with no existing board creates/updates the board before filling empty slots.
- [ ] Generated starter outlines scan as valid filled vectors.
- [ ] Preview renders `ABC box @2+2` after generating starters and scanning the board.
- [ ] Exported OTF and smoke-test HTML preserve generated starter glyphs.
- [ ] Re-running `Generate starter glyphs` does not duplicate starter outlines in already-filled slots.
- [ ] If a user edits or replaces artwork in one slot, starter generation preserves that slot and fills only other empty slots.
- [ ] Lowercase starters align with ascender, x-height, baseline, and descender guides.
- [ ] Punctuation, symbol, currency, math, mark, and Latin extended starters remain compact enough to inspect and refine.

## V4.1 Preview Preset Checks

- [ ] Preview section includes preset buttons for mixed, headline, words, paragraph, and numbers/symbols samples.
- [ ] Clicking each preset updates the editable preview text input.
- [ ] After applying a preset, typing in the preview input still works and preserves focus/scroll behavior.
- [ ] Presets reuse the existing missing-glyph and unsupported-character warnings.
- [ ] Preset text appears in smoke-test HTML when it contains at least one exportable glyph.
- [ ] Presets do not change scanned glyphs, spacing controls, advance overrides, generated-font verification, or export behavior.

## V4.2 Starter Style Checks

- [ ] Starter weight selector offers Thin, Extra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold, and Black.
- [ ] New board creation opens a weight select before creating a board.
- [ ] The settings panel starter row does not include a separate new-board button.
- [ ] The new-board modal keeps the create action on the same row as the weight select and shows a disabled `Creating...` state until the board is created and selected.
- [ ] Changing letter spacing, space width, advance overrides, and kerning on one board does not affect another selected board.
- [ ] Closing and reopening the plugin, then selecting an existing board, restores that board's saved spacing, advance override, and kerning state.
- [ ] Creating a new board starts with default spacing even if another board has custom spacing.
- [ ] `Import settings` copies the selected categories from another board into the active board and persists the imported state.
- [ ] If a Regular board exists, choosing Regular again selects the existing board instead of creating a duplicate.
- [ ] If a Bold board or one of its slots is selected, `Update board` updates the Bold board even if the UI control still says Regular.
- [ ] If a Bold board or one of its slots is selected, `Generate starter glyphs` fills the Bold board and uses the Bold starter weight.
- [ ] After creating or generating into a board, `Scan selected glyphs` scans that active board when no other canvas selection is present.
- [ ] Generating on a fresh Regular board creates editable regular-weight outlines.
- [ ] Generating on a fresh Bold board creates editable heavier outlines.
- [ ] Re-running starter generation with a different style does not overwrite existing slot artwork.
- [ ] Scanning, preview presets, font generation, and export behave the same for both starter styles.

## V4.3 Active Board Checks

- [ ] UI shows an active board indicator after creating a board.
- [ ] UI shows the selected board name and weight after generating starter glyphs.
- [ ] UI updates the active board indicator after scanning a selected board.
- [ ] Selecting a slot inside a Bold board and scanning updates the active board indicator to the Bold board.
- [ ] Starter style selector syncs to the active board weight after board, generate, or scan actions.
- [ ] Scan notification mentions the active board when available.

## V5.0 Export Package Checks

- [ ] UI label shows `Typegen V5.0 alpha`.
- [ ] UI has only one output button: `Generate font`.
- [ ] `Generate font` opens an export settings overlay before downloading.
- [ ] Export settings allow selecting existing board weights.
- [ ] Export settings allow selecting glyph sections.
- [ ] Export settings allow selecting OTF, TTF, WOFF, and WOFF2.
- [ ] `Generate ZIP` downloads a `.zip` file using the sanitized font name.
- [ ] ZIP contains selected format files only for selected board weights that scan with at least one valid glyph in the selected sections and verify cleanly.
- [ ] ZIP `index.html` contains inline `@font-face` CSS with matching numeric weights, such as `400` for Regular, `700` for Bold, and `900` for Black.
- [ ] ZIP `index.html` shows one specimen row per generated weight.
- [ ] WOFF and WOFF2 smoke-test correctly when selected.

## V8.0 Temporary Flattening Checks

- [ ] A glyph built from a live boolean operation scans as valid without permanently flattening the source artwork.
- [ ] A glyph built from a filled rounded rectangle scans as valid without permanently flattening the source artwork.
- [ ] A glyph built from a filled ellipse/polygon/star scans as valid without permanently flattening the source artwork.
- [ ] The glyph grid shows valid temporary-flattened glyphs without warning styling.
- [ ] Preview and exported OTF render the temporary-flattened glyphs.
- [ ] Live lines and stroked vectors show actionable validation messages asking for filled outlines.
- [ ] Text, images, gradients, effects, masks, and unsupported live shape layers still show actionable validation messages.

## V3.1 Board Migration Checks

- [ ] Fresh board creates categorized v9 slots.
- [ ] Existing V3.0 pilot board updates into categorized v9 slot bands.
- [ ] Existing V3.0 pilot artwork in `glyph-a`, `glyph-b`, `glyph-g`, `glyph-o`, and `glyph-x` moves with those slot frames.
- [ ] Existing V2 artwork in uppercase, numeric, and punctuation slots is preserved after update.
- [ ] Re-running `Create/update glyph board` twice does not duplicate supported slots.
- [ ] Selecting the updated board and scanning returns 209 supported glyph rows.

## V3.2 / V9 Symbol Checks

- [ ] Fresh board includes `glyph-apostrophe`, `glyph-quote`, `glyph-slash`, `glyph-paren-left`, `glyph-paren-right`, `glyph-ampersand`, `glyph-plus`, `glyph-equals`, and `glyph-at`.
- [ ] Existing boards update with symbol and v9 extended slots without clearing existing artwork.
- [ ] Safe symbol, currency, math, mark, and Latin extended slot names scan as supported glyphs.
- [ ] Raw aliases such as `glyph-@`, `glyph-+`, and `glyph-/` scan as supported glyphs.
- [ ] Preview renders `a/b @2+2` when the required glyphs are scanned.
- [ ] Preview renders `A+B=C`, `font@example`, and `(quick)` when the required glyphs are scanned.
- [ ] Exported OTF and smoke-test HTML preserve scanned common symbols.

## V2 Reliability Focus

V2 is not a scope expansion. It is a hardening pass over the already-working V1 pipeline.

- Confirm the generated board, scan, preview, font generation, and export still work end to end.
- Confirm the same normalized glyph data is used consistently by preview and font generation.
- Confirm counter glyphs do not fill unexpectedly after export.
- Confirm browser `@font-face` loading works with the exported font.
- Confirm supported glyph construction rules are visible enough for a designer to follow.
- Confirm known unsupported structures fail with actionable messages.

## Acceptance Checklist

### Plugin Shell

- [ ] Plugin appears in Figma's plugin list after importing the manifest.
- [ ] Plugin opens a UI panel with no visible runtime error.
- [ ] UI includes font name input.
- [ ] UI includes glyph source instructions.
- [ ] UI includes `Create/update glyph board`.
- [ ] UI includes `Generate starter glyphs`.
- [ ] UI includes starter style controls.
- [ ] UI includes active board/weight status.
- [ ] UI includes `Scan selected glyphs`.
- [ ] UI includes glyph status list/table.
- [ ] UI includes preview text input.
- [ ] UI includes preview preset controls.
- [ ] UI includes preview area.
- [ ] UI includes `Generate font`.
- [ ] UI includes an export/download action.
- [ ] UI includes a supported glyph recipe/help panel.
- [ ] UI includes a `Ready to export` diagnostics panel.
- [ ] `Show recipe` / `Hide recipe` toggles the help panel.
- [ ] Help panel mentions supported glyph names, filled vectors/shapes, temporary slot flattening, text/stroke outlines, and unsupported MVP features.

### Glyph Board Creation

- [ ] Clicking `Create/update glyph board` creates one parent board when no board exists.
- [ ] Clicking `Create/update glyph board` with an existing board selected preserves existing glyph artwork.
- [ ] Clicking `Create/update glyph board` with an existing older board adds only missing supported slots.
- [ ] Clicking `Create/update glyph board` repositions supported slots into labeled category bands.
- [ ] Parent board is named `Font Glyph Board`.
- [ ] Board contains slots for all 209 v9 supported glyphs.
- [ ] Each slot is named exactly `glyph-A`, `glyph-B`, `glyph-a`, etc.
- [ ] Slots are arranged in a readable grid.
- [ ] Each slot includes a visible baseline guide.
- [ ] Uppercase-style slots include a visible cap-height guide.
- [ ] Lowercase slots include ascender, x-height, and descender guides.
- [ ] Each slot includes left/right width boundary guides.
- [ ] Each slot includes a readable character label.
- [ ] Board creation failure shows an actionable error.

### Starter Glyph Generation

- [ ] `Generate starter glyphs` creates or updates the glyph board if needed.
- [ ] Empty supported slots receive filled vector starter outlines.
- [ ] Slots with existing user artwork are skipped.
- [ ] Re-running starter generation replaces older Typegen-owned starter outlines and does not duplicate artwork.
- [ ] Generated vectors are editable on the Figma canvas.
- [ ] Generated vectors are flattened outlines, not live text layers.
- [ ] Generated Inter starter vectors avoid even-odd overlap holes where contours meet, such as the lowercase `f` stem and crossbar.
- [ ] Generated vectors are not marked as Typegen helper layers.
- [ ] Generated vectors scan through the same validation path as hand-drawn vectors.

### Selection Scanning

- [ ] Scanning with no selection shows a clear no-selection or no-glyph message.
- [ ] Selecting the parent board scans nested glyph slots.
- [ ] Selecting individual glyph slots scans those slots.
- [ ] Valid generated slot names for all 209 v9 glyphs map to supported characters.
- [ ] Invalid names such as `Glyph-A`, `A`, and `glyph-AA` are ignored or reported clearly.
- [ ] Duplicate glyph slots are handled deterministically.
- [ ] Scan result returns one visible row/status for every v9 supported character.
- [ ] Empty generated slots are distinguishable from unsupported glyphs.
- [ ] Clicking a glyph row updates the glyph inspector.

### Validation

- [ ] Empty glyph slot reports no vector paths.
- [ ] Filled vector glyph reports valid or ready.
- [ ] Glyph containing a text layer asks user to convert text to outlines.
- [ ] Glyph containing an image layer reports images are unsupported.
- [ ] Glyph containing a stroked vector asks user to convert strokes to filled outlines.
- [ ] Glyph containing gradients/effects reports unsupported styling.
- [ ] Hidden layers are ignored or reported with a warning.
- [ ] Unsupported characters outside the v9 catalog are rejected with MVP scope messaging.
- [ ] Validation messages are visible near the glyph list or relevant action.

### Glyph Inspector

- [ ] Inspector defaults to `glyph-A` or the selected scanned glyph.
- [ ] Clicking each row changes the inspector character.
- [ ] Inspector shows status, Unicode, node id, path count, command count, winding rule, base advance, export advance, and bounds.
- [ ] Inspector reports multi-contour counter-risk warnings when a glyph has more than one contour.
- [ ] Inspector reports mixed winding-rule warnings when one glyph contains multiple winding rules.
- [ ] Empty/missing glyphs show `none` for unavailable metrics instead of crashing.
- [ ] Valid glyphs show path and command counts greater than zero.
- [ ] Warnings from extraction appear in the inspector.
- [ ] Changing `Letter spacing` updates the selected glyph's export advance.
- [ ] Valid glyphs allow entering an `Advance width override`.
- [ ] Empty, missing, and unsupported glyphs do not allow advance width overrides.
- [ ] `Reset to auto` removes the selected glyph override.
- [ ] Changing a glyph override updates preview spacing immediately.
- [ ] Typing in advance width override does not lose focus or reset panel scroll.
- [ ] Closing and reopening the plugin restores the selected glyph.
- [ ] Closing and reopening the plugin restores advance width overrides.
- [ ] UI warns when empty, missing, unsupported, or warning-status glyphs will not export.

### Preview

- [ ] Preview is disabled or empty before any valid scan.
- [ ] Preview enables after at least one valid glyph is scanned.
- [ ] Preview updates when text input changes.
- [ ] Available v9 glyphs render from the scanned glyph model.
- [ ] Missing v9 glyphs render as visible placeholders.
- [ ] Period and comma keep their small board-designed size in preview instead of scaling to cap height.
- [ ] Period and comma have visible side bearing on both sides and do not collide with the following glyph.
- [ ] Spaces render as blank advance, not as errors.
- [ ] Changing `Letter spacing` changes the preview spacing between exported glyphs.
- [ ] Changing `Space width` changes the preview width of spaces.
- [ ] Typing in preview text and spacing inputs does not lose focus or reset panel scroll.
- [ ] Characters outside the v9 catalog are visibly unsupported.
- [ ] Preview shows a concise missing-character summary when needed.
- [ ] Preview warns when current preview text contains characters that will not be included in the export.

### Ready To Export Diagnostics

- [ ] Diagnostics asks the user to scan before any scan result is loaded.
- [ ] Diagnostics shows valid, empty, missing, unsupported, preview-gap, and override counts.
- [ ] Diagnostics blocks export readiness when no valid glyphs exist.
- [ ] Diagnostics reports preview glyphs that are not included in the export.
- [ ] Diagnostics reports unsupported preview characters.
- [ ] Diagnostics reports active advance width overrides.
- [ ] Diagnostics warns about very tight or loose letter spacing without blocking generation.
- [ ] Diagnostics warns about very narrow or wide space width without blocking generation.
- [ ] Diagnostics warns about very narrow or wide glyph export advances without blocking verified export.
- [ ] Diagnostics reports whether saved scan node references exist.
- [ ] Diagnostics reports when a generated font is ready to export.
- [ ] Diagnostics reports multi-contour or mixed-winding glyph warnings.

### Font Generation

- [ ] `Generate font` reports a clear message when no Typegen board has valid glyphs.
- [ ] Generation succeeds with a partial alphabet containing at least one valid glyph.
- [ ] Regression checks parse generated test fonts and verify glyph unicode, advance width, and outline commands.
- [ ] Generated-font verification panel shows parsed glyph count after generation.
- [ ] Generated-font verification panel shows verified glyph count matching generated glyph count when verification succeeds.
- [ ] Generated-font verification panel shows sample glyph metrics in the form `A advance/commands`.
- [ ] Generated font family uses the user-entered font name.
- [ ] Generated font includes valid scanned v9 glyphs.
- [ ] Generated font includes a real space glyph using the selected `Space width`.
- [ ] Generated v9 glyph advance widths include the selected `Letter spacing`.
- [ ] Generated v9 glyph advance widths use per-glyph overrides where set.
- [ ] Generated fonts preserve manual kerning pairs for valid scanned glyphs.
- [ ] Generated-font verification reports verified kerning pair counts when kerning pairs are active.
- [ ] Period and comma use narrower default advance widths than uppercase letters.
- [ ] Generation failure displays an actionable error.
- [ ] Re-scanning after edits updates the generated glyph set on the next generation.
- [ ] Changing spacing after generation disables the stale export until the font is regenerated.
- [ ] Changing a glyph advance override after generation disables the stale export until the font is regenerated.
- [ ] Closing and reopening the plugin restores font name, preview text, spacing, and glyph overrides before generation.
- [ ] Closing and reopening the plugin restores the last scanned glyphs automatically when those Figma nodes still exist.
- [ ] If saved scan nodes were deleted, the plugin asks the user to scan again instead of crashing.
- [ ] Saved state panel shows scan node count and override count.
- [ ] `Reset saved settings` clears font name, preview text, spacing, selected glyph, scan restore ids, and overrides.
- [ ] After reset, closing and reopening the plugin does not restore the previous board/settings.

### Export

- [ ] Output action is a single `Generate font` button.
- [ ] `Generate font` opens package settings, then scans Typegen boards before packaging selected boards.
- [ ] `Generate font` creates a local downloadable ZIP file when at least one board has verified glyphs.
- [ ] Filename is sanitized from the font name.
- [ ] File extension is `.zip`.
- [ ] Exported ZIP size is greater than zero.
- [ ] Re-export after changing the font name produces the expected filename.

### Exported Font Smoke Test

- [ ] Exported font can be loaded by a simple HTML page with `@font-face`.
- [ ] Generated ZIP HTML opens without additional setup after extraction.
- [ ] Generated ZIP test page references packaged selected font files with relative `fonts/` URLs.
- [ ] Generated ZIP test page includes rows for each packaged font weight.
- [ ] Supported v9 glyphs render with custom outlines.
- [ ] Missing v9 glyphs do not break rendering.
- [ ] Spaces render with usable spacing.
- [ ] Adjusting space width before generation changes browser smoke-test spacing.
- [ ] Browser console shows no font loading error.
- [ ] Font metadata/family name appears correctly where inspectable.

### V2 Counters And Path Winding

- [ ] `glyph-A` renders with its internal counter open when drawn with a counter.
- [ ] `glyph-O` renders as a ring, not as a filled disk.
- [ ] `glyph-B` renders both counters open.
- [ ] `glyph-P` renders its counter open.
- [ ] `glyph-R` renders its counter open and the leg remains visible.
- [ ] SVG preview and exported font agree on whether counters are open or filled.
- [ ] Reversing contour direction in one test glyph still exports with counters open.
- [ ] Multiple vector paths inside one glyph slot preserve their relative positions.
- [ ] Multi-contour glyphs show a counter verification warning in the inspector.
- [ ] Mixed winding-rule glyphs show a warning in diagnostics or inspector.
- [ ] A counter failure is documented with the exact glyph construction method used.

### V2 Smoke-Test HTML Export/Use

- [ ] Generated smoke-test HTML embeds the generated font with `@font-face`.
- [ ] Generated smoke-test HTML uses the exported font family name.
- [ ] Smoke page renders `ABC, 123!`.
- [ ] Smoke page renders `ABOPR PRO BAR`.
- [ ] Smoke page renders `2024 A10`.
- [ ] Smoke page includes a fallback font so failed custom rendering is visually obvious.
- [ ] Browser console shows no font loading failure.
- [ ] Re-exporting after glyph edits changes the rendered result after browser refresh/cache clear.

## Edge Case Matrix

Run these after the main demo flow passes:

| Case | Expected result |
| --- | --- |
| No selection | Clear selection error |
| Click create board with no board selected | Opens a weight picker before creating a board |
| Create Regular when Regular exists | Selects the existing Regular board and warns instead of creating a duplicate |
| Create Bold after Regular exists | Creates a separate Bold board |
| Update board with no selected board | Shows a selection-required message instead of selecting an existing board |
| Select one valid slot | One valid glyph, rest missing/unscanned |
| Select board with empty slots | Empty slots reported clearly |
| Duplicate `glyph-A` slots | First valid glyph used or duplicate warning shown |
| `glyph-a` | Maps to lowercase `a` and exports as U+0061 |
| `glyph-z` | Maps to lowercase `z` and exports as U+007A |
| `glyph-exclamation` | Maps to `!` and exports as U+0021 |
| `glyph-!` | Accepted as a compatibility alias for `glyph-exclamation` |
| `glyph-at` | Maps to `@` and exports as U+0040 |
| `glyph-@` | Accepted as a compatibility alias for `glyph-at` |
| `glyph-plus` | Maps to `+` and exports as U+002B |
| Text layer inside `glyph-A` | Unsupported; convert to outlines message |
| Image layer inside `glyph-A` | Unsupported image message |
| Stroked path with no fill | Unsupported; expand stroke message |
| Filled vector path | Valid |
| Multiple filled vector paths | Valid if extraction supports them |
| Nested group with vectors | Valid if extraction supports nested vectors |
| `glyph-O` with compound counter | Counter remains open or limitation documented |
| `glyph-B` with two counters | Both counters remain open or limitation documented |
| `glyph-P` / `glyph-R` with counters | Counters remain open or limitation documented |
| Reversed inner contour direction | Correct rendering or limitation documented |
| `glyph-f` with overlapping stem/crossbar contours | Overlap stays filled instead of becoming a hole |
| Hidden vector layer | Ignored or warning shown |
| Vector outside slot bounds | Warning if supported; no crash |
| Very small vector bounds | Warning or generated glyph; no crash |
| Preview text `ABC` with A only | A renders, B/C placeholders |
| Preview text `abc123#` | Unsupported characters visibly handled |
| Preview text `ABC, 123!` | Supported punctuation renders when glyphs are scanned |
| Small `glyph-period` near baseline | Preview/export keep the period small and baseline-aligned |
| Small `glyph-comma` near baseline | Preview/export keep the comma small and baseline-aligned |
| Preview text `ABC, 012.!` | Period/comma/exclamation spacing feels punctuation-sized, not letter-sized |
| Preview text `012.,` | Period/comma do not collide with the following glyph |
| Letter spacing `-80` | Preview/export are tighter without overlap in simple demo glyphs |
| Letter spacing `200` | Preview/export are visibly looser |
| Letter spacing `-100` | Diagnostics shows a tight spacing warning |
| Letter spacing `240` | Diagnostics shows a loose spacing warning |
| Space width `120` | Word gap is narrow but still visible |
| Space width `700` | Word gap is wide in preview and smoke-test HTML |
| Space width `150` | Diagnostics shows a narrow space warning |
| Space width `760` | Diagnostics shows a wide space warning |
| Override A advance to `1200` | A creates a visibly wider advance in preview/export |
| Override A advance to `120` | Diagnostics shows a narrow A advance warning |
| Reset A override | A returns to automatic advance width |
| Kerning `AV` to `-80` | Preview and exported smoke test pull V closer to A |
| Kerning `TA` to `60` | Preview and exported smoke test loosen A after T |
| Backspace in pair glyph field | Field clears normally and kerning slider disables until one supported glyph is typed |
| Kerning pair right glyph missing | UI warns that the pair will be ignored until the glyph is valid |
| Reset `AV` kerning | Pair returns to default spacing |
| Close/reopen plugin after tuning | Font name, preview text, spacing, selected glyph, and overrides are restored |
| Close/reopen plugin after scan | Preview restores from saved glyph node ids without manual re-scan |
| Delete saved board then reopen plugin | Clear restore failure message; user can scan a new board |
| Reset saved settings then reopen | Defaults are shown and no previous scan is restored |

## Smoke-Test HTML

Prefer the plugin's `Generate font` action after preparing the board weights you want to test. It opens export settings, scans Typegen boards, downloads selected font formats plus an `index.html` page with inline `@font-face` CSS, and shows one row per generated weight.

If the generated ZIP is unavailable, use this local template after exporting a font from a development build. Update `src` and `font-family` to match the exported file/name.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Typegen Font Smoke Test</title>
    <style>
      @font-face {
        font-family: "Typegen Demo";
        src: url("./TypegenDemo.otf") format("opentype");
      }

      body {
        font-family: Arial, sans-serif;
        margin: 32px;
      }

      .sample {
        font-family: "Typegen Demo", Arial, sans-serif;
        font-size: 96px;
        line-height: 1.1;
        margin: 0 0 24px;
      }
    </style>
  </head>
  <body>
    <p class="sample">ABC, 123!</p>
    <p class="sample">ABOPR PRO BAR</p>
  </body>
</html>
```

Expected result: supported custom glyphs visibly render with Typegen outlines; unsupported or missing letters fall back or show missing-glyph behavior without breaking the page.

## Known V9 Alpha Limitations To Confirm In UI

- The v9 catalog supports 209 explicit glyphs.
- Characters beyond the v9 catalog, automatic accent composition, ligatures, auto-kerning, kerning classes, and variable fonts are not supported.
- Spacing controls are global except for per-glyph advance width overrides and manual kerning pairs.
- Per-glyph advance width overrides do not include side bearing editing.
- Reset clears document-level saved settings; generated font binaries are still not persisted.
- The recipe/help panel is informational only; it does not change validation behavior.
- No AI glyph generation.
- Stroked lines and stroked vectors must be converted to filled outlines before scanning.
- No image/text/gradient/effect support for glyph outlines.
- OTF is the native generated format; TTF, WOFF, and WOFF2 are converted package formats.
- Compound path/counter support may be limited by current extraction behavior; document exact failures.

## QA Signoff Criteria

V2 is ready for demo when:

- The demo flow passes from board creation through exported font smoke test.
- At least A, B, C, and O can be drawn, scanned, previewed, exported, and rendered in a browser/font viewer.
- At least one counter glyph, preferably O or P, renders correctly in both preview and exported font.
- Browser smoke testing passes with `ABC, 123!`, `ABOPR PRO BAR`, `2024 A10`, `A-B: 10`, `box`, `go`, `bag`, `go ox`, `ABC box 012`, `type`, `glyph`, `font`, `quick`, `boxing glyph`, `a/b @2+2`, `A+B=C`, `font@example`, and `(quick)`.
- Unsupported glyph structures show actionable messages instead of failing silently.
- The supported glyph recipe is accurate based on the latest test results.
- Any remaining defects are documented with reproduction steps and severity.
