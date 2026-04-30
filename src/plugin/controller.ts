import { createGlyphBoard, findAllGlyphBoards, findDirectlySelectedGlyphBoard, findSelectedGlyphBoard, getGlyphBoardStyle } from "./glyphBoard";
import { scanSelectedGlyphs, scanSelectedGlyphsForChars, scanSelectedGlyphsLightweight } from "./figmaNodes";
import { generateStarterGlyphs } from "./starterGlyphs";
import { ActiveBoardInfo, PersistedTypegenSettings, PluginToUiMessage, UiToPluginMessage } from "./pluginTypes";
import { GLYPH_CHARS, type BoardSpacingSettings, type GlyphChar, type KerningPair } from "../shared/types";

declare const __html__: string;

const SETTINGS_KEY = "typegen-settings-v1";
const BOARD_SPACING_KEY = "typegen-board-spacing-v1";
const PERF_LOG_PREFIX = "[Typegen perf]";
const DEFAULT_BOARD_SPACING: BoardSpacingSettings = {
  letterSpacing: 0,
  spaceWidth: 320,
  glyphAdvanceOverrides: {},
  kerningPairs: [],
};
let activeBoardId = "";
let selectionScanTimer: ReturnType<typeof setTimeout> | null = null;
let deferredFullScanTimer: ReturnType<typeof setTimeout> | null = null;
let scanVersion = 0;

figma.showUI(__html__, { width: 420, height: 640, themeColors: true });
postToUi({ type: "PLUGIN_READY" });
postToUi({ type: "SETTINGS_LOADED", settings: loadSettings() });

figma.on("selectionchange", () => {
  if (selectionScanTimer) {
    clearTimeout(selectionScanTimer);
  }

  selectionScanTimer = setTimeout(() => {
    selectionScanTimer = null;
    void scanDirectBoardSelection();
  }, 120);
});

figma.ui.onmessage = async (message: UiToPluginMessage) => {
  try {
    if (message.type === "SAVE_SETTINGS") {
      saveSettings(message.settings);
      return;
    }

    if (message.type === "SAVE_BOARD_SPACING") {
      await saveBoardSpacing(message.boardId, message.spacing);
      return;
    }

    if (message.type === "REQUEST_BOARD_SETTINGS_SOURCES") {
      postToUi({
        type: "BOARD_SETTINGS_SOURCES",
        sources: findAllGlyphBoards().map((board) => ({ activeBoard: createActiveBoardInfo(board) })),
      });
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
      const done = startPerf("createGlyphBoard");
      const result = await createGlyphBoard(message.style, message.mode ?? "update");
      done();
      activeBoardId = result.board.id;
      const action = result.duplicatePrevented
        ? `${result.board.name} already exists. Select it to update or generate starters.`
        : result.created
        ? `Created ${result.board.name}.`
        : result.addedSlots > 0
          ? `Updated ${result.board.name}: added ${result.addedSlots} missing slots.`
          : `${result.board.name} is already up to date.`;
      postToUi({
        type: "GLYPH_BOARD_CREATED",
        message: action,
        warnings: result.warnings,
        activeBoard: createActiveBoardInfo(result.board),
      });
      figma.notify(action);
      postScanResult([result.board], { silent: true, mode: "lightweight" });
      return;
    }

    if (message.type === "GENERATE_STARTER_GLYPHS") {
      const done = startPerf("generateStarterGlyphs");
      const result = await generateStarterGlyphs(message.style);
      done();
      activeBoardId = result.board.id;
      const action =
        result.filledSlots > 0
          ? `Generated starter outlines in ${result.filledSlots} empty slots. Preserved ${result.skippedSlots} slots with existing artwork.`
          : `No empty slots needed starter outlines. Preserved ${result.skippedSlots} slots with existing artwork.`;
      postToUi({
        type: "STARTER_GLYPHS_GENERATED",
        message: `${action} Active board: ${result.board.name}.`,
        warnings: result.warnings,
        activeBoard: createActiveBoardInfo(result.board),
      });
      figma.notify(action);
      postScanResult([result.board], { silent: true, mode: "lightweight" });
      return;
    }

    if (message.type === "SCAN_SELECTED_GLYPHS") {
      await scanCurrentSelection({ silent: false, useLastActiveFallback: true, mode: "full" });
      return;
    }

    if (message.type === "SCAN_GLYPH") {
      await scanSingleGlyph(message.boardId, message.char);
      return;
    }

    if (message.type === "SCAN_ALL_GLYPH_BOARDS") {
      const boards = findAllGlyphBoards();
      if (boards.length === 0) {
        postToUi({
          type: "VALIDATION_ERROR",
          message: "No Typegen glyph boards found. Create at least one weight board before generating the font package.",
        });
        return;
      }

      postToUi({
        type: "ALL_GLYPH_BOARDS_SCANNED",
        boards: boards.map((board) => {
          const done = startPerf(`scanSelectedGlyphs export ${board.name}`);
          const result = scanSelectedGlyphs([board]);
          done();
          return {
            activeBoard: createActiveBoardInfo(board),
            glyphs: result.glyphs,
            summary: result.summary,
          };
        }),
      });
      figma.notify(`Scanned ${boards.length} Typegen glyph board${boards.length === 1 ? "" : "s"} for font package export.`);
      return;
    }

    postToUi({ type: "VALIDATION_ERROR", message: "Unknown Typegen action." });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unexpected plugin error.";
    postToUi({ type: "VALIDATION_ERROR", message: messageText });
    figma.notify(messageText, { error: true });
  }
};

