import {
  GLYPH_CHARS,
  GLYPH_DEFINITIONS,
  glyphNameForChar as sharedGlyphNameForChar,
  type GlyphChar,
} from "../shared/types";

export const SUPPORTED_CHARS = [...GLYPH_CHARS];

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

export type ActiveBoardInfo = {
  id: string;
  name: string;
  style: "Regular" | "Bold";
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
      activeBoard: ActiveBoardInfo;
    }
  | {
      type: "STARTER_GLYPHS_GENERATED";
      message: string;
      warnings: string[];
      activeBoard: ActiveBoardInfo;
    }
  | {
      type: "GLYPHS_SCANNED";
      glyphs: GlyphScanResult[];
      summary: GlyphScanSummary;
      activeBoard?: ActiveBoardInfo;
    }
  | {
      type: "ALL_GLYPH_BOARDS_SCANNED";
      boards: BoardScanResult[];
    }
  | {
      type: "VALIDATION_ERROR";
      message: string;
    };

export type UiToPluginMessage =
  | { type: "CREATE_GLYPH_BOARD"; style?: "Regular" | "Bold" }
  | { type: "GENERATE_STARTER_GLYPHS"; style?: "Regular" | "Bold" }
  | { type: "SCAN_SELECTED_GLYPHS" }
  | { type: "SCAN_ALL_GLYPH_BOARDS" }
  | { type: "RESTORE_SAVED_SCAN"; nodeIds: string[] }
  | { type: "SAVE_SETTINGS"; settings: PersistedTypegenSettings }
  | { type: "RESET_SETTINGS" };

export type BoardScanResult = {
  activeBoard: ActiveBoardInfo;
  glyphs: GlyphScanResult[];
  summary: GlyphScanSummary;
};

export const TYPEGEN_ROLE_KEY = "typegen-role";
export const TYPEGEN_ROLE_BOARD = "board";
export const TYPEGEN_ROLE_SLOT = "glyph-slot";
export const TYPEGEN_ROLE_HELPER = "helper";

const GLYPH_NAME_ALIASES: Record<string, GlyphChar> = {
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
  "glyph-@": "@",
};

export function isSupportedGlyphName(name: string): boolean {
  return Boolean(glyphCharFromName(name));
}

export function glyphCharFromName(name: string): string | null {
  return GLYPH_DEFINITIONS.find((definition) => definition.name === name)?.char ?? GLYPH_NAME_ALIASES[name] ?? null;
}

export function unicodeForChar(char: string): number {
  return char.codePointAt(0) ?? 0;
}

export function glyphNameForChar(char: string): string {
  return sharedGlyphNameForChar(char as GlyphChar);
}
