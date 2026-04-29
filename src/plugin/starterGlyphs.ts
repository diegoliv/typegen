import { createGlyphBoard, type GlyphBoardStyle } from "./glyphBoard";
import {
  SUPPORTED_CHARS,
  TYPEGEN_ROLE_HELPER,
  TYPEGEN_ROLE_KEY,
  glyphCharFromName,
  glyphNameForChar,
} from "./pluginTypes";
import { glyphLabelForChar, unifiedVisualGuideProfileForChar, type GlyphChar, type SlotGuideProfile } from "../shared/types";

type StarterGlyphResult = {
  board: FrameNode;
  filledSlots: number;
  skippedSlots: number;
  warnings: string[];
};

type StarterGlyphStyle = GlyphBoardStyle;

type Point = { x: number; y: number };
type Shape = Point[];
type GlyphMetrics = {
  left: number;
  right: number;
  top: number;
  xHeight: number;
  baseline: number;
  descender: number;
  midX: number;
  bodyTop: number;
  bodyMid: number;
  stroke: number;
  thin: number;
};

const FILL: SolidPaint = { type: "SOLID", color: { r: 0.05, g: 0.06, b: 0.08 } };
const INTER_STARTER_FONT_SIZE = 178;

export async function generateStarterGlyphs(style: StarterGlyphStyle = "Regular"): Promise<StarterGlyphResult> {
  const boardResult = await createGlyphBoard(style);
  const slotsByChar = collectSlotsByChar(boardResult.board);
  const warnings = [...boardResult.warnings];
  const starterFont = await loadInterStarterFont(boardResult.style, warnings);
  let filledSlots = 0;
  let skippedSlots = 0;

  for (const char of SUPPORTED_CHARS) {
    const slot = slotsByChar.get(char);
    if (!slot) {
      warnings.push(`Could not find ${glyphNameForChar(char)} after board update.`);
      continue;
    }

    if (slot.type !== "FRAME") {
      warnings.push(`${glyphNameForChar(char)} is not a frame, so no starter glyph was added.`);
      continue;
    }

    if (hasUserArtwork(slot)) {
      skippedSlots++;
      continue;
    }

    removeTypegenStarterArtwork(slot);
    addStarterGlyphToSlot(slot, char as GlyphChar, starterFont, warnings);
    filledSlots++;
  }

  figma.currentPage.selection = [boardResult.board];
  figma.viewport.scrollAndZoomIntoView([boardResult.board]);

  return {
    board: boardResult.board,
    filledSlots,
    skippedSlots,
    warnings,
  };
}

async function loadInterStarterFont(style: StarterGlyphStyle, warnings: string[]): Promise<FontName | null> {
  const requestedFont: FontName = { family: "Inter", style };
  try {
    await figma.loadFontAsync(requestedFont);
    return requestedFont;
  } catch {
    if (style === "Bold") {
      const regularFont: FontName = { family: "Inter", style: "Regular" };
      try {
        await figma.loadFontAsync(regularFont);
        warnings.push("Could not load Inter Bold for starter outlines. Used Inter Regular instead.");
        return regularFont;
      } catch {
        warnings.push("Could not load Inter Bold or Regular for starter outlines. Used geometric fallback glyphs instead.");
        return null;
      }
    }

    warnings.push("Could not load Inter Regular for starter outlines. Used geometric fallback glyphs instead.");
    return null;
  }
}

function collectSlotsByChar(board: FrameNode): Map<string, SceneNode> {
  const slots = new Map<string, SceneNode>();

  for (const child of board.children) {
    const char = glyphCharFromName(child.name);
    if (char && !slots.has(char)) {
      slots.set(char, child);
    }
  }

  return slots;
}

function hasUserArtwork(slot: FrameNode): boolean {
  return slot.children.some((child) => child.getPluginData(TYPEGEN_ROLE_KEY) !== TYPEGEN_ROLE_HELPER && !isTypegenStarterArtwork(child));
}

function isTypegenStarterArtwork(node: SceneNode): boolean {
  return node.name.startsWith("tg-starter-");
}

function removeTypegenStarterArtwork(slot: FrameNode): void {
  for (const child of [...slot.children]) {
    if (isTypegenStarterArtwork(child)) {
      child.remove();
    }
  }
}