type ScanMode = "full" | "lightweight";

async function scanDirectBoardSelection(): Promise<void> {
  const selectedBoard = findDirectlySelectedGlyphBoard();
  if (selectedBoard) {
    if (selectedBoard.id !== activeBoardId) {
      postScanResult([selectedBoard], { silent: true, mode: "lightweight" });
    }
    return;
  }

  if (selectionTouchesActiveBoard()) {
    return;
  }

  activeBoardId = "";
  postToUi({ type: "BOARD_SELECTION_CLEARED" });
}

async function scanCurrentSelection(options: { silent: boolean; useLastActiveFallback: boolean; mode: ScanMode }): Promise<void> {
  const scanSelection = await resolveScanSelection(options);
  if (scanSelection.length === 0) {
    if (options.silent) {
      activeBoardId = "";
      postToUi({ type: "BOARD_SELECTION_CLEARED" });
      return;
    }

    if (!options.silent) {
      postToUi({
        type: "VALIDATION_ERROR",
        message: "No glyph nodes found. Select the active Font Glyph Board or supported glyph slot frames.",
      });
    }
    return;
  }

  postScanResult(scanSelection, options);
}

function postScanResult(scanSelection: readonly SceneNode[], options: { silent: boolean; mode: ScanMode }): void {
  const version = ++scanVersion;
  const done = startPerf(`${options.mode} scan`);
  const result = options.mode === "lightweight"
    ? scanSelectedGlyphsLightweight(scanSelection)
    : scanSelectedGlyphs(scanSelection);
  done();
  const activeBoard = resolveActiveBoardForSelection(scanSelection);
  if (activeBoard) {
    activeBoardId = activeBoard.id;
  }
  postToUi({
    type: "GLYPHS_SCANNED",
    glyphs: result.glyphs,
    summary: result.summary,
    activeBoard: activeBoard ? createActiveBoardInfo(activeBoard) : undefined,
  });

  if (!options.silent) {
    figma.notify(`Scanned glyphs: ${result.summary.valid} valid, ${result.summary.empty} empty${activeBoard ? ` from ${activeBoard.name}` : ""}.`);
  }

  if (options.mode === "lightweight" && activeBoard) {
    scheduleDeferredFullScan(activeBoard, version);
  }
}

async function scanSingleGlyph(boardId: string, char: string): Promise<void> {
  if (!isGlyphChar(char)) {
    return;
  }

  const node = await figma.getNodeByIdAsync(boardId);
  if (!isFrameNode(node)) {
    postToUi({ type: "VALIDATION_ERROR", message: "The active Typegen board is no longer available. Select the board again." });
    return;
  }

  const done = startPerf(`single glyph scan ${char}`);
  const result = scanSelectedGlyphsForChars([node], [char]);
  done();
  const glyph = result.glyphs[0];
  if (!glyph) {
    return;
  }

  activeBoardId = node.id;
  postToUi({ type: "GLYPH_SCAN_UPDATED", glyph, activeBoard: createActiveBoardInfo(node) });
}

