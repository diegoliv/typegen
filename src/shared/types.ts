export type GlyphCategoryId =
  | 'uppercase'
  | 'lowercase'
  | 'numbers'
  | 'punctuation'
  | 'symbols'
  | 'currency'
  | 'math'
  | 'marks'
  | 'latin-uppercase'
  | 'latin-lowercase';

export type GlyphDefinition = {
  char: string;
  name: string;
  label: string;
  category: GlyphCategoryId;
  guideProfile?: SlotGuideProfileName;
  defaultAdvanceWidth?: number;
};

export type GlyphCategory = {
  id: GlyphCategoryId;
  label: string;
  description: string;
};

export const GLYPH_CATEGORIES: GlyphCategory[] = [
  { id: 'uppercase', label: 'Uppercase', description: 'A-Z' },
  { id: 'lowercase', label: 'Lowercase', description: 'a-z' },
  { id: 'numbers', label: 'Numbers', description: '0-9' },
  { id: 'punctuation', label: 'Punctuation', description: 'ASCII punctuation, quotes, and dashes' },
  { id: 'symbols', label: 'Symbols', description: 'General symbols and legal marks' },
  { id: 'currency', label: 'Currency', description: 'Common currency signs' },
  { id: 'math', label: 'Math', description: 'Operators and comparisons' },
  { id: 'marks', label: 'Marks', description: 'Standalone diacritic and accent marks' },
  { id: 'latin-uppercase', label: 'Latin Uppercase', description: 'Accented and extended uppercase letters' },
  { id: 'latin-lowercase', label: 'Latin Lowercase', description: 'Accented and extended lowercase letters' },
];

