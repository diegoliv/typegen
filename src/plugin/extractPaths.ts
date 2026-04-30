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
type VectorSource = {
  vector: VectorNode;
  temporary: boolean;
  cleanupNodes?: BaseNode[];
  coordinateMap?: {
    from: Bounds;
    to: Bounds;
  };
};

const COMMAND_RE = /[MmLlHhVvCcQqZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const FONT_UNITS = 1000;
const CAP_HEIGHT = 700;
const SLOT_BOUNDS_TOLERANCE = 1;
const TINY_GLYPH_SIZE = 8;
const FONT_LEFT_BEARING = 40;
const IDENTITY_TRANSFORM: Transform = [
  [1, 0, 0],
  [0, 1, 0],
];

export function extractGlyphFromNode(node: SceneNode, char: string): ExtractedGlyph {
  const issues: ExtractionIssue[] = [];
  const vectorSources: VectorSource[] = [];
  const glyphName = glyphNameForChar(char);

  if (isGlyphMetricContainer(node)) {
    collectFlattenedContainerVector(node, vectorSources, issues);
  } else {
    collectSupportedVectors(node, vectorSources, issues);
  }

  if (issues.some((issue) => issue.level === "error")) {
    cleanupTemporaryVectors(vectorSources);
    return { issues, vectorCount: vectorSources.length };
  }

  if (vectorSources.length === 0) {
    return { issues, vectorCount: 0 };
  }

  const rawPaths: NormalizedPath[] = [];
  let rawBounds: Bounds | null = null;

  try {
    for (const source of vectorSources) {
      for (const path of source.vector.vectorPaths) {
        const parsedCommands = parseVectorPathDataForNode(path.data, source.vector);
        const commands = source.coordinateMap
          ? mapCommandsBetweenBounds(parsedCommands, source.coordinateMap.from, source.coordinateMap.to)
          : parsedCommands;
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
  } finally {
    cleanupTemporaryVectors(vectorSources);
  }

  if (issues.some((issue) => issue.level === "error")) {
    return { issues, vectorCount: vectorSources.length };
  }

  const vectorCount = vectorSources.length;

  if (rawPaths.length === 0 || !rawBounds) {
    return {
      issues: [...issues, { level: "error", message: `Glyph ${char} contains vector layers, but no usable path data was found.` }],
      vectorCount,
    };
  }

  const slotBounds = isGlyphMetricContainer(node) ? boundsForNode(node) : null;
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
    vectorCount,
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

function collectSupportedVectors(node: SceneNode, vectorSources: VectorSource[], issues: ExtractionIssue[]): void {
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
    issues.push({ level: "error", message: `${node.name}: effects are unsupported. Remove effects before exporting.` });
    return;
  }

  if (node.type === "BOOLEAN_OPERATION") {
    const flattened = flattenCloneToVector(node, issues, `${node.name}: boolean operation could not be flattened. Flatten it manually and scan again.`);
    if (flattened) {
      vectorSources.push({ vector: flattened, temporary: true });
    }
    return;
  }

  if (node.type === "LINE") {
    issues.push({ level: "error", message: `${node.name}: live lines are unsupported. Convert strokes to filled vector outlines before scanning.` });
    return;
  }

  if (node.type === "VECTOR") {
    if (hasVisibleStrokes(node)) {
      issues.push({ level: "error", message: `${node.name}: stroked vectors are unsupported. Convert strokes to filled vector outlines before scanning.` });
      return;
    }

    if (!hasSimpleVisibleFill(node)) {
      issues.push({ level: "error", message: `${node.name}: use simple filled vector shapes.` });
      return;
    }

    vectorSources.push({ vector: node, temporary: false });
    return;
  }

  if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR") {
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
      collectSupportedVectors(child, vectorSources, issues);
    }
    return;
  }
}

function collectFlattenedContainerVector(
  node: FrameNode | ComponentNode | InstanceNode,
  vectorSources: VectorSource[],
  issues: ExtractionIssue[],
): void {
  validateFlattenableContainerArtwork(node, issues);
  if (issues.some((issue) => issue.level === "error")) {
    return;
  }

  let clone: FrameNode | ComponentNode | InstanceNode | null = null;
  let flattened: VectorNode | null = null;

  try {
    clone = node.clone();
    clone.name = `tg-temp-container-${node.name}`;
    markTemporaryNode(clone);
    clone.relativeTransform = node.relativeTransform;

    if (!clone.parent) {
      getTemporaryParent(node).appendChild(clone);
      clone.relativeTransform = node.relativeTransform;
    }

    removeIgnoredCloneNodes(clone);
    const artwork = clone.children.filter((child) => child.getPluginData("typegen-role") !== "helper");
    if (artwork.length === 0) {
      cleanupTemporaryNode(clone);
      return;
    }

    flattened = figma.flatten(artwork, clone);
    flattened.name = `tg-temp-flattened-${node.name}`;
    markTemporaryNode(flattened);
    const sourceBounds = boundsForNode(node);
    const cloneBounds = boundsForNode(clone);
    vectorSources.push({
      vector: flattened,
      temporary: true,
      cleanupNodes: [clone],
      coordinateMap: sourceBounds && cloneBounds ? { from: cloneBounds, to: sourceBounds } : undefined,
    });
  } catch {
    cleanupTemporaryNode(flattened);
    cleanupTemporaryNode(clone);
    issues.push({ level: "error", message: `${node.name}: glyph artwork could not be flattened. Convert unsupported layers to filled vectors, then scan again.` });
  }
}

function validateFlattenableContainerArtwork(node: SceneNode, issues: ExtractionIssue[]): void {
  if (!node.visible) {
    issues.push({ level: "warning", message: `${node.name}: hidden layer ignored.` });
    return;
  }

  if (node.getPluginData("typegen-role") === "helper") {
    return;
  }

  if (node.type === "BOOLEAN_OPERATION") {
    return;
  }

  if (node.type === "LINE") {
    issues.push({ level: "error", message: `${node.name}: live lines are unsupported. Convert strokes to filled vector outlines before scanning.` });
    return;
  }

  if (node.type === "TEXT") {
    issues.push({ level: "error", message: `${node.name}: text layers are unsupported. Convert text to vector outlines first.` });
    return;
  }

  if (node.type === "SLICE") {
    issues.push({ level: "error", message: `${node.name}: unsupported layer type ${node.type}. Use filled vectors, booleans, or outlined lines.` });
    return;
  }

  if ("effects" in node && node.effects.length > 0) {
    issues.push({ level: "error", message: `${node.name}: effects are unsupported. Remove effects before exporting.` });
    return;
  }

  if (node.type === "VECTOR") {
    if (hasVisibleStrokes(node)) {
      issues.push({ level: "error", message: `${node.name}: stroked vectors are unsupported. Convert strokes to filled vector outlines before scanning.` });
      return;
    }

    if (!hasSimpleVisibleFill(node)) {
      issues.push({ level: "error", message: `${node.name}: use simple filled vector shapes.` });
    }
    return;
  }

  if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR") {
    const hasImageFill = "fills" in node && Array.isArray(node.fills) && node.fills.some((paint) => paint.visible !== false && paint.type === "IMAGE");
    if (hasImageFill) {
      issues.push({ level: "error", message: `${node.name}: image fills are unsupported. Use filled vector paths.` });
      return;
    }

    if (!hasSimpleVisiblePaint(node.fills)) {
      issues.push({ level: "error", message: `${node.name}: use a simple solid fill before scanning.` });
    }
    return;
  }

  if ("children" in node) {
    for (const child of node.children) {
      validateFlattenableContainerArtwork(child, issues);
    }
  }
}

