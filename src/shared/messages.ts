import type { GlyphScanResult, PersistedTypegenSettings, ScanSummary } from './types';

export type UiToPluginMessage =
  | { type: 'CREATE_GLYPH_BOARD' }
  | { type: 'SCAN_SELECTED_GLYPHS' }
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
    }
  | {
      type: 'GLYPHS_SCANNED';
      glyphs: GlyphScanResult[];
      summary: ScanSummary;
    }
  | {
      type: 'VALIDATION_ERROR';
      message: string;
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
