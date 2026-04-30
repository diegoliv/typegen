import {
  SUPPORTED_CHARS,
  TYPEGEN_ROLE_BOARD,
  TYPEGEN_ROLE_HELPER,
  TYPEGEN_ROLE_KEY,
  TYPEGEN_ROLE_SLOT,
  glyphCharFromName,
  glyphNameForChar,
} from "./pluginTypes";
import {
  DEFAULT_FONT_WEIGHT_STYLE,
  FONT_WEIGHT_DEFINITIONS,
  GLYPH_CATEGORIES,
  glyphCategoryForChar,
  glyphLabelForChar,
  isFontWeightStyle,
  unifiedVisualGuideProfileForChar,
  type FontWeightStyle,
  type GlyphChar,
  type SlotGuideProfile,
} from "../shared/types";

const GAP = 24;
const COLUMNS = 8;
const PADDING = 32;
const SECTION_LABEL_HEIGHT = 24;
const SECTION_GAP = 36;
const LABEL_FONT: FontName = { family: "Inter", style: "Regular" };
const BOARD_STYLE_KEY = "typegen-board-style";
const GUIDE_NODE_NAME = "tg-guides";
const GUIDE_SIGNATURE_KEY = "typegen-guide-signature";

export type GlyphBoardStyle = FontWeightStyle;

export type GlyphBoardResult = {
  board: FrameNode;
  style: GlyphBoardStyle;
  warnings: string[];
  created: boolean;
  addedSlots: number;
  duplicatePrevented: boolean;
};

export async function createGlyphBoard(style: GlyphBoardStyle = DEFAULT_FONT_WEIGHT_STYLE, mode: "new" | "update" = "update"): Promise<GlyphBoardResult> {
  const selectedBoard = findSelectedGlyphBoard();
  const requestedStyle = sanitizeBoardStyle(style);
  const boardStyle = mode === "update" && selectedBoard ? getGlyphBoardStyle(selectedBoard) : requestedStyle;
  const warnings: string[] = [];
  let labelsEnabled = true;

  try {
    await figma.loadFontAsync(LABEL_FONT);
  } catch {
    labelsEnabled = false;
    warnings.push("Could not load Inter Regular for board labels. Slots were still created.");
  }

  if (mode === "update" && !selectedBoard) {
    throw new Error("Select a Typegen glyph board before updating it, or create a new board from the weight picker.");
  }

  const duplicateBoard = mode === "new" ? findExistingBoard(boardStyle) : null;
  if (duplicateBoard) {
    figma.currentPage.selection = [duplicateBoard];
    figma.viewport.scrollAndZoomIntoView([duplicateBoard]);
    warnings.push(`A ${boardStyle} board already exists. Typegen allows one board per weight.`);
    return {
      board: duplicateBoard,
      style: boardStyle,
      warnings,
      created: false,
      addedSlots: 0,
      duplicatePrevented: true,
    };
  }

  const existingBoard = mode === "update" ? selectedBoard : null;
  const board = existingBoard ?? createBoardFrame(boardStyle);
  setBoardStyle(board, boardStyle);
  const existingSlotsByChar = collectExistingSlots(board);
  let addedSlots = 0;

  for (let index = 0; index < SUPPORTED_CHARS.length; index++) {
    const char = SUPPORTED_CHARS[index];
    let slot = existingSlotsByChar.get(char);

    if (!slot) {
      slot = createSlot(char);
      board.appendChild(slot);
      addedSlots++;
    }

    syncSlotGuides(slot, char as GlyphChar, labelsEnabled);
    positionSlot(slot, char);
  }

  resizeBoardToFitSupportedSlots(board);
  syncBoardSectionLabels(board, labelsEnabled);

  if (!existingBoard) {
    positionNewBoard(board);
    figma.currentPage.appendChild(board);
  }

  figma.currentPage.selection = [board];
  figma.viewport.scrollAndZoomIntoView([board]);

  return { board, style: boardStyle, warnings, created: !existingBoard, addedSlots, duplicatePrevented: false };
}

