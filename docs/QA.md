# Typegen V0.2 QA Checklist

## QA Goal

Validate that the smallest working Typegen loop remains stable and becomes reliable enough for a repeatable demo:

1. Create an A-Z glyph board in Figma.
2. Draw a few supported uppercase vector glyphs.
3. Scan the selected board or glyph slots.
4. Preview available glyphs and missing glyphs.
5. Generate and export one static font file.
6. Smoke test the exported font in a browser or font viewer.

V0.2 QA should first re-run the V0.1 happy path, then focus on reliability issues most likely to break real glyphs: counters, path winding, export usability, and clear supported-workflow instructions.

## Supported Glyph Recipe

- Uppercase A-Z only.
- Glyph slots are named `glyph-A` through `glyph-Z`.
- Glyphs are simple filled vector shapes inside glyph slots.
- Use vector outlines, not live text.
- Strokes should be expanded before export.
- Use solid fills only.
- Keep glyph artwork inside the slot bounds where possible.
- Draw counters, such as the holes in `O`, `B`, `P`, and `R`, as proper compound vector outlines when supported by Figma export/path data.
- Avoid mixed layer types inside a glyph slot during V0.2 testing unless intentionally testing validation.
- Text, images, gradients, effects, masks, and complex unsupported layers should be rejected with clear messages.
- Partial alphabets are allowed if at least one valid glyph exists.
- Preview spaces are allowed; lowercase, numbers, and punctuation are unsupported.
- One static font export format is expected.
- V0.3 adds global letter spacing and space width controls. These should affect both preview and exported font output.

## Test Environment

Record these before each QA pass:

- Date:
- Tester:
- OS:
- Figma desktop/browser version:
- Typegen build or commit:
- Export format tested:
- Browser/font viewer used for smoke test:

## V0.2 Demo Flow

1. Open a blank Figma file.
2. Load the Typegen plugin from its local manifest.
3. Confirm the plugin UI opens without errors.
4. Enter font name: `Typegen Demo`.
5. Click `Create glyph board`.
6. Confirm a parent frame named `Font Glyph Board` is created.
7. Confirm it contains 26 glyph slots named `glyph-A` through `glyph-Z`.
8. Confirm slots show baseline, cap-height, width boundaries, and labels.
9. Draw simple filled vector glyphs in `glyph-A`, `glyph-B`, `glyph-C`, and `glyph-O`.
10. Select the parent `Font Glyph Board`.
11. Click `Scan selected glyphs`.
12. Confirm A, B, C, and O are valid or ready.
13. Confirm empty remaining slots are reported as empty or missing according to the implemented status model.
14. Enter preview text: `CAB`.
15. Confirm the preview renders C, A, and B using scanned outlines.
16. Enter preview text: `CODE`.
17. Confirm C and O render, while D and E appear as missing glyph placeholders.
18. Click `Generate font file`.
19. Confirm generation succeeds and reports the generated glyph count.
20. Click `Export OTF`.
21. Confirm the downloaded font filename is based on `Typegen Demo`.
22. Click `Export smoke test HTML`.
23. Open the downloaded smoke-test HTML file in a browser.
24. Confirm exported glyphs render in the smoke-test page.
25. Add or revise `glyph-P` and `glyph-R` with visible counters.
26. Re-scan, regenerate, and export.
27. Smoke test `ABOPR PRO BAR` in the browser smoke page.
28. Confirm counters remain open/transparent in preview and exported font rendering.

## V0.2 Reliability Focus

V0.2 is not a scope expansion. It is a hardening pass over the already-working V0.1 pipeline.

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
- [ ] UI includes `Create glyph board`.
- [ ] UI includes `Scan selected glyphs`.
- [ ] UI includes glyph status list/table.
- [ ] UI includes preview text input.
- [ ] UI includes preview area.
- [ ] UI includes `Generate font file`.
- [ ] UI includes an export/download action.
- [ ] UI includes a supported glyph recipe/help panel.
- [ ] `Show recipe` / `Hide recipe` toggles the help panel.
- [ ] Help panel mentions uppercase A-Z, `glyph-X` naming, filled vectors, outlined strokes/text, and unsupported MVP features.

### Glyph Board Creation

- [ ] Clicking `Create glyph board` creates exactly one parent board for that action.
- [ ] Parent board is named `Font Glyph Board`.
- [ ] Board contains slots for A-Z.
- [ ] Each slot is named exactly `glyph-A`, `glyph-B`, etc.
- [ ] Slots are arranged in a readable grid.
- [ ] Each slot includes a visible baseline guide.
- [ ] Each slot includes a visible cap-height guide.
- [ ] Each slot includes left/right width boundary guides.
- [ ] Each slot includes a readable character label.
- [ ] Board creation failure shows an actionable error.

