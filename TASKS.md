# Typegen MVP Implementation Plan

## 56. V9.0 Expanded Glyph Support Plan

Goal: expand Typegen from the current compact Latin/basic symbol set to the requested 209 unique glyphs while keeping the board, scan, preview, spacing, kerning, starter, and export pipeline understandable for a designer.

Implementation status:

- Added a shared v9 glyph catalog with 209 unique supported glyphs, category metadata, safe slot names, guide profile hints, and default advance widths.
- Replaced the fixed flat board layout with category bands and board-level section labels.
- Updated glyph-name parsing to use generated catalog lookup maps and raw single-character aliases.
- Added grouped glyph sections, category filters, search, per-section counts, and broader preview presets to the plugin UI.
- Updated support copy, README, release notes, QA docs, smoke-test docs, and package metadata for V9.
- Added regression coverage for the requested glyph set, unique slot names, and risky glyph-name parsing.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Remaining:

- Manual Figma QA for V8 board update -> V9 slot creation, category board usability, starter generation coverage, scan/preview/export across representative glyphs, and standalone mark behavior.

Requested support:

- Basic Latin: A-Z, a-z, 0-9.
- ASCII punctuation and symbols: `!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~`.
- Inverted punctuation, quotes, dashes, ellipsis, and single guillemets: `¡¿«»–—…‹›`.
- Currency, legal, math, measurement, and marks: `€¢£¥₩₹§©®™°±×÷≈≠≤≥µ¶†‡•·¸¨ˆˇ˘¯˙˚˝´˜˛`.
- Latin extended letters: `ÇçÑñÁÀÂÄÃÅÆÉÈÊËÍÌÎÏÓÒÔÖÕØÚÙÛÜÝŸáàâäãåæéèêëíìîïóòôöõøúùûüýÿŒœŠšŽžÐðÞþŁł`.

UX direction:

- Replace the single uninterrupted glyph grid with grouped glyph sections so the user can scan by mental model instead of hunting through 209 tiles.
- Recommended sections: Uppercase, Lowercase, Numbers, Core punctuation, Symbols, Currency, Math, Marks/diacritics, Latin extended uppercase, Latin extended lowercase.
- Keep the Figma canvas board organized into multiple row bands with visible section labels, not one enormous undifferentiated table.
- Use a compact category filter or segmented section navigation in the plugin Glyphs tab. Default to "All" for health counts, but let users jump to one section quickly.
- Add search/jump behavior for a typed character or glyph name once the list becomes large enough to make manual scanning tedious.
- Keep glyph tiles small and consistent; open the existing detail overlay for full specimen, status, spacing, and kerning work.
- Preserve minimal visible guidance: the UI should say which section is active and how many valid/missing/issue glyphs it contains.
- For combining accent marks and spacing marks, make the constraints explicit. V9 should support them as standalone glyph slots only, not automatic accent composition.

Implementation plan:

- Add a typed glyph catalog layer in `src/shared/types.ts` with category metadata, stable sort order, Unicode/name labels, default advance widths, and guide profile hints.
- Expand `GLYPH_DEFINITIONS` to the requested 209 unique characters. Give every glyph a safe Figma slot name such as `glyph-dollar`, `glyph-section`, `glyph-Aacute`, `glyph-aacute`, `glyph-endash`, and `glyph-combining-acute` where direct character names are ambiguous or unsafe.
- Replace hard-coded alias handling in `src/plugin/pluginTypes.ts` with lookup maps generated from the glyph catalog, while preserving existing names like `glyph-period` and direct legacy aliases where safe.
- Update board generation in `src/plugin/glyphBoard.ts` to lay out glyphs by category bands and resize the board from category layout data instead of a fixed six-column global grid.
- Keep slot frames deterministic and update-safe: updating an existing board should add new v9 slots, preserve existing artwork, and avoid moving user-edited slots more than necessary unless the selected board is explicitly updated.
- Update starter glyph generation in `src/plugin/starterGlyphs.ts` so Inter-generated outlines are attempted for every requested glyph, with fallbacks only for simple symbols where Inter cannot supply a glyph.
- Update preview presets in `src/ui/main.ts` to include samples for punctuation, currency/math, accents, and Latin extended words without making the Preview tab busy.
- Update the Glyphs tab in `src/ui/main.ts` and `src/ui/styles.css` for section grouping, category filter/search, per-section health counts, and a scalable grid.
- Audit spacing and kerning UX for a 209-glyph set: default advance widths need tighter punctuation/currency/math values, and the kerning pair picker must remain usable with a larger supported set.
- Ensure `buildFont`, verification, smoke-test HTML, preview layout, and persistence continue to rely on the shared glyph catalog rather than duplicated character lists.
- Update copy in recipe/validation messages from "A-Z, a-z, 0-9, supported punctuation, common symbols" to the actual V9 support language.
- Update README, release notes, QA docs, and package metadata to V9 alpha.

QA plan:

- Add regression checks that the requested glyph string resolves to 209 unique supported glyphs with no duplicate names.
- Add regression checks for glyph name parsing for risky characters: quote, apostrophe, backslash, brackets, backtick, braces, currency symbols, dashes, ellipsis, combining marks, and accented letters.
- Verify board update from a V8 board adds V9 glyph slots without deleting existing user artwork.
- Verify scan, preview, export, package ZIP, and OTF parse-back for representative glyphs from every category.
- Manual Figma QA should inspect canvas board usability: section labels, scroll/navigation feel, category filter/search, and glyph detail overlay from a dense section.

Open decisions:

- Whether to split the Figma board into one large categorized board or multiple linked boards/pages. Recommendation: one categorized board for V9 to preserve the existing package and per-weight model.
- Whether combining marks should use zero advance widths. Recommendation: keep them standalone spacing glyphs for V9 unless font/browser QA proves zero-advance export is reliable.
- Whether starter generation should fill all 209 slots by default. Recommendation: yes for demo velocity, but show warnings for glyphs Inter cannot flatten cleanly.

## 55. V8.0 Temporary Slot Flattening

Goal: support glyph artwork built from filled vectors, filled live shapes, and live Figma boolean operations by flattening a temporary slot copy before extraction while preserving the existing scanned glyph -> preview -> exported OTF pipeline.

Plan:

- Keep V8 inside the current glyph extraction path so filled vectors, live shapes, and booleans become normal normalized vector paths before preview/export.
- For glyph slot frames/components/instances, clone the whole slot, remove helper/hidden layers, flatten the cloned artwork through Figma's native flatten behavior, read the resulting vector paths, and remove the temporary clone.
- Keep the source Figma artwork non-destructive during scanning.
- Keep live lines, stroked vectors, text, images, effects, gradients, and unsupported live shape layers outside the MVP.
- Update validation copy so users know glyph slots are scanned through temporary flattening.
- Verify with typecheck, regression checks, and build.

Implementation status:

- Added non-destructive scan-time flattening for glyph slot artwork.
- Added support for filled live shape layers such as rounded rectangles by flattening a temporary slot copy.
- Corrected V8 normalization so a live boolean node named as a glyph is normalized from its own outline bounds instead of being mistaken for a full glyph slot container.
- Corrected flattened boolean/vector coordinate parsing by matching path bounds against Figma's `absoluteBoundingBox`, avoiding double-transform offsets when flattened path data is already page-relative.
- Replaced per-child V8 conversion inside glyph slots with a more stable whole-slot temporary clone flattening path, so filled vectors, live shapes, and booleans share one slot-relative flattened coordinate frame before extraction.
- Removed live line/stroked-vector support from V8 after Figma plugin outlining proved unreliable; users should convert strokes to filled outlines before scanning.
- Removed the per-glyph temporary-flattening warning for normal slot scans.
- Updated glyph grid thumbnails to render through the same preview layout engine used by the overlay, fixing blank tiles for flattened Inter starter glyphs.
- Anchored temporary slot clones to the source slot transform before flattening so flattened artwork bounds stay aligned with the original glyph slot.
- Remapped flattened temporary slot coordinates from clone bounds back to source slot bounds before validation and normalization, covering board-specific clone offsets seen on Bold starter boards.
- Restored glyph grid thumbnails to a stable font-metric frame after the Bold-board coordinate remap fixed clipping, so small glyphs no longer scale up to fill each tile.
- Kept informational V8 conversion warnings from coloring otherwise-valid glyph grid tiles as warning tiles.
- Updated recipe UI copy, README, release notes, QA checklist, project context, package metadata, and rebuilt `dist/`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run build` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Remaining:

- Manual Figma QA for filled vector glyphs, rounded-rectangle/live-shape glyphs, live boolean glyphs, source artwork preservation after scan, preview output, and exported OTF output.

## 54. V7.0 Manual Kerning

Goal: add constrained manual kerning pairs from the glyph detail overlay while preserving Typegen's scanned glyph -> preview -> exported OTF pipeline.

Completed:

- Created `codex/v7-kerning` from the latest `origin/main`.
- Added typed manual kerning pairs to saved spacing settings.
- Added kerning normalization, clamping, lookup, update, removal, sorting, and metric warnings.
- Applied kerning pairs in the SVG preview layout.
- Added a minimal exported `kern` table injection step after `opentype.js` font generation so manual kerning survives OTF export.
- Added a minimal GPOS `kern` feature alongside the legacy `kern` table so browsers apply exported manual kerning reliably.
- Added explicit `font-kerning: normal` and `"kern" 1` CSS to generated test HTML/CSS.
- Extended generated-font verification to parse exported kerning pairs back from the OTF.
- Split the glyph detail overlay into `Glyph` and `Kerning` tabs.
- Added a kerning pair glyph input, kerning amount slider/number input, reset action, pair preview, and validation message.
- Refined the pair glyph input so users can clear it with Backspace while editing; the kerning controls disable until the field contains one supported glyph.
- Split board creation from board update so new boards are created through an explicit weight picker.
- Prevented duplicate boards for the same weight; choosing an existing weight selects that board instead of creating another one.
- Replaced two-option board weight choices with a common weight select: Thin, Extra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold, and Black.
- Removed starter-font brand naming from board creation and starter weight UI labels.
- Removed the settings-panel new-board shortcut, moved the modal create action beside the weight select, and kept the modal open in a disabled `Creating...` state until the board is created and selected.
- Persisted letter spacing, space width, advance overrides, and kerning pairs on each Typegen board instead of sharing one global spacing state across selected boards.
- Restored board-specific spacing whenever an existing board is selected or restored across plugin sessions.
- Added a board settings import overlay so the active board can copy spacing basics, advance overrides, and kerning pairs from another board.
- Updated font package generation so each exported weight uses that board's own saved spacing and kerning settings.
- Changed board update to require a selected Typegen board instead of silently selecting an existing board when nothing is selected.
- Added regression coverage for kerning sanitization, preview positioning, and OTF roundtrip kerning.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Remaining:

- Manual Figma QA for pair editing, saved settings restore, and exported web-test package kerning behavior.

## 53. V6.0 Core UX/UI Direction

Goal: make the stable Typegen workflow feel like a practical Figma-native plugin workspace before adding more feature scope.

Completed:

- Generated a visual UI draft for the V6 direction.
- Shifted the plugin label to `Typegen V6 alpha`.
- Moved preview higher in the workflow so users see output before diving into diagnostics.
- Removed saved-state and automatic-settings reset controls from the main UI; settings remain automatic.
- Replaced the permanent recipe panel with an overlay opened from a `Recipe` button.
- Removed the visible manual scan action from the main UI.
- Added plugin-side automatic scanning on Figma selection changes.
- Auto-scans after board creation and starter glyph generation so active board, weight, glyph status, and preview data stay current.
- Replaced the text-heavy glyph status table with a visual glyph grid.
- Status colors now follow the V6 direction: black for valid glyphs, muted gray for missing/empty glyphs, and red for issues.
- Moved glyph inspection/editing into a contextual overlay opened by clicking a glyph tile.
- Reworked spacing and glyph advance editing to use sliders with numeric input fallbacks.
- Restyled the UI toward Figma-native neutrals, compact controls, blue focus/primary action, and red issue states.
- Pulled the refined `Typegen V6 UI / Main plugin panel` frame from Figma and ported the main UI back into the plugin.
- Reworked the plugin shell into full-width stacked Figma-style sections instead of separate card blocks.
- Added a preview font-size slider with numeric fallback for UI-only preview scaling.
- Simplified glyph health to `Valid`, `Missing`, and `Issues` summary cards.
- Expanded the glyph grid to show the full supported character set in seven columns.
- Tuned native select and numeric control padding so compact 28px fields do not clip their content.
- Widened slider numeric fields so signed spacing values remain readable alongside native steppers.
- Updated the glyph detail overlay from the refined Figma frame: compact header, specimen preview with guides, status/unicode cards, advance slider, and concise glyph message.
- Refined the glyph overlay specimen so metric guides represent cap height, x-height, baseline, and descender lines while ghost glyph spacing follows the advance width override.
- Made the main SVG preview refresh live when spacing sliders or per-glyph advance overrides change, and added a regression for override-based preview glyph positioning.
- Split the V6 plugin body into Figma-matched `Glyphs`, `Preview`, and `Settings` tabs.
- Added the Figma empty state when no Typegen board is selected, with create board and recipe actions.
- Moved starter glyph generation and starter style selection into the Settings tab.
- Added persisted UI-only font version and author fields for the Settings tab.
- Clearing the Figma selection now returns the plugin to the empty state instead of falling back to the previous active board.
- Made the shared top section sticky and fixed-height across empty, Glyphs, Preview, and Settings states.
- Expanded the empty state body to fill the remaining plugin height and center its helper content vertically.
- Corrected the empty-state header to hug the font name row while the helper body fills the remaining plugin height.
- Matched the disabled primary button text color to the Figma disabled primary treatment.
- Top-aligned tab content panels so Preview and Settings controls keep natural spacing instead of stretching to fill the plugin window.
- Restored natural shell flow so stacked Settings sections sit together and unused space remains at the bottom of the plugin window.
- Restored vertical centering for the empty-state helper content while keeping other tab panels top-aligned.
- Centered glyph overlay artwork by matching the specimen positioning box to the rendered SVG width while keeping ghost glyph spacing driven only by the advance override.
- Switched the glyph editor specimen to the same preview layout engine used by the Preview tab so per-glyph advance spacing matches between both views.
- Updated glyph board create/update to re-sync Typegen-owned slot guides so every glyph slot shows ascender, x-height, baseline, and descender guide lines consistently.
- Updated board slot frame sizing, starter glyph placement, and board-based extraction to use the same unified visual guide profile so the new guides stay inside every glyph frame and remain WYSIWYG.
- Updated Inter starter glyph fitting to use a shared cap-height reference per starter font style, preventing rounded glyphs like `O` and `Q` from being scaled smaller than neighboring caps like `P`.
- Corrected starter `Q` fitting so its tail can extend below the cap box, and changed slot extraction to use uniform scaling so preview/export preserves glyph proportions instead of widening outlines.
- Widened the unified glyph slot/guide proportions and changed Inter starter placement to render text at a consistent size before flattening, so wide caps like `M`/`W`, `Q` tails, and lowercase glyphs keep more natural Inter proportions.
- Updated glyph grid thumbnails to render against each glyph's advance width and full font ascender/descender box, so narrow, wide, and descender glyphs stay centered and unclipped.
- Changed slot-based glyph extraction to preserve frame-relative X positions and derive advance width from the slot guide box, so the center of the Figma glyph frame maps to the center of the converted glyph.
- Refined slot extraction metrics so frame-center alignment is preserved while the exported advance width is derived from glyph ink width plus padding, reducing oversized side bearings for narrow glyphs in preview text.
- Hid the post-generation debug/verification panel behind a UI flag while keeping the implementation available for later QA.
- Updated the glyph edit overlay specimen guides to use the same unified guide profile geometry as glyph board slots instead of decorative percentage-based lines.

Out of scope:

- New font generation behavior.
- New glyph coverage.
- Kerning, variable fonts, AI generation, or broader export formats.
- A full visual design system.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run build` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Select Regular and Bold boards in Figma and confirm the plugin auto-updates active board, starter style, glyph grid status, preview data, and contextual glyph overlay without a manual scan button.

## 52. V5.0 Export Package Polish

Goal: make exported fonts easier to use outside Figma without expanding beyond one static OTF format.

Completed:

- Added package HTML `@font-face` generation from verified font results.
- Updated the plugin UI label to `Typegen V5.0 alpha`.
- Collapsed output to one `Generate font` button.
- Added a plugin-side `SCAN_ALL_GLYPH_BOARDS` flow so `Generate font` scans every Typegen board on the page.
- Updated `Generate font` to immediately package all valid verified board weights into a ZIP.
- Added ZIP contents: `fonts/*-Regular.otf`, `fonts/*-Bold.otf` when available, and `index.html`.
- Added inline `@font-face` CSS in the ZIP HTML, with one specimen row per generated weight.
- Fixed exported OpenType contour winding so same-direction Figma/Inter compound contours are rewritten with opposite counter directions.
- Made `.notdef` empty so missing glyph fallback does not draw Typegen box/cross fragments in the ZIP HTML.
- Kept newly generated starter vectors Inter-based, then boolean-merged and flattened each glyph to avoid even-odd overlap holes in Figma/exported fonts.
- Re-running starter generation now replaces Typegen-owned starter outlines while preserving user artwork.
- Tightened contour containment detection so overlapping construction contours, such as an `f` stem and crossbar, do not export as counters.
- Updated regression coverage for CSS filename/snippet generation, weighted filenames, package HTML, ZIP creation, and HTML font loading CSS.
- Updated regression coverage for same-direction counter contour export.
- Updated regression coverage for empty `.notdef` export.
- Updated regression coverage for overlapping construction contours.
- Updated README, release notes, roadmap, QA docs, smoke-test docs, package metadata, and rebuilt `dist/`.