function removeIgnoredCloneNodes(node: SceneNode): void {
  if ("children" in node) {
    for (const child of [...node.children]) {
      if (!child.visible || child.getPluginData("typegen-role") === "helper") {
        child.remove();
        continue;
      }

      removeIgnoredCloneNodes(child);
    }
  }
}

function flattenCloneToVector(
  node: BooleanOperationNode,
  issues: ExtractionIssue[],
  errorMessage: string,
): VectorNode | null {
  let clone: BooleanOperationNode | null = null;
  let flattened: VectorNode | null = null;

  try {
    const parent = getTemporaryParent(node);
    clone = node.clone();
    clone.name = `tg-temp-flatten-${node.name}`;
    markTemporaryNode(clone);
    if (!clone.parent) {
      parent.appendChild(clone);
    }

    flattened = figma.flatten([clone], parent);
    flattened.name = `tg-temp-vector-${node.name}`;
    markTemporaryNode(flattened);
    issues.push({ level: "warning", message: `${node.name}: boolean operation was scanned from a temporary flattened copy.` });
    return flattened;
  } catch {
    cleanupTemporaryNode(flattened);
    cleanupTemporaryNode(clone);
    issues.push({ level: "error", message: errorMessage });
    return null;
  }
}

function getTemporaryParent(node: SceneNode): BaseNode & ChildrenMixin {
  return node.parent && "appendChild" in node.parent ? node.parent : figma.currentPage;
}

