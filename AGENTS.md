# Typegen Agent Guide

## Project

Typegen is a focused Figma plugin MVP for generating a usable static font file from uppercase glyphs designed in Figma.

## Shared Rules

- Do not expand scope beyond the MVP unless explicitly instructed.
- Always prioritize a working end-to-end pipeline: Figma vectors -> glyph model -> preview -> font file export.
- Prefer simple, constrained solutions over flexible but fragile ones.
- Validate assumptions before implementing complex features.
- Start with uppercase A-Z only.
- Keep UI practical and minimal.
- Make constraints and validation messages visible to users.
- Treat `PROJECT_CONTEXT.md` as the source of truth for product scope and constraints.
- Keep `TASKS.md` updated when project priorities or implementation status changes.

## Roles

### Product

- Owns MVP scope, user flow, terminology, and acceptance criteria.
- Defines plugin UI states, validation messages, and demo workflow.
- Rejects feature creep that does not support the first end-to-end font export.

### Plugin Engineer

- Owns Figma plugin manifest, main controller, Figma API interactions, board generation, selection scanning, and message passing.
- Keeps Figma canvas operations deterministic and easy to test.
- Documents any Figma API constraints discovered during implementation.

### Font Engine

- Owns internal glyph model, path normalization, font generation, metadata, and binary export format.
- Prefers a proven JavaScript font library where possible.
- Keeps font generation limited to one static format for MVP.

### Preview

- Owns preview rendering in the plugin UI.
- Starts with the simplest reliable preview approach.
- Handles missing glyphs clearly.

### QA

- Owns manual QA checklist, demo workflow, edge case validation, and exported font smoke tests.
- Tests the narrow supported workflow before testing broader unsupported cases.
- Records risks, defects, and test gaps in `TASKS.md`.
