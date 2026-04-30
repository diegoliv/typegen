export type {
  GlyphChar,
  KerningPair,
  GlyphModel,
  GlyphScanResult,
  NormalizedCommand as NormalizedPathCommand,
  NormalizedPath,
} from '../shared/types';

export {
  GLYPH_CHARS,
  GLYPH_DEFINITIONS,
  LOWERCASE_GUIDE_PROFILE,
  defaultAdvanceForChar,
  glyphLabelForChar,
  glyphNameForChar,
} from '../shared/types';

import { GLYPH_CHARS, type BoardSpacingSettings, type GlyphChar, type GlyphModel, type KerningPair } from '../shared/types';

export const FONT_METRICS = {
  unitsPerEm: 1000,
  ascender: 900,
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
  verification: FontVerificationResult;
};

export type FontVerificationResult = {
  parsedGlyphCount: number;
  verifiedGlyphs: FontVerifiedGlyph[];
  failedGlyphs: GlyphChar[];
  verifiedKerningPairs: KerningPair[];
  failedKerningPairs: KerningPair[];
};

export type FontVerifiedGlyph = {
  char: GlyphChar;
  unicode: number;
  advanceWidth: number;
  commandCount: number;
};

export type FontSpacingSettings = BoardSpacingSettings;

export const DEFAULT_SPACING: FontSpacingSettings = {
  letterSpacing: 0,
  spaceWidth: 320,
  glyphAdvanceOverrides: {},
  kerningPairs: [],
};

export const KERNING_MIN = -300;
export const KERNING_MAX = 300;

export function normalizeSpacingSettings(spacing?: Partial<FontSpacingSettings>): FontSpacingSettings {
  return {
    letterSpacing: clampMetric(spacing?.letterSpacing ?? DEFAULT_SPACING.letterSpacing, -120, 300),
    spaceWidth: clampMetric(spacing?.spaceWidth ?? DEFAULT_SPACING.spaceWidth, 120, 900),
    glyphAdvanceOverrides: normalizeGlyphAdvanceOverrides(spacing?.glyphAdvanceOverrides),
    kerningPairs: normalizeKerningPairs(spacing?.kerningPairs),
  };
}

export function resolveGlyphAdvance(glyph: GlyphModel, spacing?: Partial<FontSpacingSettings>): number {
  const normalized = normalizeSpacingSettings(spacing);
  const override = normalized.glyphAdvanceOverrides[glyph.char];
  return clampMetric((override ?? glyph.advanceWidth) + normalized.letterSpacing, 120, 1400);
}

export function collectMetricsWarnings(
  glyphs: GlyphModel[],
  spacing?: Partial<FontSpacingSettings>,
): string[] {
  const normalized = normalizeSpacingSettings(spacing);
  const warnings: string[] = [];

  if (normalized.letterSpacing <= -80) {
    warnings.push(`Letter spacing ${normalized.letterSpacing} may make glyphs collide.`);
  } else if (normalized.letterSpacing >= 220) {
    warnings.push(`Letter spacing ${normalized.letterSpacing} is very loose.`);
  }

  if (normalized.spaceWidth <= 160) {
    warnings.push(`Space width ${normalized.spaceWidth} is very narrow.`);
  } else if (normalized.spaceWidth >= 700) {
    warnings.push(`Space width ${normalized.spaceWidth} is very wide.`);
  }

  for (const glyph of sortGlyphsByAlphabet(getUsableGlyphs(glyphs))) {
    const advance = resolveGlyphAdvance(glyph, normalized);
    if (advance <= 180) {
      warnings.push(`${glyph.char} export advance ${advance} is very narrow.`);
    } else if (advance >= 1200) {
      warnings.push(`${glyph.char} export advance ${advance} is very wide.`);
    }
  }

  for (const pair of normalized.kerningPairs) {
    if (pair.value <= -220) {
      warnings.push(`${pair.left}${pair.right} kerning ${pair.value} is very tight.`);
    } else if (pair.value >= 220) {
      warnings.push(`${pair.left}${pair.right} kerning ${pair.value} is very loose.`);
    }
  }

  return warnings;
}

export function kerningKey(left: GlyphChar, right: GlyphChar): string {
  return `${left}${right}`;
}

export function resolveKerningValue(
  left: GlyphChar | undefined,
  right: GlyphChar | undefined,
  spacing?: Partial<FontSpacingSettings>,
): number {
  if (!left || !right) {
    return 0;
  }

  const normalized = normalizeSpacingSettings(spacing);
  return normalized.kerningPairs.find((pair) => pair.left === left && pair.right === right)?.value ?? 0;
}

export function upsertKerningPair(
  pairs: KerningPair[],
  left: GlyphChar,
  right: GlyphChar,
  value: number,
): KerningPair[] {
  const normalizedValue = clampMetric(value, KERNING_MIN, KERNING_MAX);
  const next = normalizeKerningPairs(pairs).filter((pair) => pair.left !== left || pair.right !== right);

  if (normalizedValue === 0) {
    return next;
  }

  return sortKerningPairs([...next, { left, right, value: normalizedValue }]);
}

export function removeKerningPair(pairs: KerningPair[], left: GlyphChar, right: GlyphChar): KerningPair[] {
  return normalizeKerningPairs(pairs).filter((pair) => pair.left !== left || pair.right !== right);
}

export function isGlyphChar(value: string): value is GlyphChar {
  return (GLYPH_CHARS as readonly string[]).includes(value);
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

export function normalizeKerningPairs(pairs?: KerningPair[]): KerningPair[] {
  if (!Array.isArray(pairs)) {
    return [];
  }

  const normalized = new Map<string, KerningPair>();

  for (const pair of pairs) {
    if (!pair || !isGlyphChar(pair.left) || !isGlyphChar(pair.right)) {
      continue;
    }

    const value = clampMetric(Number(pair.value), KERNING_MIN, KERNING_MAX);
    if (value === 0) {
      continue;
    }

    normalized.set(kerningKey(pair.left, pair.right), {
      left: pair.left,
      right: pair.right,
      value,
    });
  }

  return sortKerningPairs([...normalized.values()]);
}

function sortKerningPairs(pairs: KerningPair[]): KerningPair[] {
  const order = new Map<string, number>(GLYPH_CHARS.map((char, index) => [char, index]));
  return [...pairs].sort((a, b) => {
    const left = (order.get(a.left) ?? 999) - (order.get(b.left) ?? 999);
    if (left !== 0) return left;
    return (order.get(a.right) ?? 999) - (order.get(b.right) ?? 999);
  });
}
