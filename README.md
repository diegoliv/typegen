# Typegen

Typegen is a focused Figma plugin MVP for turning uppercase glyphs drawn in Figma into a usable static OTF font.

The goal of this V1 is the smallest reliable loop:

1. Create a starter A-Z glyph board.
2. Draw filled vector glyphs inside slots named `glyph-A` through `glyph-Z`.
3. Scan the selected board.
4. Preview available glyphs.
5. Tune spacing.
6. Export an OTF font and smoke-test HTML.

## Current Scope

Supported:

- Uppercase A-Z
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

- Lowercase, numbers, punctuation
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

- Use slots named exactly `glyph-A` through `glyph-Z`.
- Draw simple filled vector paths inside each slot.
- Convert text to outlines before scanning.
- Expand strokes before scanning.
- Avoid images, effects, gradients, masks, booleans, and live shape layers.
- Use preview, spacing controls, and the glyph inspector before exporting.

## Development

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run check
```

Build output:

- `dist/controller.js`
- `dist/index.html`

## QA

See [docs/QA.md](docs/QA.md) for the manual QA checklist and [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) for exported font smoke testing.

## Status

V1.0 candidate. This is intentionally still an MVP, built to prove the Figma vectors -> glyph model -> preview -> font export workflow.
