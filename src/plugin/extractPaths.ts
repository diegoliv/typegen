import { GlyphCommand, GlyphModel, NormalizedPath, glyphNameForChar } from "./pluginTypes";
import {
  UPPERCASE_GUIDE_PROFILE,
  defaultAdvanceForChar,
  unifiedVisualGuideProfileForChar,
  type GlyphChar,
  type SlotGuideProfile,
} from "../shared/types";

type ExtractionIssue = {
  level: "warning" | "error";
  message: string;
};

export type ExtractedGlyph = {
  glyph?: GlyphModel;
  issues: ExtractionIssue[];
  vectorCount: number;
};

type Point = { x: number; y: number };
export type Bounds = { xMin: number; yMin: number; xMax: number; yMax: number };

const COMMAND_RE = /[MmLlHhVvCcQqZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const FONT_UNITS = 1000;
const CAP_HEIGHT = 700;
const SLOT_BOUNDS_TOLERANCE = 1;
const TINY_GLYPH_SIZE = 8;
const FONT_LEFT_BEARING = 40;

export function extractGlyphFromNode(node: SceneNode, char: string): ExtractedGlyph {
  const issues: ExtractionIssue[] = [];
  const vectors: VectorNode[] = [];
  const glyphName = glyphNameForChar(char);

  collectSupportedVectors(node, vectors, issues);

  if (issues.some((issue) => issue.level === "error")) {
    return { issues, vectorCount: vectors.length };
  }

  if (vectors.length === 0) {
    return { issues, vectorCount: 0 };
  }

  const rawPaths: NormalizedPath[] = [];
  let rawBounds: Bounds | null = null;

  for (const vector of vectors) {
    for (const path of vector.vectorPaths) {
      // Counters work best when the user flattens compound glyphs into simple vector paths.
      // Boolean nodes remain unsupported because their winding can differ from exported font contours.
      const commands = parseSvgPathData(path.data, vector.absoluteTransform);
      if (commands.length === 0) {
        issues.push({ level: "warning", message: `${char}: skipped an empty vector path.` });
        continue;
      }

      rawPaths.push({
        commands,
        windingRule: path.windingRule === "EVENODD" ? "EVENODD" : "NONZERO",
      });
      rawBounds = mergeBounds(rawBounds, boundsForCommands(commands));
    }
  }

  if (rawPaths.length === 0 || !rawBounds) {
    return {
      issues: [...issues, { level: "error", message: `Glyph ${char} contains vector layers, but no usable path data was found.` }],
      vectorCount: vectors.length,
    };
  }

  const slotBounds = "children" in node ? boundsForNode(node) : null;
  issues.push(...validateRawGeometry(char, glyphName, rawBounds, slotBounds));

  const guideProfile = unifiedVisualGuideProfileForChar(char as GlyphChar);
  const normalized = slotBounds
    ? normalizePathsForSlotMetrics(rawPaths, slotBounds, guideProfile)
    : normalizePaths(rawPaths, rawBounds);
  const slotAdvanceWidth = readSlotFrameAdvanceWidth(normalized);
  const advanceWidth = slotAdvanceWidth ?? resolveExtractedAdvanceWidth(char, normalized.bounds);
  const fitted = slotAdvanceWidth === null
    ? shouldFitGlyphToAdvance(char)
      ? fitPathsToAdvance(normalized, advanceWidth)
      : normalized
    : centerSlotPathsToAdvance(normalized, resolveSlotAdvanceWidth(char, normalized.bounds), slotAdvanceWidth);
  const finalAdvanceWidth = slotAdvanceWidth === null ? advanceWidth : resolveSlotAdvanceWidth(char, normalized.bounds);

  return {
    issues,
    vectorCount: vectors.length,
    glyph: {
      char,
      unicode: char.codePointAt(0) ?? 0,
      name: glyphName,
      advanceWidth: finalAdvanceWidth,
      bounds: fitted.bounds,
      paths: fitted.paths,
      warnings: issues.filter((issue) => issue.level === "warning").map((issue) => issue.message),
    },
  };
}

function readSlotFrameAdvanceWidth(
  normalized: { paths: NormalizedPath[]; bounds: GlyphModel["bounds"] } | { paths: NormalizedPath[]; bounds: GlyphModel["bounds"]; frameAdvanceWidth: number },
): number | null {
  return "frameAdvanceWidth" in normalized ? normalized.frameAdvanceWidth : null;
}

function resolveExtractedAdvanceWidth(char: string, bounds: GlyphModel["bounds"]): number {
  const defaultAdvance = defaultAdvanceForChar(char as GlyphChar);
  if (defaultAdvance < 700) {
    return defaultAdvance;
  }

  return Math.max(defaultAdvance, bounds.xMax + 80);
}

function resolveSlotAdvanceWidth(char: string, bounds: GlyphModel["bounds"]): number {
  const defaultAdvance = defaultAdvanceForChar(char as GlyphChar);
  if (defaultAdvance < 700) {
    return defaultAdvance;
  }

  const glyphWidth = Math.max(1, bounds.xMax - bounds.xMin);
  return Math.max(120, Math.min(1400, Math.round(glyphWidth + 80)));
}

function shouldFitGlyphToAdvance(char: string): boolean {
  return defaultAdvanceForChar(char as GlyphChar) < 700;
}

function collectSupportedVectors(node: SceneNode, vectors: VectorNode[], issues: ExtractionIssue[]): void {
  if (!node.visible) {
    issues.push({ level: "warning", message: `${node.name}: hidden layer ignored.` });
    return;
  }

  if (node.getPluginData("typegen-role") === "helper") {
    return;
  }

  if (node.type === "TEXT") {
    issues.push({ level: "error", message: `${node.name}: text layers are unsupported. Convert text to vector outlines first.` });
    return;
  }

  if (node.type === "RECTANGLE" && node.getPluginData("typegen-role") === "helper") {
    return;
  }

  if (node.type === "SLICE") {
    issues.push({ level: "error", message: `${node.name}: unsupported layer type ${node.type}. Use simple filled vector paths.` });
    return;
  }

  if ("effects" in node && node.effects.length > 0) {
    issues.push({ level: "error", message: `${node.name}: effects are unsupported in the MVP. Remove effects before exporting.` });
    return;
  }

  if (node.type === "VECTOR") {
    if (hasVisibleStrokes(node)) {
      issues.push({ level: "error", message: `${node.name}: contains strokes. Expand strokes before exporting.` });
      return;
    }

    if (!hasSimpleVisibleFill(node)) {
      issues.push({ level: "error", message: `${node.name}: use simple filled vector shapes.` });
      return;
    }

    vectors.push(node);
    return;
  }

  if (node.type === "BOOLEAN_OPERATION") {
    issues.push({
      level: "error",
      message: `${node.name}: boolean operations are unsupported in V0.2. Flatten or convert to vector outlines first.`,
    });
    return;
  }

  if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR" || node.type === "LINE") {
    const hasImageFill = "fills" in node && Array.isArray(node.fills) && node.fills.some((paint) => paint.visible !== false && paint.type === "IMAGE");
    issues.push({
      level: "error",
      message: hasImageFill
        ? `${node.name}: image fills are unsupported. Use filled vector paths.`
        : `${node.name}: convert shape layers to vector outlines before scanning.`,
    });
    return;
  }

  if ("children" in node) {
    for (const child of node.children) {
      collectSupportedVectors(child, vectors, issues);
    }
    return;
  }
}

