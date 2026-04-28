import {
  SUPPORTED_CHARS,
  TYPEGEN_ROLE_BOARD,
  TYPEGEN_ROLE_HELPER,
  TYPEGEN_ROLE_KEY,
  TYPEGEN_ROLE_SLOT,
  glyphCharFromName,
  glyphNameForChar,
} from "./pluginTypes";
import { glyphLabelForChar, guideProfileForChar, type GlyphChar, type SlotGuideProfile } from "../shared/types";

const GAP = 24;
const COLUMNS = 6;
const PADDING = 32;
const LABEL_FONT: FontName = { family: "Inter", style: "Regular" };
const BOARD_STYLE_KEY = "typegen-board-style";

export type GlyphBoardStyle = "Regular" | "Bold";

export type GlyphBoardResult = {
  board: FrameNode;
  style: GlyphBoardStyle;
  warnings: string[];
  created: boolean;
  addedSlots: number;
};

export async function createGlyphBoard(style: GlyphBoardStyle = "Regular"): Promise<GlyphBoardResult> {
  const selectedBoard = findSelectedGlyphBoard();
  const boardStyle = selectedBoard ? getGlyphBoardStyle(selectedBoard) : sanitizeBoardStyle(style);
  const warnings: string[] = [];
  let labelsEnabled = true;

  try {
    await figma.loadFontAsync(LABEL_FONT);
  } catch {
    labelsEnabled = false;
    warnings.push("Could not load Inter Regular for board labels. Slots were still created.");
  }

  const existingBoard = selectedBoard ?? findExistingBoard(boardStyle);
  const board = existingBoard ?? createBoardFrame(boardStyle);
  setBoardStyle(board, boardStyle);
  const existingSlotsByChar = collectExistingSlots(board);
  let addedSlots = 0;

  for (let index = 0; index < SUPPORTED_CHARS.length; index++) {
    const char = SUPPORTED_CHARS[index];
    let slot = existingSlotsByChar.get(char);

    if (!slot) {
      slot = createSlot(char, labelsEnabled);
      board.appendChild(slot);
      addedSlots++;
    }

    positionSlot(slot, char, index);
  }

  resizeBoardToFitSupportedSlots(board);

  if (!existingBoard) {
    positionNewBoard(board);
    figma.currentPage.appendChild(board);
  }

  figma.currentPage.selection = [board];
  figma.viewport.scrollAndZoomIntoView([board]);

  return { board, style: boardStyle, warnings, created: !existingBoard, addedSlots };
}

function sanitizeBoardStyle(style: GlyphBoardStyle): GlyphBoardStyle {
  return style === "Bold" ? "Bold" : "Regular";
}

function collectExistingSlots(board: FrameNode): Map<string, SceneNode> {
  const slots = new Map<string, SceneNode>();

  for (const child of board.children) {
    const char = glyphCharFromName(child.name);
    if (char && !slots.has(char)) {
      slots.set(char, child);
    }
  }

  return slots;
}

function positionSlot(slot: SceneNode, char: string, index: number): void {
  const layout = getSlotLayout(index);
  slot.x = layout.x;
  slot.y = layout.y;

  if (slot.type === "FRAME") {
    const profile = guideProfileForChar(char as GlyphChar);
    if (slot.width !== profile.slotWidth || slot.height !== profile.slotHeight) {
      slot.resize(profile.slotWidth, profile.slotHeight);
    }
  }
}

function findExistingBoard(style: GlyphBoardStyle): FrameNode | null {
  return figma.currentPage.findOne((node) => isGlyphBoardFrameForStyle(node, style)) as FrameNode | null;
}

export function findAllGlyphBoards(): FrameNode[] {
  return figma.currentPage.findAll((node) => isGlyphBoardFrame(node)) as FrameNode[];
}

export function findSelectedGlyphBoard(): FrameNode | null {
  for (const node of figma.currentPage.selection) {
    const board = findGlyphBoardAncestor(node);
    if (board) {
      return board;
    }
  }

  return null;
}

function findGlyphBoardAncestor(node: BaseNode | null): FrameNode | null {
  let current: BaseNode | null = node;

  while (current) {
    if (isGlyphBoardFrame(current)) {
      return current;
    }

    current = current.parent;
  }

  return null;
}

function isGlyphBoardFrameForStyle(node: BaseNode, style: GlyphBoardStyle): node is FrameNode {
  if (!isGlyphBoardFrame(node)) {
    return false;
  }

  return getGlyphBoardStyle(node) === style;
}

function isGlyphBoardFrame(node: BaseNode): node is FrameNode {
  return (
    node.type === "FRAME" &&
    (node.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_BOARD || node.name === "Font Glyph Board" || node.name.startsWith("Font Glyph Board - Inter "))
  );
}

export function getGlyphBoardStyle(board: FrameNode): GlyphBoardStyle {
  const style = board.getPluginData(BOARD_STYLE_KEY);
  if (style === "Bold") {
    return "Bold";
  }

  if (style === "Regular") {
    return "Regular";
  }

  return board.name.includes("Bold") ? "Bold" : "Regular";
}

