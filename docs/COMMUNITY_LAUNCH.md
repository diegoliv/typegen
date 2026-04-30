# Typegen Figma Community Launch Brief

Use this brief for the 1.0.0 Figma Community listing and launch assets.

## Positioning

Typegen helps designers turn lettering drawn in Figma into usable static font files without leaving their design workflow.

Lead with the current 1.0.0 release:

- Designers often sketch type ideas in Figma, then hit a gap when they need a real font file for testing, sharing, or prototyping.
- Typegen closes that gap with a structured glyph board, plugin preview, validation, spacing controls, and static font export.
- The 1.0.0 release supports the current 209-glyph Typegen catalog across Latin letters, numbers, punctuation, symbols, currency, math, standalone marks, and Latin extended characters.
- Output is a ZIP package with selected static weights, glyph sections, formats, and one test HTML file.

Do not position Typegen as a full font editor, variable-font tool, AI glyph generator, auto-kerning engine, or complete OpenType feature editor.

## Listing Copy

Tagline:

> Turn Figma lettering into a usable font package.

Description:

> Designers already use Figma to explore lettering, logos, display type, and custom alphabets. The hard part is getting those vector drawings into a font file you can install, test, and share.
>
> Typegen gives that work a simple path forward: create a structured glyph board, draw or refine the glyphs in Figma, scan the board, preview sample text, adjust spacing, and export a static font package with a test HTML specimen.
>
> The 1.0.0 release is intentionally focused. It supports the current 209-glyph Typegen catalog and works best with simple filled vector artwork.

What users get:

- A clean place to organize glyph work before it becomes a font.
- A scan step that shows what is ready and what needs fixing.
- A preview step for checking words, spacing, and missing glyphs.
- A local export package for testing the font outside Figma.
- Clear constraints, so unsupported artwork fails with useful guidance.

## Required Community Assets

Figma's publishing flow asks for:

- Plugin icon, recommended `128 x 128px`.
- Thumbnail image or video, recommended `1920 x 1080px`.
- Optional playground file.
- Optional carousel media, up to 9 images or videos.
- Name, tagline, description, and category.
- Support contact.
- Optional security disclosure form.

Recommended carousel:

1. Cover: `Typegen` plus `Design glyphs in Figma. Export a font package.`
2. Categorized 209-glyph board.
3. Editable vector glyph workflow.
4. Scan and validation states.
5. Preview, spacing, and kerning.
6. Export settings and ZIP contents.
7. Browser test HTML rendering multiple static weights.

Created assets:

- `docs/community-assets/typegen-community-icon.png` and `.svg`
- `docs/community-assets/typegen-community-thumbnail.png` and `.svg`
- `docs/community-assets/typegen-carousel-01-problem.png` and `.svg`
- `docs/community-assets/typegen-carousel-02-board.png` and `.svg`
- `docs/community-assets/typegen-carousel-03-scan.png` and `.svg`
- `docs/community-assets/typegen-carousel-04-preview.png` and `.svg`
- `docs/community-assets/typegen-carousel-05-export.png` and `.svg`
- `docs/community-assets/typegen-carousel-06-workflow.png` and `.svg`

## Visual Direction

Use a practical type-specimen-meets-Figma-utility direction:

- High contrast neutral base with one accent color.
- Visible glyph slots, category bands, guides, and output files.
- Show breadth with `Aa09?!` instead of only `A-Z`.
- Keep thumbnail text short: `Figma to Font`, `209 Glyphs`, or `Draw. Preview. Export.`

Avoid visual claims that imply unsupported features such as AI generation, variable fonts, automatic interpolation, or any-layer support.

## Constraints To Show Publicly

- Supports the current 209-glyph Typegen catalog only.
- Exports separate static board weights, not variable or interpolated fonts.
- OTF is the native generated format; TTF, WOFF, and WOFF2 are converted package outputs.
- Use simple filled vector paths, supported filled shape layers, or live boolean operations.
- Convert text layers to outlines before scanning.
- Convert strokes and live lines to filled vector outlines.
- Avoid images, gradients, effects, masks, and unsupported live shape layers.
- Standalone marks are supported as explicit glyph slots; automatic accent composition is not supported.

## Launch QA Gate

Before submitting:

- Run `npm.cmd run typecheck`.
- Run `npm.cmd run test:regression`.
- Run `npm.cmd run build`.
- Run `npm.cmd run check`.
- Import `manifest.json` in Figma Desktop and confirm the plugin opens.
- Create/update a 209-glyph board.
- Generate starter glyphs for at least Regular and Bold boards.
- Scan, preview, and export representative glyphs from every section.
- Export OTF-only and all-format ZIPs.
- Open generated `index.html` after extraction and verify font loading.
- Smoke test counters in `O`, `B`, `P`, `R`, `a`, and `g`.
- Confirm source artwork is not destructively flattened by scan/export.
- Confirm unsupported text, strokes, images, gradients, effects, masks, and unsupported shapes show actionable validation messages.

## Review Risks

- The broad 209-glyph catalog increases QA surface area.
- WOFF2 conversion uses a bundled encoder and needs manual Figma Desktop timing checks.
- Separate static board weights need clear naming and expected CSS weight output.
- Network access should remain declared as no access if the plugin does not call external domains.
- Inter-derived starter outlines should have license and attribution confidence before publication.
- Any listing or screenshot must avoid promising unsupported font-editor features.