function hasVisibleStrokes(node: VectorNode): boolean {
  return Array.isArray(node.strokes) && node.strokes.some((paint) => paint.visible !== false);
}

function hasSimpleVisibleFill(node: VectorNode): boolean {
  if (!Array.isArray(node.fills)) {
    return false;
  }

  const visibleFills = node.fills.filter((paint) => paint.visible !== false);
  return visibleFills.length > 0 && visibleFills.every((paint) => paint.type === "SOLID");
}

function parseSvgPathData(data: string, transform: Transform): GlyphCommand[] {
  const tokens = data.match(COMMAND_RE) ?? [];
  const commands: GlyphCommand[] = [];
  let index = 0;
  let current = { x: 0, y: 0 };
  let activeCommand = "";

  while (index < tokens.length) {
    const token = tokens[index++];
    if (isCommandToken(token)) {
      activeCommand = token;
    } else {
      index--;
    }

    switch (activeCommand) {
      case "M":
      case "m": {
        const point = readPoint(tokens, index, current, activeCommand === "m");
        index += 2;
        current = point;
        commands.push({ type: "M", ...applyTransform(point, transform) });
        activeCommand = activeCommand === "m" ? "l" : "L";
        break;
      }
      case "L":
      case "l": {
        const point = readPoint(tokens, index, current, activeCommand === "l");
        index += 2;
        current = point;
        commands.push({ type: "L", ...applyTransform(point, transform) });
        break;
      }
      case "H":
      case "h": {
        const x = Number(tokens[index++]);
        current = { x: activeCommand === "h" ? current.x + x : x, y: current.y };
        commands.push({ type: "L", ...applyTransform(current, transform) });
        break;
      }
      case "V":
      case "v": {
        const y = Number(tokens[index++]);
        current = { x: current.x, y: activeCommand === "v" ? current.y + y : y };
        commands.push({ type: "L", ...applyTransform(current, transform) });
        break;
      }
      case "C":
      case "c": {
        const relative = activeCommand === "c";
        const p1 = readPoint(tokens, index, current, relative);
        const p2 = readPoint(tokens, index + 2, current, relative);
        const point = readPoint(tokens, index + 4, current, relative);
        index += 6;
        current = point;
        const a = applyTransform(p1, transform);
        const b = applyTransform(p2, transform);
        const c = applyTransform(point, transform);
        commands.push({ type: "C", x1: a.x, y1: a.y, x2: b.x, y2: b.y, x: c.x, y: c.y });
        break;
      }
      case "Q":
      case "q": {
        const relative = activeCommand === "q";
        const p1 = readPoint(tokens, index, current, relative);
        const point = readPoint(tokens, index + 2, current, relative);
        index += 4;
        current = point;
        const a = applyTransform(p1, transform);
        const b = applyTransform(point, transform);
        commands.push({ type: "Q", x1: a.x, y1: a.y, x: b.x, y: b.y });
        break;
      }
      case "Z":
      case "z":
        commands.push({ type: "Z" });
        break;
      default:
        index++;
        break;
    }
  }

  return commands;
}

