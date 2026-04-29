import type { GlyphScanResult, PersistedTypegenSettings, ScanSummary } from './types';

export type ActiveBoardInfo = {
  id: string;
  name: string;
  style: 'Regular' | 'Bold';
};

export type UiToPluginMessage =
  | { type: 'CREATE_GLYPH_BOARD'; style?: 'Regular' | 'Bold' }
  | { type: 'GENERATE_STARTER_GLYPHS'; style?: 'Regular' | 'Bold' }
  | { type: 'SCAN_SELECTED_GLYPHS' }
  | { type: 'SCAN_ALL_GLYPH_BOARDS' }
  | { type: 'RESTORE_SAVED_SCAN'; nodeIds: string[] }
  | { type: 'SAVE_SETTINGS'; settings: PersistedTypegenSettings }
  | { type: 'RESET_SETTINGS' };

export type PluginToUiMessage =
  | {
      type: 'PLUGIN_READY';
    }
  | {
      type: 'SETTINGS_LOADED';
      settings: PersistedTypegenSettings | null;
    }
  | {
      type: 'SETTINGS_RESET';
    }
  | {
      type: 'GLYPH_BOARD_CREATED';
      message: string;
      warnings: string[];
      activeBoard: ActiveBoardInfo;
    }
  | {
      type: 'STARTER_GLYPHS_GENERATED';
      message: string;
      warnings: string[];
      activeBoard: ActiveBoardInfo;
    }
  | {
      type: 'GLYPHS_SCANNED';
      glyphs: GlyphScanResult[];
      summary: ScanSummary;
      activeBoard?: ActiveBoardInfo;
    }
  | {
      type: 'BOARD_SELECTION_CLEARED';
    }
  | {
      type: 'ALL_GLYPH_BOARDS_SCANNED';
      boards: BoardScanResult[];
    }
  | {
      type: 'VALIDATION_ERROR';
      message: string;
    };

export type BoardScanResult = {
  activeBoard: ActiveBoardInfo;
  glyphs: GlyphScanResult[];
  summary: ScanSummary;
};

export function postToPlugin(message: UiToPluginMessage) {
  parent.postMessage({ pluginMessage: message }, '*');
}

export function isPluginMessage(message: unknown): message is PluginToUiMessage {
  return Boolean(
    message &&
      typeof message === 'object' &&
      'type' in message &&
      typeof (message as { type: unknown }).type === 'string',
  );
}
