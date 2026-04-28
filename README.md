# Typegen

Typegen is a focused Figma plugin MVP for turning glyphs drawn in Figma into a usable static OTF font.

The current V4 alpha keeps the reliable V3 loop and adds editable Inter-based starter glyph generation:

1. Create a starter A-Z, a-z, 0-9, punctuation, and common-symbol glyph board.
2. Generate starter glyph outlines in empty slots or draw filled vector glyphs yourself.
3. Refine the editable vector outlines in Figma.
4. Scan the selected board.
5. Preview available glyphs with custom text or quick presets.
6. Tune spacing.
7. Export an OTF font and smoke-test HTML.

The board action is safe to re-run: it updates an existing `Font Glyph Board`, preserves existing glyph artwork, and repositions supported slots into the canonical A-Z, a-z, 0-9, punctuation order.

The starter glyph action is also artwork-safe: it fills empty supported slots only and skips any slot that already contains user or generated artwork. Starter outlines are seeded from Figma's Inter Regular font when available, then flattened into editable vectors.

## Current Scope

Supported:

- Uppercase A-Z
- Numbers 0-9
- Basic punctuation: `.`, `,`, `!`, `?`, `-`, `:`
- Lowercase a-z
- Common symbols: `'`, `"`, `/`, `(`, `)`, `&`, `+`, `=`, `@`
- Simple filled vector paths
- Starter glyph board generation
- Inter-based starter glyph outline generation for empty slots
- Glyph scan and validation
- SVG preview from extracted outlines
- Preview presets for mixed, headline, word-list, paragraph-style, and number/symbol samples
- Global letter spacing and space width
- Per-glyph advance width overrides
- OTF export
- Self-contained smoke-test HTML export
- Saved settings and last scan restore inside the Figma document

Not supported in the MVP:

- Symbols beyond the supported common set
- Kerning
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
- Use `Generate starter glyphs` to fill empty slots with editable Inter-based starter outlines, then refine them as needed.
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

V4.1 alpha preview presets on top of Inter-based starter glyph generation. This is intentionally still an MVP, built to prove and harden the Figma vectors -> glyph model -> preview -> font export workflow before broader character support.
