# Typegen V3 Roadmap

## Product Goal

V3 moves Typegen from a cap-height-only display-font MVP toward a fuller static font workflow by adding lowercase support.

The first V3 goal is not a professional font editor. It is to prove that lowercase glyphs can be designed in Figma, scanned, previewed, and exported with usable vertical metrics.

## Scope Boundary

V3.0 should focus on the minimum lowercase implementation needed to validate the new geometry before full lowercase.

In scope:

- Lowercase pilot glyphs: `a`, `b`, `g`, `o`, `x`
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

## V3.0 Alpha Sprint

Goal: lower-risk lowercase pilot.

1. Add design spec for lowercase guide geometry. Done.
2. Update board generation to append lowercase pilot slots. Done.
3. Add x-height, ascender, descender, and baseline guides to lowercase slots. Done.
4. Add shared glyph definitions for `a`, `b`, `g`, `o`, and `x`. Done.
5. Add scan support for pilot lowercase slot names. Done.
6. Normalize lowercase glyphs against lowercase slot guides. Done.
7. Add preview/export support through the existing glyph model. Done.
8. Add regression fixtures for `a`, `b`, `g`, `o`, and `x`. Done.
9. Run manual QA with `box`, `go`, `bag`, `go ox`, and `ABC box 012`. Done.

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

## V3.1 Full Lowercase Expansion Plan

Goal: expand the verified lowercase guide profile from the pilot to `a-z` without disrupting existing V2 or V3 alpha boards.

Supported lowercase set:

- `glyph-a` through `glyph-z`

Implementation requirements:

- Reuse the V3 lowercase guide profile for every lowercase slot.
- Keep V2 uppercase, numeric, and punctuation glyph behavior unchanged.
- Preserve existing V3 alpha pilot artwork when users click `Create/update glyph board`.
- Reposition existing supported slots into canonical A-Z, a-z, 0-9, punctuation order.
- Keep lowercase outside `a-z` unsupported.
- Add regression coverage for x-height, ascender, and descender representative glyphs.
- Add manual QA strings for full lowercase words: `type`, `glyph`, `font`, `quick`, and `boxing glyph`.

Board migration decision:

- Reposition existing supported slot frames rather than creating duplicates or clearing artwork.
- Moving the whole slot frame preserves artwork because user vectors remain children of the slot.
- Keep duplicate handling deterministic: the first matching slot is repositioned and used by scanning.

Recommended V3.1 implementation order:

1. Add full lowercase glyph definitions.
2. Add board update logic that sorts existing and new slots into canonical order.
3. Add regression coverage for full lowercase naming and preview support.
4. Add representative normalization fixtures for `c`, `d`, `j`, `p`, `q`, `t`, and `y`.
5. Update UI copy, docs, and QA from "lowercase pilot" to "lowercase a-z".
6. Run manual QA on old pilot boards and fresh full-lowercase boards.

## V3.1 Signoff Plan

Goal: close V3.1 as the full-lowercase alpha before starting another scope expansion.

Manual QA targets:

- Fresh board creates 68 slots in A-Z, a-z, 0-9, punctuation order.
- Existing V3.0 pilot boards update into sorted order without losing `a`, `b`, `g`, `o`, or `x` artwork.
- Existing V2 boards update safely with lowercase slots and preserve uppercase, numeric, and punctuation artwork.
- Preview and smoke-test HTML render `type`, `glyph`, `font`, `quick`, `boxing glyph`, `box`, `go`, `bag`, `go ox`, and `ABC box 012`.
- Descenders in `g`, `j`, `p`, `q`, and `y` sit below baseline without clipping.
- Ascenders in `b`, `d`, `h`, `k`, `l`, and `t` align with the ascender guide.
- x-height glyphs such as `a`, `c`, `e`, `m`, `n`, `o`, `r`, `s`, `u`, `v`, `w`, `x`, and `z` feel visually consistent.
- V2 regression strings still work: `ABC, 012.!`, `A-B: 10?`, `ABOPR PRO BAR`, and `2024 A10`.

Automated gate:

- `npm.cmd run typecheck`
- `npm.cmd run test:regression`
- `npm.cmd run check`

Release criteria:

- No artwork loss during board update.
- Sorted board order is confirmed on fresh and upgraded boards.
- Full lowercase scan, preview, OTF export, and smoke-test HTML work end to end.
- README, release notes, QA docs, roadmap, and `TASKS.md` match the shipped behavior.
- Remaining limitations are documented rather than hidden.