function addStarterGlyphToSlot(slot: FrameNode, char: GlyphChar, starterFont: FontName | null, warnings: string[]): void {
  if (starterFont) {
    try {
      createInterStarterOutline(slot, char, starterFont);
      return;
    } catch {
      warnings.push(`${glyphNameForChar(char)} could not be generated, merged, and flattened from Inter. Used geometric fallback for that slot.`);
    }
  }

  const vector = createStarterVector(char);
  vector.name = `tg-starter-geometric-${starterFont?.style.toLowerCase() ?? "fallback"}-${safeNodeName(glyphLabelForChar(char))}`;
  slot.appendChild(vector);
}

function createInterStarterOutline(slot: FrameNode, char: GlyphChar, starterFont: FontName): void {
  const text = figma.createText();
  let flattened: VectorNode | null = null;
  let finalVector: VectorNode | null = null;

  try {
    text.name = `tg-inter-source-${safeNodeName(glyphLabelForChar(char))}`;
    text.fontName = starterFont;
    text.fontSize = INTER_STARTER_FONT_SIZE;
    text.textAutoResize = "WIDTH_AND_HEIGHT";
    text.characters = char;
    text.fills = [FILL];
    text.strokes = [];
    text.x = 0;
    text.y = 0;
    slot.appendChild(text);

    flattened = figma.flatten([text], slot);
    flattened.name = `tg-starter-inter-raw-${starterFont.style.toLowerCase()}-${safeNodeName(glyphLabelForChar(char))}`;
    flattened.fills = [FILL];
    flattened.strokes = [];

    finalVector = booleanMergeAndFlattenStarter(flattened, slot);
    finalVector.name = `tg-starter-inter-${starterFont.style.toLowerCase()}-${safeNodeName(glyphLabelForChar(char))}`;
    finalVector.fills = [FILL];
    finalVector.strokes = [];
    fitInterStarterVectorToSlot(finalVector, char);
  } catch (error) {
    if (finalVector?.parent) {
      finalVector.remove();
    }
    if (flattened?.parent) {
      flattened.remove();
    }
    if (text.parent) {
      text.remove();
    }
    throw error;
  }
}

function booleanMergeAndFlattenStarter(vector: VectorNode, slot: FrameNode): VectorNode {
  const vectorPaths = [...vector.vectorPaths];
  if (vectorPaths.length === 0) {
    return vector;
  }

  if (vectorPaths.length === 1) {
    try {
      const union = figma.union([vector], slot);
      return figma.flatten([union], slot);
    } catch {
      if (vector.parent) {
        return figma.flatten([vector], slot);
      }
      throw new Error("Inter starter outline could not be boolean-merged.");
    }
  }

  const parts: VectorNode[] = [];
  let union: BooleanOperationNode | null = null;

  try {
    for (const [index, path] of vectorPaths.entries()) {
      const part = figma.createVector();
      part.name = `${vector.name}-part-${index + 1}`;
      part.vectorPaths = [{ windingRule: path.windingRule, data: path.data }];
      part.fills = [FILL];
      part.strokes = [];
      part.x = vector.x;
      part.y = vector.y;
      slot.appendChild(part);
      parts.push(part);
    }

    vector.remove();

    union = figma.union(parts, slot);
    return figma.flatten([union], slot);
  } catch (error) {
    for (const part of parts) {
      if (part.parent) {
        part.remove();
      }
    }
    if (union?.parent) {
      union.remove();
    }
    throw error;
  }
}

function fitInterStarterVectorToSlot(vector: VectorNode, char: GlyphChar): void {
  const target = targetBoundsForChar(char);
  const metrics = createMetrics(unifiedVisualGuideProfileForChar(char));
  const sourceWidth = Math.max(1, vector.width);
  const sourceHeight = Math.max(1, vector.height);
  const targetWidth = Math.max(1, target.xMax - target.xMin);
  const targetHeight = Math.max(1, target.yMax - target.yMin);
  const scale = interStarterScaleForChar(char, targetWidth, targetHeight, sourceWidth, sourceHeight);
  const nextWidth = sourceWidth * scale;
  const nextHeight = sourceHeight * scale;

  vector.resizeWithoutConstraints(nextWidth, nextHeight);
  vector.x = target.xMin + (targetWidth - nextWidth) / 2;
  vector.y = interStarterYForChar(char, metrics, target, nextHeight);
}

