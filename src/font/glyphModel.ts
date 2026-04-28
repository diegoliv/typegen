export type {
  GlyphChar,
  GlyphModel,
  GlyphScanResult,
  NormalizedCommand as NormalizedPathCommand,
  NormalizedPath,
} from '../shared/types';

export { GLYPH_CHARS } from '../shared/types';

import { GLYPH_CHARS, type GlyphChar, type GlyphModel } from '../shared/types';

export const FONT_METRICS = {
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  capHeight: 700,
  defaultAdvanceWidth: 700,
  notdefAdvanceWidth: 700,
} as const;

export type FontBuildInput = {
  familyName: string;
  glyphs: GlyphModel[];
  spacing?: FontSpacingSettings;
};

export type FontBuildResult = {
  arrayBuffer: ArrayBuffer;
  familyName: string;
  glyphCount: number;
  warnings: string[];
};

export type FontSpacingSettings = {
  letterSpacing: number;
  spaceWidth: number;
  glyphAdvanceOverrides: Partial<Record<GlyphChar, number>>;
};

export const DEFAULT_SPACING: FontSpacingSettings = {
  letterSpacing: 0,
  spaceWidth: 320,
  glyphAdvanceOverrides: {},
};

export function normalizeSpacingSettings(spacing?: Partial<FontSpacingSettings>): FontSpacingSettings {
  return {
    letterSpacing: clampMetric(spacing?.letterSpacing ?? DEFAULT_SPACING.letterSpacing, -120, 300),
    spaceWidth: clampMetric(spacing?.spaceWidth ?? DEFAULT_SPACING.spaceWidth, 120, 900),
    glyphAdvanceOverrides: normalizeGlyphAdvanceOverrides(spacing?.glyphAdvanceOverrides),
  };
}

export function resolveGlyphAdvance(glyph: GlyphModel, spacing?: Partial<FontSpacingSettings>): number {
  const normalized = normalizeSpacingSettings(spacing);
  const override = normalized.glyphAdvanceOverrides[glyph.char];
  return clampMetric((override ?? glyph.advanceWidth) + normalized.letterSpacing, 120, 1400);
}

export function isGlyphChar(value: string): value is GlyphChar {
  return (GLYPH_CHARS as string[]).includes(value);
}

export function getUsableGlyphs(glyphs: GlyphModel[]): GlyphModel[] {
  return glyphs.filter((glyph) => glyph.paths.some((path) => path.commands.length > 0));
}

export function sortGlyphsByAlphabet(glyphs: GlyphModel[]): GlyphModel[] {
  const order = new Map<string, number>(GLYPH_CHARS.map((char, index) => [char, index]));
  return [...glyphs].sort((a, b) => (order.get(a.char) ?? 999) - (order.get(b.char) ?? 999));
}

function clampMetric(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.round(Math.min(max, Math.max(min, value)));
}

function normalizeGlyphAdvanceOverrides(
  overrides?: Partial<Record<GlyphChar, number>>,
): Partial<Record<GlyphChar, number>> {
  if (!overrides) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(overrides)
      .filter(([char]) => isGlyphChar(char))
      .map(([char, value]) => [char, clampMetric(Number(value), 120, 1400)]),
  ) as Partial<Record<GlyphChar, number>>;
}