function cleanupTemporaryVectors(vectorSources: VectorSource[]): void {
  for (const source of vectorSources) {
    if (source.temporary) {
      cleanupTemporaryNode(source.vector);
    }

    for (const node of source.cleanupNodes ?? []) {
      cleanupTemporaryNode(node);
    }
  }
}

function cleanupTemporaryNode(node: BaseNode | null): void {
  if (node && !node.removed) {
    node.remove();
  }
}

function markTemporaryNode(node: BaseNode): void {
  node.setPluginData("typegen-role", "helper");
}

function isGlyphMetricContainer(node: SceneNode): node is FrameNode | ComponentNode | InstanceNode {
  return node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE";
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

function hasVisibleStrokes(node: VectorNode | LineNode): boolean {
  return Array.isArray(node.strokes) && node.strokes.some((paint) => paint.visible !== false);
}

function hasSimpleVisibleFill(node: VectorNode): boolean {
  return hasSimpleVisiblePaint(node.fills);
}

function hasSimpleVisiblePaint(fills: readonly Paint[] | PluginAPI["mixed"]): boolean {
  if (!Array.isArray(fills)) {
    return false;
  }

  const visibleFills = fills.filter((paint) => paint.visible !== false);
  return visibleFills.length > 0 && visibleFills.every((paint) => paint.type === "SOLID");
}

function parseVectorPathDataForNode(data: string, vector: VectorNode): GlyphCommand[] {
  const transformed = parseSvgPathData(data, vector.absoluteTransform);
  const absoluteBounds = boundsForAbsoluteBoundingBox(vector.absoluteBoundingBox);

  if (!absoluteBounds || transformed.length === 0) {
    return transformed;
  }

  const local = parseSvgPathData(data, IDENTITY_TRANSFORM);
  if (local.length === 0) {
    return transformed;
  }

  const transformedScore = boundsDistance(boundsForCommands(transformed), absoluteBounds);
  const localScore = boundsDistance(boundsForCommands(local), absoluteBounds);
  return localScore + 0.5 < transformedScore ? local : transformed;
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

function mapCommandsBetweenBounds(commands: GlyphCommand[], from: Bounds, to: Bounds): GlyphCommand[] {
  const fromWidth = Math.max(1, from.xMax - from.xMin);
  const fromHeight = Math.max(1, from.yMax - from.yMin);
  const toWidth = Math.max(1, to.xMax - to.xMin);
  const toHeight = Math.max(1, to.yMax - to.yMin);
  const scaleX = toWidth / fromWidth;
  const scaleY = toHeight / fromHeight;
  const mapPoint = (point: Point): Point => ({
    x: to.xMin + (point.x - from.xMin) * scaleX,
    y: to.yMin + (point.y - from.yMin) * scaleY,
  });
  const mapRounded = (point: Point): Point => {
    const mapped = mapPoint(point);
    return {
      x: Math.round(mapped.x * 1000) / 1000,
      y: Math.round(mapped.y * 1000) / 1000,
    };
  };

  return commands.map((command) => {
    if (command.type === "M" || command.type === "L") {
      return { type: command.type, ...mapRounded(command) };
    }

    if (command.type === "C") {
      const p1 = mapRounded({ x: command.x1, y: command.y1 });
      const p2 = mapRounded({ x: command.x2, y: command.y2 });
      const p = mapRounded({ x: command.x, y: command.y });
      return { type: "C", x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x: p.x, y: p.y };
    }

    if (command.type === "Q") {
      const p1 = mapRounded({ x: command.x1, y: command.y1 });
      const p = mapRounded({ x: command.x, y: command.y });
      return { type: "Q", x1: p1.x, y1: p1.y, x: p.x, y: p.y };
    }

    return command;
  });
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

function boundsForAbsoluteBoundingBox(box: Rect | null): Bounds | null {
  if (!box) {
    return null;
  }

  return {
    xMin: box.x,
    yMin: box.y,
    xMax: box.x + box.width,
    yMax: box.y + box.height,
  };
}

function boundsDistance(a: Bounds, b: Bounds): number {
  return (
    Math.abs(a.xMin - b.xMin) +
    Math.abs(a.yMin - b.yMin) +
    Math.abs(a.xMax - b.xMax) +
    Math.abs(a.yMax - b.yMax)
  );
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