function interStarterScaleForChar(
  char: GlyphChar,
  targetWidth: number,
  targetHeight: number,
  sourceWidth: number,
  sourceHeight: number,
): number {
  if (/[A-Za-z0-9]/.test(char)) {
    return 1;
  }

  return Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
}

function interStarterYForChar(
  char: GlyphChar,
  metrics: GlyphMetrics,
  target: { yMin: number; yMax: number },
  renderedHeight: number,
): number {
  if (/[A-Z0-9]/.test(char)) {
    return metrics.top;
  }

  if (/[a-z]/.test(char)) {
    if ("bdfhkl".includes(char)) {
      return metrics.top;
    }

    if ("gjpqy".includes(char)) {
      return metrics.descender - renderedHeight;
    }

    return metrics.baseline - renderedHeight;
  }

  return target.yMin + (target.yMax - target.yMin - renderedHeight) / 2;
}

function targetBoundsForChar(char: GlyphChar): { xMin: number; yMin: number; xMax: number; yMax: number } {
  const profile = unifiedVisualGuideProfileForChar(char);
  const metrics = createMetrics(profile);
  const sideInset = defaultSideInset(char, metrics);
  const vertical = verticalBoundsForChar(char, metrics);

  return {
    xMin: metrics.left + sideInset,
    yMin: vertical.top,
    xMax: metrics.right - sideInset,
    yMax: vertical.bottom,
  };
}

function verticalBoundsForChar(char: GlyphChar, metrics: GlyphMetrics): { top: number; bottom: number } {
  if (/[a-z]/.test(char)) {
    if ("bdfhkl".includes(char)) {
      return { top: metrics.top, bottom: metrics.baseline };
    }

    if ("gjpqy".includes(char)) {
      return { top: metrics.xHeight, bottom: metrics.descender };
    }

    if ("it".includes(char)) {
      return { top: metrics.top + 10, bottom: metrics.baseline };
    }

    return { top: metrics.xHeight, bottom: metrics.baseline };
  }

  if (".,".includes(char)) {
    return { top: metrics.baseline - 28, bottom: metrics.baseline };
  }

  if ("'\"".includes(char)) {
    return { top: metrics.top, bottom: metrics.top + 52 };
  }

  if (":".includes(char)) {
    return { top: metrics.bodyMid - 36, bottom: metrics.baseline };
  }

  if ("-+=/".includes(char)) {
    return { top: metrics.bodyMid - 44, bottom: metrics.bodyMid + 44 };
  }

  return { top: metrics.top, bottom: metrics.baseline };
}

function defaultSideInset(char: GlyphChar, metrics: GlyphMetrics): number {
  if ("ilI1!'\".,:".includes(char)) {
    return (metrics.right - metrics.left) * 0.28;
  }

  if ("mwMW@&".includes(char)) {
    return 0;
  }

  if ("()+-=/-".includes(char)) {
    return (metrics.right - metrics.left) * 0.12;
  }

  return (metrics.right - metrics.left) * 0.06;
}

function createStarterVector(char: GlyphChar): VectorNode {
  const vector = figma.createVector();
  vector.name = `tg-starter-${safeNodeName(glyphLabelForChar(char))}`;
  vector.vectorPaths = [
    {
      windingRule: "NONZERO",
      data: shapesToPathData(createStarterShapes(char)),
    },
  ];
  vector.fills = [FILL];
  vector.strokes = [];
  return vector;
}

function createStarterShapes(char: GlyphChar): Shape[] {
  const profile = unifiedVisualGuideProfileForChar(char);
  const metrics = createMetrics(profile);

  if (/[a-z]/.test(char)) {
    return lowercaseShapes(char, metrics);
  }

  if (/[A-Z]/.test(char)) {
    return uppercaseShapes(char, metrics);
  }

  if (/[0-9]/.test(char)) {
    return numberShapes(char, metrics);
  }

  return symbolShapes(char, metrics);
}

