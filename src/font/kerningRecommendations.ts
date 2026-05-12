import {
  GLYPH_CHARS,
  glyphLabelForChar,
  isGlyphChar,
  resolveKerningValue,
  type FontSpacingSettings,
  type GlyphChar,
} from './glyphModel';
import type { GlyphScanResult } from '../shared/types';

export type KerningPairFamilyId = 'uppercase' | 'lowercase' | 'mixed' | 'punctuation' | 'numbers' | 'custom';

export type KerningPairFamily = {
  id: KerningPairFamilyId;
  label: string;
};

export type RecommendedKerningPair = {
  left: GlyphChar;
  right: GlyphChar;
  family: KerningPairFamilyId;
};

export type KerningPairStatus = 'customized' | 'not-customized' | 'blocked';

export type KerningPairReview = {
  pair: RecommendedKerningPair;
  label: string;
  status: KerningPairStatus;
  value: number;
  leftIsValid: boolean;
  rightIsValid: boolean;
};

export const KERNING_PAIR_FAMILIES: KerningPairFamily[] = [
  { id: 'uppercase', label: 'Uppercase' },
  { id: 'lowercase', label: 'Lowercase' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'punctuation', label: 'Punctuation' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'custom', label: 'Custom' },
];

const RECOMMENDED_PAIR_SEEDS: Array<RecommendedKerningPair & { key: string }> = [
  ...pairSeeds('uppercase', [
    'AV', 'AW', 'AY', 'AT', 'AU', 'AO', 'AC', 'AG', 'AQ',
    'VA', 'VE', 'VI', 'VO', 'VU', 'VY',
    'WA', 'WE', 'WI', 'WO', 'WU', 'WY',
    'YA', 'YE', 'YI', 'YO', 'YU', 'YS',
    'LA', 'LC', 'LG', 'LO', 'LQ', 'LT', 'LU', 'LV', 'LW', 'LY',
    'FA', 'FE', 'FI', 'FO', 'FU', 'FY',
    'PA', 'PE', 'PI', 'PO', 'PU', 'PY',
    'TA', 'TC', 'TE', 'TG', 'TI', 'TO', 'TQ', 'TR', 'TS', 'TU', 'TV', 'TW', 'TY',
    'RA', 'RC', 'RE', 'RG', 'RO', 'RQ', 'RT', 'RU', 'RV', 'RW', 'RY',
    'OA', 'OV', 'OW', 'OY',
    'CA', 'CV', 'CW', 'CY',
    'GA', 'GV', 'GW', 'GY',
    'QA', 'QV', 'QW', 'QY',
  ]),
  ...pairSeeds('mixed', [
    'Av', 'Aw', 'Ay', 'At', 'Au', 'Ao',
    'Va', 'Ve', 'Vi', 'Vo', 'Vu', 'Vy',
    'Wa', 'We', 'Wi', 'Wo', 'Wu', 'Wy',
    'Ya', 'Ye', 'Yi', 'Yo', 'Yu', 'Ys',
    'La', 'Le', 'Lo', 'Lu', 'Ly',
    'Fa', 'Fe', 'Fi', 'Fo', 'Fr', 'Fu',
    'Pa', 'Pe', 'Pi', 'Po', 'Pu', 'Py',
    'Ta', 'Te', 'Ti', 'To', 'Tu', 'Ty', 'Tr', 'Ts',
    'Ra', 'Re', 'Ri', 'Ro', 'Ru', 'Ry',
  ]),
  ...pairSeeds('punctuation', [
    'A.', 'A,', 'A:', 'A;', 'A-',
    'F.', 'F,', 'F:', 'F;', 'F-',
    'L.', 'L,', 'L:', 'L;', 'L-',
    'P.', 'P,', 'P:', 'P;', 'P-',
    'T.', 'T,', 'T:', 'T;', 'T-',
    'V.', 'V,', 'V:', 'V;', 'V-',
    'W.', 'W,', 'W:', 'W;', 'W-',
    'Y.', 'Y,', 'Y:', 'Y;', 'Y-',
  ]),
  ...pairSeeds('numbers', [
    '11', '12', '13', '14', '17', '19',
    '20', '21', '24', '27', '29',
    '30', '31', '34', '37', '39',
    '40', '41', '44', '47', '49',
    '50', '51', '54', '57', '59',
    '70', '71', '74', '77', '79',
    '90', '91', '94', '97', '99',
  ]),
];

export const RECOMMENDED_KERNING_PAIRS: RecommendedKerningPair[] = RECOMMENDED_PAIR_SEEDS
  .filter((pair) => isGlyphChar(pair.left) && isGlyphChar(pair.right))
  .filter((pair, index, pairs) => pairs.findIndex((item) => item.key === pair.key) === index)
  .map(({ key: _key, ...pair }) => pair)
  .sort((a, b) => glyphOrder(a.left) - glyphOrder(b.left) || glyphOrder(a.right) - glyphOrder(b.right));

export function getRecommendedKerningPairsForLeft(left: GlyphChar): RecommendedKerningPair[] {
  return RECOMMENDED_KERNING_PAIRS.filter((pair) => pair.left === left);
}

export function reviewKerningPair(
  pair: RecommendedKerningPair,
  glyphs: GlyphScanResult[],
  spacing: FontSpacingSettings,
): KerningPairReview {
  const valid = new Set(glyphs.filter((glyph) => glyph.status === 'valid' && glyph.glyph).map((glyph) => glyph.char));
  const leftIsValid = valid.has(pair.left);
  const rightIsValid = valid.has(pair.right);
  const value = resolveKerningValue(pair.left, pair.right, spacing);
  const status: KerningPairStatus = !leftIsValid || !rightIsValid
    ? 'blocked'
    : value === 0
      ? 'not-customized'
      : 'customized';

  return {
    pair,
    label: formatKerningPairLabel(pair.left, pair.right),
    status,
    value,
    leftIsValid,
    rightIsValid,
  };
}

export function reviewRecommendedKerningPairs(
  pairs: RecommendedKerningPair[],
  glyphs: GlyphScanResult[],
  spacing: FontSpacingSettings,
): KerningPairReview[] {
  return pairs.map((pair) => reviewKerningPair(pair, glyphs, spacing));
}

export function formatKerningPairLabel(left: GlyphChar, right: GlyphChar): string {
  return `${glyphLabelForChar(left)}${glyphLabelForChar(right)}`;
}

function pairSeeds(family: KerningPairFamilyId, pairs: string[]): Array<RecommendedKerningPair & { key: string }> {
  return pairs
    .map((pair) => {
      const [left, right] = Array.from(pair);
      return {
        left: left as GlyphChar,
        right: right as GlyphChar,
        family,
        key: `${left}${right}`,
      };
    })
    .filter((pair) => Boolean(pair.left && pair.right));
}

function glyphOrder(char: GlyphChar): number {
  return GLYPH_CHARS.indexOf(char);
}
