# Typegen

Typegen is a focused Figma plugin MVP for turning glyphs drawn in Figma into a usable static OTF font.

The current V7 alpha keeps the reliable V6 export loop and adds constrained manual kerning:

1. Create a starter A-Z, a-z, 0-9, punctuation, and common-symbol glyph board.
2. Generate starter glyph outlines in empty slots or draw filled vector glyphs yourself.
3. Refine the editable vector outlines in Figma.
4. Select a board and let Typegen auto-scan it.
5. Preview available glyphs with custom text or quick presets.
6. Tune spacing and optional manual kerning pairs in the glyph detail overlay.
7. Click `Generate font` to download a ZIP package containing every generated weight and one test HTML file.

The board action is safe to re-run: it updates the selected board when one is active on the canvas, preserves existing glyph artwork, and repositions supported slots into the canonical A-Z, a-z, 0-9, punctuation order. Regular and Bold starter styles use separate boards, so creating a Bold board will not reuse an existing Regular board.

Board-aware actions prefer the selected board or a selected slot's parent board. If no board is selected, Typegen falls back to the starter style control.

The plugin also shows the active board and weight in the UI after board creation, starter generation, or scanning, so multi-weight work stays visible.

The starter glyph action is also artwork-safe: it fills empty supported slots, replaces older Typegen-owned starter outlines when rerun, and skips slots with user artwork. Starter outlines are generated from Inter, then boolean-merged and flattened so overlapping Inter contours do not create even-odd holes.

## Current Scope

Supported:

- Uppercase A-Z
- Numbers 0-9
- Basic punctuation: `.`, `,`, `!`, `?`, `-`, `:`
- Lowercase a-z
- Common symbols: `'`, `"`, `/`, `(`, `)`, `&`, `+`, `=`, `@`
- Simple filled vector paths
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
- One-click ZIP export from all Typegen glyph boards on the page
- OTF files for each valid generated board weight
- Single HTML test page with inline `@font-face` rows for every generated weight
- Saved settings and last scan restore inside the Figma document

Not supported in the MVP:

- Symbols beyond the supported common set
- Variable fonts
- AI glyph generation
- Replacing existing glyph artwork from the starter generator
- Strokes, text layers, images, gradients, effects, masks, booleans, or live shape layers as glyph outlines
- Multiple weights or styles

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

- Use slots named exactly `glyph-A` through `glyph-Z`, `glyph-a` through `glyph-z`, `glyph-0` through `glyph-9`, `glyph-period`, `glyph-comma`, `glyph-exclamation`, `glyph-question`, `glyph-hyphen`, `glyph-colon`, `glyph-apostrophe`, `glyph-quote`, `glyph-slash`, `glyph-paren-left`, `glyph-paren-right`, `glyph-ampersand`, `glyph-plus`, `glyph-equals`, and `glyph-at`.
- Raw punctuation aliases such as `glyph-!`, `glyph-.`, and `glyph-?` are also accepted during scanning, but the generated board uses the safer names above.
- Draw simple filled vector paths inside each slot.
- Choose Inter Regular or Inter Bold, then use `Generate starter glyphs` to fill empty slots with editable Inter-derived starter outlines.
- Convert text to outlines before scanning.
- Expand strokes before scanning.
- Avoid images, effects, gradients, masks, booleans, and live shape layers.
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

See [docs/QA.md](docs/QA.md) for the manual QA checklist, [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) for exported font smoke testing, [docs/ROADMAP.md](docs/ROADMAP.md) for the V2 closeout / V3 boundary, [docs/V3_ROADMAP.md](docs/V3_ROADMAP.md) for the lowercase roadmap, and [docs/V3_LOWERCASE_GEOMETRY.md](docs/V3_LOWERCASE_GEOMETRY.md) for the V3 guide geometry spec.

## Status

V6.0 alpha begins the core UX/UI direction on top of V5 export package polish, starter glyph generation, style controls, active board clarity, and preview presets. This is intentionally still an MVP with one static OTF export path, built to prove and harden the Figma vectors -> glyph model -> preview -> font export workflow before broader export formats.
