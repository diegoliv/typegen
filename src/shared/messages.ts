import type { BoardSpacingSettings, FontWeightStyle, GlyphScanResult, PersistedTypegenSettings, ScanSummary } from './types';

export type ActiveBoardInfo = {
  id: string;
  name: string;
  style: FontWeightStyle;
  spacing: BoardSpacingSettings;
  hasCustomSpacing: boolean;
};

export type BoardSettingsSource = {
  activeBoard: ActiveBoardInfo;
};

export type UiToPluginMessage =
  | { type: 'CREATE_GLYPH_BOARD'; style?: FontWeightStyle; mode?: 'new' | 'update' }
  | { type: 'GENERATE_STARTER_GLYPHS'; style?: FontWeightStyle }
  | { type: 'SCAN_SELECTED_GLYPHS' }
  | { type: 'SCAN_GLYPH'; boardId: string; char: string }
  | { type: 'SCAN_ALL_GLYPH_BOARDS' }
  | { type: 'RESTORE_SAVED_SCAN'; nodeIds: string[] }
  | { type: 'SAVE_SETTINGS'; settings: PersistedTypegenSettings }
  | { type: 'SAVE_BOARD_SPACING'; boardId: string; spacing: BoardSpacingSettings }
  | { type: 'REQUEST_BOARD_SETTINGS_SOURCES' }
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
      type: 'GLYPH_SCAN_STARTED';
      activeBoard?: ActiveBoardInfo;
    }
  | {
      type: 'GLYPH_SCAN_UPDATED';
      glyph: GlyphScanResult;
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
      type: 'BOARD_SETTINGS_SOURCES';
      sources: BoardSettingsSource[];
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
