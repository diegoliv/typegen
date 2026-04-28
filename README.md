# Typegen

Typegen is a focused Figma plugin MVP for turning uppercase, numeric, and basic punctuation glyphs drawn in Figma into a usable static OTF font.

The goal of V2 is to keep the smallest reliable loop from V1, then make it easier to verify and safer to extend:

1. Create a starter A-Z, 0-9, and punctuation glyph board.
2. Draw filled vector glyphs inside slots named `glyph-A` through `glyph-Z`, `glyph-0` through `glyph-9`, and supported punctuation slots.
3. Scan the selected board.
4. Preview available glyphs.
5. Tune spacing.
6. Export an OTF font and smoke-test HTML.

The board action is safe to re-run: it updates an existing `Font Glyph Board` by adding missing supported slots and does not clear existing glyph artwork.

## Current Scope

Supported:

- Uppercase A-Z
- Numbers 0-9
- Basic punctuation: `.`, `,`, `!`, `?`, `-`, `:`
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

- Lowercase and extra symbols
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

- Use slots named exactly `glyph-A` through `glyph-Z`, `glyph-0` through `glyph-9`, `glyph-period`, `glyph-comma`, `glyph-exclamation`, `glyph-question`, `glyph-hyphen`, and `glyph-colon`.
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

See [docs/QA.md](docs/QA.md) for the manual QA checklist, [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) for exported font smoke testing, [docs/ROADMAP.md](docs/ROADMAP.md) for the V2 closeout / V3 boundary, and [docs/V3_ROADMAP.md](docs/V3_ROADMAP.md) for the lowercase roadmap.

## Status

V2.10.1 punctuation milestone closeout. This is intentionally still an MVP, built to prove and harden the Figma vectors -> glyph model -> preview -> font export workflow with A-Z, 0-9, and a small punctuation set before broader character support.