Post-3.1 boundary:

- Do not add new symbols, kerning, ligatures, variable fonts, or side-bearing tools until V3.1 is closed.
- If V3.1 needs more work, prefer polish/fixes for lowercase spacing, guide clarity, validation copy, or board migration safety.

Status: V3.1 manual QA passed. No release-blocking defects were reported.

## V3.2 Common Symbols Planning

Goal: add the next small character-set slice only after V3.1 is closed and stable.

Recommended candidate set:

- Apostrophe: `glyph-apostrophe`
- Quote: `glyph-quote`
- Slash: `glyph-slash`
- Left parenthesis: `glyph-paren-left`
- Right parenthesis: `glyph-paren-right`
- Ampersand: `glyph-ampersand`
- Plus: `glyph-plus`
- Equals: `glyph-equals`
- At sign: `glyph-at`

V3.2 should remain a constrained static-font workflow:

- Reuse current scan, preview, spacing, verification, and export behavior.
- Prefer safe Figma slot names for symbols.
- Add raw alias scanning only where it is simple and unambiguous.
- Add default advances for narrow or punctuation-like symbols when needed.
- Keep board updates artwork-safe and sorted.

Do not use V3.2 for:

- Kerning.
- Ligatures.
- Variable fonts.
- Broad Unicode support.
- Side-bearing editing.
- Professional OpenType feature authoring.

## V3.2 Common Symbols Implementation

Goal: support the planned common-symbol set without changing the static-font workflow.

Implemented symbol set:

- Apostrophe: `glyph-apostrophe`
- Quote: `glyph-quote`
- Slash: `glyph-slash`
- Left parenthesis: `glyph-paren-left`
- Right parenthesis: `glyph-paren-right`
- Ampersand: `glyph-ampersand`
- Plus: `glyph-plus`
- Equals: `glyph-equals`
- At sign: `glyph-at`

V3.2 QA strings:

- `a/b @2+2`
- `A+B=C`
- `font@example`
- `(quick)`

V3.2 exit criteria:

- Fresh boards include the common-symbol slots after punctuation.
- Existing boards update without clearing artwork.
- Safe symbol names scan correctly.
- Simple raw aliases such as `glyph-@`, `glyph-+`, and `glyph-/` scan correctly.
- Preview and exported OTF include scanned common symbols.
- V3.1 lowercase and V2 punctuation behavior do not regress.

Status: V3.2 manual QA passed. No release-blocking defects were reported.

## V3.3 Metrics And Preview Polish Planning

Goal: improve the feel of the expanded V3 character set before adding more glyph scope.

Recommended focus:

- Review default advances for lowercase and common symbols.
- Confirm symbol spacing in realistic strings rather than isolated glyph samples.
- Improve smoke-test sample coverage for mixed lowercase, numbers, punctuation, and symbols.
- Add or tune non-blocking metrics warnings if a symbol class is consistently too tight or too wide.
- Keep the existing static OTF export, board generation, scan, and preview architecture.

Candidate QA strings:

- `quick fox @ 10/10`
- `type + glyph = font`
- `(boxing glyph)`
- `"quick" & 'font'`
- `A-Z / a-z`

Do not use V3.3 for:

- More glyph scope.
- Kerning.
- Ligatures.
- Side-bearing editing.
- Variable fonts.
- AI generation.

Status: V3.3 metrics/readability QA passed. No code changes were needed.

## V3 Alpha Closeout

Goal: freeze the successful V3 alpha expansion before starting a new feature track.

Closeout checklist:

- Final automated verification passes.
- `dist/` is rebuilt from current source.
- README, release notes, QA docs, roadmap, and `TASKS.md` describe the same supported scope.
- V3.0 pilot, V3.1 lowercase, V3.2 symbols, and V3.3 metrics/readability outcomes are all recorded.
- The next feature track is planned only after the V3 alpha changes are committed.

Candidate next tracks after closeout:

- Preview/specimen presets.
- Additional carefully chosen symbols.
- Validation polish.
- Export package polish.

Still avoid:

- Kerning.
- Ligatures.
- Variable fonts.
- AI generation.
- Broad Unicode support.

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

Run final V3 alpha verification and prepare the closeout commit/PR boundary.