const GLYPH_CATEGORY_CHARS: Array<{ category: GlyphCategoryId; chars: string }> = [
  { category: 'uppercase', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { category: 'lowercase', chars: 'abcdefghijklmnopqrstuvwxyz' },
  { category: 'numbers', chars: '0123456789' },
  { category: 'punctuation', chars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~¡¿«»–—…‹›" },
  { category: 'currency', chars: '€¢£¥₩₹' },
  { category: 'symbols', chars: '§©®™°µ¶†‡•·' },
  { category: 'math', chars: '±×÷≈≠≤≥' },
  { category: 'marks', chars: '¸¨ˆˇ˘¯˙˚˝`´˜˛' },
  { category: 'latin-uppercase', chars: 'ÇÑÁÀÂÄÃÅÆÉÈÊËÍÌÎÏÓÒÔÖÕØÚÙÛÜÝŸŒŠŽÐÞŁ' },
  { category: 'latin-lowercase', chars: 'çñáàâäãåæéèêëíìîïóòôöõøúùûüýÿœšžðþł' },
];

const GLYPH_NAME_OVERRIDES: Record<string, string> = {
  '!': 'glyph-exclamation',
  '"': 'glyph-quote',
  '#': 'glyph-number-sign',
  '$': 'glyph-dollar',
  '%': 'glyph-percent',
  '&': 'glyph-ampersand',
  "'": 'glyph-apostrophe',
  '(': 'glyph-paren-left',
  ')': 'glyph-paren-right',
  '*': 'glyph-asterisk',
  '+': 'glyph-plus',
  ',': 'glyph-comma',
  '-': 'glyph-hyphen',
  '.': 'glyph-period',
  '/': 'glyph-slash',
  ':': 'glyph-colon',
  ';': 'glyph-semicolon',
  '<': 'glyph-less',
  '=': 'glyph-equals',
  '>': 'glyph-greater',
  '?': 'glyph-question',
  '@': 'glyph-at',
  '[': 'glyph-bracket-left',
  '\\': 'glyph-backslash',
  ']': 'glyph-bracket-right',
  '^': 'glyph-caret',
  '_': 'glyph-underscore',
  '`': 'glyph-grave',
  '{': 'glyph-brace-left',
  '|': 'glyph-bar',
  '}': 'glyph-brace-right',
  '~': 'glyph-tilde',
  '¡': 'glyph-exclamation-inverted',
  '¿': 'glyph-question-inverted',
  '«': 'glyph-guillemet-left',
  '»': 'glyph-guillemet-right',
  '–': 'glyph-endash',
  '—': 'glyph-emdash',
  '…': 'glyph-ellipsis',
  '‹': 'glyph-guillemet-single-left',
  '›': 'glyph-guillemet-single-right',
  '€': 'glyph-euro',
  '¢': 'glyph-cent',
  '£': 'glyph-sterling',
  '¥': 'glyph-yen',
  '₩': 'glyph-won',
  '₹': 'glyph-rupee',
  '§': 'glyph-section',
  '©': 'glyph-copyright',
  '®': 'glyph-registered',
  '™': 'glyph-trademark',
  '°': 'glyph-degree',
  '±': 'glyph-plus-minus',
  '×': 'glyph-multiply',
  '÷': 'glyph-divide',
  '≈': 'glyph-approximately',
  '≠': 'glyph-not-equal',
  '≤': 'glyph-less-equal',
  '≥': 'glyph-greater-equal',
  'µ': 'glyph-micro',
  '¶': 'glyph-pilcrow',
  '†': 'glyph-dagger',
  '‡': 'glyph-dagger-double',
  '•': 'glyph-bullet',
  '·': 'glyph-middle-dot',
  '¸': 'glyph-cedilla',
  '¨': 'glyph-dieresis',
  'ˆ': 'glyph-modifier-circumflex',
  'ˇ': 'glyph-caron',
  '˘': 'glyph-breve',
  '¯': 'glyph-macron',
  '˙': 'glyph-dot-accent',
  '˚': 'glyph-ring-above',
  '˝': 'glyph-double-acute',
  '´': 'glyph-acute',
  '˜': 'glyph-small-tilde',
  '˛': 'glyph-ogonek',
};

const NARROW_ADVANCE = new Set(["'", '`', '´', 'ˆ', 'ˇ', '˘', '¯', '˙', '˚', '˝', '˜', '¨', '¸', '˛', '.', ',', ':', ';', '!', '¡', '|', '·']);
const MEDIUM_ADVANCE = new Set(['"', '(', ')', '[', ']', '{', '}', '/', '\\', '-', '–', '‹', '›', '«', '»']);
const WIDE_ADVANCE = new Set(['@', '&', '©', '®', '™', '—', '…', 'Œ', 'œ', 'Æ', 'æ']);
const MATH_ADVANCE = new Set(['+', '=', '<', '>', '±', '×', '÷', '≈', '≠', '≤', '≥']);
const CURRENCY_ADVANCE = new Set(['€', '¢', '£', '¥', '₩', '₹', '$']);

function createGlyphDefinitions(): GlyphDefinition[] {
  const seen = new Set<string>();
  const definitions: GlyphDefinition[] = [];

  for (const group of GLYPH_CATEGORY_CHARS) {
    for (const char of Array.from(group.chars)) {
      if (seen.has(char)) {
        continue;
      }

      seen.add(char);
      definitions.push({
        char,
        name: glyphNameFromCatalogChar(char),
        label: char,
        category: group.category,
        guideProfile: guideProfileNameForCatalogChar(char),
        defaultAdvanceWidth: defaultAdvanceForCatalogChar(char),
      });
    }
  }

  return definitions;
}

function glyphNameFromCatalogChar(char: string): string {
  if (/^[A-Za-z0-9]$/.test(char)) {
    return `glyph-${char}`;
  }

  return GLYPH_NAME_OVERRIDES[char] ?? `glyph-u${(char.codePointAt(0) ?? 0).toString(16).padStart(4, '0')}`;
}

function guideProfileNameForCatalogChar(char: string): SlotGuideProfileName {
  return char.toLowerCase() === char && char.toUpperCase() !== char ? 'lowercase' : 'uppercase';
}

function defaultAdvanceForCatalogChar(char: string): number {
  if (char === '!') return 320;
  if (char === '¡') return 320;
  if (char === '?') return 560;
  if (char === '"') return 360;
  if ("()[]{}".includes(char)) return 360;
  if ("/\\".includes(char)) return 360;
  if (NARROW_ADVANCE.has(char)) return 260;
  if (MEDIUM_ADVANCE.has(char)) return 420;
  if (MATH_ADVANCE.has(char)) return 560;
  if (CURRENCY_ADVANCE.has(char)) return 620;
  if (WIDE_ADVANCE.has(char)) return 760;
  if (char === '_') return 560;
  if (char === '•') return 420;
  return 700;
}

export const GLYPH_DEFINITIONS = createGlyphDefinitions();

export type GlyphChar = string;

export const FONT_WEIGHT_DEFINITIONS = [
  { style: 'Thin', label: 'Thin', cssWeight: 100 },
  { style: 'Extra Light', label: 'Extra Light', cssWeight: 200 },
  { style: 'Light', label: 'Light', cssWeight: 300 },
  { style: 'Regular', label: 'Regular', cssWeight: 400 },
  { style: 'Medium', label: 'Medium', cssWeight: 500 },
  { style: 'Semi Bold', label: 'Semi Bold', cssWeight: 600 },
  { style: 'Bold', label: 'Bold', cssWeight: 700 },
  { style: 'Extra Bold', label: 'Extra Bold', cssWeight: 800 },
  { style: 'Black', label: 'Black', cssWeight: 900 },
] as const;

export type FontWeightStyle = (typeof FONT_WEIGHT_DEFINITIONS)[number]['style'];

export const DEFAULT_FONT_WEIGHT_STYLE: FontWeightStyle = 'Regular';

export function isFontWeightStyle(value: string | undefined): value is FontWeightStyle {
  return FONT_WEIGHT_DEFINITIONS.some((definition) => definition.style === value);
}

export function fontWeightValueForStyle(style: FontWeightStyle): number {
  return FONT_WEIGHT_DEFINITIONS.find((definition) => definition.style === style)?.cssWeight ?? 400;
}

export type SlotGuideProfileName = 'uppercase' | 'lowercase';

export type SlotGuideProfile = {
  name: SlotGuideProfileName;
  slotWidth: number;
  slotHeight: number;
  leftBoundaryX: number;
  rightBoundaryX: number;
  ascenderY: number;
  xHeightY?: number;
  baselineY: number;
  descenderY?: number;
  ascenderUnits: number;
};

export const UPPERCASE_GUIDE_PROFILE: SlotGuideProfile = {
  name: 'uppercase',
  slotWidth: 160,
  slotHeight: 200,
  leftBoundaryX: 24,
  rightBoundaryX: 136,
  ascenderY: 48,
  baselineY: 162,
  ascenderUnits: 700,
};

export const LOWERCASE_GUIDE_PROFILE: SlotGuideProfile = {
  name: 'lowercase',
  slotWidth: 160,
  slotHeight: 240,
  leftBoundaryX: 24,
  rightBoundaryX: 136,
  ascenderY: 40,
  xHeightY: 77,
  baselineY: 170,
  descenderY: 207,
  ascenderUnits: 700,
};

export const UNIFIED_VISUAL_GUIDE_PROFILE: SlotGuideProfile = {
  ...LOWERCASE_GUIDE_PROFILE,
  name: 'lowercase',
  slotWidth: 220,
  leftBoundaryX: 25,
  rightBoundaryX: 195,
};

const UPPERCASE_ACCENT_TOP_PADDING = 24;

export const UNIFIED_UPPERCASE_ACCENT_GUIDE_PROFILE: SlotGuideProfile = {
  ...UNIFIED_VISUAL_GUIDE_PROFILE,
  name: 'uppercase',
  slotHeight: UNIFIED_VISUAL_GUIDE_PROFILE.slotHeight + UPPERCASE_ACCENT_TOP_PADDING,
  ascenderY: UNIFIED_VISUAL_GUIDE_PROFILE.ascenderY + UPPERCASE_ACCENT_TOP_PADDING,
  xHeightY: undefined,
  baselineY: UNIFIED_VISUAL_GUIDE_PROFILE.baselineY + UPPERCASE_ACCENT_TOP_PADDING,
  descenderY: (UNIFIED_VISUAL_GUIDE_PROFILE.descenderY ?? UNIFIED_VISUAL_GUIDE_PROFILE.baselineY) + UPPERCASE_ACCENT_TOP_PADDING,
};

export const GUIDE_PROFILES: Record<SlotGuideProfileName, SlotGuideProfile> = {
  uppercase: UPPERCASE_GUIDE_PROFILE,
  lowercase: LOWERCASE_GUIDE_PROFILE,
};

export const GLYPH_CHARS = GLYPH_DEFINITIONS.map((definition) => definition.char) as GlyphChar[];

export function glyphCategoryForChar(char: GlyphChar): GlyphCategoryId {
  return GLYPH_DEFINITIONS.find((definition) => definition.char === char)?.category ?? 'symbols';
}

export function glyphCategoryLabel(category: GlyphCategoryId): string {
  return GLYPH_CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

export function glyphNameForChar(char: GlyphChar): string {
  return GLYPH_DEFINITIONS.find((definition) => definition.char === char)?.name ?? `glyph-${char}`;
}

export function glyphLabelForChar(char: GlyphChar): string {
  return GLYPH_DEFINITIONS.find((definition) => definition.char === char)?.label ?? char;
}

export function defaultAdvanceForChar(char: GlyphChar): number {
  const definition = GLYPH_DEFINITIONS.find((item) => item.char === char);
  return definition?.defaultAdvanceWidth ?? 700;
}

export function guideProfileForChar(char: GlyphChar): SlotGuideProfile {
  const definition = GLYPH_DEFINITIONS.find((item) => item.char === char);
  const profileName =
    definition?.guideProfile
      ? definition.guideProfile
      : 'uppercase';

  return GUIDE_PROFILES[profileName];
}

export function unifiedVisualGuideProfileForChar(char: GlyphChar): SlotGuideProfile {
  if (glyphCategoryForChar(char) === 'latin-uppercase' && hasTopAccent(char)) {
    return UNIFIED_UPPERCASE_ACCENT_GUIDE_PROFILE;
  }

  return {
    ...UNIFIED_VISUAL_GUIDE_PROFILE,
    name: guideProfileForChar(char).name,
  };
}

function hasTopAccent(char: GlyphChar): boolean {
  return char.normalize('NFD').slice(1).search(/[\u0300-\u036f]/) >= 0;
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

export type KerningPair = {
  left: GlyphChar;
  right: GlyphChar;
  value: number;
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
  warning: number;
  warnings: number;
};

export type GeneratedFont = {
  familyName: string;
  filename: string;
  glyphCount: number;
  buffer: ArrayBuffer;
};

export type BoardSpacingSettings = {
  letterSpacing: number;
  spaceWidth: number;
  glyphAdvanceOverrides: Partial<Record<GlyphChar, number>>;
  kerningPairs: KerningPair[];
};

export type PersistedTypegenSettings = {
  fontName: string;
  fontVersion?: string;
  fontAuthor?: string;
  previewText: string;
  previewFontSize?: number;
  selectedGlyph: GlyphChar;
  lastScanNodeIds: string[];
  spacing?: Partial<BoardSpacingSettings>;
};