function scheduleDeferredFullScan(board: FrameNode, version: number): void {
  if (deferredFullScanTimer) {
    clearTimeout(deferredFullScanTimer);
  }

  deferredFullScanTimer = setTimeout(() => {
    deferredFullScanTimer = null;
    if (version !== scanVersion || activeBoardId !== board.id) {
      return;
    }

    if (board.removed) {
      clearActiveBoardScan(board.id);
      return;
    }

    postToUi({ type: "GLYPH_SCAN_STARTED", activeBoard: createActiveBoardInfo(board) });
    setTimeout(() => {
      if (version !== scanVersion || activeBoardId !== board.id) {
        return;
      }

      if (board.removed) {
        clearActiveBoardScan(board.id);
        return;
      }

      postScanResult([board], { silent: true, mode: "full" });
    }, 80);
  }, 350);
}

function clearActiveBoardScan(boardId: string): void {
  if (activeBoardId !== boardId) {
    return;
  }

  activeBoardId = "";
  scanVersion++;
  postToUi({ type: "BOARD_SELECTION_CLEARED" });
}

function startPerf(label: string): () => void {
  const start = Date.now();
  return () => {
    const elapsed = Date.now() - start;
    if (elapsed >= 50) {
      console.log(`${PERF_LOG_PREFIX} ${label}: ${elapsed}ms`);
    }
  };
}

async function resolveScanSelection(options: { useLastActiveFallback: boolean }): Promise<SceneNode[]> {
  const selectedBoard = findSelectedGlyphBoard();
  if (selectedBoard) {
    return [selectedBoard];
  }

  if (figma.currentPage.selection.length > 0) {
    return [...figma.currentPage.selection];
  }

  if (!options.useLastActiveFallback || !activeBoardId) {
    return [];
  }

  const node = await figma.getNodeByIdAsync(activeBoardId);
  return isSceneNode(node) ? [node] : [];
}

function resolveActiveBoardForSelection(selection: readonly SceneNode[]): FrameNode | null {
  const selectedBoard = findSelectedGlyphBoard();
  if (selectedBoard) {
    return selectedBoard;
  }

  for (const node of selection) {
    if (node.type === "FRAME" && node.id === activeBoardId) {
      return node;
    }
  }

  return null;
}

function selectionTouchesActiveBoard(): boolean {
  if (!activeBoardId) {
    return false;
  }

  return figma.currentPage.selection.some((node) => isNodeOrAncestor(node, activeBoardId));
}

