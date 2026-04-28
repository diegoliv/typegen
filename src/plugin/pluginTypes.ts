export const SUPPORTED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type GlyphStatus = "valid" | "empty" | "unsupported" | "missing";

export type GlyphCommand =
  | { type: "M"; x: number; y: number }
  | { type: "L"; x: number; y: number }
  | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: "Q"; x1: number; y1: number; x: number; y: number }
  | { type: "Z" };

export type NormalizedPath = {
  commands: GlyphCommand[];
  windingRule?: "NONZERO" | "EVENODD";
};

export type GlyphModel = {
  char: string;
  unicode: number;
  name: string;
  advanceWidth: number;
  bounds: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  paths: NormalizedPath[];
  warnings: string[];
};

export type GlyphScanResult = {
  char: string;
  unicode: number;
  name: string;
  status: GlyphStatus;
  message: string;
  nodeId?: string;
  glyph?: GlyphModel;
  warnings: string[];
};

export type GlyphScanSummary = {
  valid: number;
  empty: number;
  unsupported: number;
  missing: number;
  warnings: number;
};

export type PersistedTypegenSettings = {
  fontName: string;
  previewText: string;
  selectedGlyph: string;
  lastScanNodeIds: string[];
  spacing: {
    letterSpacing: number;
    spaceWidth: number;
    glyphAdvanceOverrides: Record<string, number>;
  };
};

export type PluginToUiMessage =
  | {
      type: "PLUGIN_READY";
    }
  | {
      type: "SETTINGS_LOADED";
      settings: PersistedTypegenSettings | null;
    }
  | {
      type: "SETTINGS_RESET";
    }
  | {
      type: "GLYPH_BOARD_CREATED";
      message: string;
      warnings: string[];
    }
  | {
      type: "GLYPHS_SCANNED";
      glyphs: GlyphScanResult[];
      summary: GlyphScanSummary;
    }
  | {
      type: "VALIDATION_ERROR";
      message: string;
    };

export type UiToPluginMessage =
  | { type: "CREATE_GLYPH_BOARD" }
  | { type: "SCAN_SELECTED_GLYPHS" }
  | { type: "RESTORE_SAVED_SCAN"; nodeIds: string[] }
  | { type: "SAVE_SETTINGS"; settings: PersistedTypegenSettings }
  | { type: "RESET_SETTINGS" };

export const TYPEGEN_ROLE_KEY = "typegen-role";
export const TYPEGEN_ROLE_BOARD = "board";
export const TYPEGEN_ROLE_SLOT = "glyph-slot";
export const TYPEGEN_ROLE_HELPER = "helper";

export function isSupportedGlyphName(name: string): boolean {
  return /^glyph-[A-Z]$/.test(name);
}

export function glyphCharFromName(name: string): string | null {
  return isSupportedGlyphName(name) ? name.slice("glyph-".length) : null;
}

export function unicodeForChar(char: string): number {
  return char.charCodeAt(0);
}