function createMetrics(profile: SlotGuideProfile): GlyphMetrics {
  const left = profile.leftBoundaryX;
  const right = profile.rightBoundaryX;
  const top = profile.ascenderY;
  const xHeight = profile.xHeightY ?? profile.ascenderY;
  const baseline = profile.baselineY;
  const descender = profile.descenderY ?? profile.baselineY;
  const stroke = profile.name === "lowercase" ? 13 : 15;

  return {
    left,
    right,
    top,
    xHeight,
    baseline,
    descender,
    midX: (left + right) / 2,
    bodyTop: profile.name === "lowercase" ? xHeight : top,
    bodyMid: (xHeight + baseline) / 2,
    stroke,
    thin: Math.max(7, Math.round(stroke * 0.72)),
  };
}

function uppercaseShapes(char: string, m: GlyphMetrics): Shape[] {
  const { left: l, right: r, top: t, baseline: b, stroke: s, thin, midX, bodyMid } = m;
  const midY = (t + b) / 2;

  switch (char) {
    case "A":
      return [slant(l, b, midX, t, s), slant(midX, t, r, b, s), rect(l + 24, midY + 8, r - 24, midY + 8 + thin)];
    case "B":
      return [rect(l, t, l + s, b), rect(l, t, r - 14, t + s), rect(l, midY - s / 2, r - 8, midY + s / 2), rect(l, b - s, r - 18, b), rect(r - s, t + 8, r, midY), rect(r - s, midY, r, b - 8)];
    case "C":
      return [rect(l, t + 6, r, t + s + 6), rect(l, t + 6, l + s, b - 6), rect(l, b - s - 6, r, b - 6)];
    case "D":
      return [rect(l, t, l + s, b), rect(l, t, r - 18, t + s), rect(l, b - s, r - 18, b), rect(r - s, t + 14, r, b - 14)];
    case "E":
      return [rect(l, t, l + s, b), rect(l, t, r, t + s), rect(l, midY - thin / 2, r - 16, midY + thin / 2), rect(l, b - s, r, b)];
    case "F":
      return [rect(l, t, l + s, b), rect(l, t, r, t + s), rect(l, midY - thin / 2, r - 18, midY + thin / 2)];
    case "G":
      return [rect(l, t + 6, r, t + s + 6), rect(l, t + 6, l + s, b - 6), rect(l, b - s - 6, r, b - 6), rect(r - s, midY, r, b - 6), rect(midX, midY, r, midY + thin)];
    case "H":
      return [rect(l, t, l + s, b), rect(r - s, t, r, b), rect(l, midY - thin / 2, r, midY + thin / 2)];
    case "I":
      return [rect(l + 18, t, r - 18, t + s), rect(midX - s / 2, t, midX + s / 2, b), rect(l + 18, b - s, r - 18, b)];
    case "J":
      return [rect(l + 20, t, r, t + s), rect(r - s, t, r, b - 18), rect(l + 20, b - s, r - s, b), rect(l + 20, b - 36, l + 20 + s, b - s)];
    case "K":
      return [rect(l, t, l + s, b), slant(l + s, midY, r, t, s), slant(l + s, midY, r, b, s)];
    case "L":
      return [rect(l, t, l + s, b), rect(l, b - s, r, b)];
    case "M":
      return [rect(l, t, l + s, b), rect(r - s, t, r, b), slant(l + s, t, midX, b - 38, thin), slant(r - s, t, midX, b - 38, thin)];
    case "N":
      return [rect(l, t, l + s, b), rect(r - s, t, r, b), slant(l + s, t, r - s, b, s)];
    case "O":
      return ring(l, t, r, b, s);
    case "P":
      return [rect(l, t, l + s, b), rect(l, t, r - 12, t + s), rect(l, midY - s / 2, r - 12, midY + s / 2), rect(r - s, t + 8, r, midY)];
    case "Q":
      return [...ring(l, t, r, b, s), slant(midX, bodyMid, r + 4, b + 4, thin)];
    case "R":
      return [rect(l, t, l + s, b), rect(l, t, r - 12, t + s), rect(l, midY - s / 2, r - 12, midY + s / 2), rect(r - s, t + 8, r, midY), slant(midX, midY, r, b, s)];
    case "S":
      return [rect(l + 8, t, r, t + s), rect(l, t, l + s, midY), rect(l + 8, midY - thin / 2, r - 8, midY + thin / 2), rect(r - s, midY, r, b), rect(l, b - s, r - 8, b)];
    case "T":
      return [rect(l, t, r, t + s), rect(midX - s / 2, t, midX + s / 2, b)];
    case "U":
      return [rect(l, t, l + s, b - 12), rect(r - s, t, r, b - 12), rect(l + s, b - s, r - s, b)];
    case "V":
      return [slant(l, t, midX, b, s), slant(r, t, midX, b, s)];
    case "W":
      return [slant(l, t, l + 25, b, s), slant(l + 25, b, midX, t + 36, thin), slant(midX, t + 36, r - 25, b, thin), slant(r, t, r - 25, b, s)];
    case "X":
      return [slant(l, t, r, b, s), slant(r, t, l, b, s)];
    case "Y":
      return [slant(l, t, midX, midY + 4, s), slant(r, t, midX, midY + 4, s), rect(midX - s / 2, midY, midX + s / 2, b)];
    case "Z":
      return [rect(l, t, r, t + s), slant(r - 4, t, l + 4, b, s), rect(l, b - s, r, b)];
    default:
      return ring(l, t, r, b, s);
  }
}

