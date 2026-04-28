# Typegen — Codex Project Brief (Figma Font Creation Plugin MVP)

## 1. Product Context

We are building a Figma plugin for creating usable font files directly from glyphs designed inside Figma.

The long-term vision is to create a more modern, design-friendly, AI-assisted font creation workflow — closer to “Figma for typography” than a traditional technical font editor.

However, the MVP must stay extremely focused.

The first goal is not to build a full font editor. The first goal is to prove that a designer can go from a few glyphs in Figma to a usable generated font file with minimal friction.

## 2. Core MVP Promise

> Generate a usable font from glyphs created or edited inside Figma.

The MVP should deliver one clear “magic moment”:

1. User creates or selects glyph frames/components in Figma.
2. Plugin reads those glyphs.
3. Plugin generates a basic font preview.
4. User exports a font file.

The product should feel like a workflow accelerator, not a technical font engineering tool.

## 3. MVP Scope

### Must-have features

#### 3.1 Plugin UI

Create a simple Figma plugin UI with the following sections:

* Project / font name input
* Glyph source instructions
* Button: “Scan selected glyphs”
* Glyph status table/list
* Preview text input
* Basic preview area
* Button: “Generate font file”
* Export/download action

Keep the interface minimal, clean, and practical.

The MVP UI does not need advanced styling. Functionality and clarity are more important.

#### 3.2 Glyph input workflow

The user should be able to create glyphs in Figma as frames, components, or vector groups.

Recommended naming convention:

* `glyph-A`
* `glyph-B`
* `glyph-C`
* etc.

For MVP, support uppercase A–Z first.

The plugin should scan the current selection and identify valid glyph nodes based on name.

Each valid glyph should map to a Unicode character.

Example:

* `glyph-A` → `A`
* `glyph-B` → `B`

#### 3.3 Generate starter board

The plugin should include an action to create a starter glyph board in Figma.

Button:

* “Create glyph board”

The board should create:

* A parent frame named `Font Glyph Board`
* A grid of glyph slots for A–Z
* Each slot named `glyph-A`, `glyph-B`, etc.
* Visual guides for baseline, cap height, and width boundaries

For the MVP, the glyph slots may be empty frames with guide lines and labels.

This feature makes the workflow easier to test and gives users a structured starting point.

#### 3.4 Glyph extraction

The plugin must read vector path data from selected glyph nodes.

For MVP, support the simplest reliable path:

* Vector nodes inside each glyph frame/component
* Boolean/compound shapes only if easy to support
* Ignore images, text layers, effects, strokes, gradients, and complex fills at first

The extraction should produce a normalized outline representation that can be passed into the font generation engine.

Important: the MVP may impose strict constraints on glyph construction if needed.

Example constraints:

* Use filled vector shapes only
* Convert strokes to outlines before generating font
* Avoid gradients and effects
* Each glyph should be a frame containing vector paths

The plugin should show clear validation messages when a glyph is unsupported.

#### 3.5 Font generation

Generate one basic static font file.

Recommended first target:

* TTF or OTF

Use a JavaScript-compatible font generation library if possible, such as `opentype.js` or another suitable library.

The generated font should include:

* Font family name from user input
* Uppercase A–Z glyphs
* Basic advance width per glyph
* Basic spacing
* Required font metadata

No variable font support in MVP.

No kerning in MVP unless trivial to add.

#### 3.6 Preview

The plugin should include a preview text input.

The user can type a word or phrase using available glyphs.

The preview should render with the generated glyph outlines.

For MVP, the preview can be implemented in one of two ways:

Option A:

* Render glyph SVG paths directly in the plugin UI.

Option B:

* Generate a temporary font blob and use it in the plugin iframe via `@font-face`.

Choose the simplest reliable approach.

#### 3.7 Export

The user should be able to export the generated font file locally.

Since Figma plugins run in an iframe UI, the export can likely be handled by generating a Blob and triggering a browser download from the plugin UI.

MVP export format:

* One font format only: TTF or OTF

Later roadmap can add WOFF / WOFF2.

## 4. Explicit Non-goals for MVP

Do not build these in the MVP:

* Variable fonts
* Multiple weights
* Multiple width axes
* AI glyph generation
* Auto-generating missing glyphs from a few letters
* Advanced auto-kerning
* Advanced spacing engine
* Full lowercase support
* Numbers and punctuation
* Font hinting
* Complex OpenType features
* Ligatures
* Collaborative workflow
* User accounts
* Cloud storage
* Marketplace
* Standalone app

The MVP is intentionally narrow.

## 5. Suggested Technical Architecture

### 5.1 Figma plugin structure

Recommended structure:

