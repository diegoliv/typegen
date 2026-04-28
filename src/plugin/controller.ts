import { createGlyphBoard } from "./glyphBoard";
import { scanSelectedGlyphs } from "./figmaNodes";
import { PersistedTypegenSettings, PluginToUiMessage, UiToPluginMessage } from "./pluginTypes";

declare const __html__: string;

const SETTINGS_KEY = "typegen-settings-v1";

figma.showUI(__html__, { width: 420, height: 640, themeColors: true });
postToUi({ type: "PLUGIN_READY" });
postToUi({ type: "SETTINGS_LOADED", settings: loadSettings() });

figma.ui.onmessage = async (message: UiToPluginMessage) => {
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
      const action = result.created
        ? `Created ${result.board.name}.`
        : result.addedSlots > 0
          ? `Updated ${result.board.name}: added ${result.addedSlots} missing slots.`
          : `${result.board.name} is already up to date.`;
      postToUi({
        type: "GLYPH_BOARD_CREATED",
        message: action,
        warnings: result.warnings,
      });
      figma.notify(action);
      return;
    }

    if (message.type === "SCAN_SELECTED_GLYPHS") {
      if (figma.currentPage.selection.length === 0) {
        postToUi({
          type: "VALIDATION_ERROR",
          message: "No glyph nodes found. Select the Font Glyph Board or supported glyph slot frames.",
        });
        return;
      }

      const result = scanSelectedGlyphs(figma.currentPage.selection);
      postToUi({
        type: "GLYPHS_SCANNED",
        glyphs: result.glyphs,
        summary: result.summary,
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
    candidate.lastScanNodeIds.every((id) => typeof id === "string") &&
    Boolean(candidate.spacing) &&
    typeof candidate.spacing === "object" &&
    typeof candidate.spacing.letterSpacing === "number" &&
    typeof candidate.spacing.spaceWidth === "number" &&
    Boolean(candidate.spacing.glyphAdvanceOverrides) &&
    typeof candidate.spacing.glyphAdvanceOverrides === "object"
  );
}

function isSceneNode(node: BaseNode | null): node is SceneNode {
  return Boolean(node && "visible" in node && "absoluteTransform" in node);
}