function lowercaseShapes(char: string, m: GlyphMetrics): Shape[] {
  const { left: l, right: r, top: asc, baseline: b, descender: d, stroke: s, thin, bodyTop: xh, bodyMid, midX } = m;
  const narrowL = l + 22;

  switch (char) {
    case "a":
      return [...ring(l + 8, xh, r - 8, b, s), rect(r - s - 8, xh, r - 8, b)];
    case "b":
      return [rect(l, asc, l + s, b), ...ring(l + 8, xh, r, b, s)];
    case "c":
      return [rect(l + 8, xh + 4, r - 8, xh + s + 4), rect(l + 8, xh + 4, l + 8 + s, b - 4), rect(l + 8, b - s - 4, r - 8, b - 4)];
    case "d":
      return [rect(r - s, asc, r, b), ...ring(l, xh, r - 8, b, s)];
    case "e":
      return [...lowercaseShapes("c", m), rect(l + 20, bodyMid - thin / 2, r - 8, bodyMid + thin / 2)];
    case "f":
      return [rect(midX - s / 2, asc, midX + s / 2, b), rect(midX - s / 2, asc, r - 12, asc + s), rect(l + 16, xh + 18, r - 18, xh + 18 + thin)];
    case "g":
      return [...ring(l + 8, xh, r - 8, b, s), rect(r - s - 8, xh, r - 8, d - 10), rect(l + 24, d - s, r - 8, d)];
    case "h":
      return [rect(l, asc, l + s, b), rect(l + s, xh, r - s, xh + s), rect(r - s, xh, r, b)];
    case "i":
      return [rect(midX - thin / 2, asc + 2, midX + thin / 2, asc + 2 + thin), rect(midX - s / 2, xh, midX + s / 2, b)];
    case "j":
      return [rect(midX - thin / 2, asc + 2, midX + thin / 2, asc + 2 + thin), rect(midX - s / 2, xh, midX + s / 2, d - 12), rect(narrowL, d - s, midX + s / 2, d)];
    case "k":
      return [rect(l, asc, l + s, b), slant(l + s, bodyMid, r, xh, s), slant(l + s, bodyMid, r, b, s)];
    case "l":
      return [rect(midX - s / 2, asc, midX + s / 2, b)];
    case "m":
      return [rect(l, xh, l + s, b), rect(midX - s / 2, xh + 8, midX + s / 2, b), rect(r - s, xh + 8, r, b), rect(l, xh, r, xh + s)];
    case "n":
      return [rect(l, xh, l + s, b), rect(l, xh, r - s, xh + s), rect(r - s, xh + 8, r, b)];
    case "o":
      return ring(l + 8, xh, r - 8, b, s);
    case "p":
      return [rect(l, xh, l + s, d), ...ring(l + 8, xh, r, b, s)];
    case "q":
      return [rect(r - s, xh, r, d), ...ring(l, xh, r - 8, b, s)];
    case "r":
      return [rect(l, xh, l + s, b), rect(l, xh, r - 20, xh + s), rect(r - 20 - s, xh + 6, r - 20, bodyMid)];
    case "s":
      return [rect(l + 10, xh, r - 8, xh + s), rect(l + 8, xh, l + 8 + s, bodyMid), rect(l + 10, bodyMid - thin / 2, r - 10, bodyMid + thin / 2), rect(r - s - 8, bodyMid, r - 8, b), rect(l + 8, b - s, r - 10, b)];
    case "t":
      return [rect(midX - s / 2, asc + 20, midX + s / 2, b), rect(l + 20, xh + 18, r - 16, xh + 18 + thin), rect(midX - s / 2, b - s, r - 18, b)];
    case "u":
      return [rect(l, xh, l + s, b - 8), rect(r - s, xh, r, b), rect(l + s, b - s, r, b)];
    case "v":
      return [slant(l, xh, midX, b, s), slant(r, xh, midX, b, s)];
    case "w":
      return [slant(l, xh, l + 24, b, s), slant(l + 24, b, midX, xh + 28, thin), slant(midX, xh + 28, r - 24, b, thin), slant(r, xh, r - 24, b, s)];
    case "x":
      return [slant(l + 6, xh, r - 6, b, s), slant(r - 6, xh, l + 6, b, s)];
    case "y":
      return [slant(l, xh, midX, b, s), slant(r, xh, midX - 6, d, s)];
    case "z":
      return [rect(l + 8, xh, r - 8, xh + s), slant(r - 10, xh, l + 10, b, s), rect(l + 8, b - s, r - 8, b)];
    default:
      return ring(l, xh, r, b, s);
  }
}