```txt
/src
  /plugin
    controller.ts        # Figma main thread logic
    figmaNodes.ts        # node scanning and validation
    glyphBoard.ts        # create starter board in canvas
    extractPaths.ts      # extract vector/path data from Figma nodes
    normalizeGlyph.ts    # normalize glyph geometry into font coordinate system
  /ui
    App.tsx              # plugin UI
    components/*
    preview/*            # preview renderer
  /font
    buildFont.ts         # font generation engine
    glyphModel.ts        # internal glyph types
    exportFont.ts        # Blob/download helpers
  /shared
    messages.ts          # typed messages between plugin and UI
    types.ts
```

### 5.2 Plugin ↔ UI communication

Use typed message passing between the Figma plugin controller and the plugin UI.

Example actions:

* `CREATE_GLYPH_BOARD`
* `SCAN_SELECTED_GLYPHS`
* `GLYPHS_SCANNED`
* `GENERATE_FONT`
* `FONT_GENERATED`
* `EXPORT_FONT`
* `VALIDATION_ERROR`

### 5.3 Internal glyph model

Create a normalized internal representation before generating the font.

Example:

```ts
type GlyphChar = 'A' | 'B' | 'C' | ...;

type GlyphModel = {
  char: string;
  unicode: number;
  name: string;
  width: number;
  bounds: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  paths: NormalizedPath[];
  warnings: string[];
};
```

This avoids coupling Figma node data directly to the font generation layer.

## 6. Product UX Principles

### Keep the MVP simple

The plugin should guide the user through a tight workflow:

1. Create board
2. Draw/edit glyphs
3. Select board or glyphs
4. Scan glyphs
5. Preview
6. Export

### Make constraints visible

Because font generation from Figma vectors can be fragile, the plugin must clearly communicate constraints.

Example messages:

* “Glyph A has no vector paths.”
* “Glyph B contains a text layer. Convert it to outlines first.”
* “Glyph C contains strokes. Expand strokes before exporting.”
* “Only uppercase A–Z is supported in this MVP.”

### Prefer working constraints over fragile magic

For MVP, it is better to require users to follow a specific glyph structure than to support every possible Figma edge case poorly.

## 7. Success Criteria

The MVP is successful if:

* A user can create a starter board.
* A user can draw/edit at least several uppercase glyphs.
* The plugin can scan and validate those glyphs.
* The plugin can generate a preview from the available glyphs.
* The plugin can export a usable font file.
* The font can be installed or used in a simple test page.

## 8. Milestones

### Milestone 1 — Plugin skeleton

Build the basic Figma plugin project:

* Plugin manifest
* Main controller
* UI iframe
* Message passing
* Simple UI
* Local dev/build setup

Deliverable:

* Plugin opens in Figma and basic UI actions work.

### Milestone 2 — Glyph board generation

Build the board creation feature:

* Create parent frame
* Create A–Z glyph slots
* Add labels and visual guides
* Name slots correctly

Deliverable:

* User can click “Create glyph board” and get a structured board in Figma.

### Milestone 3 — Glyph scanning and validation

Build selection scanning:

* Detect selected board/glyph frames
* Parse names like `glyph-A`
* Validate supported glyph structure
* Return status list to UI

Deliverable:

* UI displays found glyphs, missing glyphs, and validation warnings.

### Milestone 4 — Path extraction and normalization

Build the glyph extraction pipeline:

* Extract vector paths
* Normalize dimensions
* Convert to internal glyph model
* Prepare data for font generation

Deliverable:

* Plugin can convert Figma vector glyphs into normalized internal path data.

### Milestone 5 — Font generation

Build the static font generator:

* Use font generation library
* Map A–Z to unicode
* Add metadata
* Generate binary font buffer

Deliverable:

* Plugin can generate a TTF or OTF from scanned glyphs.

### Milestone 6 — Preview

Build preview feature:

* User enters preview text
* Plugin renders available glyphs
* Missing glyphs are visibly handled

Deliverable:

* User can preview generated font before export.

### Milestone 7 — Export

Build export/download:

* Create Blob
* Trigger local download
* Name file based on font family

Deliverable:

* User can save generated font file locally.

### Milestone 8 — QA and demo flow

Build a simple demo file/workflow:

* Example glyph board
* Sample glyphs
* Test export
* Test install/use of generated font

Deliverable:

* End-to-end demo works reliably.

## 9. Roadmap After MVP

### Phase 1 — Better static font workflow

Add:

* Lowercase a–z
* Numbers 0–9
* Basic punctuation
* Better spacing controls
* Manual advance width per glyph
* Basic kerning pairs
* Better validation
* Better preview templates

### Phase 2 — Font Playground

Add richer preview environments:

* Hero headline preview
* UI text preview
* Paragraph preview
* Brand lockup preview
* Editable tracking, size, line height
* Light/dark preview backgrounds

### Phase 3 — Assisted consistency tools