function sanitizeBoardStyle(style: GlyphBoardStyle): GlyphBoardStyle {
  return isFontWeightStyle(style) ? style : DEFAULT_FONT_WEIGHT_STYLE;
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

function positionSlot(slot: SceneNode, char: string): void {
  const layout = getSlotLayout(char as GlyphChar);
  slot.x = layout.x;
  slot.y = layout.y;

  if (slot.type === "FRAME") {
    const profile = unifiedVisualGuideProfileForChar(char as GlyphChar);
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
    (node.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_BOARD || node.name === "Font Glyph Board" || node.name.startsWith("Font Glyph Board - "))
  );
}

export function getGlyphBoardStyle(board: FrameNode): GlyphBoardStyle {
  const style = board.getPluginData(BOARD_STYLE_KEY);
  if (isFontWeightStyle(style)) {
    return style;
  }

  const weightByLongestLabel = [...FONT_WEIGHT_DEFINITIONS].sort((a, b) => b.style.length - a.style.length);
  const boardName = board.name.toLowerCase();
  return weightByLongestLabel.find((definition) => boardName.includes(definition.style.toLowerCase()))?.style ?? DEFAULT_FONT_WEIGHT_STYLE;
}

function setBoardStyle(board: FrameNode, style: GlyphBoardStyle): void {
  board.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_BOARD);
  board.setPluginData(BOARD_STYLE_KEY, style);

  board.name = boardNameForStyle(style);
}

function boardNameForStyle(style: GlyphBoardStyle): string {
  return `Font Glyph Board - ${style}`;
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
  const boardWidth = PADDING * 2 + COLUMNS * UPPERCASE_SLOT_WIDTH + (COLUMNS - 1) * GAP;
  const boardHeight = PADDING + BOARD_LAYOUT.height;
  board.resize(boardWidth, boardHeight);
}

function getSlotLayout(char: GlyphChar): { x: number; y: number } {
  return BOARD_LAYOUT.slots.get(char) ?? { x: PADDING, y: PADDING + SECTION_LABEL_HEIGHT };
}

const UPPERCASE_SLOT_WIDTH = unifiedVisualGuideProfileForChar("A").slotWidth;
const UPPERCASE_SLOT_HEIGHT = unifiedVisualGuideProfileForChar("A").slotHeight;

type BoardLayout = {
  slots: Map<GlyphChar, { x: number; y: number }>;
  sections: Array<{ id: string; label: string; description: string; x: number; y: number; width: number }>;
  height: number;
};

function createBoardLayout(): BoardLayout {
  const slots = new Map<GlyphChar, { x: number; y: number }>();
  const sections: BoardLayout["sections"] = [];
  const boardInnerWidth = COLUMNS * UPPERCASE_SLOT_WIDTH + (COLUMNS - 1) * GAP;
  let y = PADDING;

  for (const category of GLYPH_CATEGORIES) {
    const chars = SUPPORTED_CHARS.filter((char) => glyphCategoryForChar(char as GlyphChar) === category.id);
    if (chars.length === 0) {
      continue;
    }

    sections.push({
      id: category.id,
      label: category.label,
      description: category.description,
      x: PADDING,
      y,
      width: boardInnerWidth,
    });

    y += SECTION_LABEL_HEIGHT;
    const rowCount = Math.ceil(chars.length / COLUMNS);

    for (let index = 0; index < chars.length; index++) {
      const char = chars[index] as GlyphChar;
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      slots.set(char, {
        x: PADDING + column * (UPPERCASE_SLOT_WIDTH + GAP),
        y: y + getSectionRowsHeight(chars, row) + row * GAP,
      });
    }

    y += getSectionRowsHeight(chars, rowCount) + Math.max(0, rowCount - 1) * GAP + SECTION_GAP;
  }

  return { slots, sections, height: Math.max(PADDING, y - SECTION_GAP + PADDING) };
}

function getSectionRowsHeight(chars: string[], rowCount: number): number {
  let height = 0;
  for (let row = 0; row < rowCount; row++) {
    const rowChars = chars.slice(row * COLUMNS, row * COLUMNS + COLUMNS);
    height += Math.max(...rowChars.map((char) => unifiedVisualGuideProfileForChar(char as GlyphChar).slotHeight), UPPERCASE_SLOT_HEIGHT);
  }
  return height;
}

const BOARD_LAYOUT = createBoardLayout();

function createSlot(char: string): FrameNode {
  const profile = unifiedVisualGuideProfileForChar(char as GlyphChar);
  const slot = figma.createFrame();
  slot.name = glyphNameForChar(char);
  slot.resize(profile.slotWidth, profile.slotHeight);
  slot.fills = [solid(1, 1, 1)];
  slot.strokes = [solid(0.75, 0.78, 0.84)];
  slot.strokeWeight = 1;
  slot.cornerRadius = 4;
  slot.clipsContent = false;
  slot.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_SLOT);

  return slot;
}

