# Typegen V3 Roadmap

## Product Goal

V3 moves Typegen from a cap-height-only display-font MVP toward a fuller static font workflow by adding lowercase support.

The first V3 goal is not a professional font editor. It is to prove that lowercase glyphs can be designed in Figma, scanned, previewed, and exported with usable vertical metrics.

## Scope Boundary

V3.0 should focus on lowercase planning and the minimum implementation needed to validate it.

In scope:

- Lowercase `a-z`
- Safe lowercase slot naming
- Board layout updates
- x-height guide
- ascender guide
- descender guide
- Baseline and side-boundary guide reuse
- Lowercase normalization against the new guides
- Preview and export support for lowercase
- Regression fixtures for lowercase metrics
- Manual QA words that exercise lowercase proportions

Still out of scope:

- Kerning
- Ligatures
- Variable fonts
- Multiple weights or styles
- AI generation
- Broad symbol sets
- Professional side-bearing editing
- Full OpenType feature authoring

## Key Design Decision

Lowercase requires a new vertical metrics model.

V2 glyphs mostly live between baseline and cap height. Lowercase introduces:

- x-height for letters like `a`, `c`, `e`, `o`, `x`
- ascenders for letters like `b`, `d`, `h`, `k`, `l`, `t`
- descenders for letters like `g`, `j`, `p`, `q`, `y`
- mixed-height preview strings

That means V3 should update board guides before adding broad lowercase generation.

## Proposed V3.0 Sprint

Goal: lower-risk lowercase pilot.

1. Add design spec for lowercase guide geometry.
2. Update board generation to include lowercase slots in a separate section or row group.
3. Add x-height, ascender, descender, and baseline guides to lowercase slots.
4. Add shared glyph definitions for `a-z`.
5. Add scan support for lowercase slot names.
6. Normalize lowercase glyphs against lowercase slot guides.
7. Add preview/export support for a small lowercase pilot set.
8. Add regression fixtures for `a`, `b`, `g`, `o`, and `x`.
9. Run manual QA with `type`, `glyph`, `font`, `quick`, and `box`.

## Pilot Recommendation

Start with a pilot subset before all lowercase:

- `a`
- `b`
- `g`
- `o`
- `x`

This covers:

- x-height-only glyphs: `a`, `o`, `x`
- ascender behavior: `b`
- descender behavior: `g`

If the pilot works, expand to the full lowercase alphabet.

## V3.0 Exit Criteria

- Lowercase pilot slots generate on the board.
- Existing V2 slots and artwork remain preserved during board update.
- Lowercase pilot glyphs scan as valid when drawn as filled vectors.
- Preview renders mixed-case text.
- Exported OTF verifies lowercase unicode, advance width, and outlines.
- Smoke-test HTML renders lowercase pilot words.
- V2 uppercase, numeric, and punctuation behavior does not regress.

## Risks

- Existing slot-relative normalization assumes V2 guide geometry.
- Lowercase guide design may need multiple vertical zones.
- Descenders may require canvas slot space below baseline.
- Mixed-case spacing may expose new advance-width defaults.
- Full lowercase may be too large for one implementation sprint.

## Recommended Next Action

Start V3.0 with a planning/design pass for lowercase board geometry before writing implementation code.
