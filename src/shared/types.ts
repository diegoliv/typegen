export const GLYPH_DEFINITIONS = [
  { char: 'A', name: 'glyph-A', label: 'A' },
  { char: 'B', name: 'glyph-B', label: 'B' },
  { char: 'C', name: 'glyph-C', label: 'C' },
  { char: 'D', name: 'glyph-D', label: 'D' },
  { char: 'E', name: 'glyph-E', label: 'E' },
  { char: 'F', name: 'glyph-F', label: 'F' },
  { char: 'G', name: 'glyph-G', label: 'G' },
  { char: 'H', name: 'glyph-H', label: 'H' },
  { char: 'I', name: 'glyph-I', label: 'I' },
  { char: 'J', name: 'glyph-J', label: 'J' },
  { char: 'K', name: 'glyph-K', label: 'K' },
  { char: 'L', name: 'glyph-L', label: 'L' },
  { char: 'M', name: 'glyph-M', label: 'M' },
  { char: 'N', name: 'glyph-N', label: 'N' },
  { char: 'O', name: 'glyph-O', label: 'O' },
  { char: 'P', name: 'glyph-P', label: 'P' },
  { char: 'Q', name: 'glyph-Q', label: 'Q' },
  { char: 'R', name: 'glyph-R', label: 'R' },
  { char: 'S', name: 'glyph-S', label: 'S' },
  { char: 'T', name: 'glyph-T', label: 'T' },
  { char: 'U', name: 'glyph-U', label: 'U' },
  { char: 'V', name: 'glyph-V', label: 'V' },
  { char: 'W', name: 'glyph-W', label: 'W' },
  { char: 'X', name: 'glyph-X', label: 'X' },
  { char: 'Y', name: 'glyph-Y', label: 'Y' },
  { char: 'Z', name: 'glyph-Z', label: 'Z' },
  { char: '0', name: 'glyph-0', label: '0' },
  { char: '1', name: 'glyph-1', label: '1' },
  { char: '2', name: 'glyph-2', label: '2' },
  { char: '3', name: 'glyph-3', label: '3' },
  { char: '4', name: 'glyph-4', label: '4' },
  { char: '5', name: 'glyph-5', label: '5' },
  { char: '6', name: 'glyph-6', label: '6' },
  { char: '7', name: 'glyph-7', label: '7' },
  { char: '8', name: 'glyph-8', label: '8' },
  { char: '9', name: 'glyph-9', label: '9' },
  { char: '.', name: 'glyph-period', label: '.', defaultAdvanceWidth: 260 },
  { char: ',', name: 'glyph-comma', label: ',', defaultAdvanceWidth: 260 },
  { char: '!', name: 'glyph-exclamation', label: '!', defaultAdvanceWidth: 320 },
  { char: '?', name: 'glyph-question', label: '?', defaultAdvanceWidth: 560 },
  { char: '-', name: 'glyph-hyphen', label: '-', defaultAdvanceWidth: 420 },
  { char: ':', name: 'glyph-colon', label: ':', defaultAdvanceWidth: 280 },
] as const;

export type GlyphChar = (typeof GLYPH_DEFINITIONS)[number]['char'];

export const GLYPH_CHARS = GLYPH_DEFINITIONS.map((definition) => definition.char) as GlyphChar[];

export function glyphNameForChar(char: GlyphChar): string {
  return GLYPH_DEFINITIONS.find((definition) => definition.char === char)?.name ?? `glyph-${char}`;
}

export function glyphLabelForChar(char: GlyphChar): string {
  return GLYPH_DEFINITIONS.find((definition) => definition.char === char)?.label ?? char;
}

export function defaultAdvanceForChar(char: GlyphChar): number {
  const definition = GLYPH_DEFINITIONS.find((item) => item.char === char);
  return definition && 'defaultAdvanceWidth' in definition ? definition.defaultAdvanceWidth : 700;
}

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