Add smart checks:

* Inconsistent cap height detection
* Baseline drift detection
* Stroke/curve consistency warnings
* Width outlier detection
* Similar glyph comparison, e.g. O/Q, E/F, H/I

### Phase 4 — Export presets

Add:

* WOFF
* WOFF2
* CSS `@font-face` generation
* Web export package
* Brand kit package
* Test HTML file export

### Phase 5 — AI-assisted generation

Add:

* Generate missing glyphs from existing glyphs
* Create font from style prompt
* Create font from reference image/logo
* Suggest alternate glyphs
* Harmonize inconsistent glyphs

### Phase 6 — Variable fonts

Add:

* Multiple masters
* Weight axis
* Width axis
* Soft/sharp axis if feasible
* Interpolation preview
* Variable font export

### Phase 7 — Standalone product evaluation

Only consider standalone after the plugin proves demand.

Signals that standalone may be needed:

* Figma API limits block core functionality
* Performance becomes a bottleneck
* Users want deeper editing tools
* Users need full professional font production workflow

## 10. Instructions for Codex as Project Manager

Act as the technical project manager for this MVP.

Your first task is to turn this brief into an implementation plan.

Do not start coding immediately.

First produce:

1. Product assumptions
2. Technical assumptions
3. Risks and unknowns
4. Recommended architecture
5. Milestone breakdown
6. Detailed task backlog
7. Agent plan
8. First implementation sprint

## 11. Required Setup Step (DO THIS FIRST)

Before any planning or coding, you MUST create the following files in the project root:

### 1. PROJECT_CONTEXT.md

* Copy the full contents of this brief into PROJECT_CONTEXT.md
* This file is the single source of truth for product, scope, and constraints

### 2. AGENTS.md

Create an AGENTS.md file that defines how Codex and sub-agents should behave.

Include:

* Project name: Typegen
* Roles (Product, Plugin Engineer, Font Engine, Preview, QA)
* Rules:

  * Do not expand scope beyond MVP unless explicitly instructed
  * Always prioritize working end-to-end pipeline
  * Prefer simple, constrained solutions over flexible but fragile ones
  * Validate assumptions before implementing complex features

### 3. TASKS.md

* This file will be generated after planning
* It should contain prioritized tasks and milestones

Only AFTER creating these files should you proceed with planning.

## 12. Agent Plan Requested

Use specialized agents or workstreams if available.

Suggested agents:

### Product/UX Agent

Responsibilities:

* Define exact user flow
* Define plugin UI states
* Define validation messages
* Define demo workflow

### Figma Plugin Engineer Agent

Responsibilities:

* Manifest setup
* Main plugin controller
* Figma API interactions
* Board generation
* Selection scanning
* Message passing

### Font Engine Agent

Responsibilities:

* Research best JS font generation library
* Define internal glyph model
* Convert paths to font glyphs
* Generate TTF/OTF
* Handle export/download

### Preview Agent

Responsibilities:

* Build preview renderer
* Handle missing glyphs
* Show live preview state
* Optional SVG preview fallback

### QA Agent

Responsibilities:

* Create test glyph board
* Test glyph extraction edge cases
* Test generated font install/use
* Write manual QA checklist

## 13. First Prompt to Codex

Use this prompt to start the project:

```txt
This project is called Typegen.

You are acting as technical project manager and senior engineer for a new Figma plugin MVP.

Before doing anything else, create the following files:

1. PROJECT_CONTEXT.md → copy the full project brief into this file
2. AGENTS.md → define roles, rules, and behavior for agents
3. TASKS.md → leave empty for now

Only after creating these files, proceed to planning.

Now read the full project brief and do not start coding yet.

Your first job is to create a detailed implementation plan for the MVP.

Please output:

1. A concise interpretation of the product goal.
2. The smallest viable MVP scope.
3. Technical feasibility notes for Figma Plugin API + font generation.
4. Main risks and proposed mitigations.
5. Recommended code architecture.
6. Milestone-by-milestone implementation plan.
7. A detailed task backlog with priorities.
8. Suggested agent/workstream delegation.
9. The first sprint plan with exact tasks.
10. Any questions that must be answered before coding.

Important constraints:

- Keep the MVP focused.
- Do not include variable fonts in the MVP.
- Do not include AI generation in the MVP.
- Start with uppercase A–Z only.
- Prefer a reliable constrained workflow over broad fragile support.
- The plugin should generate a starter glyph board, scan selected glyphs, preview available glyphs, and export one static font file.
```

## 14. Build Philosophy

The first version should be ugly but useful.

The priority is proving the technical loop:

Figma vectors → glyph model → preview → font file export.

Do not overbuild the UI.
Do not overbuild typography intelligence.
Do not attempt professional font-editor parity.

Ship the smallest end-to-end loop first.
