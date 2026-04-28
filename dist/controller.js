"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/shared/types.ts
  var GLYPH_DEFINITIONS = [
    { char: "A", name: "glyph-A", label: "A" },
    { char: "B", name: "glyph-B", label: "B" },
    { char: "C", name: "glyph-C", label: "C" },
    { char: "D", name: "glyph-D", label: "D" },
    { char: "E", name: "glyph-E", label: "E" },
    { char: "F", name: "glyph-F", label: "F" },
    { char: "G", name: "glyph-G", label: "G" },
    { char: "H", name: "glyph-H", label: "H" },
    { char: "I", name: "glyph-I", label: "I" },
    { char: "J", name: "glyph-J", label: "J" },
    { char: "K", name: "glyph-K", label: "K" },
    { char: "L", name: "glyph-L", label: "L" },
    { char: "M", name: "glyph-M", label: "M" },
    { char: "N", name: "glyph-N", label: "N" },
    { char: "O", name: "glyph-O", label: "O" },
    { char: "P", name: "glyph-P", label: "P" },
    { char: "Q", name: "glyph-Q", label: "Q" },
    { char: "R", name: "glyph-R", label: "R" },
    { char: "S", name: "glyph-S", label: "S" },
    { char: "T", name: "glyph-T", label: "T" },
    { char: "U", name: "glyph-U", label: "U" },
    { char: "V", name: "glyph-V", label: "V" },
    { char: "W", name: "glyph-W", label: "W" },
    { char: "X", name: "glyph-X", label: "X" },
    { char: "Y", name: "glyph-Y", label: "Y" },
    { char: "Z", name: "glyph-Z", label: "Z" },
    { char: "0", name: "glyph-0", label: "0" },
    { char: "1", name: "glyph-1", label: "1" },
    { char: "2", name: "glyph-2", label: "2" },
    { char: "3", name: "glyph-3", label: "3" },
    { char: "4", name: "glyph-4", label: "4" },
    { char: "5", name: "glyph-5", label: "5" },
    { char: "6", name: "glyph-6", label: "6" },
    { char: "7", name: "glyph-7", label: "7" },
    { char: "8", name: "glyph-8", label: "8" },
    { char: "9", name: "glyph-9", label: "9" },
    { char: ".", name: "glyph-period", label: ".", defaultAdvanceWidth: 260 },
    { char: ",", name: "glyph-comma", label: ",", defaultAdvanceWidth: 260 },
    { char: "!", name: "glyph-exclamation", label: "!", defaultAdvanceWidth: 320 },
    { char: "?", name: "glyph-question", label: "?", defaultAdvanceWidth: 560 },
    { char: "-", name: "glyph-hyphen", label: "-", defaultAdvanceWidth: 420 },
    { char: ":", name: "glyph-colon", label: ":", defaultAdvanceWidth: 280 }
  ];
  var GLYPH_CHARS = GLYPH_DEFINITIONS.map((definition) => definition.char);
  function glyphNameForChar(char) {
    var _a, _b;
    return (_b = (_a = GLYPH_DEFINITIONS.find((definition) => definition.char === char)) == null ? void 0 : _a.name) != null ? _b : `glyph-${char}`;
  }
  function glyphLabelForChar(char) {
    var _a, _b;
    return (_b = (_a = GLYPH_DEFINITIONS.find((definition) => definition.char === char)) == null ? void 0 : _a.label) != null ? _b : char;
  }
  function defaultAdvanceForChar(char) {
    const definition = GLYPH_DEFINITIONS.find((item) => item.char === char);
    return definition && "defaultAdvanceWidth" in definition ? definition.defaultAdvanceWidth : 700;
  }

  // src/plugin/pluginTypes.ts
  var SUPPORTED_CHARS = [...GLYPH_CHARS];
  var TYPEGEN_ROLE_KEY = "typegen-role";
  var TYPEGEN_ROLE_BOARD = "board";
  var TYPEGEN_ROLE_SLOT = "glyph-slot";
  var TYPEGEN_ROLE_HELPER = "helper";
  var GLYPH_NAME_ALIASES = {
    "glyph-.": ".",
    "glyph-,": ",",
    "glyph-!": "!",
    "glyph-?": "?",
    "glyph--": "-",
    "glyph-:": ":"
  };
  function glyphCharFromName(name) {
    var _a, _b, _c;
    return (_c = (_b = (_a = GLYPH_DEFINITIONS.find((definition) => definition.name === name)) == null ? void 0 : _a.char) != null ? _b : GLYPH_NAME_ALIASES[name]) != null ? _c : null;
  }
  function unicodeForChar(char) {
    var _a;
    return (_a = char.codePointAt(0)) != null ? _a : 0;
  }
  function glyphNameForChar2(char) {
    return glyphNameForChar(char);
  }

  // src/plugin/glyphBoard.ts
  var SLOT_WIDTH = 160;
  var SLOT_HEIGHT = 200;
  var GAP = 24;
  var COLUMNS = 6;
  var PADDING = 32;
  var LABEL_FONT = { family: "Inter", style: "Regular" };
  async function createGlyphBoard() {
    const warnings = [];
    let labelsEnabled = true;
    try {
      await figma.loadFontAsync(LABEL_FONT);
    } catch (e) {
      labelsEnabled = false;
      warnings.push("Could not load Inter Regular for board labels. Slots were still created.");
    }
    const existingBoard = findExistingBoard();
    const board = existingBoard != null ? existingBoard : createBoardFrame();
    const existingSlotChars = new Set(
      board.children.map((child) => glyphCharFromName(child.name)).filter((char) => Boolean(char))
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
  function findExistingBoard() {
    const selectedBoard = figma.currentPage.selection.find(isGlyphBoardFrame);
    if (selectedBoard) {
      return selectedBoard;
    }
    return figma.currentPage.findOne((node) => isGlyphBoardFrame(node));
  }
  function isGlyphBoardFrame(node) {
    return node.type === "FRAME" && (node.getPluginData(TYPEGEN_ROLE_KEY) === TYPEGEN_ROLE_BOARD || node.name === "Font Glyph Board");
  }
  function createBoardFrame() {
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
  function resizeBoardToFitSupportedSlots(board) {
    const rows = Math.ceil(SUPPORTED_CHARS.length / COLUMNS);
    board.resize(
      PADDING * 2 + COLUMNS * SLOT_WIDTH + (COLUMNS - 1) * GAP,
      PADDING * 2 + rows * SLOT_HEIGHT + (rows - 1) * GAP
    );
  }
  function createSlot(char, labelsEnabled) {
    const slot = figma.createFrame();
    slot.name = glyphNameForChar2(char);
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
      addLabel(slot, glyphLabelForChar(char));
    }
    return slot;
  }
  function addGuide(parent, name, x, y, width, height, alpha) {
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
  function addLabel(parent, char) {
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
  function solid(r, g, b, a = 1) {
    return { type: "SOLID", color: { r, g, b }, opacity: a };
  }

  // src/plugin/extractPaths.ts
  var COMMAND_RE = /[MmLlHhVvCcQqZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
  var FONT_UNITS = 1e3;
  var CAP_HEIGHT = 700;
  var SLOT_BOUNDS_TOLERANCE = 1;
  var TINY_GLYPH_SIZE = 8;
  var SLOT_WIDTH2 = 160;
  var SLOT_HEIGHT2 = 200;
  var SLOT_LEFT_BOUNDARY = 24;
  var SLOT_RIGHT_BOUNDARY = 136;
  var SLOT_CAP_HEIGHT_Y = 48;
  var SLOT_BASELINE_Y = 162;
  var FONT_LEFT_BEARING = 40;
  var FONT_DESIGN_WIDTH = 720;
  function extractGlyphFromNode(node, char) {
    var _a;
    const issues = [];
    const vectors = [];
    const glyphName = glyphNameForChar2(char);
    collectSupportedVectors(node, vectors, issues);
    if (issues.some((issue) => issue.level === "error")) {
      return { issues, vectorCount: vectors.length };
    }
    if (vectors.length === 0) {
      return { issues, vectorCount: 0 };
    }
    const rawPaths = [];
    let rawBounds = null;
    for (const vector of vectors) {
      for (const path of vector.vectorPaths) {
        const commands = parseSvgPathData(path.data, vector.absoluteTransform);
        if (commands.length === 0) {
          issues.push({ level: "warning", message: `${char}: skipped an empty vector path.` });
          continue;
        }
        rawPaths.push({
          commands,
          windingRule: path.windingRule === "EVENODD" ? "EVENODD" : "NONZERO"
        });
        rawBounds = mergeBounds(rawBounds, boundsForCommands(commands));
      }
    }
    if (rawPaths.length === 0 || !rawBounds) {
      return {
        issues: [...issues, { level: "error", message: `Glyph ${char} contains vector layers, but no usable path data was found.` }],
        vectorCount: vectors.length
      };
    }
    const slotBounds = "children" in node ? boundsForNode(node) : null;
    issues.push(...validateRawGeometry(char, glyphName, rawBounds, slotBounds));
    const normalized = slotBounds ? normalizePathsForSlotMetrics(rawPaths, slotBounds) : normalizePaths(rawPaths, rawBounds);
    const advanceWidth = resolveExtractedAdvanceWidth(char, normalized.bounds);
    const fitted = shouldFitGlyphToAdvance(char) ? fitPathsToAdvance(normalized, advanceWidth) : normalized;
    return {
      issues,
      vectorCount: vectors.length,
      glyph: {
        char,
        unicode: (_a = char.codePointAt(0)) != null ? _a : 0,
        name: glyphName,
        advanceWidth,
        bounds: fitted.bounds,
        paths: fitted.paths,
        warnings: issues.filter((issue) => issue.level === "warning").map((issue) => issue.message)
      }
    };
  }
  function resolveExtractedAdvanceWidth(char, bounds) {
    const defaultAdvance = defaultAdvanceForChar(char);
    if (defaultAdvance < 700) {
      return defaultAdvance;
    }
    return Math.max(defaultAdvance, bounds.xMax + 80);
  }
  function shouldFitGlyphToAdvance(char) {
    return defaultAdvanceForChar(char) < 700;
  }
  function collectSupportedVectors(node, vectors, issues) {
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
        message: `${node.name}: boolean operations are unsupported in V0.2. Flatten or convert to vector outlines first.`
      });
      return;
    }
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR" || node.type === "LINE") {
      const hasImageFill = "fills" in node && Array.isArray(node.fills) && node.fills.some((paint) => paint.visible !== false && paint.type === "IMAGE");
      issues.push({
        level: "error",
        message: hasImageFill ? `${node.name}: image fills are unsupported. Use filled vector paths.` : `${node.name}: convert shape layers to vector outlines before scanning.`
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
  function hasVisibleStrokes(node) {
    return Array.isArray(node.strokes) && node.strokes.some((paint) => paint.visible !== false);
  }
  function hasSimpleVisibleFill(node) {
    if (!Array.isArray(node.fills)) {
      return false;
    }
    const visibleFills = node.fills.filter((paint) => paint.visible !== false);
    return visibleFills.length > 0 && visibleFills.every((paint) => paint.type === "SOLID");
  }
  function parseSvgPathData(data, transform) {
    var _a;
    const tokens = (_a = data.match(COMMAND_RE)) != null ? _a : [];
    const commands = [];
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
          commands.push(__spreadValues({ type: "M" }, applyTransform(point, transform)));
          activeCommand = activeCommand === "m" ? "l" : "L";
          break;
        }
        case "L":
        case "l": {
          const point = readPoint(tokens, index, current, activeCommand === "l");
          index += 2;
          current = point;
          commands.push(__spreadValues({ type: "L" }, applyTransform(point, transform)));
          break;
        }
        case "H":
        case "h": {
          const x = Number(tokens[index++]);
          current = { x: activeCommand === "h" ? current.x + x : x, y: current.y };
          commands.push(__spreadValues({ type: "L" }, applyTransform(current, transform)));
          break;
        }
        case "V":
        case "v": {
          const y = Number(tokens[index++]);
          current = { x: current.x, y: activeCommand === "v" ? current.y + y : y };
          commands.push(__spreadValues({ type: "L" }, applyTransform(current, transform)));
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
  function readPoint(tokens, index, current, relative) {
    const x = Number(tokens[index]);
    const y = Number(tokens[index + 1]);
    return relative ? { x: current.x + x, y: current.y + y } : { x, y };
  }
  function isCommandToken(token) {
    return /^[A-Za-z]$/.test(token);
  }
  function applyTransform(point, transform) {
    return {
      x: transform[0][0] * point.x + transform[0][1] * point.y + transform[0][2],
      y: transform[1][0] * point.x + transform[1][1] * point.y + transform[1][2]
    };
  }
  function validateRawGeometry(char, glyphName, rawBounds, slotBounds) {
    const issues = [];
    const rawWidth = rawBounds.xMax - rawBounds.xMin;
    const rawHeight = rawBounds.yMax - rawBounds.yMin;
    if (rawWidth < TINY_GLYPH_SIZE || rawHeight < TINY_GLYPH_SIZE) {
      issues.push({
        level: "warning",
        message: `Glyph ${char} vector bounds are very small (${Math.round(rawWidth)}x${Math.round(rawHeight)} px). Scale the outline inside the slot for better output.`
      });
    }
    if (slotBounds && extendsOutside(rawBounds, slotBounds, SLOT_BOUNDS_TOLERANCE)) {
      issues.push({
        level: "warning",
        message: `Glyph ${char} artwork extends outside ${glyphName} slot bounds. Move or resize it inside the slot before exporting.`
      });
    }
    return issues;
  }
  function boundsForCommands(commands) {
    const points = [];
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
      yMax: Math.max(...points.map((point) => point.y))
    };
  }
  function mergeBounds(a, b) {
    if (!a) return b;
    return {
      xMin: Math.min(a.xMin, b.xMin),
      yMin: Math.min(a.yMin, b.yMin),
      xMax: Math.max(a.xMax, b.xMax),
      yMax: Math.max(a.yMax, b.yMax)
    };
  }
  function normalizePaths(paths, bounds) {
    const width = Math.max(1, bounds.xMax - bounds.xMin);
    const height = Math.max(1, bounds.yMax - bounds.yMin);
    const scale = Math.min(FONT_UNITS * 0.72 / width, CAP_HEIGHT / height);
    const leftBearing = 40;
    const normalizedPaths = paths.map((path) => ({
      windingRule: path.windingRule,
      commands: path.commands.map((command) => normalizeCommand(command, bounds, scale, leftBearing))
    }));
    const normalizedBounds = normalizedPaths.reduce((acc, path) => {
      const pathBounds = boundsForCommands(path.commands);
      return mergeBounds(acc, pathBounds);
    }, null);
    return {
      paths: normalizedPaths,
      bounds: normalizedBounds != null ? normalizedBounds : { xMin: 0, yMin: 0, xMax: 0, yMax: 0 }
    };
  }
  function normalizePathsForSlotMetrics(paths, slotBounds) {
    const slotWidth = Math.max(1, slotBounds.xMax - slotBounds.xMin);
    const slotHeight = Math.max(1, slotBounds.yMax - slotBounds.yMin);
    const designLeft = slotBounds.xMin + slotWidth * (SLOT_LEFT_BOUNDARY / SLOT_WIDTH2);
    const designWidth = slotWidth * ((SLOT_RIGHT_BOUNDARY - SLOT_LEFT_BOUNDARY) / SLOT_WIDTH2);
    const capY = slotBounds.yMin + slotHeight * (SLOT_CAP_HEIGHT_Y / SLOT_HEIGHT2);
    const baselineY = slotBounds.yMin + slotHeight * (SLOT_BASELINE_Y / SLOT_HEIGHT2);
    const designHeight = Math.max(1, baselineY - capY);
    const normalizedPaths = paths.map((path) => ({
      windingRule: path.windingRule,
      commands: path.commands.map(
        (command) => normalizeCommandToSlotMetrics(command, designLeft, designWidth, baselineY, designHeight)
      )
    }));
    const normalizedBounds = normalizedPaths.reduce((acc, path) => {
      const pathBounds = boundsForCommands(path.commands);
      return mergeBounds(acc, pathBounds);
    }, null);
    return {
      paths: normalizedPaths,
      bounds: normalizedBounds != null ? normalizedBounds : { xMin: 0, yMin: 0, xMax: 0, yMax: 0 }
    };
  }
  function fitPathsToAdvance(normalized, advanceWidth) {
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
        commands: path.commands.map((command) => shiftCommandX(command, dx))
      })),
      bounds: {
        xMin: normalized.bounds.xMin + dx,
        yMin: normalized.bounds.yMin,
        xMax: normalized.bounds.xMax + dx,
        yMax: normalized.bounds.yMax
      }
    };
  }
  function normalizeCommand(command, bounds, scale, leftBearing) {
    const mapPoint = (point) => ({
      x: Math.round((point.x - bounds.xMin) * scale + leftBearing),
      y: Math.round((bounds.yMax - point.y) * scale)
    });
    if (command.type === "M" || command.type === "L") {
      return __spreadValues({ type: command.type }, mapPoint(command));
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
  function normalizeCommandToSlotMetrics(command, designLeft, designWidth, baselineY, designHeight) {
    const mapPoint = (point) => ({
      x: Math.round((point.x - designLeft) / designWidth * FONT_DESIGN_WIDTH + FONT_LEFT_BEARING),
      y: Math.round((baselineY - point.y) / designHeight * CAP_HEIGHT)
    });
    if (command.type === "M" || command.type === "L") {
      return __spreadValues({ type: command.type }, mapPoint(command));
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
  function shiftCommandX(command, dx) {
    if (command.type === "M" || command.type === "L") {
      return __spreadProps(__spreadValues({}, command), { x: command.x + dx });
    }
    if (command.type === "C") {
      return __spreadProps(__spreadValues({}, command), {
        x1: command.x1 + dx,
        x2: command.x2 + dx,
        x: command.x + dx
      });
    }
    if (command.type === "Q") {
      return __spreadProps(__spreadValues({}, command), {
        x1: command.x1 + dx,
        x: command.x + dx
      });
    }
    return command;
  }
  function boundsForNode(node) {
    if (!("width" in node) || !("height" in node)) {
      return null;
    }
    const transform = node.absoluteTransform;
    const corners = [
      applyTransform({ x: 0, y: 0 }, transform),
      applyTransform({ x: node.width, y: 0 }, transform),
      applyTransform({ x: node.width, y: node.height }, transform),
      applyTransform({ x: 0, y: node.height }, transform)
    ];
    return {
      xMin: Math.min(...corners.map((point) => point.x)),
      yMin: Math.min(...corners.map((point) => point.y)),
      xMax: Math.max(...corners.map((point) => point.x)),
      yMax: Math.max(...corners.map((point) => point.y))
    };
  }
  function extendsOutside(inner, outer, tolerance) {
    return inner.xMin < outer.xMin - tolerance || inner.yMin < outer.yMin - tolerance || inner.xMax > outer.xMax + tolerance || inner.yMax > outer.yMax + tolerance;
  }

  // src/plugin/figmaNodes.ts
  function scanSelectedGlyphs(selection) {
    var _a;
    const candidates = collectGlyphCandidates(selection);
    const firstByChar = /* @__PURE__ */ new Map();
    const duplicateTotals = /* @__PURE__ */ new Map();
    for (const candidate of candidates) {
      if (firstByChar.has(candidate.char)) {
        duplicateTotals.set(candidate.char, ((_a = duplicateTotals.get(candidate.char)) != null ? _a : 1) + 1);
        continue;
      }
      firstByChar.set(candidate.char, candidate.node);
    }
    const glyphs = SUPPORTED_CHARS.map((char) => {
      var _a2;
      const node = firstByChar.get(char);
      const glyphName = glyphNameForChar2(char);
      const base = {
        char,
        unicode: unicodeForChar(char),
        name: glyphName,
        warnings: []
      };
      if (!node) {
        return __spreadProps(__spreadValues({}, base), {
          status: "missing",
          message: `Glyph ${char} is missing. Select a board or node named ${glyphName}.`
        });
      }
      const extraction = extractGlyphFromNode(node, char);
      const duplicateTotal = (_a2 = duplicateTotals.get(char)) != null ? _a2 : 0;
      const warnings = extraction.issues.filter((issue) => issue.level === "warning").map((issue) => issue.message);
      if (duplicateTotal > 0) {
        warnings.push(`${duplicateTotal} ${glyphName} nodes were found. The first one was used; remove or rename duplicates.`);
      }
      const errors = extraction.issues.filter((issue) => issue.level === "error");
      if (errors.length > 0) {
        return __spreadProps(__spreadValues({}, base), {
          status: "unsupported",
          nodeId: node.id,
          message: errors[0].message,
          warnings
        });
      }
      if (extraction.vectorCount === 0 || !extraction.glyph) {
        return __spreadProps(__spreadValues({}, base), {
          status: "empty",
          nodeId: node.id,
          message: `Glyph ${char} is empty. Add a simple filled vector path inside ${glyphName}.`,
          warnings
        });
      }
      return __spreadProps(__spreadValues({}, base), {
        status: "valid",
        nodeId: node.id,
        message: `Glyph ${char} is valid.`,
        glyph: extraction.glyph,
        warnings
      });
    });
    return {
      glyphs,
      summary: summarize(glyphs)
    };
  }
  function collectGlyphCandidates(selection) {
    const candidates = [];
    for (const node of selection) {
      walkNode(node, candidates);
    }
    return candidates;
  }
  function walkNode(node, candidates) {
    if (node.getPluginData(TYPEGEN_ROLE_KEY) === "helper") {
      return;
    }
    const char = glyphCharFromName(node.name);
    if (char) {
      candidates.push({ char, node });
      return;
    }
    if ("children" in node) {
      for (const child of node.children) {
        walkNode(child, candidates);
      }
    }
  }
  function summarize(glyphs) {
    return glyphs.reduce(
      (summary, glyph) => {
        summary[glyph.status] += 1;
        summary.warnings += glyph.warnings.length;
        return summary;
      },
      { valid: 0, empty: 0, unsupported: 0, missing: 0, warnings: 0 }
    );
  }

  // src/plugin/controller.ts
  var SETTINGS_KEY = "typegen-settings-v1";
  figma.showUI(__html__, { width: 420, height: 640, themeColors: true });
  postToUi({ type: "PLUGIN_READY" });
  postToUi({ type: "SETTINGS_LOADED", settings: loadSettings() });
  figma.ui.onmessage = async (message) => {
    try {
      if (message.type === "SAVE_SETTINGS") {
        saveSettings(message.settings);
        return;
      }
      if (message.type === "RESET_SETTINGS") {
        resetSettings();
        postToUi({ type: "SETTINGS_RESET" });
        return;
      }
      if (message.type === "RESTORE_SAVED_SCAN") {
        await restoreSavedScan(message.nodeIds);
        return;
      }
      if (message.type === "CREATE_GLYPH_BOARD") {
        const result = await createGlyphBoard();
        const action = result.created ? `Created ${result.board.name}.` : result.addedSlots > 0 ? `Updated ${result.board.name}: added ${result.addedSlots} missing slots.` : `${result.board.name} is already up to date.`;
        postToUi({
          type: "GLYPH_BOARD_CREATED",
          message: action,
          warnings: result.warnings
        });
        figma.notify(action);
        return;
      }
      if (message.type === "SCAN_SELECTED_GLYPHS") {
        if (figma.currentPage.selection.length === 0) {
          postToUi({
            type: "VALIDATION_ERROR",
            message: "No glyph nodes found. Select the Font Glyph Board or supported glyph slot frames."
          });
          return;
        }
        const result = scanSelectedGlyphs(figma.currentPage.selection);
        postToUi({
          type: "GLYPHS_SCANNED",
          glyphs: result.glyphs,
          summary: result.summary
        });
        figma.notify(`Scanned glyphs: ${result.summary.valid} valid, ${result.summary.empty} empty.`);
        return;
      }
      postToUi({ type: "VALIDATION_ERROR", message: "Unknown Typegen action." });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unexpected plugin error.";
      postToUi({ type: "VALIDATION_ERROR", message: messageText });
      figma.notify(messageText, { error: true });
    }
  };
  function postToUi(message) {
    figma.ui.postMessage(message);
  }
  function loadSettings() {
    const raw = figma.root.getPluginData(SETTINGS_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      return isPersistedSettings(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  function saveSettings(settings) {
    if (!isPersistedSettings(settings)) {
      return;
    }
    figma.root.setPluginData(SETTINGS_KEY, JSON.stringify(settings));
  }
  function resetSettings() {
    figma.root.setPluginData(SETTINGS_KEY, "");
  }
  async function restoreSavedScan(nodeIds) {
    const nodes = await Promise.all([...new Set(nodeIds)].map((id) => figma.getNodeByIdAsync(id)));
    const sceneNodes = nodes.filter(isSceneNode);
    if (sceneNodes.length === 0) {
      postToUi({
        type: "VALIDATION_ERROR",
        message: "Saved glyph scan could not be restored. Select the board and scan again."
      });
      return;
    }
    const result = scanSelectedGlyphs(sceneNodes);
    postToUi({
      type: "GLYPHS_SCANNED",
      glyphs: result.glyphs,
      summary: result.summary
    });
  }
  function isPersistedSettings(value) {
    if (!value || typeof value !== "object") {
      return false;
    }
    const candidate = value;
    return typeof candidate.fontName === "string" && typeof candidate.previewText === "string" && typeof candidate.selectedGlyph === "string" && candidate.selectedGlyph.length === 1 && Array.isArray(candidate.lastScanNodeIds) && candidate.lastScanNodeIds.every((id) => typeof id === "string") && Boolean(candidate.spacing) && typeof candidate.spacing === "object" && typeof candidate.spacing.letterSpacing === "number" && typeof candidate.spacing.spaceWidth === "number" && Boolean(candidate.spacing.glyphAdvanceOverrides) && typeof candidate.spacing.glyphAdvanceOverrides === "object";
  }
  function isSceneNode(node) {
    return Boolean(node && "visible" in node && "absoluteTransform" in node);
  }
})();