function addGuides(slot: FrameNode, profile: SlotGuideProfile): void {
  const guideTop = profile.ascenderY;
  const guideBottom = profile.descenderY ?? profile.baselineY;
  const guideWidth = profile.rightBoundaryX - profile.leftBoundaryX;
  const data = [
    `M ${profile.leftBoundaryX} ${guideTop} L ${profile.leftBoundaryX} ${guideBottom}`,
    `M ${profile.rightBoundaryX} ${guideTop} L ${profile.rightBoundaryX} ${guideBottom}`,
    `M ${profile.leftBoundaryX} ${profile.ascenderY} L ${profile.leftBoundaryX + guideWidth} ${profile.ascenderY}`,
    `M ${profile.leftBoundaryX} ${profile.xHeightY ?? profile.ascenderY} L ${profile.leftBoundaryX + guideWidth} ${profile.xHeightY ?? profile.ascenderY}`,
    `M ${profile.leftBoundaryX} ${profile.baselineY} L ${profile.leftBoundaryX + guideWidth} ${profile.baselineY}`,
    `M ${profile.leftBoundaryX} ${profile.descenderY ?? profile.baselineY} L ${profile.leftBoundaryX + guideWidth} ${profile.descenderY ?? profile.baselineY}`,
  ].join(" ");
  const guide = figma.createVector();
  guide.name = GUIDE_NODE_NAME;
  guide.vectorPaths = [{ windingRule: "NONZERO", data }];
  guide.fills = [];
  guide.strokes = [solid(0.16, 0.32, 0.68, 0.42)];
  guide.strokeWeight = 1;
  guide.locked = true;
  guide.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_HELPER);
  guide.setPluginData(GUIDE_SIGNATURE_KEY, guideSignature(profile));
  slot.appendChild(guide);
}

function syncSlotGuides(slot: SceneNode, char: GlyphChar, labelsEnabled: boolean): void {
  if (slot.type !== "FRAME") {
    return;
  }

  const profile = unifiedVisualGuideProfileForChar(char);
  if (slotHelpersAreCurrent(slot, char, profile, labelsEnabled)) {
    return;
  }

  for (const child of [...slot.children]) {
    if (child.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_HELPER && (child.type === "RECTANGLE" || child.name === GUIDE_NODE_NAME || (labelsEnabled && child.name.startsWith("tg-label-")))) {
      child.remove();
    }
  }

  addGuides(slot, profile);

  if (labelsEnabled) {
    addLabel(slot, glyphLabelForChar(char));
  }
}

function slotHelpersAreCurrent(slot: FrameNode, char: GlyphChar, profile: SlotGuideProfile, labelsEnabled: boolean): boolean {
  const guide = slot.children.find((child) => child.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_HELPER && child.name === GUIDE_NODE_NAME);
  if (!guide || guide.getPluginData(GUIDE_SIGNATURE_KEY) !== guideSignature(profile)) {
    return false;
  }

  const hasLegacyGuideRect = slot.children.some((child) => child.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_HELPER && child.type === "RECTANGLE");
  if (hasLegacyGuideRect) {
    return false;
  }

  if (!labelsEnabled) {
    return true;
  }

  return slot.children.some((child) => child.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_HELPER && child.name === `tg-label-${glyphLabelForChar(char)}`);
}

function guideSignature(profile: SlotGuideProfile): string {
  return [
    profile.slotWidth,
    profile.slotHeight,
    profile.leftBoundaryX,
    profile.rightBoundaryX,
    profile.ascenderY,
    profile.xHeightY ?? "",
    profile.baselineY,
    profile.descenderY ?? "",
  ].join(":");
}

function syncBoardSectionLabels(board: FrameNode, labelsEnabled: boolean): void {
  for (const child of [...board.children]) {
    if (child.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_HELPER && child.name.startsWith("tg-section-")) {
      child.remove();
    }
  }

  if (!labelsEnabled) {
    return;
  }

  for (const section of BOARD_LAYOUT.sections) {
    const label = figma.createText();
    label.name = `tg-section-${section.id}`;
    label.characters = `${section.label}  ${section.description}`;
    label.fontName = LABEL_FONT;
    label.fontSize = 18;
    label.fills = [solid(0.12, 0.13, 0.15)];
    label.x = section.x;
    label.y = section.y;
    label.resize(section.width, SECTION_LABEL_HEIGHT);
    label.locked = true;
    label.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_HELPER);
    board.appendChild(label);
  }
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
