# Typegen MVP Implementation Plan

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

Suggested next step:

- V0.9 can improve demo readiness by adding an explicit in-plugin “Supported glyph recipe” / help panel and clearer onboarding copy for first-time users.