function numberShapes(char: string, m: GlyphMetrics): Shape[] {
  const { left: l, right: r, top: t, baseline: b, stroke: s, thin, midX } = m;
  const midY = (t + b) / 2;

  switch (char) {
    case "0":
      return ring(l, t, r, b, s);
    case "1":
      return [rect(midX - s / 2, t + 6, midX + s / 2, b), slant(l + 24, t + 28, midX - s / 2, t + 6, s), rect(l + 24, b - s, r - 20, b)];
    case "2":
      return [rect(l + 8, t, r - 8, t + s), rect(r - s - 8, t, r - 8, midY), rect(l + 8, midY - thin / 2, r - 8, midY + thin / 2), rect(l + 8, midY, l + 8 + s, b), rect(l + 8, b - s, r - 8, b)];
    case "3":
      return [rect(l + 8, t, r - 8, t + s), rect(l + 16, midY - thin / 2, r - 8, midY + thin / 2), rect(l + 8, b - s, r - 8, b), rect(r - s - 8, t, r - 8, b)];
    case "4":
      return [rect(l + 8, t, l + 8 + s, midY + 10), rect(r - s - 8, t, r - 8, b), rect(l + 8, midY, r - 8, midY + s)];
    case "5":
      return [rect(l + 8, t, r - 8, t + s), rect(l + 8, t, l + 8 + s, midY), rect(l + 8, midY - thin / 2, r - 8, midY + thin / 2), rect(r - s - 8, midY, r - 8, b), rect(l + 8, b - s, r - 8, b)];
    case "6":
      return [...ring(l + 8, midY - 6, r - 8, b, s), rect(l + 8, t, l + 8 + s, midY), rect(l + 8, t, r - 8, t + s)];
    case "7":
      return [rect(l + 8, t, r - 8, t + s), slant(r - 8, t, midX - 8, b, s)];
    case "8":
      return [...ring(l + 8, t, r - 8, midY + 8, s), ...ring(l + 8, midY - 8, r - 8, b, s)];
    case "9":
      return [...ring(l + 8, t, r - 8, midY + 8, s), rect(r - s - 8, midY, r - 8, b), rect(l + 8, b - s, r - 8, b)];
    default:
      return ring(l, t, r, b, s);
  }
}