function readPoint(tokens: string[], index: number, current: Point, relative: boolean): Point {
  const x = Number(tokens[index]);
  const y = Number(tokens[index + 1]);
  return relative ? { x: current.x + x, y: current.y + y } : { x, y };
}

function isCommandToken(token: string): boolean {
  return /^[A-Za-z]$/.test(token);
}

function applyTransform(point: Point, transform: Transform): Point {
  return {
    x: transform[0][0] * point.x + transform[0][1] * point.y + transform[0][2],
    y: transform[1][0] * point.x + transform[1][1] * point.y + transform[1][2],
  };
}

function validateRawGeometry(
  char: string,
  glyphName: string,
  rawBounds: Bounds,
  slotBounds: Bounds | null,
): ExtractionIssue[] {
  const issues: ExtractionIssue[] = [];
  const rawWidth = rawBounds.xMax - rawBounds.xMin;
  const rawHeight = rawBounds.yMax - rawBounds.yMin;

  if (rawWidth < TINY_GLYPH_SIZE || rawHeight < TINY_GLYPH_SIZE) {
    issues.push({
      level: "warning",
      message: `Glyph ${char} vector bounds are very small (${Math.round(rawWidth)}x${Math.round(rawHeight)} px). Scale the outline inside the slot for better output.`,
    });
  }

  if (slotBounds && extendsOutside(rawBounds, slotBounds, SLOT_BOUNDS_TOLERANCE)) {
    issues.push({
      level: "warning",
      message: `Glyph ${char} artwork extends outside ${glyphName} slot bounds. Move or resize it inside the slot before exporting.`,
    });
  }

  return issues;
}

function boundsForCommands(commands: GlyphCommand[]): Bounds {
  const points: Point[] = [];
  for (const command of commands) {
    if (command.type === "M" || command.type === "L") {
      points.push({ x: command.x, y: command.y });
    } else if (command.type === "C") {
      points.push({ x: command.x1, y: command.y1 }, { x: command.x2, y: command.y2 }, { x: command.x, y: command.y });
    } else if (command.type === "Q") {
      points.push({ x: command.x1, y: command.y1 }, { x: command.x, y: command.y });
    }
  }

  return {
    xMin: Math.min(...points.map((point) => point.x)),
    yMin: Math.min(...points.map((point) => point.y)),
    xMax: Math.max(...points.map((point) => point.x)),
    yMax: Math.max(...points.map((point) => point.y)),
  };
}

function mergeBounds(
  a: Bounds | null,
  b: Bounds,
): Bounds {
  if (!a) return b;
  return {
    xMin: Math.min(a.xMin, b.xMin),
    yMin: Math.min(a.yMin, b.yMin),
    xMax: Math.max(a.xMax, b.xMax),
    yMax: Math.max(a.yMax, b.yMax),
  };
}