function setBoardStyle(board: FrameNode, style: GlyphBoardStyle): void {
  board.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_BOARD);
  board.setPluginData(BOARD_STYLE_KEY, style);

  if (board.name !== "Font Glyph Board" || style === "Bold") {
    board.name = boardNameForStyle(style);
  }
}

function boardNameForStyle(style: GlyphBoardStyle): string {
  return `Font Glyph Board - Inter ${style}`;
}

function createBoardFrame(style: GlyphBoardStyle): FrameNode {
  const board = figma.createFrame();
  board.name = boardNameForStyle(style);
  board.fills = [solid(0.98, 0.98, 0.98)];
  board.strokes = [solid(0.82, 0.84, 0.88)];
  board.strokeWeight = 1;
  board.cornerRadius = 8;
  board.clipsContent = false;
  board.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_BOARD);
  resizeBoardToFitSupportedSlots(board);
  return board;
}

function positionNewBoard(board: FrameNode): void {
  const existingBoards = (figma.currentPage.findAll((node) => isGlyphBoardFrame(node)) as FrameNode[]).filter(
    (existingBoard) => existingBoard.id !== board.id,
  );
  if (existingBoards.length === 0) {
    return;
  }

  const rightEdge = Math.max(...existingBoards.map((existingBoard) => existingBoard.x + existingBoard.width));
  const top = Math.min(...existingBoards.map((existingBoard) => existingBoard.y));
  board.x = rightEdge + GAP;
  board.y = top;
}

function resizeBoardToFitSupportedSlots(board: FrameNode): void {
  const rows = Math.ceil(SUPPORTED_CHARS.length / COLUMNS);
  const boardWidth = PADDING * 2 + COLUMNS * UPPERCASE_SLOT_WIDTH + (COLUMNS - 1) * GAP;
  const boardHeight = PADDING * 2 + getRowsHeight(rows) + Math.max(0, rows - 1) * GAP;
  board.resize(boardWidth, boardHeight);
}

function getSlotLayout(index: number): { x: number; y: number } {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const rowTop = PADDING + getRowsHeight(row) + row * GAP;
  return {
    x: PADDING + column * (UPPERCASE_SLOT_WIDTH + GAP),
    y: rowTop,
  };
}

function getRowsHeight(rowCount: number): number {
  let height = 0;
  for (let row = 0; row < rowCount; row++) {
    height += getRowHeight(row);
  }
  return height;
}

function getRowHeight(row: number): number {
  const rowChars = SUPPORTED_CHARS.slice(row * COLUMNS, row * COLUMNS + COLUMNS);
  return Math.max(...rowChars.map((char) => guideProfileForChar(char as GlyphChar).slotHeight), UPPERCASE_SLOT_HEIGHT);
}

const UPPERCASE_SLOT_WIDTH = guideProfileForChar("A").slotWidth;
const UPPERCASE_SLOT_HEIGHT = guideProfileForChar("A").slotHeight;

function createSlot(char: string, labelsEnabled: boolean): FrameNode {
  const profile = guideProfileForChar(char as GlyphChar);
  const slot = figma.createFrame();
  slot.name = glyphNameForChar(char);
  slot.resize(profile.slotWidth, profile.slotHeight);
  slot.fills = [solid(1, 1, 1)];
  slot.strokes = [solid(0.75, 0.78, 0.84)];
  slot.strokeWeight = 1;
  slot.cornerRadius = 4;
  slot.clipsContent = false;
  slot.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_SLOT);

  addGuides(slot, profile);

  if (labelsEnabled) {
    addLabel(slot, glyphLabelForChar(char as GlyphChar));
  }

  return slot;
}

function addGuides(slot: FrameNode, profile: SlotGuideProfile): void {
  const guideTop = profile.ascenderY;
  const guideBottom = profile.descenderY ?? profile.baselineY;
  const guideHeight = Math.max(1, guideBottom - guideTop);
  const guideWidth = profile.rightBoundaryX - profile.leftBoundaryX;

  addGuide(slot, "tg-left-boundary", profile.leftBoundaryX, guideTop, 1, guideHeight, 0.78);
  addGuide(slot, "tg-right-boundary", profile.rightBoundaryX, guideTop, 1, guideHeight, 0.78);
  addGuide(
    slot,
    profile.name === "lowercase" ? "tg-ascender" : "tg-cap-height",
    profile.leftBoundaryX,
    profile.ascenderY,
    guideWidth,
    1,
    0.62,
  );

  if (typeof profile.xHeightY === "number") {
    addGuide(slot, "tg-x-height", profile.leftBoundaryX, profile.xHeightY, guideWidth, 1, 0.5);
  }

  addGuide(slot, "tg-baseline", profile.leftBoundaryX, profile.baselineY, guideWidth, 1, 0.36);

  if (typeof profile.descenderY === "number") {
    addGuide(slot, "tg-descender", profile.leftBoundaryX, profile.descenderY, guideWidth, 1, 0.28);
  }
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