function symbolShapes(char: string, m: GlyphMetrics): Shape[] {
  const { left: l, right: r, top: t, baseline: b, stroke: s, thin, midX, bodyMid } = m;
  const midY = (t + b) / 2;

  switch (char) {
    case ".":
      return [rect(midX - s / 2, b - s, midX + s / 2, b)];
    case ",":
      return [rect(midX - s / 2, b - s, midX + s / 2, b), slant(midX + s / 2, b - 2, midX - s / 2, b + 28, thin)];
    case "!":
      return [rect(midX - thin / 2, t, midX + thin / 2, b - 34), rect(midX - thin / 2, b - thin, midX + thin / 2, b)];
    case "?":
      return [rect(l + 16, t, r - 16, t + s), rect(r - s - 16, t, r - 16, midY), rect(midX - thin / 2, midY - thin / 2, r - 16, midY + thin / 2), rect(midX - thin / 2, midY, midX + thin / 2, b - 34), rect(midX - thin / 2, b - thin, midX + thin / 2, b)];
    case "-":
      return [rect(l + 16, midY - thin / 2, r - 16, midY + thin / 2)];
    case ":":
      return [rect(midX - thin / 2, midY - 30, midX + thin / 2, midY - 30 + thin), rect(midX - thin / 2, b - thin, midX + thin / 2, b)];
    case "'":
      return [rect(midX - thin / 2, t, midX + thin / 2, t + 38)];
    case '"':
      return [rect(midX - 18, t, midX - 18 + thin, t + 38), rect(midX + 10, t, midX + 10 + thin, t + 38)];
    case "/":
      return [slant(r - 10, t, l + 10, b, s)];
    case "(":
      return [rect(l + 30, t + 10, r - 26, t + 10 + thin), rect(l + 18, t + 20, l + 18 + thin, b - 20), rect(l + 30, b - 10 - thin, r - 26, b - 10)];
    case ")":
      return [rect(l + 26, t + 10, r - 30, t + 10 + thin), rect(r - 18 - thin, t + 20, r - 18, b - 20), rect(l + 26, b - 10 - thin, r - 30, b - 10)];
    case "&":
      return [...ring(l + 8, t + 6, r - 26, midY + 14, thin), ...ring(l + 8, midY - 10, r - 8, b, thin), slant(midX, bodyMid, r, b, thin)];
    case "+":
      return [rect(midX - thin / 2, midY - 34, midX + thin / 2, midY + 34), rect(l + 18, midY - thin / 2, r - 18, midY + thin / 2)];
    case "=":
      return [rect(l + 18, midY - 22, r - 18, midY - 22 + thin), rect(l + 18, midY + 22, r - 18, midY + 22 + thin)];
    case "@":
      return [...ring(l, t, r, b, thin), ...ring(l + 26, midY - 30, r - 24, b - 22, thin), rect(r - 34, midY - 30, r - 24, b - 18)];
    default:
      return [rect(l, t, r, b)];
  }
}

function ring(left: number, top: number, right: number, bottom: number, stroke: number): Shape[] {
  return [
    rect(left, top, right, top + stroke),
    rect(left, top, left + stroke, bottom),
    rect(right - stroke, top, right, bottom),
    rect(left, bottom - stroke, right, bottom),
  ];
}

function rect(x1: number, y1: number, x2: number, y2: number): Shape {
  return [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 },
  ];
}

function slant(x1: number, y1: number, x2: number, y2: number, width: number): Shape {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const offsetX = (-dy / length) * (width / 2);
  const offsetY = (dx / length) * (width / 2);

  return [
    { x: x1 + offsetX, y: y1 + offsetY },
    { x: x2 + offsetX, y: y2 + offsetY },
    { x: x2 - offsetX, y: y2 - offsetY },
    { x: x1 - offsetX, y: y1 - offsetY },
  ];
}

function shapesToPathData(shapes: Shape[]): string {
  return shapes
    .map((shape) => {
      const [first, ...rest] = shape;
      return [`M ${round(first.x)} ${round(first.y)}`, ...rest.map((point) => `L ${round(point.x)} ${round(point.y)}`), "Z"].join(" ");
    })
    .join(" ");
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function safeNodeName(label: string): string {
  return label
    .replace(/'/g, "apostrophe")
    .replace(/"/g, "quote")
    .replace(/\//g, "slash")
    .replace(/\(/g, "paren-left")
    .replace(/\)/g, "paren-right")
    .replace(/&/g, "ampersand")
    .replace(/\+/g, "plus")
    .replace(/=/g, "equals")
    .replace(/@/g, "at")
    .replace(/[^A-Za-z0-9.-]/g, "-");
}