function normalizePaths(
  paths: NormalizedPath[],
  bounds: Bounds,
): { paths: NormalizedPath[]; bounds: GlyphModel["bounds"] } {
  const width = Math.max(1, bounds.xMax - bounds.xMin);
  const height = Math.max(1, bounds.yMax - bounds.yMin);
  const scale = Math.min((FONT_UNITS * 0.72) / width, CAP_HEIGHT / height);
  const leftBearing = 40;

  const normalizedPaths = paths.map((path) => ({
    windingRule: path.windingRule,
    commands: path.commands.map((command) => normalizeCommand(command, bounds, scale, leftBearing)),
  }));

  const normalizedBounds = normalizedPaths.reduce<GlyphModel["bounds"] | null>((acc, path) => {
    const pathBounds = boundsForCommands(path.commands);
    return mergeBounds(acc, pathBounds);
  }, null);

  return {
    paths: normalizedPaths,
    bounds: normalizedBounds ?? { xMin: 0, yMin: 0, xMax: 0, yMax: 0 },
  };
}

export function normalizePathsForSlotMetrics(
  paths: NormalizedPath[],
  slotBounds: Bounds,
  guideProfile: SlotGuideProfile = UPPERCASE_GUIDE_PROFILE,
): { paths: NormalizedPath[]; bounds: GlyphModel["bounds"]; frameAdvanceWidth: number } {
  const slotWidth = Math.max(1, slotBounds.xMax - slotBounds.xMin);
  const slotHeight = Math.max(1, slotBounds.yMax - slotBounds.yMin);
  const designLeft = slotBounds.xMin + slotWidth * (guideProfile.leftBoundaryX / guideProfile.slotWidth);
  const ascenderY = slotBounds.yMin + slotHeight * (guideProfile.ascenderY / guideProfile.slotHeight);
  const baselineY = slotBounds.yMin + slotHeight * (guideProfile.baselineY / guideProfile.slotHeight);
  const designHeight = Math.max(1, baselineY - ascenderY);
  const scale = guideProfile.ascenderUnits / designHeight;
  const designWidth = slotWidth * ((guideProfile.rightBoundaryX - guideProfile.leftBoundaryX) / guideProfile.slotWidth);
  const frameAdvanceWidth = Math.round(designWidth * scale + FONT_LEFT_BEARING * 2);

  const normalizedPaths = paths.map((path) => ({
    windingRule: path.windingRule,
    commands: path.commands.map((command) =>
      normalizeCommandToSlotMetrics(command, designLeft, baselineY, scale),
    ),
  }));

  const normalizedBounds = normalizedPaths.reduce<GlyphModel["bounds"] | null>((acc, path) => {
    const pathBounds = boundsForCommands(path.commands);
    return mergeBounds(acc, pathBounds);
  }, null);

  return {
    paths: normalizedPaths,
    bounds: normalizedBounds ?? { xMin: 0, yMin: 0, xMax: 0, yMax: 0 },
    frameAdvanceWidth,
  };
}

function centerSlotPathsToAdvance(
  normalized: { paths: NormalizedPath[]; bounds: GlyphModel["bounds"] },
  advanceWidth: number,
  frameAdvanceWidth: number,
): { paths: NormalizedPath[]; bounds: GlyphModel["bounds"] } {
  const dx = Math.round(advanceWidth / 2 - frameAdvanceWidth / 2);

  if (dx === 0) {
    return normalized;
  }

  return {
    paths: normalized.paths.map((path) => ({
      windingRule: path.windingRule,
      commands: path.commands.map((command) => shiftCommandX(command, dx)),
    })),
    bounds: {
      xMin: normalized.bounds.xMin + dx,
      yMin: normalized.bounds.yMin,
      xMax: normalized.bounds.xMax + dx,
      yMax: normalized.bounds.yMax,
    },
  };
}