### Selection Scanning

- [ ] Scanning with no selection shows a clear no-selection or no-glyph message.
- [ ] Selecting the parent board scans nested glyph slots.
- [ ] Selecting individual glyph slots scans those slots.
- [ ] Valid names `glyph-A` through `glyph-Z` map to uppercase characters.
- [ ] Invalid names such as `Glyph-A`, `glyph-a`, `A`, and `glyph-AA` are ignored or reported clearly.
- [ ] Duplicate glyph slots are handled deterministically.
- [ ] Scan result returns one visible row/status for every A-Z character.
- [ ] Empty generated slots are distinguishable from unsupported glyphs.
- [ ] Clicking a glyph row updates the glyph inspector.

### Validation

- [ ] Empty glyph slot reports no vector paths.
- [ ] Filled vector glyph reports valid or ready.
- [ ] Glyph containing a text layer asks user to convert text to outlines.
- [ ] Glyph containing an image layer reports images are unsupported.
- [ ] Glyph containing a stroked vector reports strokes must be expanded.
- [ ] Glyph containing gradients/effects reports unsupported styling.
- [ ] Hidden layers are ignored or reported with a warning.
- [ ] Unsupported characters outside A-Z are rejected with MVP scope messaging.
- [ ] Validation messages are visible near the glyph list or relevant action.

### Glyph Inspector

- [ ] Inspector defaults to `glyph-A` or the selected scanned glyph.
- [ ] Clicking each row changes the inspector character.
- [ ] Inspector shows status, Unicode, node id, path count, command count, winding rule, base advance, export advance, and bounds.
- [ ] Empty/missing glyphs show `none` for unavailable metrics instead of crashing.
- [ ] Valid glyphs show path and command counts greater than zero.
- [ ] Warnings from extraction appear in the inspector.
- [ ] Changing `Letter spacing` updates the selected glyph's export advance.
- [ ] Valid glyphs allow entering an `Advance width override`.
- [ ] Empty, missing, and unsupported glyphs do not allow advance width overrides.
- [ ] `Reset to auto` removes the selected glyph override.
- [ ] Changing a glyph override updates preview spacing immediately.
- [ ] Closing and reopening the plugin restores the selected glyph.
- [ ] Closing and reopening the plugin restores advance width overrides.
- [ ] UI warns when empty, missing, unsupported, or warning-status glyphs will not export.

### Preview

- [ ] Preview is disabled or empty before any valid scan.
- [ ] Preview enables after at least one valid glyph is scanned.
- [ ] Preview updates when text input changes.
- [ ] Available uppercase glyphs render from the scanned glyph model.
- [ ] Missing uppercase glyphs render as visible placeholders.
- [ ] Spaces render as blank advance, not as errors.
- [ ] Changing `Letter spacing` changes the preview spacing between exported glyphs.
- [ ] Changing `Space width` changes the preview width of spaces.
- [ ] Lowercase, numbers, and punctuation are visibly unsupported.
- [ ] Preview shows a concise missing-character summary when needed.
- [ ] Preview warns when current preview text contains characters that will not be included in the export.

### Font Generation

- [ ] `Generate font file` is disabled or blocked when no valid glyphs exist.
- [ ] Generation succeeds with a partial alphabet containing at least one valid glyph.
- [ ] Generated font family uses the user-entered font name.
- [ ] Generated font includes the valid scanned uppercase glyphs.
- [ ] Generated font includes a real space glyph using the selected `Space width`.
- [ ] Generated uppercase glyph advance widths include the selected `Letter spacing`.
- [ ] Generated uppercase glyph advance widths use per-glyph overrides where set.
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

- [ ] Export action is disabled until font generation succeeds.
- [ ] Export creates a local downloadable font file.
- [ ] Smoke-test export creates a local downloadable HTML file after generation.
- [ ] Filename is sanitized from the font name.
- [ ] File extension matches the chosen V0.2 export format.
- [ ] Exported file size is greater than zero.
- [ ] Re-export after changing the font name produces the expected filename.

### Exported Font Smoke Test

- [ ] Exported font can be loaded by a simple HTML page with `@font-face`.
- [ ] Generated smoke-test HTML opens without additional setup.
- [ ] Supported uppercase glyphs render with custom outlines.
- [ ] Missing uppercase glyphs do not break rendering.
- [ ] Spaces render with usable spacing.
- [ ] Adjusting space width before generation changes browser smoke-test spacing.
- [ ] Browser console shows no font loading error.
- [ ] Font metadata/family name appears correctly where inspectable.

