# V3 Lowercase Geometry Spec

## Goal

Define the first lowercase slot model before implementing V3 code.

The V3 lowercase pilot should preserve the V2 pipeline while adding the vertical metrics needed for lowercase:

- Ascender
- x-height
- Baseline
- Descender
- Side boundaries

Implementation status: V3.0 alpha implemented this pilot profile for `a`, `b`, `g`, `o`, and `x`; V3.1 alpha reuses the same profile for full lowercase `a-z`.

## Pilot Glyphs

Start with five lowercase glyphs:

- `a`
- `b`
- `g`
- `o`
- `x`

This subset is intentionally small:

- `a`, `o`, and `x` test x-height glyphs.
- `b` tests ascenders.
- `g` tests descenders.

Do not add all lowercase letters until this pilot previews and exports correctly.

## Slot Naming

Recommended pilot slot names:

- `glyph-a`
- `glyph-b`
- `glyph-g`
- `glyph-o`
- `glyph-x`

Full lowercase later uses `glyph-a` through `glyph-z`.

This collides with the old V2 invalid-name rule for lowercase, so V3 must explicitly update supported glyph definitions rather than relying on broad regex matching.

## Slot Dimensions

Recommended lowercase slot size:

```txt
width: 160 px
height: 240 px
```

Keep width aligned with V2 slots so the board remains readable. Increase height from `200` to `240` so descenders have room below the baseline.

## Guide Positions

Recommended positions inside a `160 x 240` lowercase slot:

```txt
left boundary:   x = 24
right boundary:  x = 136
ascender guide:  y = 40
x-height guide:  y = 77
baseline guide:  y = 170
descender guide: y = 207
```

These positions map cleanly to the existing font metrics:

```txt
ascender:  700
x-height:  500
baseline:    0
descender: -200
```

The relationship is:

```txt
fontY = ((baselineY - figmaY) / (baselineY - ascenderY)) * 700
```

With:

```txt
baselineY = 170
ascenderY = 40
```

That gives:

```txt
xHeightY   = 170 - (500 / 700) * 130 = 77.14
descenderY = 170 + (200 / 700) * 130 = 207.14
```

Rounded board guides:

```txt
x-height guide:  77
descender guide: 207
```

## Horizontal Mapping

Reuse the V2 horizontal model:

```txt
slot left boundary:  x = 24
slot right boundary: x = 136
font left bearing:   40
font design width:   720
```

This keeps lowercase compatible with current preview/export spacing and per-glyph advance overrides.

## Board Layout

For V3.0 pilot, add lowercase slots after the existing V2 glyph set.

Recommended layout:

1. Preserve existing V2 slots exactly.
2. Append lowercase pilot slots in a new row group.
3. Use the taller lowercase slot height only for lowercase slots.
4. Resize the board to fit mixed slot heights.
5. Never move or resize existing V2 slots during board update.

Avoid reorganizing the whole board in V3.0. Preserving user artwork is more important than making the board visually perfect.

## Normalization Requirements

V2 normalization currently assumes:

```txt
cap-height guide -> 700
baseline guide   -> 0
```

V3 lowercase normalization should support per-slot guide profiles:

```ts
type SlotGuideProfile = {
  name: 'uppercase' | 'lowercase';
  slotWidth: number;
  slotHeight: number;
  leftBoundaryX: number;
  rightBoundaryX: number;
  ascenderY: number;
  xHeightY?: number;
  baselineY: number;
  descenderY?: number;
  ascenderUnits: number;
};
```

Lowercase pilot profile:

```ts
{
  name: 'lowercase',
  slotWidth: 160,
  slotHeight: 240,
  leftBoundaryX: 24,
  rightBoundaryX: 136,
  ascenderY: 40,
  xHeightY: 77,
  baselineY: 170,
  descenderY: 207,
  ascenderUnits: 700,
}
```

## Preview QA Strings

Use these for the pilot:

```txt
box
go
bag
go ox
ABC box 012
```

After full lowercase:

```txt
type
glyph
font
quick
boxing glyph
```

## Regression Fixtures

Add synthetic fixtures:

- `a`: x-height-only body, no ascender or descender.
- `b`: ascender reaches near `700`.
- `g`: descender extends below baseline toward `-200`.
- `o`: x-height oval/counter test.
- `x`: diagonal x-height test.

Regression checks should verify:

- Lowercase names parse.
- Pilot glyphs are considered supported.
- `a`, `o`, and `x` stay around x-height.
- `b` reaches ascender height.
- `g` extends below baseline.
- Generated OTF roundtrip preserves lowercase unicode and advance widths.

## V3.0 Implementation Order

1. Add guide-profile constants.
2. Split board slot creation into uppercase-style and lowercase-style profiles.
3. Add lowercase pilot glyph definitions.
4. Add board update support for pilot slots.
5. Update scan/name parsing for pilot lowercase slots.
6. Update normalization to use the correct slot guide profile.
7. Add preview/export support through the existing glyph model.
8. Add regression fixtures and roundtrip checks.
9. Update QA docs and smoke-test guidance.

## V3.0 Non-Goals

- Do not add full lowercase before the pilot is verified.
- Do not add kerning.
- Do not add ligatures.
- Do not redesign the whole board.
- Do not change the export format.
- Do not add professional side-bearing editing.
