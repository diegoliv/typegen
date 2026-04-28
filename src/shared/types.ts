export const GLYPH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as GlyphChar[];

export type GlyphChar =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

export type GlyphStatus = 'missing' | 'empty' | 'valid' | 'unsupported' | 'warning';

export type NormalizedCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x: number; y: number }
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: 'Q'; x1: number; y1: number; x: number; y: number }
  | { type: 'Z' };

export type NormalizedPath = {
  commands: NormalizedCommand[];
  windingRule?: 'NONZERO' | 'EVENODD';
};

export type GlyphModel = {
  char: GlyphChar;
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
  char: GlyphChar;
  name: string;
  status: GlyphStatus;
  message: string;
  warnings: string[];
  nodeId?: string;
  glyph?: GlyphModel;
};

export type ScanSummary = {
  valid: number;
  empty: number;
  missing: number;
  unsupported: number;
  warnings: number;
};

export type GeneratedFont = {
  familyName: string;
  filename: string;
  glyphCount: number;
  buffer: ArrayBuffer;
};

export type PersistedTypegenSettings = {
  fontName: string;
  previewText: string;
  selectedGlyph: GlyphChar;
  lastScanNodeIds: string[];
  spacing: {
    letterSpacing: number;
    spaceWidth: number;
    glyphAdvanceOverrides: Partial<Record<GlyphChar, number>>;
  };
};
