# Typegen

Typegen is a focused Figma plugin for turning glyphs drawn in Figma into usable static font packages.

The current 1.0.0 release keeps the reliable temporary-flattening pipeline, supports a 209-glyph catalog, and includes release export settings for selected board weights, glyph sections, and font formats:

1. Create a categorized starter glyph board.
2. Generate starter glyph outlines in empty slots, draw filled vector glyphs yourself, or build glyphs from supported live shapes and booleans.
3. Refine the editable vector outlines in Figma.
4. Select a board and let Typegen auto-scan it.
5. Preview available glyphs with custom text or quick presets.
6. Tune spacing and optional manual kerning pairs in the glyph detail overlay.
7. Click `Generate font`, choose export settings, and download a ZIP package containing selected weights, selected glyph sections, selected formats, and one test HTML file.

The board action is safe to re-run: it updates the selected board when one is active on the canvas, preserves existing glyph artwork, and adds/repositions supported slots into labeled category bands. Regular and Bold starter styles use separate boards, so creating a Bold board will not reuse an existing Regular board.

Board-aware actions prefer the selected board or a selected slot's parent board. If no board is selected, Typegen falls back to the starter style control.

The plugin also shows the active board and weight in the UI after board creation, starter generation, or scanning, so multi-weight work stays visible.

The starter glyph action is also artwork-safe: it fills empty supported slots, replaces older Typegen-owned starter outlines when rerun, and skips slots with user artwork. Starter outlines are generated from Inter, then boolean-merged and flattened so overlapping Inter contours do not create even-odd holes.

## Current Scope

Supported:

- 209 glyphs across uppercase, lowercase, numbers, ASCII punctuation, inverted punctuation, quotes, dashes, currency, legal symbols, math symbols, standalone marks, and Latin extended letters.
- The expanded catalog matches the requested Latin, punctuation, symbol, currency, math, mark, and extended-letter set.
- Simple filled vector paths
- Filled shape layers such as rounded rectangles, ellipses, polygons, and stars
- Live boolean operations
- Temporary slot flattening before glyph extraction, without changing source artwork
- Starter glyph board generation
- Inter-based starter glyph outline generation for empty slots, with Regular and Bold starter styles
- Figma-native, compact plugin UI direction
- Automatic board scanning on selection changes
- Active board/weight indicator for multi-board workflows
- Visual glyph status grid
- Contextual glyph preview/editing overlay
- Recipe overlay for supported glyph constraints
- Glyph scan and validation
- SVG preview from extracted outlines
- Preview presets for mixed, headline, word-list, paragraph-style, and number/symbol samples
- Global letter spacing and space width
- Per-glyph advance width overrides
- Manual kerning pairs from the glyph detail overlay
- Export settings for board weights, glyph sections, and output formats
- OTF, TTF, WOFF, and WOFF2 files for selected valid generated board weights
- Single HTML test page with inline `@font-face` rows for every generated weight
- Saved settings and last scan restore inside the Figma document

Not supported in the current release:

- Characters outside the 209-glyph catalog
- Automatic accent composition from base letters plus marks
- Variable fonts
- AI glyph generation
- Replacing existing glyph artwork from the starter generator
- Text layers, images, gradients, effects, masks, or unsupported live shape layers as glyph outlines
- Variable or interpolated weights/styles beyond separate static board exports

## Using The Plugin In Figma

1. Install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Build the plugin:

   ```powershell
   npm.cmd run build
   ```

3. In Figma, open `Plugins > Development > Import plugin from manifest...`.
4. Select `manifest.json` from this repository.
5. Run Typegen from Figma's development plugins menu.

The committed `dist/` files are included so the manifest can load immediately after cloning, but rebuilding is recommended after local edits.

## Supported Glyph Recipe

- Use the generated board whenever possible; it creates safe slot names for all 209 supported glyphs, including names such as `glyph-dollar`, `glyph-endash`, `glyph-euro`, `glyph-not-equal`, and Unicode fallback names for accented letters.
- Raw single-character aliases such as `glyph-!`, `glyph-.`, `glyph-?`, and `glyph-Ç` are also accepted during scanning, but the generated board uses safer names for punctuation and symbols.
- Draw simple filled vector paths, filled live shape layers, or live boolean operations inside each slot. Typegen scans a temporary flattened copy of the slot artwork.
- Choose Inter Regular or Inter Bold, then use `Generate starter glyphs` to fill empty slots with editable Inter-derived starter outlines.
- Convert text to outlines before scanning.
- Convert strokes and live lines to filled vector outlines before scanning.
- Avoid images, effects, gradients, masks, and unsupported live shape layers.
- Use preview, spacing controls, and the glyph inspector before exporting.
- Use preview presets to quickly inspect mixed-case text, words, paragraph-style samples, numbers, and symbols.

## Development

```powershell
npm.cmd run typecheck
npm.cmd run test:regression
npm.cmd run build
npm.cmd run check
```

Build output:

- `dist/controller.js`
- `dist/index.html`

## QA

See [docs/QA.md](docs/QA.md) for the manual QA checklist, [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) for exported font smoke testing, and [docs/COMMUNITY_LAUNCH.md](docs/COMMUNITY_LAUNCH.md) for the Figma Community listing and launch asset brief. Historical planning docs remain in [docs/ROADMAP.md](docs/ROADMAP.md), [docs/V3_ROADMAP.md](docs/V3_ROADMAP.md), and [docs/V3_LOWERCASE_GEOMETRY.md](docs/V3_LOWERCASE_GEOMETRY.md).

## Status

Typegen 1.0.0 exports selected weights, glyph sections, and OTF/TTF/WOFF/WOFF2 package output on top of the expanded 209-glyph coverage.