Out of scope:

- WOFF and WOFF2 export.
- Separate OTF/CSS/HTML export buttons.
- Automatically creating missing board weights.
- Production specimen pages.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run build` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Generate Regular and Bold starter boards, click `Generate font`, confirm the ZIP contains OTF files for both weights plus `index.html`, and confirm the HTML shows one row per weight in a browser.

## 51. V4.3 Board / Weight Clarity

Goal: make multi-board Regular/Bold workflows visible and less confusing.

Completed:

- Added active board metadata to board creation, starter generation, and scan responses.
- Added an active board indicator in the UI showing board name and Inter weight.
- Synced the starter style selector to the active board weight after board, generate, or scan actions.
- Updated scan notifications to mention the active board when available.
- Updated README, release notes, roadmap, QA docs, package metadata, and rebuilt `dist/`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Create Regular and Bold boards, select each board or one of its slots, run generate and scan, and confirm the active board indicator and starter style selector follow the selected board.

## 50. V4.2 Starter Style Controls

Goal: add a small starter-generation control without changing the scan, preview, or export pipeline.

Completed:

- Added a starter style selector for Inter Regular and Inter Bold.
- Passed the selected starter style from the UI to board creation and starter generation.
- Made glyph board lookup style-aware so Regular and Bold use separate boards.
- Made board actions context-aware: selected boards and selected slots determine the active board/weight before the UI style fallback is used.
- Added active-board scan fallback after board creation or starter generation.
- Updated Inter starter generation to load and flatten the selected Inter style.
- Added fallback from Inter Bold to Inter Regular if Bold cannot load.
- Preserved the existing geometric fallback for cases where Inter cannot load or flatten a specific glyph.
- Kept starter generation artwork-safe: only empty supported slots are filled.
- Updated README, release notes, roadmap, QA docs, package metadata, and rebuilt `dist/`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Generate a fresh board with Inter Regular, switch to Inter Bold, click `Create/update glyph board`, and confirm a separate Bold board is created. Select the Bold board or one of its slots, generate Bold starters, scan and preview it, and confirm the actions stay scoped to the Bold board.

## 49. V4.1 Preview Presets

Goal: make generated full-font starter sets easier to inspect without adding a new preview engine.

Completed:

- Added preview preset buttons for mixed text, headline text, lowercase word lists, paragraph-style samples, and numbers/symbols.
- Presets update the editable preview text input instead of creating separate preview modes.
- Presets reuse existing missing-glyph warnings, unsupported-character warnings, diagnostics, font generation, and smoke-test HTML behavior.
- Updated package metadata to `4.1.0-alpha.1`.
- Updated release notes, roadmap, QA docs, and rebuilt `dist/`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Generate Inter starters, scan the board, click each preview preset, confirm the preview updates, then type custom text and confirm focus/scroll stability still holds.

## 48. V4.0 Starter Glyph Generation

Goal: let users create a full editable Inter-based starting alphabet/symbol set inside Figma, then refine it using the existing Typegen scan, preview, spacing, and export workflow.

Completed:

- Added `Generate starter glyphs` to the plugin UI.
- Added a plugin controller action that creates/updates the board, then fills empty supported slots.
- Added Inter-based starter generation by creating Inter Regular text, flattening it into vectors, and fitting it into glyph slots.
- Kept simple geometric filled-vector recipes as a fallback if Inter cannot load or an individual glyph cannot flatten.
- Kept starter generation artwork-safe: slots with existing non-helper artwork are skipped.
- Reused existing guide profiles so lowercase starter glyphs respect ascender, x-height, baseline, and descender zones.
- Kept preview/export unchanged; generated starters are regular Figma vectors that scan like user-drawn glyphs.
- Updated README, release notes, roadmap, and QA docs for V4.0 alpha.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run build` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- In Figma, click `Generate starter glyphs` from a blank file, scan the board, preview `ABC box @2+2`, export OTF and smoke-test HTML, then re-run starter generation and confirm no duplicate artwork is added.

Suggested next step:

- Manually QA starter generation in Figma before deciding whether to polish starter shapes or return to preview/specimen presets.

## 47. V3 Alpha Closeout Planning

Goal: close the V3 alpha character-set expansion cleanly before starting a new feature track.

Completed:

- Ran final automated verification.
- Confirmed README, release notes, QA docs, roadmap, and `TASKS.md` match V3.2/V3.3 behavior.
- Rebuilt `dist/` from current source.
- Prepared the V3 alpha closeout for commit/PR handoff.
- Deferred new feature work until the V3 alpha closeout is committed.

Verification completed:

- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Out of scope:

- More glyph scope.
- Kerning.
- Ligatures.
- Variable fonts.
- Side-bearing editing.
- AI generation.

Suggested next step:

- Commit, push, and open the V3 alpha closeout PR.

## 46. V3.3 Metrics And Preview Polish Planning

Goal: improve usability of the expanded V3 character set before adding more glyph scope.

Completed:

- Review default advances for lowercase and common symbols in preview and exported OTF.
- Confirm common symbols do not feel too wide or too tight in realistic strings.
- Manual QA passed for lowercase plus symbols.
- No V3.3 code changes were needed.

QA strings reviewed:

- `quick fox @ 10/10`
- `type + glyph = font`
- `(boxing glyph)`
- `"quick" & 'font'`
- `A-Z / a-z`

Out of scope:

- More character sets.
- Kerning.
- Ligatures.
- Side-bearing editing.
- Variable fonts.
- AI generation.

Suggested next step:

- Move to V3 alpha closeout.

## 45. V3.2 Common Symbols Implementation

Goal: add the next narrow common-symbol slice after V3.1 lowercase signoff.

Completed:

- Updated package metadata to `3.2.0-alpha.1`.
- Added common-symbol glyph definitions for `'`, `"`, `/`, `(`, `)`, `&`, `+`, `=`, and `@`.
- Added safe symbol slot names: `glyph-apostrophe`, `glyph-quote`, `glyph-slash`, `glyph-paren-left`, `glyph-paren-right`, `glyph-ampersand`, `glyph-plus`, `glyph-equals`, and `glyph-at`.
- Added raw scan aliases for the common symbols where simple and unambiguous.
- Added default advance widths for narrow and wide common symbols.
- Updated UI copy, default preview text, and smoke-test fallback text for V3.2.
- Added regression coverage for symbol name parsing, preview layout, generated-font verification, and OTF roundtrip parsing.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.
- Manual QA passed for `a/b @2+2`, `A+B=C`, `font@example`, and `(quick)` in Figma and smoke-test HTML.

Suggested next step:

- Move to V3.3 metrics and preview polish planning before adding more glyph scope.

## 44. V3.2 Common Symbols Planning

Goal: choose the next narrow character-set expansion after V3.1 lowercase signoff.

Completed:

- Chose the V3.2 symbol subset: apostrophe, quote, slash, parentheses, ampersand, plus, equals, and at sign.
- Kept one static OTF export.
- Reused the existing uppercase-style guide profile.
- Preserved sorted board behavior and artwork-safe board updates.
- Kept kerning, ligatures, variable fonts, side-bearing editing, AI generation, and broad Unicode coverage out of scope.

Out of scope for V3.2:

- Kerning.
- Ligatures.
- Variable fonts.
- Side-bearing editor.
- AI generation.
- Broad Unicode coverage.

Suggested next step:

- Implement the V3.2 common-symbol subset.

## 43. V3.1 Full Lowercase Signoff

Goal: validate and close V3.1 full lowercase alpha before starting another scope expansion.

Completed:

- Manual QA fresh V3.1 board creation with sorted A-Z, a-z, 0-9, punctuation slots.
- Manual QA update of an existing V3.0 pilot board; confirm `a`, `b`, `g`, `o`, and `x` artwork moves with the correct slots.
- Manual QA update of a V2 board; confirm existing uppercase, numeric, and punctuation artwork is preserved.
- Smoke test lowercase words: `type`, `glyph`, `font`, `quick`, `boxing glyph`, `box`, `go`, `bag`, `go ox`, and `ABC box 012`.
- Smoke test V2 regression strings: `ABC, 012.!`, `A-B: 10?`, `ABOPR PRO BAR`, and `2024 A10`.
- Confirm descender, ascender, and x-height proportions against the lowercase guides.
- No release-blocking V3.1 defects reported during manual QA.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Close out V3.1 and plan the next narrow scope expansion.