### V0.2 Counters And Path Winding

- [ ] `glyph-A` renders with its internal counter open when drawn with a counter.
- [ ] `glyph-O` renders as a ring, not as a filled disk.
- [ ] `glyph-B` renders both counters open.
- [ ] `glyph-P` renders its counter open.
- [ ] `glyph-R` renders its counter open and the leg remains visible.
- [ ] SVG preview and exported font agree on whether counters are open or filled.
- [ ] Reversing contour direction in one test glyph either still exports correctly or produces a documented limitation.
- [ ] Multiple vector paths inside one glyph slot preserve their relative positions.
- [ ] A counter failure is documented with the exact glyph construction method used.

### V0.2 Smoke-Test HTML Export/Use

- [ ] Generated smoke-test HTML embeds the generated font with `@font-face`.
- [ ] Generated smoke-test HTML uses the exported font family name.
- [ ] Smoke page renders `ABC CAB CODE`.
- [ ] Smoke page renders `ABOPR PRO BAR`.
- [ ] Smoke page includes a fallback font so failed custom rendering is visually obvious.
- [ ] Browser console shows no font loading failure.
- [ ] Re-exporting after glyph edits changes the rendered result after browser refresh/cache clear.

## Edge Case Matrix

Run these after the main demo flow passes:

| Case | Expected result |
| --- | --- |
| No selection | Clear selection error |
| Select one valid slot | One valid glyph, rest missing/unscanned |
| Select board with empty slots | Empty slots reported clearly |
| Duplicate `glyph-A` slots | First valid glyph used or duplicate warning shown |
| `glyph-a` | Rejected as unsupported lowercase name |
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
| Hidden vector layer | Ignored or warning shown |
| Vector outside slot bounds | Warning if supported; no crash |
| Very small vector bounds | Warning or generated glyph; no crash |
| Preview text `ABC` with A only | A renders, B/C placeholders |
| Preview text `abc123!` | Unsupported characters visibly handled |
| Letter spacing `-80` | Preview/export are tighter without overlap in simple demo glyphs |
| Letter spacing `200` | Preview/export are visibly looser |
| Space width `120` | Word gap is narrow but still visible |
| Space width `700` | Word gap is wide in preview and smoke-test HTML |
| Override A advance to `1200` | A creates a visibly wider advance in preview/export |
| Reset A override | A returns to automatic advance width |
| Close/reopen plugin after tuning | Font name, preview text, spacing, selected glyph, and overrides are restored |
| Close/reopen plugin after scan | Preview restores from saved glyph node ids without manual re-scan |
| Delete saved board then reopen plugin | Clear restore failure message; user can scan a new board |
| Reset saved settings then reopen | Defaults are shown and no previous scan is restored |

## Smoke-Test HTML

Prefer the plugin's `Export smoke test HTML` action after generating a font. It downloads a self-contained HTML file with the generated OTF embedded as a data URL.

If the generated smoke-test export is unavailable, use this local template after exporting a font. Update `src` and `font-family` to match the exported file/name.

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
    <p class="sample">ABC CAB CODE</p>
    <p class="sample">ABOPR PRO BAR</p>
  </body>
</html>
```

Expected result: supported custom glyphs visibly render with Typegen outlines; unsupported or missing letters fall back or show missing-glyph behavior without breaking the page.

## Known V0.2 Limitations To Confirm In UI

- Uppercase A-Z only.
- No lowercase, numbers, punctuation, ligatures, kerning, or variable fonts.
- V0.3 spacing is global only; no per-glyph advance width editing or kerning yet.
- V0.5 supports per-glyph advance width overrides only; no per-glyph side bearings or kerning yet.
- V0.8 includes reset for document-level saved settings; generated font binaries are still not persisted.
- V0.9 recipe/help panel is informational only; it does not change validation behavior.
- No AI glyph generation.
- No strokes unless expanded to outlines.
- No image/text/gradient/effect support for glyph outlines.
- Export is one static font file format only.
- Compound path/counter support may be limited by current extraction behavior; document exact failures.

## QA Signoff Criteria

V0.2 is ready for demo when:

- The demo flow passes from board creation through exported font smoke test.
- At least A, B, C, and O can be drawn, scanned, previewed, exported, and rendered in a browser/font viewer.
- At least one counter glyph, preferably O or P, renders correctly in both preview and exported font.
- Browser smoke testing passes with `ABC CAB CODE` and `ABOPR PRO BAR`.
- Unsupported glyph structures show actionable messages instead of failing silently.
- The supported glyph recipe is accurate based on the latest test results.
- Any remaining defects are documented with reproduction steps and severity.
