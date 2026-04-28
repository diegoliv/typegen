# Typegen

Typegen is a focused Figma plugin MVP for turning glyphs drawn in Figma into a usable static OTF font.

The current V3 alpha keeps the reliable V2 loop and adds lowercase a-z plus a small common-symbol set:

1. Create a starter A-Z, a-z, 0-9, punctuation, and common-symbol glyph board.
2. Draw filled vector glyphs inside supported slots.
3. Scan the selected board.
4. Preview available glyphs.
5. Tune spacing.
6. Export an OTF font and smoke-test HTML.

The board action is safe to re-run: it updates an existing `Font Glyph Board`, preserves existing glyph artwork, and repositions supported slots into the canonical A-Z, a-z, 0-9, punctuation order.

## Current Scope

Supported:

- Uppercase A-Z
- Numbers 0-9
- Basic punctuation: `.`, `,`, `!`, `?`, `-`, `:`
- Lowercase a-z
- Common symbols: `'`, `"`, `/`, `(`, `)`, `&`, `+`, `=`, `@`
- Simple filled vector paths
- Starter glyph board generation
- Glyph scan and validation
- SVG preview from extracted outlines
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
- Convert text to outlines before scanning.
- Expand strokes before scanning.
- Avoid images, effects, gradients, masks, booleans, and live shape layers.
- Use preview, spacing controls, and the glyph inspector before exporting.

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

V3.2 alpha common-symbol expansion. This is intentionally still an MVP, built to prove and harden the Figma vectors -> glyph model -> preview -> font export workflow before broader character support.