## 42. V3.1 Full Lowercase Expansion Planning

Goal: expand from the verified V3 alpha lowercase pilot to full lowercase `a-z` without disrupting existing boards.

Completed:

- Confirmed manual Figma QA passed for the V3 alpha lowercase pilot strings.
- Added the V3.1 expansion plan to `docs/V3_ROADMAP.md`.
- Identified the key board migration risk: inserting alphabetical lowercase slots can overlap existing V3 alpha pilot artwork.
- Updated package metadata to `3.1.0-alpha.1`.
- Added lowercase definitions for every missing `glyph-c` through `glyph-z` slot.
- Reused the lowercase guide profile for every lowercase glyph.
- Kept uppercase, numeric, punctuation, spacing, preview, export, and persistence behavior unchanged.
- Added full lowercase regression coverage for naming and preview strings: `type`, `glyph`, `font`, `quick`, and `boxing glyph`.
- Updated UI/docs from "lowercase pilot" language to full lowercase `a-z` language.
- Reordered the canonical board sequence to A-Z, a-z, 0-9, punctuation.
- Updated board creation so existing supported slots are repositioned into canonical order while preserving their artwork.

Suggested next step:

- Manually QA a fresh V3.1 board and an existing V3.0 pilot board after clicking `Create/update glyph board`; confirm slots are sorted and old artwork moved with its slot.

## 41. V3.0 Alpha Lowercase Pilot Foundations

Goal: implement the first narrow V3 slice by supporting lowercase guide geometry for `a`, `b`, `g`, `o`, and `x` only.

Completed:

- Updated package metadata to `3.0.0-alpha.1`.
- Updated plugin UI label to `Typegen V3.0 alpha`.
- Added shared uppercase and lowercase slot guide profiles.
- Added lowercase pilot glyph definitions for `glyph-a`, `glyph-b`, `glyph-g`, `glyph-o`, and `glyph-x`.
- Updated board generation to append mixed-height lowercase pilot slots without clearing existing board artwork.
- Added lowercase ascender, x-height, baseline, descender, and side-boundary guides.
- Updated slot-relative extraction to choose the correct guide profile per glyph.
- Added regression coverage for lowercase name parsing, preview support, x-height normalization, descender normalization, and OTF roundtrip export.
- Added automated coverage for the V3 manual QA preview targets: `box`, `go`, `bag`, `go ox`, and `ABC box 012`.
- Updated V3 alpha UI copy so recipe, preview warnings, and export diagnostics mention the lowercase pilot instead of saying all lowercase is unsupported.
- Updated default preview and smoke-test fallback text to `ABC box 012`.
- Manual Figma QA passed for the lowercase pilot strings: `box`, `go`, `bag`, `go ox`, and `ABC box 012`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run build` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Plan the full lowercase `a-z` expansion as the next V3 slice, using the verified lowercase guide profile.

## 40. V3.0 Lowercase Geometry Planning

Goal: define lowercase guide geometry before implementation.

Completed:

- Added `docs/V3_LOWERCASE_GEOMETRY.md`.
- Defined the V3.0 lowercase pilot set: `a`, `b`, `g`, `o`, and `x`.
- Defined recommended lowercase slot dimensions: `160 x 240`.
- Defined lowercase guide positions: ascender `40`, x-height `77`, baseline `170`, descender `207`, side boundaries `24` and `136`.
- Defined font-unit mapping: ascender `700`, x-height `500`, baseline `0`, descender `-200`.
- Proposed a `SlotGuideProfile` abstraction for uppercase and lowercase normalization.
- Defined V3.0 implementation order and regression fixture targets.
- Linked the geometry spec from README and roadmap docs.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Suggested next step:

- Implement V3.0 pilot board slots and guide-profile constants without enabling full lowercase yet.

## 39. V3 Roadmap Kickoff

Goal: start the 3.x roadmap after closing the V2 punctuation/static-font milestone.

Completed:

- Added `docs/V3_ROADMAP.md`.
- Defined V3 as the lowercase/static-font expansion track.
- Proposed a lowercase pilot subset: `a`, `b`, `g`, `o`, and `x`.
- Captured the required lowercase guide model: x-height, ascender, descender, baseline, and side boundaries.
- Listed V3.0 exit criteria and implementation risks.
- Linked the V3 roadmap from `README.md` and `docs/ROADMAP.md`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Suggested next step:

- Commit and push the V2.10.1 closeout plus V3 roadmap, then begin V3.0 lowercase guide geometry planning.

## 38. V2.x Closeout / V3 Boundary

Goal: finish the 2.x roadmap cleanly before starting the 3.x lowercase track.

Completed:

- Added `docs/ROADMAP.md`.
- Defined V2.x as the hardening track for A-Z, 0-9, six punctuation marks, preview, spacing, verified OTF export, smoke-test HTML, persistence, and regression checks.
- Defined V2.x closeout criteria.
- Defined V3.x as the start of a fuller static font workflow, beginning with lowercase planning.
- Documented why lowercase belongs in V3: x-height, ascenders, descenders, board guide changes, and new QA expectations.
- Linked the roadmap from `README.md`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Manual QA target:

- Complete the V2 closeout QA strings: `ABC, 012.!`, `A-B: 10?`, `ABOPR PRO BAR`, and `2024 A10`.

Suggested next step:

- Run final manual V2 QA. If it passes, start V3.0 planning for lowercase guide geometry and board layout.

## 37. V2.10.1 Punctuation Side-Bearing Fix

Goal: make punctuation spacing work on both sides of the glyph, not just after the glyph.

Completed:

- Updated package metadata to `2.10.1`.
- Updated plugin UI label to `Typegen V2.10.1`.
- Added punctuation outline fitting after slot-relative extraction.
- Narrow punctuation is centered inside its advance width for balanced side bearings.
- Added regression coverage for a period fitting inside its narrow advance.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Preview `012.,` and `A-B: 10?`; period/comma should sit inside their spacing instead of colliding with the following glyph.

## 36. V2.10 Punctuation Metrics Polish

Goal: make supported punctuation usable without requiring per-glyph advance overrides for every mark.

Completed:

- Updated package metadata to `2.10.0`.
- Updated plugin UI label to `Typegen V2.10`.
- Added punctuation-specific default advance widths.
- Period and comma now default to narrow advances.
- Punctuation defaults apply to preview and exported OTF output.
- Added regression coverage for punctuation advance defaults, preview spacing, and generated font roundtrip parsing.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Manual QA target:

- Scan punctuation glyphs and compare `ABC, 012.!` plus `A-B: 10?` in plugin preview and smoke-test HTML.

Suggested next step:

- If punctuation spacing feels good manually, move to a V2.10 release tidy pass or decide whether lowercase planning belongs in V2.11.

## 35. V2.9.3 Slot-Relative Punctuation Sizing

Goal: preserve the designed size and baseline position of small punctuation marks during preview and export.

Completed:

- Updated package metadata to `2.9.3`.
- Updated plugin UI label to `Typegen V2.9.3`.
- Changed glyph-slot extraction to normalize artwork relative to the slot guides instead of each glyph's own bounds.
- Kept fallback own-bounds normalization for raw vector nodes named as glyphs.
- Added regression coverage proving a small period near the baseline stays small after normalization.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Manual QA with `glyph-period` and `glyph-comma`; scan, preview `ABC 012.,`, and confirm punctuation keeps its board-designed size.

## 34. V2.9.2 Punctuation Scan Compatibility

Goal: make punctuation scanning robust for both generated safe slot names and hand-named raw punctuation slots.

Completed:

- Updated package metadata to `2.9.2`.
- Updated plugin UI label to `Typegen V2.9.2`.
- Added scanner aliases for `glyph-.`, `glyph-,`, `glyph-!`, `glyph-?`, `glyph--`, and `glyph-:`.
- Board update now treats punctuation aliases as existing slots so it does not duplicate hand-named punctuation glyphs.
- Updated regression checks and docs for punctuation aliases.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Manual QA by scanning both generated safe punctuation slots, such as `glyph-exclamation`, and hand-named aliases, such as `glyph-!`.

## 33. V2.9 Board Update Safety

Goal: prevent accidental workflow disruption when users already have glyph artwork on an existing board.

Completed:

- Changed the board action from create-only to create/update behavior.
- Updated package metadata to `2.9.1`.
- Updated plugin UI label to `Typegen V2.9.1`.
- Existing `Font Glyph Board` frames are reused when selected or found on the current page.
- Existing glyph slots and their artwork are preserved.
- Missing V2.9 slots are appended without clearing existing content.
- Updated the UI button copy to `Create/update glyph board`.
- Updated QA/docs with board update safety checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Manual QA on a V2.8/V2.9 board with existing glyph artwork, then click `Create/update glyph board` and confirm old glyph contents remain in place while missing punctuation slots are added.

## 32. V2.9 Basic Punctuation Support

Goal: add the smallest useful punctuation set without changing the static OTF pipeline or opening broad symbol support.

Completed:

- Updated package metadata to `2.9.0`.
- Updated plugin UI label to `Typegen V2.9`.
- Added support for `.`, `,`, `!`, `?`, `-`, and `:`.
- Added safe punctuation slot names: `glyph-period`, `glyph-comma`, `glyph-exclamation`, `glyph-question`, `glyph-hyphen`, and `glyph-colon`.
- Starter glyph board now creates 42 slots: A-Z, 0-9, and the six punctuation glyphs.
- Scan, preview, spacing overrides, generated-font verification, OTF export, and smoke-test HTML now support the punctuation set.
- Regression checks cover punctuation glyph naming, preview, font generation, verification metadata, and OTF roundtrip parsing.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Manual QA `glyph-period`, `glyph-comma`, `glyph-exclamation`, `glyph-question`, `glyph-hyphen`, and `glyph-colon` with preview text like `ABC, 123! OK?` and `A-B: 10`.

## 31. V2.8 Metrics Sanity Warnings

Goal: make extreme spacing and advance settings visible before export without blocking the verified export pipeline.

Completed:

- Updated package metadata to `2.8.0`.
- Updated plugin UI label to `Typegen V2.8`.
- Added shared metrics sanity warnings for very tight/loose letter spacing, very narrow/wide space width, and very narrow/wide glyph export advances.
- Added metrics warnings to the `Ready to export` diagnostics panel.
- Kept metrics warnings non-blocking; generated-font verification remains the export gate.
- Added regression checks for tight and loose metrics warning thresholds.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.
- `npm.cmd run check` passed with unsandboxed execution because Vite/esbuild hit `spawn EPERM` in the sandbox.

Suggested next step:

- Manual QA with extreme spacing and advance overrides, then decide whether V2.9 should add a compact metrics legend/help note or move to basic punctuation planning.

## 30. V2.7 Numeric Workflow Polish

Goal: make numeric support more visible in the default workflow and lock in the input focus/scroll regression checks.

Completed:

- Updated package metadata to `2.7.0`.
- Updated plugin UI label to `Typegen V2.7`.
- Updated default preview text from `ABC CAB` to `ABC 123`.
- Updated smoke-test fallback text to `ABC 123 2024`.
- Updated QA flow and smoke-test copy to exercise mixed letter/number text.
- Added QA checks for focus/scroll stability while typing in preview, spacing, and advance override inputs.

Verification pending:

- `npm.cmd run check`

Suggested next step:

- Manual QA the default mixed preview and smoke-test export with A, B, C, 1, 2, and 3.

## 29. V2.6 Input Focus / Scroll Stability

Goal: fix the annoying UI behavior where live input changes caused focus loss and reset the panel scroll to the top.

Completed:

- Updated package metadata to `2.6.0`.
- Updated plugin UI label to `Typegen V2.6`.
- Added render interaction capture for focused input id, selection/caret range, document scroll, and app scroll.
- Restored focus, caret/selection, and scroll after UI re-render and event rebinding.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Manual QA target:

- Type continuously in preview text, letter spacing, space width, and advance override inputs while scrolled down in the plugin panel; focus and scroll should remain stable.

## 28. V2.5 Numeric Glyph Support

Goal: add the first narrow scope expansion by supporting numeric glyphs `0-9` while keeping the same constrained glyph recipe and static OTF pipeline.

Completed:

- Updated package metadata to `2.5.0`.
- Updated plugin UI label to `Typegen V2.5`.
- Expanded shared supported glyphs from A-Z to A-Z plus 0-9.
- Added scan/name support for `glyph-0` through `glyph-9`.
- Starter glyph board now creates 36 slots: A-Z and 0-9.
- Preview, spacing overrides, generated-font verification, OTF export, and smoke-test HTML now support numeric glyphs.
- Regression checks now cover numeric glyph parsing, preview, font generation, verification metadata, and OTF roundtrip parsing.
- Updated README, release notes, QA docs, and smoke-test docs for numeric glyph support.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Known V2.5 limitations:

- Lowercase and punctuation remain unsupported.
- Numeric glyphs use the same global spacing and per-glyph advance override model as uppercase glyphs.
- Existing saved settings with selected A-Z glyphs continue to work; saved selected glyphs outside A-Z/0-9 are sanitized.

Suggested next step:

- Run a manual Figma QA pass with `glyph-0`, `glyph-1`, `glyph-2`, and a mixed preview such as `2024 A10`.

## 27. V2.4 Verified Export Gate

Goal: prevent users from exporting a generated font if the generated OTF does not parse back with matching glyph metadata.

Completed:

- Updated package metadata to `2.4.0`.
- Updated plugin UI label to `Typegen V2.4`.
- Export OTF and smoke-test HTML buttons now require generated-font verification to pass.
- Export click handlers also guard against unverified generated fonts.
- Ready-to-export diagnostics now reports verified export enabled vs verification-blocked state.
- Regression checks assert verification metadata for single-glyph and counter-style generated fonts.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Known V2.4 limitations:

- Verification failures are expected to be rare; there is no manually triggered failure fixture yet.
- Verified export confirms font data integrity, not visual browser rendering.

Suggested next step:

- Decide whether to begin the first small scope expansion with numeric glyph slots `0-9`, or add one more reliability pass with a deliberately invalid verification fixture.

## 26. V2.3 Generated-Font Verification Panel

Goal: expose the V2.2 font roundtrip confidence directly in the plugin UI after generation.

Completed:

- Updated package metadata to `2.3.0`.
- Updated plugin UI label to `Typegen V2.3`.
- Added parsed-font verification metadata to `FontBuildResult`.
- Font generation now parses the generated OTF and verifies exported glyph unicode, advance width, and outline command presence.
- Added generated-font verification display in the UI with parsed glyph count, verified glyph count, and sample glyph metrics.
- Expanded local `opentype.js` type declarations for parse/roundtrip metadata.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Known V2.3 limitations:

- Verification confirms generated font data, not browser rasterization.
- Visual counter behavior still needs smoke-test HTML and manual inspection.

Suggested next step:

- Start the first small scope expansion discussion: whether V2.4 should add numeric glyph slots `0-9` or stay in reliability mode for one more pass.

## 25. V2.2 Export Roundtrip Reliability

Goal: verify generated OTF buffers contain the expected glyph data after parsing, not just that font generation returns a non-empty file.

Completed:

- Updated package metadata to `2.2.0`.
- Updated plugin UI label to `Typegen V2.2`.
- Added `opentype.parse` roundtrip checks to the V2 regression script.
- Roundtrip checks now verify glyph unicode, advance width, and outline command presence for `A`, synthetic counter `O`, and synthetic counter `P`.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Known V2.2 limitations:

- Roundtrip checks validate font table/glyph data, not visual browser rasterization.
- Real Figma extraction and counter rendering still require manual Figma QA.

Suggested next step:

- Consider adding a small optional generated-font metadata panel after generation, showing parsed glyph count and verified sample glyphs, if designers need more confidence before export.

## 24. V2.1 Counter / Path Reliability

Goal: make counter-style uppercase glyphs easier to test and less surprising without expanding beyond A-Z static OTF export.

Completed:

- Added synthetic counter-style `O` and `P` glyphs to the V2 regression checks.
- Updated package metadata to `2.1.0`.
- Updated plugin UI label to `Typegen V2.1`.
- Confirmed synthetic counter glyphs generate a non-empty OTF buffer.
- Added inspector warnings for multi-contour glyphs, including mixed winding-rule warnings.
- Added ready-to-export diagnostics warnings for multi-contour and mixed-winding glyphs.
- Updated release notes and QA docs with V2.1 counter/path guidance.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run test:regression` passed.

Known V2.1 limitations:

- Synthetic counter checks verify generation and HTML embedding, not visual counter rendering.
- Real Figma counter behavior still requires manual preview/export/smoke-test QA.
- Boolean live layers remain unsupported; users should flatten or convert counter glyphs to vector outlines before scanning.

Suggested next step:

- Run manual Figma QA using `O`, `P`, `B`, and `R` built from flattened vector counters, then document any construction method that causes filled counters.

## 23. V2.0 Reliability Baseline

Goal: keep V1 scope intact while making the project easier to verify, maintain, and safely extend.

Completed:

- Updated package metadata to `2.0.0`.
- Updated plugin UI label to `Typegen V2.0`.
- Added `npm run test:regression`.
- Added regression coverage for supported glyph name parsing, uppercase-only scope, spacing normalization, per-glyph advance overrides, preview missing/unsupported character reporting, safe download filenames, smoke-test HTML generation, and synthetic OTF generation.
- Updated `npm run check` so it runs typecheck, regression checks, and build.
- Made smoke-test HTML generation usable in Node-based regression checks by switching from `window.btoa` to `globalThis.btoa`.
- Added a `Ready to export` diagnostics panel that summarizes valid glyph count, empty/missing/unsupported glyphs, preview gaps, active overrides, generated font state, and saved scan state.
- Updated README, release notes, QA docs, and smoke-test docs for the V2 reliability baseline.

Verification completed:

- `npm.cmd run test:regression` passed.

Known V2.0 limitations:

- Figma runtime behavior still requires manual QA through the development plugin manifest.
- Regression checks do not replace real Figma extraction tests.
- Build may require unsandboxed execution in this Codex environment because Vite/esbuild spawning can hit `EPERM` under sandboxing.

Suggested next step:

- Run a manual Figma QA pass with real `A`, `O`, `B`, `P`, and `R` glyphs to verify counter behavior in preview, OTF export, and smoke-test HTML.

## 1. Product Goal

Typegen should prove one narrow workflow: a designer can draw uppercase glyphs in Figma, scan those glyphs with a plugin, preview available characters, and export one usable static font file.

The MVP is a workflow accelerator, not a full font editor.

## 2. Smallest Viable MVP Scope

Must ship:

- Figma plugin skeleton with manifest, controller, UI, and typed message passing.
- Minimal UI with font name, instructions, create board, scan glyphs, glyph status list, preview input, preview area, generate font, and export.
- Starter A-Z glyph board generation.
- Selection scan for `glyph-A` through `glyph-Z`.
- Validation for supported/unsupported glyph structures.
- Extraction of simple filled vector paths from glyph frames/components/groups.
- Normalized glyph model shared by preview and font generation.
- SVG path preview for available glyphs.
- One static font export, initially OTF/TTF via `opentype.js`.
- Manual QA/demo flow.

Explicitly out of scope:

- AI glyph generation.
- Variable fonts.
- Lowercase, numbers, punctuation beyond preview spaces.
- Kerning, hinting, OpenType features, multiple weights, cloud/account workflows.

## 3. Product Assumptions

- The target user is comfortable drawing vector shapes in Figma but does not want font-engine complexity.
- Users can follow a constrained glyph structure for MVP.
- A partial uppercase font is acceptable for proving the loop, as long as missing glyphs are visible.
- The plugin should favor actionable validation over trying to repair unsupported artwork.
- First demo can use only a few glyphs, such as A, B, C, and O.

## 4. Technical Assumptions

- Use Figma plugin manifest v2.
- Use TypeScript for plugin, shared types, UI, and font code.
- Use a simple bundled UI, likely React + Vite or a similarly small build setup.
- Runtime must not depend on network access.
- Figma main thread owns canvas operations and extraction from nodes.
- UI iframe owns preview rendering, font generation, Blob creation, and download.
- `opentype.js` is the first font generation candidate.
- SVG path preview is simpler and more reliable than temporary `@font-face` preview for MVP.
- The normalized glyph model is the contract between Figma extraction, preview, and font generation.

## 5. Risks And Mitigations

- Risk: Figma vector geometry may not map cleanly into font contours.
  Mitigation: support only filled vector paths first; reject strokes, text, images, gradients, masks, and effects.

- Risk: Coordinate conversion can produce upside-down or poorly scaled glyphs.
  Mitigation: use fixed board metrics, baseline/cap-height guide assumptions, and test with simple known shapes first.

- Risk: Compound paths and counters may fail in exported fonts.
  Mitigation: include A/O/B-like manual tests early; document limitations if winding behavior is not reliable.

- Risk: Users select nested artwork instead of glyph slots.
  Mitigation: recursively scan selected board/slots but only accept valid `glyph-X` containers as glyph roots.

- Risk: Font export works technically but is unusable in browser/system preview.
  Mitigation: add an exported-font smoke test using a simple local HTML fixture.

- Risk: Board text labels require font loading in Figma.
  Mitigation: load a default font before labels; if unavailable, still create slots/guides and return a warning.

## 6. Recommended Architecture

```txt
manifest.json
package.json
vite.config.ts or build config

src/
  plugin/
    controller.ts
    glyphBoard.ts
    figmaNodes.ts
    extractPaths.ts
    normalizeGlyph.ts
  ui/
    App.tsx
    components/
      GlyphStatusTable.tsx
      PreviewPanel.tsx
    preview/
      renderGlyphPreview.ts
  font/
    buildFont.ts
    exportFont.ts
    glyphModel.ts
  shared/
    messages.ts
    types.ts
```

Message flow:

- UI -> plugin: `CREATE_GLYPH_BOARD`
- plugin -> UI: `GLYPH_BOARD_CREATED`
- UI -> plugin: `SCAN_SELECTED_GLYPHS`
- plugin -> UI: `GLYPHS_SCANNED`
- UI -> UI/font: `GENERATE_FONT`
- UI -> browser: `EXPORT_FONT`
- plugin/UI -> UI: `VALIDATION_ERROR`

Pipeline:

```txt
Figma nodes -> scan/validate -> extract paths -> normalize glyphs -> SVG preview
Figma nodes -> scan/validate -> extract paths -> normalize glyphs -> opentype.js -> font Blob -> download
```

## 7. Milestones

### M1 - Plugin Skeleton

Deliverable: plugin opens in Figma and UI can exchange messages with controller.

Tasks:

- Create package/build setup.
- Add manifest.
- Add controller entrypoint with `figma.showUI`.
- Add minimal UI shell.
- Add shared message types.
- Verify create/scan placeholder messages round-trip.

### M2 - Starter Glyph Board

Deliverable: clicking `Create glyph board` creates `Font Glyph Board` with A-Z slots.

Tasks:

- Implement deterministic board dimensions.
- Create 26 slot frames named `glyph-A` through `glyph-Z`.
- Add baseline, cap-height, and side boundary guides.
- Add slot labels.
- Select/zoom to generated board if practical.
- Return success/warning messages to UI.

### M3 - Glyph Scanning And Validation

Deliverable: UI displays found, missing, invalid, and unsupported glyph statuses.

Tasks:

- Parse strict `glyph-[A-Z]` names.
- Recursively scan selected board or selected glyph slots.
- Handle duplicates deterministically.
- Validate text/image/stroke/effect/unsupported layer cases.
- Return one row for each A-Z.
- Disable generation when no valid glyphs exist.

### M4 - Path Extraction And Normalization

Deliverable: simple filled vector glyphs convert into normalized internal glyph models.

Tasks:

- Extract vector path commands from supported vector nodes.
- Support nested groups with vector children.
- Ignore hidden layers with warnings.
- Reject unsupported fills/strokes/images/text/effects.
- Convert Figma coordinates to font coordinates.
- Normalize to `unitsPerEm: 1000`, baseline `0`, cap height around `700`.
- Preserve advance width from slot metrics or default width.

### M5 - Font Generation

Deliverable: plugin generates a static font buffer from valid glyph models.

Tasks:

- Add `opentype.js`.
- Convert normalized commands to `opentype.Path`.
- Create `.notdef` plus uppercase glyphs.
- Add font metadata from font name input.
- Export `ArrayBuffer`.
- Handle partial alphabets and generation errors.

### M6 - Preview

Deliverable: preview text renders available glyph outlines and missing placeholders.

Tasks:

- Build SVG preview renderer from normalized glyph model.
- Render spaces as fixed blank advance.
- Show missing glyph placeholders.
- Show missing character summary.
- Update preview live after scan and text edits.

### M7 - Export

Deliverable: user can download generated font locally.

Tasks:

- Create Blob from generated font buffer in UI.
- Sanitize filename from font family.
- Trigger download through temporary anchor.
- Keep export button disabled until generation succeeds.
- Show generated glyph count.

### M8 - QA And Demo Flow

Deliverable: documented end-to-end demo works reliably.

Tasks:

- Create manual QA checklist. Status: created in `docs/QA.md`.
- Create simple browser smoke-test fixture for exported font.
- Test empty, valid, and unsupported glyph cases.
- Test duplicate and invalid glyph names.
- Record known MVP limitations.

## 8. Prioritized Backlog

### P0 - Required For First End-To-End Loop

- Scaffold Figma plugin project.
- Implement controller/UI message contracts.
- Implement minimal UI workflow.
- Implement starter board generation.
- Implement strict A-Z glyph scan.
- Implement basic validation statuses.
- Implement simple vector extraction.
- Implement normalized glyph model.
- Implement SVG preview from normalized model.
- Implement `opentype.js` font generation.
- Implement Blob download export.
- Add manual demo and smoke test instructions.

