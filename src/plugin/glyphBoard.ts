import {
  SUPPORTED_CHARS,
  TYPEGEN_ROLE_BOARD,
  TYPEGEN_ROLE_HELPER,
  TYPEGEN_ROLE_KEY,
  TYPEGEN_ROLE_SLOT,
  glyphCharFromName,
  glyphNameForChar,
} from "./pluginTypes";
import { glyphLabelForChar, type GlyphChar } from "../shared/types";

const SLOT_WIDTH = 160;
const SLOT_HEIGHT = 200;
const GAP = 24;
const COLUMNS = 6;
const PADDING = 32;
const LABEL_FONT: FontName = { family: "Inter", style: "Regular" };

export type GlyphBoardResult = {
  board: FrameNode;
  warnings: string[];
  created: boolean;
  addedSlots: number;
};

export async function createGlyphBoard(): Promise<GlyphBoardResult> {
  const warnings: string[] = [];
  let labelsEnabled = true;

  try {
    await figma.loadFontAsync(LABEL_FONT);
  } catch {
    labelsEnabled = false;
    warnings.push("Could not load Inter Regular for board labels. Slots were still created.");
  }

  const existingBoard = findExistingBoard();
  const board = existingBoard ?? createBoardFrame();
  const existingSlotChars = new Set(
    board.children
      .map((child) => glyphCharFromName(child.name))
      .filter((char): char is string => Boolean(char)),
  );
  let addedSlots = 0;

  for (let index = 0; index < SUPPORTED_CHARS.length; index++) {
    const char = SUPPORTED_CHARS[index];
    if (existingSlotChars.has(char)) {
      continue;
    }

    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const slot = createSlot(char, labelsEnabled);
    slot.x = PADDING + column * (SLOT_WIDTH + GAP);
    slot.y = PADDING + row * (SLOT_HEIGHT + GAP);
    board.appendChild(slot);
    addedSlots++;
  }

  resizeBoardToFitSupportedSlots(board);

  if (!existingBoard) {
    figma.currentPage.appendChild(board);
  }

  figma.currentPage.selection = [board];
  figma.viewport.scrollAndZoomIntoView([board]);

  return { board, warnings, created: !existingBoard, addedSlots };
}

function findExistingBoard(): FrameNode | null {
  const selectedBoard = figma.currentPage.selection.find(isGlyphBoardFrame);
  if (selectedBoard) {
    return selectedBoard;
  }

  return figma.currentPage.findOne((node) => isGlyphBoardFrame(node)) as FrameNode | null;
}

function isGlyphBoardFrame(node: BaseNode): node is FrameNode {
  return (
    node.type === "FRAME" &&
    (node.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_BOARD || node.name === "Font Glyph Board")
  );
}

function createBoardFrame(): FrameNode {
  const board = figma.createFrame();
  board.name = "Font Glyph Board";
  board.fills = [solid(0.98, 0.98, 0.98)];
  board.strokes = [solid(0.82, 0.84, 0.88)];
  board.strokeWeight = 1;
  board.cornerRadius = 8;
  board.clipsContent = false;
  board.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_BOARD);
  resizeBoardToFitSupportedSlots(board);
  return board;
}

function resizeBoardToFitSupportedSlots(board: FrameNode): void {
  const rows = Math.ceil(SUPPORTED_CHARS.length / COLUMNS);
  board.resize(
    PADDING * 2 + COLUMNS * SLOT_WIDTH + (COLUMNS - 1) * GAP,
    PADDING * 2 + rows * SLOT_HEIGHT + (rows - 1) * GAP,
  );
}

function createSlot(char: string, labelsEnabled: boolean): FrameNode {
  const slot = figma.createFrame();
  slot.name = glyphNameForChar(char);
  slot.resize(SLOT_WIDTH, SLOT_HEIGHT);
  slot.fills = [solid(1, 1, 1)];
  slot.strokes = [solid(0.75, 0.78, 0.84)];
  slot.strokeWeight = 1;
  slot.cornerRadius = 4;
  slot.clipsContent = false;
  slot.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_SLOT);

  addGuide(slot, "tg-left-boundary", 24, 34, 1, 128, 0.78);
  addGuide(slot, "tg-right-boundary", SLOT_WIDTH - 24, 34, 1, 128, 0.78);
  addGuide(slot, "tg-cap-height", 24, 48, SLOT_WIDTH - 48, 1, 0.62);
  addGuide(slot, "tg-baseline", 24, 162, SLOT_WIDTH - 48, 1, 0.36);
  if (labelsEnabled) {
    addLabel(slot, glyphLabelForChar(char as GlyphChar));
  }

  return slot;
}

function addGuide(parent: FrameNode, name: string, x: number, y: number, width: number, height: number, alpha: number): void {
  const guide = figma.createRectangle();
  guide.name = name;
  guide.x = x;
  guide.y = y;
  guide.resize(width, height);
  guide.fills = [solid(0.16, 0.32, 0.68, alpha)];
  guide.locked = true;
  guide.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_HELPER);
  parent.appendChild(guide);
}

function addLabel(parent: FrameNode, char: string): void {
  const label = figma.createText();
  label.name = `tg-label-${char}`;
  label.characters = char;
  label.fontName = LABEL_FONT;
  label.fontSize = 16;
  label.fills = [solid(0.22, 0.24, 0.28)];
  label.x = 12;
  label.y = 10;
  label.locked = true;
  label.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_HELPER);
  parent.appendChild(label);
}

function solid(r: number, g: number, b: number, a = 1): SolidPaint {
  return { type: "SOLID", color: { r, g, b }, opacity: a };
}