export function fitPathsToAdvance(
  normalized: { paths: NormalizedPath[]; bounds: GlyphModel["bounds"] },
  advanceWidth: number,
): { paths: NormalizedPath[]; bounds: GlyphModel["bounds"] } {
  const glyphWidth = normalized.bounds.xMax - normalized.bounds.xMin;
  if (!Number.isFinite(glyphWidth) || glyphWidth <= 0 || !Number.isFinite(advanceWidth) || advanceWidth <= 0) {
    return normalized;
  }

  const targetLeft = Math.max(0, Math.round((advanceWidth - glyphWidth) / 2));
  const dx = targetLeft - normalized.bounds.xMin;

  if (dx === 0) {
    return normalized;
  }

  return {
    paths: normalized.paths.map((path) => ({
      windingRule: path.windingRule,
      commands: path.commands.map((command) => shiftCommandX(command, dx)),
    })),
    bounds: {
      xMin: normalized.bounds.xMin + dx,
      yMin: normalized.bounds.yMin,
      xMax: normalized.bounds.xMax + dx,
      yMax: normalized.bounds.yMax,
    },
  };
}

function normalizeCommand(
  command: GlyphCommand,
  bounds: Bounds,
  scale: number,
  leftBearing: number,
): GlyphCommand {
  const mapPoint = (point: Point): Point => ({
    x: Math.round((point.x - bounds.xMin) * scale + leftBearing),
    y: Math.round((bounds.yMax - point.y) * scale),
  });

  if (command.type === "M" || command.type === "L") {
    return { type: command.type, ...mapPoint(command) };
  }

  if (command.type === "C") {
    const p1 = mapPoint({ x: command.x1, y: command.y1 });
    const p2 = mapPoint({ x: command.x2, y: command.y2 });
    const p = mapPoint({ x: command.x, y: command.y });
    return { type: "C", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x: p.x, y: p.y };
  }

  if (command.type === "Q") {
    const p1 = mapPoint({ x: command.x1, y: command.y1 });
    const p = mapPoint({ x: command.x, y: command.y });
    return { type: "Q", x1: p1.x, y1: p1.y, x: p.x, y: p.y };
  }

  return command;
}

function normalizeCommandToSlotMetrics(
  command: GlyphCommand,
  designLeft: number,
  baselineY: number,
  scale: number,
): GlyphCommand {
  const mapPoint = (point: Point): Point => ({
    x: Math.round((point.x - designLeft) * scale + FONT_LEFT_BEARING),
    y: Math.round((baselineY - point.y) * scale),
  });

  if (command.type === "M" || command.type === "L") {
    return { type: command.type, ...mapPoint(command) };
  }

  if (command.type === "C") {
    const p1 = mapPoint({ x: command.x1, y: command.y1 });
    const p2 = mapPoint({ x: command.x2, y: command.y2 });
    const p = mapPoint({ x: command.x, y: command.y });
    return { type: "C", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x: p.x, y: p.y };
  }

  if (command.type === "Q") {
    const p1 = mapPoint({ x: command.x1, y: command.y1 });
    const p = mapPoint({ x: command.x, y: command.y });
    return { type: "Q", x1: p1.x, y1: p1.y, x: p.x, y: p.y };
  }

  return command;
}

function shiftCommandX(command: GlyphCommand, dx: number): GlyphCommand {
  if (command.type === "M" || command.type === "L") {
    return { ...command, x: command.x + dx };
  }

  if (command.type === "C") {
    return {
      ...command,
      x1: command.x1 + dx,
      x2: command.x2 + dx,
      x: command.x + dx,
    };
  }

  if (command.type === "Q") {
    return {
      ...command,
      x1: command.x1 + dx,
      x: command.x + dx,
    };
  }

  return command;
}

function boundsForNode(node: SceneNode): Bounds | null {
  if (!("width" in node) || !("height" in node)) {
    return null;
  }

  const transform = node.absoluteTransform;
  const corners = [
    applyTransform({ x: 0, y: 0 }, transform),
    applyTransform({ x: node.width, y: 0 }, transform),
    applyTransform({ x: node.width, y: node.height }, transform),
    applyTransform({ x: 0, y: node.height }, transform),
  ];

  return {
    xMin: Math.min(...corners.map((point) => point.x)),
    yMin: Math.min(...corners.map((point) => point.y)),
    xMax: Math.max(...corners.map((point) => point.x)),
    yMax: Math.max(...corners.map((point) => point.y)),
  };
}

function extendsOutside(inner: Bounds, outer: Bounds, tolerance: number): boolean {
  return (
    inner.xMin < outer.xMin - tolerance ||
    inner.yMin < outer.yMin - tolerance ||
    inner.xMax > outer.xMax + tolerance ||
    inner.yMax > outer.yMax + tolerance
  );
}