### P1 - Important Quality And Reliability

- Duplicate glyph handling.
- Better unsupported-layer messages.
- Hidden/locked layer handling.
- Partial alphabet warning.
- File name sanitization.
- Basic tests for name parsing and glyph model conversion.
- Local exported-font HTML smoke fixture.

### P2 - Nice After MVP Loop Works

- Generated-font `@font-face` preview confidence check.
- Better board layout controls.
- More robust compound path support.
- Better side-bearing controls.
- Lowercase/numbers roadmap notes only, no implementation.

## 9. Agent / Workstream Plan

- Product/UX: owns user flow, UI states, validation copy, demo path, and scope guardrails.
- Figma Plugin Engineer: owns manifest, controller, Figma API calls, board generation, selection scan, validation, and message passing.
- Font Engine: owns glyph model, normalization, `opentype.js` integration, font metrics, and binary generation.
- Preview: owns SVG preview rendering, missing glyph UI, and live preview state.
- QA: owns checklist, demo workflow, edge cases, exported font smoke test, and acceptance signoff.

Coordination rule: all workstreams must treat the normalized glyph model and typed messages as shared contracts. Any change to those contracts updates `src/shared/*`, `src/font/glyphModel.ts`, and `TASKS.md`.

## 10. First Sprint Plan

Goal: reach a clickable plugin skeleton with board creation and scan scaffolding, without starting complex font generation yet.

Exact tasks:

- Choose build stack: TypeScript + Vite/React unless repo constraints suggest otherwise.
- Create `manifest.json`, `package.json`, build config, and `src` structure.
- Implement `src/shared/messages.ts` and `src/shared/types.ts`.
- Implement `src/plugin/controller.ts` with `CREATE_GLYPH_BOARD` and `SCAN_SELECTED_GLYPHS` handlers.
- Implement `src/plugin/glyphBoard.ts`.
- Implement `src/plugin/figmaNodes.ts` with strict naming parse and placeholder validation.
- Implement `src/ui/App.tsx` with font name input, instructions, create/scan buttons, status table placeholder, preview input placeholder, generate/export disabled states.
- Verify TypeScript build.
- Manually load plugin in Figma and confirm UI opens.
- Click `Create glyph board` and confirm board structure.
- Select board and click `Scan selected glyphs`; confirm A-Z statuses appear.

First sprint exit criteria:

- Plugin opens.
- Board generation works.
- Scan finds A-Z slot names.
- UI shows statuses.
- `TASKS.md` is updated with what moved from planned to done.

## 11. Questions Before Coding

- Should the first export target be `.otf` or `.ttf`? Recommendation: `.otf` through `opentype.js` unless testing shows `.ttf` is materially easier.
- Should `Generate font file` require at least one valid glyph or a minimum demo set like A/B/C? Recommendation: at least one valid glyph.
- Should empty generated slots count as `missing` or `found but empty`? Recommendation: selected/generated slots should appear as `empty`; unselected absent slots as `missing`.
- Should board guides be real Figma guide-like line nodes inside slots? Recommendation: simple line/rectangle nodes, since plugin-created ruler guides are not necessary for MVP.
- Are components/instances required in Sprint 1 scanning, or can Sprint 1 focus on frames/groups? Recommendation: parse components but implement full instance handling only if simple.

## 12. Plugin Engineer V0.1 Status

Completed plugin-side files:

- `src/plugin/controller.ts`
- `src/plugin/glyphBoard.ts`
- `src/plugin/figmaNodes.ts`
- `src/plugin/extractPaths.ts`
- `src/plugin/pluginTypes.ts`

Implemented:

- Controller message routing for `CREATE_GLYPH_BOARD` and `SCAN_SELECTED_GLYPHS`.
- Starter board generation for `Font Glyph Board`.
- A-Z slot creation with names `glyph-A` through `glyph-Z`.
- Slot helper guides for left/right boundaries, cap height, and baseline.
- Helper labels/guides marked with plugin data so scan/extraction ignores Typegen board furniture.
- Recursive selection scanning for selected boards or selected glyph slots.
- Strict glyph name parsing for uppercase `glyph-A` through `glyph-Z`.
- A-Z scan results with `valid`, `empty`, `unsupported`, and `missing` statuses.
- Duplicate glyph warning behavior.
- Simple extraction from filled `VectorNode.vectorPaths`.
- MVP validation failures for text, strokes, complex vector fills, images, shape layers, booleans, effects, and unsupported slices.
- Basic normalization into a serializable glyph model for preview/font workstreams.

Known dependencies / handoff:

- Needs project scaffold, manifest, bundler, and Figma plugin typings from the skeleton workstream.
- UI workstream should send `CREATE_GLYPH_BOARD` and `SCAN_SELECTED_GLYPHS`, then consume `GLYPH_BOARD_CREATED`, `GLYPHS_SCANNED`, and `VALIDATION_ERROR`.
- Preview/font workstreams can use the returned `glyph` payload on each valid scan row.
- No full compile was run yet because the repository does not currently include a TypeScript/build setup.

## 13. Integrated V0.1 Build Status

Completed integration files:

- `manifest.json`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/shared/messages.ts`
- `src/shared/types.ts`
- `src/ui/index.html`
- `src/ui/main.ts`
- `src/ui/styles.css`
- `dist/controller.js`
- `dist/index.html`

Implemented:

- Local build setup using TypeScript, esbuild, Vite, and a single-file UI bundle.
- Figma manifest pointing to the built controller and UI files.
- Minimal plugin UI with font name, constraints, create board, scan glyphs, glyph status list, preview input, preview area, generate button, and export button.
- UI message wiring for `CREATE_GLYPH_BOARD` and `SCAN_SELECTED_GLYPHS`.
- Shared glyph model contract used by plugin scan payloads, SVG preview, and font generation.
- SVG preview rendering from normalized glyph paths with missing/unsupported placeholders.
- OTF generation and Blob download through the plugin iframe UI.
- Manual QA checklist in `docs/QA.md`.

Verification completed:

- `npm.cmd install` completed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.1 limitations:

- Figma runtime behavior still needs manual verification by importing `manifest.json` into Figma.
- Extraction supports simple filled vector paths first; text, strokes, shape layers, booleans, effects, masks, images, and complex fills remain intentionally unsupported.
- Exported OTF needs browser/font-viewer smoke testing with real drawn glyphs.
- `npm audit` reports two moderate advisories in dependencies; no forced upgrade was applied during MVP integration.

## 14. V0.2 Reliability Sprint

Goal: keep the V0.1 scope intact while making the working pipeline reliable enough for repeatable demos and better real-glyph testing.

### V0.2 Priorities

- Re-run the full V0.1 loop after every implementation change.
- Harden validation copy and status behavior for empty, unsupported, duplicate, and malformed glyphs.
- Test counter/path winding behavior for `A`, `O`, `B`, `P`, and `R`.
- Confirm SVG preview and exported font output agree for counter glyphs.
- Add or document a simple exported-font HTML smoke-test workflow.
- Clarify the supported glyph recipe for users: uppercase A-Z, `glyph-X` names, filled vector outlines, expanded strokes, no text/images/effects.

### QA/Docs Status

Completed:

- Updated `docs/QA.md` from a V0.1 checklist into a V0.2 reliability checklist.
- Added a supported glyph recipe for designers.
- Added counter/path winding checks for `A`, `O`, `B`, `P`, and `R`.
- Added browser smoke-test expectations for `ABC CAB CODE` and `ABOPR PRO BAR`.
- Added a copyable local HTML smoke-test template using `@font-face`.
- Added V0.2 signoff criteria.
- Added `docs/SMOKE_TEST.md` for the generated smoke-test HTML export workflow.

### UI/Export Status

Completed:

- Added UI warnings when scanned glyphs are empty, missing, unsupported, or warning-status and therefore will not export.
- Added preview/export consistency messaging when preview text contains unsupported characters or uppercase glyphs outside the export set.
- Added generated-font warning display after font generation.
- Added `Export smoke test HTML`, which downloads a self-contained browser test page with the generated OTF embedded through `@font-face`.
- Updated smoke-test QA docs to prefer the generated HTML helper while keeping the manual template as a fallback.

### QA Handoff To Implementation Workstreams

- If counter glyphs fill unexpectedly in exported fonts, capture whether SVG preview also fails or only the generated font fails.
- If the browser smoke-test workflow becomes automated or generated by the app, update `docs/QA.md` with the exact export path.
- If compound paths remain unsupported, make the UI validation copy explicit before V0.2 signoff.
- If the export format changes from `.otf`, update the smoke-test HTML `format(...)` hint and filename examples.

### V0.2 Signoff Checklist

- [ ] Board creation still works from a clean Figma file.
- [ ] Scan/validation still reports all A-Z rows.
- [ ] Preview still renders valid glyphs and placeholders for missing glyphs.
- [ ] Font generation/export still succeeds with a partial alphabet.
- [ ] Browser smoke test passes with `ABC CAB CODE`.
- [ ] Browser smoke test passes with `ABOPR PRO BAR`.
- [ ] At least one counter glyph renders correctly in preview and exported font.
- [ ] Any counter/path winding limitation is documented with reproduction steps.
- [ ] Supported glyph recipe in `docs/QA.md` matches actual behavior.

## 15. V0.3 Spacing Sprint

Goal: make exported fonts more usable in real preview text by adding basic global spacing controls without adding kerning, per-glyph metrics editing, lowercase, numbers, or punctuation.

Completed:

- Updated package metadata to `0.3.0`.
- Added global `Letter spacing` control in the plugin UI.
- Added global `Space width` control in the plugin UI.
- Applied spacing controls to SVG preview layout.
- Applied spacing controls to generated OTF glyph advance widths.
- Added a real exported space glyph with the selected space width.
- Changing spacing after generation clears the generated font so stale exports are blocked.
- Smoke-test HTML now reflects the generated font spacing because the font embeds the selected metrics.
- Updated `docs/QA.md` and `docs/SMOKE_TEST.md` with V0.3 spacing checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.3 limitations:

- Spacing is global only.
- No per-glyph advance width editor.
- No kerning pairs.
- Existing glyph path side bearing remains based on normalization; V0.3 adjusts advance width, not outline position.

Suggested next step:

- V0.4 should add a focused glyph detail panel for inspecting one selected glyph's metrics and warnings, then consider per-glyph advance width overrides only if the global spacing controls are not enough for demos.

## 16. V0.4 Glyph Inspector Sprint

Goal: make glyph debugging easier by adding a focused read-only inspector for one glyph at a time, without expanding into per-glyph editing or kerning yet.

Completed:

- Updated package metadata to `0.4.0`.
- Added selectable glyph rows in the status table.
- Added a read-only glyph inspector panel.
- Inspector shows status, Unicode, Figma node id, path count, command count, winding rules, base advance, export advance, normalized bounds, status message, and glyph warnings.
- Inspector export advance reflects the current global letter spacing setting.
- Missing and empty glyphs show safe fallback values instead of failing.
- Updated `docs/QA.md` with glyph inspector checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.4 limitations:

- Inspector is read-only.
- No per-glyph advance width overrides yet.
- No kerning pairs.
- No direct sync from a selected Figma canvas node into the inspector beyond scan results.

Suggested next step:

- V0.5 can add per-glyph advance width overrides for valid glyphs, using the inspector as the editing surface, if spacing demos show global spacing is not enough.

## 17. V0.5 Per-Glyph Advance Width Sprint

Goal: let users tune individual glyph spacing from the inspector while keeping the MVP away from kerning, side bearings, or broader character sets.

Completed:

- Updated package metadata to `0.5.0`.
- Added per-glyph advance width overrides for valid uppercase glyphs.
- Added `Advance width override` input to the glyph inspector.
- Added `Reset to auto` for the selected glyph.
- Preview uses the override immediately.
- Font generation uses overrides when exporting OTF.
- Export advance is calculated as `(override or automatic advance) + global letter spacing`.
- Changing an override clears stale generated font state so users regenerate before exporting.
- Export summary reports how many overrides are active.
- Updated `docs/QA.md` and `docs/SMOKE_TEST.md` with V0.5 checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.5 limitations:

- Overrides are in-memory only for the current plugin session.
- No per-glyph left/right side bearing editing.
- No kerning pairs.
- No persistence to Figma plugin data yet.

Suggested next step:

- V0.6 should persist font settings and per-glyph overrides in the Figma document via plugin data, so a user can close/reopen the plugin without losing tuning work.

## 18. V0.6 Document Persistence Sprint

Goal: preserve user tuning work inside the Figma document so closing and reopening the plugin does not lose font settings.

Completed:

- Updated package metadata to `0.6.0`.
- Added typed `SAVE_SETTINGS` and `SETTINGS_LOADED` messages.
- Persisted settings to `figma.root` plugin data under `typegen-settings-v1`.
- Restores font name.
- Restores preview text.
- Restores selected glyph.
- Restores global letter spacing and space width.
- Restores per-glyph advance width overrides.
- Sanitizes persisted settings on load before applying them to UI state.
- Keeps generated font binaries out of persistence.
- Keeps scanned glyph results out of persistence; users still rescan current Figma artwork after reopening.
- Updated `docs/QA.md` and `docs/SMOKE_TEST.md` with persistence checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.6 limitations:

- Settings are document-level, not board-specific.
- Scan results are not persisted.
- Generated OTF buffers are not persisted.
- No explicit reset-all-settings button yet.

Suggested next step:

- V0.7 can add a small project settings section with `Reset saved settings` and possibly board-specific persistence if users work with multiple boards in one Figma file.

## 19. V0.7 Last Scan Restore Sprint

Goal: remove the annoying reopen step where users had to manually rescan the same glyph board before preview worked again.

Completed:

- Updated package metadata to `0.7.0`.
- Persisted last scanned glyph node IDs with the document settings.
- Added typed `RESTORE_SAVED_SCAN` UI-to-plugin message.
- On plugin startup, restored settings and requested a scan restore when saved node IDs exist.
- Controller resolves saved node IDs through `figma.getNodeByIdAsync`.
- If saved nodes still exist, the plugin rescans them and restores preview/export glyph models automatically.
- If saved nodes were deleted, the plugin shows a clear message asking the user to scan again.
- Generated font binaries remain intentionally unpersisted.
- Updated `docs/QA.md` with last-scan restore checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.7 limitations:

- Restore depends on Figma node IDs still existing in the same document.
- Moving or editing glyph nodes is fine; deleting/recreating the board requires a manual scan.
- Settings are still document-level, not board-specific.

Suggested next step:

- V0.8 can add `Reset saved settings` and a small saved-state indicator so users understand what is stored in the document.

## 20. V0.8 Saved State Controls Sprint

Goal: make persistence visible and controllable so users understand what Typegen stores in the Figma document.

Completed:

- Updated package metadata to `0.8.0`.
- Added a compact `Saved state` panel.
- Panel shows saved scan node count, preview text, and active override count.
- Added `Reset saved settings`.
- Added typed `RESET_SETTINGS` and `SETTINGS_RESET` messages.
- Controller clears the document plugin data key when reset is requested.
- UI resets font name, preview text, selected glyph, scan ids, glyph rows, global spacing, advance overrides, and generated font state.
- Updated `docs/QA.md` with saved-state reset checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.8 limitations:

- Reset is global for Typegen settings in the current Figma document.
- There is no confirmation dialog yet.
- Still no board-specific profiles.

## 21. V0.9 Demo Readiness / Help Sprint

Goal: make the supported workflow visible inside the plugin so testers do not need to read external docs before using the MVP.

Completed:

- Updated package metadata to `0.9.0`.
- Added a collapsible `Supported glyph recipe` panel.
- Added `Show recipe` / `Hide recipe` control near the primary board/scan actions.
- Rewrote first-run instruction copy around the core loop: create board, draw filled vectors, scan, preview, export.
- Recipe panel states:
  - name slots `glyph-A` through `glyph-Z`
  - use simple filled vector paths
  - convert text and strokes to outlines
  - avoid images, effects, gradients, masks, booleans, and live shape layers
  - use preview, spacing, and inspector before export
  - lowercase, numbers, punctuation, kerning, variable fonts, and AI generation are not in MVP
- Updated `docs/QA.md` with help-panel checks.

Verification completed:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed with generated files in `dist/`.

Known V0.9 limitations:

- Help panel expanded/collapsed state is session-only.
- The recipe is informational; validation remains the source of truth.

Suggested next step:

- V1.0 candidate should focus on final QA pass, defect fixes from real use, and release packaging notes rather than adding another feature.

## 22. V1.0 Candidate / Release Prep

Goal: prepare the MVP for public GitHub release without expanding product scope.

Completed:

- Updated package metadata to `1.0.0`.
- Updated plugin UI label to `Typegen V1.0`.
- Added `README.md` with usage, development, scope, and QA guidance.
- Added `RELEASE_NOTES.md`.
- Added `.gitignore` for dependencies, logs, and local generated demo exports.
- Kept `dist/` committed so the Figma manifest can load after clone.

Release validation:

- `npm.cmd run typecheck`
- `npm.cmd run build`

Publishing plan:

- Initialize a Git repository.
- Commit V1.0 candidate.
- Create a new public GitHub repository.
- Push the local repository to GitHub.