function isNodeOrAncestor(node: BaseNode | null, ancestorId: string): boolean {
  let current = node;
  while (current) {
    if (current.id === ancestorId) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function createActiveBoardInfo(board: FrameNode): ActiveBoardInfo {
  const boardSpacing = loadBoardSpacing(board);
  return {
    id: board.id,
    name: board.name,
    style: getGlyphBoardStyle(board),
    spacing: boardSpacing.spacing,
    hasCustomSpacing: boardSpacing.hasCustomSpacing,
  };
}

function postToUi(message: PluginToUiMessage): void {
  figma.ui.postMessage(message);
}

function loadSettings(): PersistedTypegenSettings | null {
  const raw = figma.root.getPluginData(SETTINGS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isPersistedSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: PersistedTypegenSettings): void {
  if (!isPersistedSettings(settings)) {
    return;
  }

  figma.root.setPluginData(SETTINGS_KEY, JSON.stringify(settings));
}

function resetSettings(): void {
  figma.root.setPluginData(SETTINGS_KEY, "");
}

async function saveBoardSpacing(boardId: string, spacing: BoardSpacingSettings): Promise<void> {
  const node = await figma.getNodeByIdAsync(boardId);
  if (!isFrameNode(node)) {
    return;
  }

  node.setPluginData(BOARD_SPACING_KEY, JSON.stringify(sanitizeBoardSpacing(spacing)));
}

function loadBoardSpacing(board: FrameNode): { spacing: BoardSpacingSettings; hasCustomSpacing: boolean } {
  const raw = board.getPluginData(BOARD_SPACING_KEY);
  if (!raw) {
    return { spacing: cloneDefaultBoardSpacing(), hasCustomSpacing: false };
  }

  try {
    return { spacing: sanitizeBoardSpacing(JSON.parse(raw)), hasCustomSpacing: true };
  } catch {
    return { spacing: cloneDefaultBoardSpacing(), hasCustomSpacing: false };
  }
}

function sanitizeBoardSpacing(value: unknown): BoardSpacingSettings {
  const candidate = value && typeof value === "object" ? value as Partial<BoardSpacingSettings> : {};
  return {
    letterSpacing: clampNumber(candidate.letterSpacing, -120, 300, DEFAULT_BOARD_SPACING.letterSpacing),
    spaceWidth: clampNumber(candidate.spaceWidth, 120, 900, DEFAULT_BOARD_SPACING.spaceWidth),
    glyphAdvanceOverrides: sanitizeAdvanceOverrides(candidate.glyphAdvanceOverrides),
    kerningPairs: sanitizeKerningPairs(candidate.kerningPairs),
  };
}

function sanitizeAdvanceOverrides(overrides: BoardSpacingSettings["glyphAdvanceOverrides"] | undefined): BoardSpacingSettings["glyphAdvanceOverrides"] {
  if (!overrides || typeof overrides !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(overrides)
      .filter(([char]) => isGlyphChar(char))
      .map(([char, value]) => [char, clampNumber(value, 120, 1400, 700)]),
  ) as BoardSpacingSettings["glyphAdvanceOverrides"];
}

function sanitizeKerningPairs(pairs: BoardSpacingSettings["kerningPairs"] | undefined): BoardSpacingSettings["kerningPairs"] {
  if (!Array.isArray(pairs)) {
    return [];
  }

  return pairs
    .filter((pair): pair is KerningPair => Boolean(pair && isGlyphChar(pair.left) && isGlyphChar(pair.right)))
    .map((pair) => ({
      left: pair.left,
      right: pair.right,
      value: clampNumber(pair.value, -300, 300, 0),
    }))
    .filter((pair) => pair.value !== 0)
    .sort((a, b) => `${a.left}${a.right}`.localeCompare(`${b.left}${b.right}`));
}

function cloneDefaultBoardSpacing(): BoardSpacingSettings {
  return {
    letterSpacing: DEFAULT_BOARD_SPACING.letterSpacing,
    spaceWidth: DEFAULT_BOARD_SPACING.spaceWidth,
    glyphAdvanceOverrides: {},
    kerningPairs: [],
  };
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.round(Math.min(max, Math.max(min, value as number)));
}

function isGlyphChar(value: string): value is GlyphChar {
  return (GLYPH_CHARS as readonly string[]).includes(value);
}

async function restoreSavedScan(nodeIds: string[]): Promise<void> {
  const nodes = await Promise.all([...new Set(nodeIds)].map((id) => figma.getNodeByIdAsync(id)));
  const sceneNodes = nodes.filter(isSceneNode);

  if (sceneNodes.length === 0) {
    postToUi({
      type: "VALIDATION_ERROR",
      message: "Saved glyph scan could not be restored. Select the board and scan again.",
    });
    return;
  }

  const result = scanSelectedGlyphs(sceneNodes);
  postToUi({
    type: "GLYPHS_SCANNED",
    glyphs: result.glyphs,
    summary: result.summary,
  });
}

function isPersistedSettings(value: unknown): value is PersistedTypegenSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as PersistedTypegenSettings;
  return (
    typeof candidate.fontName === "string" &&
    typeof candidate.previewText === "string" &&
    typeof candidate.selectedGlyph === "string" &&
    candidate.selectedGlyph.length === 1 &&
    Array.isArray(candidate.lastScanNodeIds) &&
    candidate.lastScanNodeIds.every((id) => typeof id === "string")
  );
}

function isSceneNode(node: BaseNode | null): node is SceneNode {
  return Boolean(node && "visible" in node && "absoluteTransform" in node);
}

function isFrameNode(node: BaseNode | null): node is FrameNode {
  return Boolean(node && node.type === "FRAME");
}
