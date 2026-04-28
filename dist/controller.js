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
    { char: "a", name: "glyph-a", label: "a", guideProfile: "lowercase" },
    { char: "b", name: "glyph-b", label: "b", guideProfile: "lowercase" },
    { char: "c", name: "glyph-c", label: "c", guideProfile: "lowercase" },
    { char: "d", name: "glyph-d", label: "d", guideProfile: "lowercase" },
    { char: "e", name: "glyph-e", label: "e", guideProfile: "lowercase" },
    { char: "f", name: "glyph-f", label: "f", guideProfile: "lowercase" },
    { char: "g", name: "glyph-g", label: "g", guideProfile: "lowercase" },
    { char: "h", name: "glyph-h", label: "h", guideProfile: "lowercase" },
    { char: "i", name: "glyph-i", label: "i", guideProfile: "lowercase" },
    { char: "j", name: "glyph-j", label: "j", guideProfile: "lowercase" },
    { char: "k", name: "glyph-k", label: "k", guideProfile: "lowercase" },
    { char: "l", name: "glyph-l", label: "l", guideProfile: "lowercase" },
    { char: "m", name: "glyph-m", label: "m", guideProfile: "lowercase" },
    { char: "n", name: "glyph-n", label: "n", guideProfile: "lowercase" },
    { char: "o", name: "glyph-o", label: "o", guideProfile: "lowercase" },
    { char: "p", name: "glyph-p", label: "p", guideProfile: "lowercase" },
    { char: "q", name: "glyph-q", label: "q", guideProfile: "lowercase" },
    { char: "r", name: "glyph-r", label: "r", guideProfile: "lowercase" },
    { char: "s", name: "glyph-s", label: "s", guideProfile: "lowercase" },
    { char: "t", name: "glyph-t", label: "t", guideProfile: "lowercase" },
    { char: "u", name: "glyph-u", label: "u", guideProfile: "lowercase" },
    { char: "v", name: "glyph-v", label: "v", guideProfile: "lowercase" },
    { char: "w", name: "glyph-w", label: "w", guideProfile: "lowercase" },
    { char: "x", name: "glyph-x", label: "x", guideProfile: "lowercase" },
    { char: "y", name: "glyph-y", label: "y", guideProfile: "lowercase" },
    { char: "z", name: "glyph-z", label: "z", guideProfile: "lowercase" },
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
    { char: ":", name: "glyph-colon", label: ":", defaultAdvanceWidth: 280 },
    { char: "'", name: "glyph-apostrophe", label: "'", defaultAdvanceWidth: 260 },
    { char: '"', name: "glyph-quote", label: '"', defaultAdvanceWidth: 360 },
    { char: "/", name: "glyph-slash", label: "/", defaultAdvanceWidth: 420 },
    { char: "(", name: "glyph-paren-left", label: "(", defaultAdvanceWidth: 360 },
    { char: ")", name: "glyph-paren-right", label: ")", defaultAdvanceWidth: 360 },
    { char: "&", name: "glyph-ampersand", label: "&", defaultAdvanceWidth: 700 },
    { char: "+", name: "glyph-plus", label: "+", defaultAdvanceWidth: 560 },
    { char: "=", name: "glyph-equals", label: "=", defaultAdvanceWidth: 560 },
    { char: "@", name: "glyph-at", label: "@", defaultAdvanceWidth: 760 }
  ];
  var UPPERCASE_GUIDE_PROFILE = {
    name: "uppercase",
    slotWidth: 160,
    slotHeight: 200,
    leftBoundaryX: 24,
    rightBoundaryX: 136,
    ascenderY: 48,
    baselineY: 162,
    ascenderUnits: 700
  };
  var LOWERCASE_GUIDE_PROFILE = {
    name: "lowercase",
    slotWidth: 160,
    slotHeight: 240,
    leftBoundaryX: 24,
    rightBoundaryX: 136,
    ascenderY: 40,
    xHeightY: 77,
    baselineY: 170,
    descenderY: 207,
    ascenderUnits: 700
  };
  var GUIDE_PROFILES = {
    uppercase: UPPERCASE_GUIDE_PROFILE,
    lowercase: LOWERCASE_GUIDE_PROFILE
  };
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
  function guideProfileForChar(char) {
    const definition = GLYPH_DEFINITIONS.find((item) => item.char === char);
    const profileName = definition && "guideProfile" in definition ? definition.guideProfile : "uppercase";
    return GUIDE_PROFILES[profileName];
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
    "glyph-:": ":",
    "glyph-'": "'",
    'glyph-"': '"',
    "glyph-/": "/",
    "glyph-(": "(",
    "glyph-)": ")",
    "glyph-&": "&",
    "glyph-+": "+",
    "glyph-=": "=",
    "glyph-@": "@"
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
      figma.currentPage.appendChild(board);
    }
    figma.currentPage.selection = [board];
    figma.viewport.scrollAndZoomIntoView([board]);
    return { board, warnings, created: !existingBoard, addedSlots };
  }
  function collectExistingSlots(board) {
    const slots = /* @__PURE__ */ new Map();
    for (const child of board.children) {
      const char = glyphCharFromName(child.name);
      if (char && !slots.has(char)) {
        slots.set(char, child);
      }
    }
    return slots;
  }
  function positionSlot(slot, char, index) {
    const layout = getSlotLayout(index);
    slot.x = layout.x;
    slot.y = layout.y;
    if (slot.type === "FRAME") {
      const profile = guideProfileForChar(char);
      if (slot.width !== profile.slotWidth || slot.height !== profile.slotHeight) {
        slot.resize(profile.slotWidth, profile.slotHeight);
      }
    }
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
    const boardWidth = PADDING * 2 + COLUMNS * UPPERCASE_SLOT_WIDTH + (COLUMNS - 1) * GAP;
    const boardHeight = PADDING * 2 + getRowsHeight(rows) + Math.max(0, rows - 1) * GAP;
    board.resize(boardWidth, boardHeight);
  }
  function getSlotLayout(index) {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const rowTop = PADDING + getRowsHeight(row) + row * GAP;
    return {
      x: PADDING + column * (UPPERCASE_SLOT_WIDTH + GAP),
      y: rowTop
    };
  }
  function getRowsHeight(rowCount) {
    let height = 0;
    for (let row = 0; row < rowCount; row++) {
      height += getRowHeight(row);
    }
    return height;
  }
  function getRowHeight(row) {
    const rowChars = SUPPORTED_CHARS.slice(row * COLUMNS, row * COLUMNS + COLUMNS);
    return Math.max(...rowChars.map((char) => guideProfileForChar(char).slotHeight), UPPERCASE_SLOT_HEIGHT);
  }
  var UPPERCASE_SLOT_WIDTH = guideProfileForChar("A").slotWidth;
  var UPPERCASE_SLOT_HEIGHT = guideProfileForChar("A").slotHeight;
  function createSlot(char, labelsEnabled) {
    const profile = guideProfileForChar(char);
    const slot = figma.createFrame();
    slot.name = glyphNameForChar2(char);
    slot.resize(profile.slotWidth, profile.slotHeight);
    slot.fills = [solid(1, 1, 1)];
    slot.strokes = [solid(0.75, 0.78, 0.84)];
    slot.strokeWeight = 1;
    slot.cornerRadius = 4;
    slot.clipsContent = false;
    slot.setPluginData(TYPEGEN_ROLE_KEY, TYPEGEN_ROLE_SLOT);
    addGuides(slot, profile);
    if (labelsEnabled) {
      addLabel(slot, glyphLabelForChar(char));
    }
    return slot;
  }
  function addGuides(slot, profile) {
    var _a;
    const guideTop = profile.ascenderY;
    const guideBottom = (_a = profile.descenderY) != null ? _a : profile.baselineY;
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
      0.62
    );
    if (typeof profile.xHeightY === "number") {
      addGuide(slot, "tg-x-height", profile.leftBoundaryX, profile.xHeightY, guideWidth, 1, 0.5);
    }
    addGuide(slot, "tg-baseline", profile.leftBoundaryX, profile.baselineY, guideWidth, 1, 0.36);
    if (typeof profile.descenderY === "number") {
      addGuide(slot, "tg-descender", profile.leftBoundaryX, profile.descenderY, guideWidth, 1, 0.28);
    }
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
    const guideProfile = guideProfileForChar(char);
    const normalized = slotBounds ? normalizePathsForSlotMetrics(rawPaths, slotBounds, guideProfile) : normalizePaths(rawPaths, rawBounds);
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
  function normalizePathsForSlotMetrics(paths, slotBounds, guideProfile = UPPERCASE_GUIDE_PROFILE) {
    const slotWidth = Math.max(1, slotBounds.xMax - slotBounds.xMin);
    const slotHeight = Math.max(1, slotBounds.yMax - slotBounds.yMin);
    const designLeft = slotBounds.xMin + slotWidth * (guideProfile.leftBoundaryX / guideProfile.slotWidth);
    const designWidth = slotWidth * ((guideProfile.rightBoundaryX - guideProfile.leftBoundaryX) / guideProfile.slotWidth);
    const ascenderY = slotBounds.yMin + slotHeight * (guideProfile.ascenderY / guideProfile.slotHeight);
    const baselineY = slotBounds.yMin + slotHeight * (guideProfile.baselineY / guideProfile.slotHeight);
    const designHeight = Math.max(1, baselineY - ascenderY);
    const normalizedPaths = paths.map((path) => ({
      windingRule: path.windingRule,
      commands: path.commands.map(
        (command) => normalizeCommandToSlotMetrics(command, designLeft, designWidth, baselineY, designHeight, guideProfile.ascenderUnits)
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
  function normalizeCommandToSlotMetrics(command, designLeft, designWidth, baselineY, designHeight, ascenderUnits) {
    const mapPoint = (point) => ({
      x: Math.round((point.x - designLeft) / designWidth * FONT_DESIGN_WIDTH + FONT_LEFT_BEARING),
      y: Math.round((baselineY - point.y) / designHeight * ascenderUnits)
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

  // src/plugin/starterGlyphs.ts
  var FILL = { type: "SOLID", color: { r: 0.05, g: 0.06, b: 0.08 } };
  var INTER_STARTER_FONT = { family: "Inter", style: "Regular" };
  async function generateStarterGlyphs() {
    const boardResult = await createGlyphBoard();
    const slotsByChar = collectSlotsByChar(boardResult.board);
    const warnings = [...boardResult.warnings];
    const interAvailable = await loadInterStarterFont(warnings);
    let filledSlots = 0;
    let skippedSlots = 0;
    for (const char of SUPPORTED_CHARS) {
      const slot = slotsByChar.get(char);
      if (!slot) {
        warnings.push(`Could not find ${glyphNameForChar2(char)} after board update.`);
        continue;
      }
      if (slot.type !== "FRAME") {
        warnings.push(`${glyphNameForChar2(char)} is not a frame, so no starter glyph was added.`);
        continue;
      }
      if (hasUserArtwork(slot)) {
        skippedSlots++;
        continue;
      }
      addStarterGlyphToSlot(slot, char, interAvailable, warnings);
      filledSlots++;
    }
    figma.currentPage.selection = [boardResult.board];
    figma.viewport.scrollAndZoomIntoView([boardResult.board]);
    return {
      board: boardResult.board,
      filledSlots,
      skippedSlots,
      warnings
    };
  }
  async function loadInterStarterFont(warnings) {
    try {
      await figma.loadFontAsync(INTER_STARTER_FONT);
      return true;
    } catch (e) {
      warnings.push("Could not load Inter Regular for starter outlines. Used geometric fallback glyphs instead.");
      return false;
    }
  }
  function collectSlotsByChar(board) {
    const slots = /* @__PURE__ */ new Map();
    for (const child of board.children) {
      const char = glyphCharFromName(child.name);
      if (char && !slots.has(char)) {
        slots.set(char, child);
      }
    }
    return slots;
  }
  function hasUserArtwork(slot) {
    return slot.children.some((child) => child.getPluginData(TYPEGEN_ROLE_KEY) !== TYPEGEN_ROLE_HELPER);
  }
  function addStarterGlyphToSlot(slot, char, interAvailable, warnings) {
    if (interAvailable) {
      try {
        createInterStarterOutline(slot, char);
        return;
      } catch (e) {
        warnings.push(`${glyphNameForChar2(char)} could not be generated from Inter. Used geometric fallback for that slot.`);
      }
    }
    const vector = createStarterVector(char);
    slot.appendChild(vector);
  }
  function createInterStarterOutline(slot, char) {
    const text = figma.createText();
    try {
      text.name = `tg-inter-source-${safeNodeName(glyphLabelForChar(char))}`;
      text.fontName = INTER_STARTER_FONT;
      text.fontSize = 128;
      text.textAutoResize = "WIDTH_AND_HEIGHT";
      text.characters = char;
      text.fills = [FILL];
      text.strokes = [];
      text.x = 0;
      text.y = 0;
      slot.appendChild(text);
      const vector = figma.flatten([text], slot);
      vector.name = `tg-starter-inter-${safeNodeName(glyphLabelForChar(char))}`;
      vector.fills = [FILL];
      vector.strokes = [];
      fitStarterVectorToSlot(vector, char);
    } catch (error) {
      if (text.parent) {
        text.remove();
      }
      throw error;
    }
  }
  function fitStarterVectorToSlot(vector, char) {
    const target = targetBoundsForChar(char);
    const sourceWidth = Math.max(1, vector.width);
    const sourceHeight = Math.max(1, vector.height);
    const targetWidth = Math.max(1, target.xMax - target.xMin);
    const targetHeight = Math.max(1, target.yMax - target.yMin);
    const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
    const nextWidth = sourceWidth * scale;
    const nextHeight = sourceHeight * scale;
    vector.resizeWithoutConstraints(nextWidth, nextHeight);
    vector.x = target.xMin + (targetWidth - nextWidth) / 2;
    vector.y = target.yMin + (targetHeight - nextHeight) / 2;
  }
  function targetBoundsForChar(char) {
    const profile = guideProfileForChar(char);
    const metrics = createMetrics(profile);
    const sideInset = defaultSideInset(char, metrics);
    const vertical = verticalBoundsForChar(char, metrics);
    return {
      xMin: metrics.left + sideInset,
      yMin: vertical.top,
      xMax: metrics.right - sideInset,
      yMax: vertical.bottom
    };
  }
  function verticalBoundsForChar(char, metrics) {
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
    if (`'"`.includes(char)) {
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
  function defaultSideInset(char, metrics) {
    if (`ilI1!'".,:`.includes(char)) {
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
  function createStarterVector(char) {
    const vector = figma.createVector();
    vector.name = `tg-starter-${safeNodeName(glyphLabelForChar(char))}`;
    vector.vectorPaths = [
      {
        windingRule: "NONZERO",
        data: shapesToPathData(createStarterShapes(char))
      }
    ];
    vector.fills = [FILL];
    vector.strokes = [];
    return vector;
  }
  function createStarterShapes(char) {
    const profile = guideProfileForChar(char);
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
  function createMetrics(profile) {
    var _a, _b;
    const left = profile.leftBoundaryX;
    const right = profile.rightBoundaryX;
    const top = profile.ascenderY;
    const xHeight = (_a = profile.xHeightY) != null ? _a : profile.ascenderY;
    const baseline = profile.baselineY;
    const descender = (_b = profile.descenderY) != null ? _b : profile.baselineY;
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
      thin: Math.max(7, Math.round(stroke * 0.72))
    };
  }
  function uppercaseShapes(char, m) {
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
  function lowercaseShapes(char, m) {
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
  function numberShapes(char, m) {
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
  function symbolShapes(char, m) {
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
  function ring(left, top, right, bottom, stroke) {
    return [
      rect(left, top, right, top + stroke),
      rect(left, top, left + stroke, bottom),
      rect(right - stroke, top, right, bottom),
      rect(left, bottom - stroke, right, bottom)
    ];
  }
  function rect(x1, y1, x2, y2) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 }
    ];
  }
  function slant(x1, y1, x2, y2, width) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const offsetX = -dy / length * (width / 2);
    const offsetY = dx / length * (width / 2);
    return [
      { x: x1 + offsetX, y: y1 + offsetY },
      { x: x2 + offsetX, y: y2 + offsetY },
      { x: x2 - offsetX, y: y2 - offsetY },
      { x: x1 - offsetX, y: y1 - offsetY }
    ];
  }
  function shapesToPathData(shapes) {
    return shapes.map((shape) => {
      const [first, ...rest] = shape;
      return [`M ${round(first.x)} ${round(first.y)}`, ...rest.map((point) => `L ${round(point.x)} ${round(point.y)}`), "Z"].join(" ");
    }).join(" ");
  }
  function round(value) {
    return Math.round(value * 10) / 10;
  }
  function safeNodeName(label) {
    return label.replace(/'/g, "apostrophe").replace(/"/g, "quote").replace(/\//g, "slash").replace(/\(/g, "paren-left").replace(/\)/g, "paren-right").replace(/&/g, "ampersand").replace(/\+/g, "plus").replace(/=/g, "equals").replace(/@/g, "at").replace(/[^A-Za-z0-9.-]/g, "-");
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
      if (message.type === "GENERATE_STARTER_GLYPHS") {
        const result = await generateStarterGlyphs();
        const action = result.filledSlots > 0 ? `Generated starter outlines in ${result.filledSlots} empty slots. Preserved ${result.skippedSlots} slots with existing artwork.` : `No empty slots needed starter outlines. Preserved ${result.skippedSlots} slots with existing artwork.`;
        postToUi({
          type: "STARTER_GLYPHS_GENERATED",
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
