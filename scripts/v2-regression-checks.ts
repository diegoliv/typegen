import assert from "node:assert/strict";
import * as opentype from "opentype.js";
import { buildFont } from "../src/font/buildFont";
import {
  DEFAULT_SPACING,
  GLYPH_DEFINITIONS,
  GLYPH_CHARS,
  LOWERCASE_GUIDE_PROFILE,
  collectMetricsWarnings,
  defaultAdvanceForChar,
  isGlyphChar,
  normalizeKerningPairs,
  normalizeSpacingSettings,
  resolveKerningValue,
  resolveGlyphAdvance,
  type GlyphModel,
} from "../src/font/glyphModel";
import {
  createFontDownloadName,
  createCssDownloadName,
  createFontFaceCss,
  createFontPackageHtml,
  createFontPackageZip,
  createPackageDownloadName,
  createSmokeTestDownloadName,
  createSmokeTestHtml,
  createWeightedFontDownloadName,
} from "../src/font/exportFont";
import { glyphCharFromName, isSupportedGlyphName, unicodeForChar } from "../src/plugin/pluginTypes";
import { fitPathsToAdvance, normalizePathsForSlotMetrics } from "../src/plugin/extractPaths";
import { layoutPreviewText } from "../src/ui/preview/renderGlyphPreview";

const glyphA: GlyphModel = {
  char: "A",
  unicode: 65,
  name: "glyph-A",
  advanceWidth: 700,
  bounds: {
    xMin: 40,
    yMin: 0,
    xMax: 650,
    yMax: 700,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 40, y: 0 },
        { type: "L", x: 340, y: 700 },
        { type: "L", x: 650, y: 0 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphO: GlyphModel = {
  char: "O",
  unicode: 79,
  name: "glyph-O",
  advanceWidth: 760,
  bounds: {
    xMin: 40,
    yMin: 0,
    xMax: 720,
    yMax: 700,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 40, y: 0 },
        { type: "L", x: 720, y: 0 },
        { type: "L", x: 720, y: 700 },
        { type: "L", x: 40, y: 700 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
    {
      commands: [
        { type: "M", x: 220, y: 180 },
        { type: "L", x: 220, y: 520 },
        { type: "L", x: 540, y: 520 },
        { type: "L", x: 540, y: 180 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphOSameDirectionCounter: GlyphModel = {
  ...glyphO,
  paths: [
    glyphO.paths[0],
    {
      commands: [
        { type: "M", x: 220, y: 180 },
        { type: "L", x: 540, y: 180 },
        { type: "L", x: 540, y: 520 },
        { type: "L", x: 220, y: 520 },
        { type: "Z" },
      ],
      windingRule: "EVENODD",
    },
  ],
};

const glyphP: GlyphModel = {
  char: "P",
  unicode: 80,
  name: "glyph-P",
  advanceWidth: 720,
  bounds: {
    xMin: 40,
    yMin: 0,
    xMax: 660,
    yMax: 700,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 40, y: 0 },
        { type: "L", x: 180, y: 0 },
        { type: "L", x: 180, y: 700 },
        { type: "L", x: 660, y: 700 },
        { type: "L", x: 660, y: 360 },
        { type: "L", x: 180, y: 360 },
        { type: "L", x: 180, y: 0 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
    {
      commands: [
        { type: "M", x: 260, y: 450 },
        { type: "L", x: 260, y: 610 },
        { type: "L", x: 520, y: 610 },
        { type: "L", x: 520, y: 450 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphFOverlappingShapes: GlyphModel = {
  char: "f",
  unicode: 102,
  name: "glyph-f",
  advanceWidth: 420,
  bounds: {
    xMin: 120,
    yMin: 0,
    xMax: 380,
    yMax: 700,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 190, y: 0 },
        { type: "L", x: 260, y: 0 },
        { type: "L", x: 260, y: 700 },
        { type: "L", x: 190, y: 700 },
        { type: "Z" },
      ],
      windingRule: "EVENODD",
    },
    {
      commands: [
        { type: "M", x: 120, y: 360 },
        { type: "L", x: 380, y: 360 },
        { type: "L", x: 380, y: 430 },
        { type: "L", x: 120, y: 430 },
        { type: "Z" },
      ],
      windingRule: "EVENODD",
    },
  ],
  warnings: [],
};

const glyph2: GlyphModel = {
  char: "2",
  unicode: 50,
  name: "glyph-2",
  advanceWidth: 680,
  bounds: {
    xMin: 50,
    yMin: 0,
    xMax: 620,
    yMax: 700,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 80, y: 520 },
        { type: "L", x: 220, y: 700 },
        { type: "L", x: 600, y: 700 },
        { type: "L", x: 600, y: 420 },
        { type: "L", x: 120, y: 0 },
        { type: "L", x: 620, y: 0 },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphExclamation: GlyphModel = {
  char: "!",
  unicode: 33,
  name: "glyph-exclamation",
  advanceWidth: 360,
  bounds: {
    xMin: 120,
    yMin: 0,
    xMax: 260,
    yMax: 700,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 160, y: 180 },
        { type: "L", x: 220, y: 180 },
        { type: "L", x: 220, y: 700 },
        { type: "L", x: 160, y: 700 },
        { type: "Z" },
        { type: "M", x: 160, y: 0 },
        { type: "L", x: 220, y: 0 },
        { type: "L", x: 220, y: 70 },
        { type: "L", x: 160, y: 70 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphPeriod: GlyphModel = {
  char: ".",
  unicode: 46,
  name: "glyph-period",
  advanceWidth: defaultAdvanceForChar("."),
  bounds: {
    xMin: 320,
    yMin: 12,
    xMax: 420,
    yMax: 86,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 320, y: 12 },
        { type: "L", x: 420, y: 12 },
        { type: "L", x: 420, y: 86 },
        { type: "L", x: 320, y: 86 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphLowerA: GlyphModel = {
  char: "a",
  unicode: 97,
  name: "glyph-a",
  advanceWidth: 700,
  bounds: {
    xMin: 70,
    yMin: 0,
    xMax: 640,
    yMax: 500,
  },
  paths: [
    {
      commands: [
        { type: "M", x: 70, y: 0 },
        { type: "L", x: 640, y: 0 },
        { type: "L", x: 640, y: 500 },
        { type: "L", x: 70, y: 500 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  warnings: [],
};

const glyphLowerB = makeRectGlyph("b", 98, "glyph-b", 70, 0, 640, 700);
const glyphLowerG = makeRectGlyph("g", 103, "glyph-g", 70, -200, 640, 500);
const glyphLowerO = makeRectGlyph("o", 111, "glyph-o", 70, 0, 640, 500);
const glyphLowerX = makeRectGlyph("x", 120, "glyph-x", 70, 0, 640, 500);
const lowercasePilotGlyphs = [glyphLowerA, glyphLowerB, glyphLowerG, glyphLowerO, glyphLowerX];
const fullLowercaseGlyphs = Array.from("abcdefghijklmnopqrstuvwxyz").map((char) =>
  makeRectGlyph(char, char.codePointAt(0) ?? 0, `glyph-${char}`, 70, "gjpqy".includes(char) ? -200 : 0, 640, 500),
);
const glyphAt = makeRectGlyph("@", 64, "glyph-at", 40, 0, 720, 700, defaultAdvanceForChar("@"));
const glyphPlus = makeRectGlyph("+", 43, "glyph-plus", 90, 180, 470, 560, defaultAdvanceForChar("+"));
const glyphSlash = makeRectGlyph("/", 47, "glyph-slash", 90, 0, 430, 700, defaultAdvanceForChar("/"));
const commonSymbolGlyphs = [glyphAt, glyphPlus, glyphSlash];

const requestedV9Glyphs = Array.from(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~¡¿«»–—…‹›€¢£¥₩₹§©®™°±×÷≈≠≤≥µ¶†‡•·¸¨ˆˇ˘¯˙˚˝`´ˆ˜¨¸˛ÇçÑñÁÀÂÄÃÅÆÉÈÊËÍÌÎÏÓÒÔÖÕØÚÙÛÜÝŸáàâäãåæéèêëíìîïóòôöõøúùûüýÿŒœŠšŽžÐðÞþŁł",
);
const uniqueRequestedV9Glyphs = [...new Set(requestedV9Glyphs)];
assert.equal(uniqueRequestedV9Glyphs.length, 209, "V9 requested glyph string should resolve to 209 unique glyphs");
assert.equal(GLYPH_CHARS.length, 209, "supported glyph list should contain the full V9 glyph catalog");
assert.deepEqual(new Set(GLYPH_CHARS), new Set(uniqueRequestedV9Glyphs), "supported glyph set should match the requested V9 catalog after duplicates are removed");
assert.equal(new Set(GLYPH_DEFINITIONS.map((definition) => definition.name)).size, GLYPH_DEFINITIONS.length, "glyph slot names should be unique");
assert.equal(isGlyphChar("A"), true, "A should be supported");
assert.equal(isGlyphChar("2"), true, "numeric glyphs should be supported");
assert.equal(isGlyphChar("!"), true, "supported punctuation glyphs should be supported");
assert.equal(isGlyphChar("a"), true, "lowercase glyphs should be supported");
assert.equal(isGlyphChar("z"), true, "lowercase z should be supported");
assert.equal(isGlyphChar("@"), true, "common symbols should be supported");
assert.equal(isGlyphChar("#"), true, "number sign should be supported in V9");
assert.equal(isGlyphChar("€"), true, "euro should be supported in V9");
assert.equal(isGlyphChar("≈"), true, "approximately equal should be supported in V9");
assert.equal(isGlyphChar("Ç"), true, "Latin extended uppercase should be supported in V9");
assert.equal(isGlyphChar("ł"), true, "Latin extended lowercase should be supported in V9");
assert.equal(defaultAdvanceForChar("."), 260, "periods should have a narrow default advance");
assert.equal(defaultAdvanceForChar(","), 260, "commas should have a narrow default advance");
assert.equal(defaultAdvanceForChar("!"), 320, "exclamation should have a narrow default advance");
assert.equal(defaultAdvanceForChar("?"), 560, "question should have a medium default advance");
assert.equal(defaultAdvanceForChar("'"), 260, "apostrophe should have a narrow default advance");
assert.equal(defaultAdvanceForChar('"'), 360, "quote should have a narrow default advance");
assert.equal(defaultAdvanceForChar("@"), 760, "at sign should have a wider default advance");
assert.equal(defaultAdvanceForChar("A"), 700, "letters should keep the standard default advance");

assert.equal(isSupportedGlyphName("glyph-A"), true, "strict uppercase glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-2"), true, "strict numeric glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-exclamation"), true, "strict punctuation glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-a"), true, "lowercase glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-z"), true, "lowercase z glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-at"), true, "safe symbol glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-plus"), true, "safe plus glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-number-sign"), true, "safe number-sign glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-backslash"), true, "safe backslash glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-bracket-left"), true, "safe bracket glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-grave"), true, "safe grave glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-endash"), true, "safe en dash glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-ellipsis"), true, "safe ellipsis glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-euro"), true, "safe euro glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-rupee"), true, "safe rupee glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-section"), true, "safe section glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-plus-minus"), true, "safe plus-minus glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-not-equal"), true, "safe not-equal glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-caron"), true, "safe caron glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-u00c7"), true, "unicode fallback name for Ç should parse");
assert.equal(isSupportedGlyphName("glyph-u0142"), true, "unicode fallback name for ł should parse");
assert.equal(isSupportedGlyphName("glyph-@"), true, "raw at sign alias should parse");
assert.equal(isSupportedGlyphName("glyph-+"), true, "raw plus alias should parse");
assert.equal(isSupportedGlyphName("glyph-!"), true, "raw punctuation alias should parse");
assert.equal(isSupportedGlyphName("glyph-."), true, "raw period alias should parse");
assert.equal(isSupportedGlyphName("glyph-?"), true, "raw question alias should parse");
assert.equal(isSupportedGlyphName("glyph-AA"), false, "multi-character glyph names should stay unsupported");
assert.equal(glyphCharFromName("glyph-Z"), "Z", "glyph-Z should map to Z");
assert.equal(glyphCharFromName("glyph-0"), "0", "glyph-0 should map to 0");
assert.equal(glyphCharFromName("glyph-exclamation"), "!", "glyph-exclamation should map to !");
assert.equal(glyphCharFromName("glyph-a"), "a", "glyph-a should map to a");
assert.equal(glyphCharFromName("glyph-z"), "z", "glyph-z should map to z");
assert.equal(glyphCharFromName("glyph-at"), "@", "glyph-at should map to @");
assert.equal(glyphCharFromName("glyph-@"), "@", "glyph-@ alias should map to @");
assert.equal(glyphCharFromName("glyph-plus"), "+", "glyph-plus should map to +");
assert.equal(glyphCharFromName("glyph-+"), "+", "glyph-+ alias should map to +");
assert.equal(glyphCharFromName("glyph-number-sign"), "#", "glyph-number-sign should map to #");
assert.equal(glyphCharFromName("glyph-backslash"), "\\", "glyph-backslash should map to backslash");
assert.equal(glyphCharFromName("glyph-endash"), "–", "glyph-endash should map to en dash");
assert.equal(glyphCharFromName("glyph-ellipsis"), "…", "glyph-ellipsis should map to ellipsis");
assert.equal(glyphCharFromName("glyph-euro"), "€", "glyph-euro should map to euro");
assert.equal(glyphCharFromName("glyph-not-equal"), "≠", "glyph-not-equal should map to ≠");
assert.equal(glyphCharFromName("glyph-caron"), "ˇ", "glyph-caron should map to caron");
assert.equal(glyphCharFromName("glyph-u00c7"), "Ç", "unicode fallback name should map to Ç");
assert.equal(glyphCharFromName("glyph-u0142"), "ł", "unicode fallback name should map to ł");
assert.equal(glyphCharFromName("glyph-!"), "!", "glyph-! alias should map to !");
assert.equal(glyphCharFromName("glyph-."), ".", "glyph-. alias should map to period");
assert.equal(glyphCharFromName("Glyph-Z"), null, "name parsing should be case-sensitive");
assert.equal(unicodeForChar("A"), 65, "A unicode should be stable");
assert.equal(unicodeForChar("2"), 50, "2 unicode should be stable");
assert.equal(unicodeForChar("!"), 33, "! unicode should be stable");
assert.equal(unicodeForChar("@"), 64, "@ unicode should be stable");

const spacing = normalizeSpacingSettings({
  letterSpacing: 999,
  spaceWidth: -10,
  glyphAdvanceOverrides: {
    A: 1200,
    Z: Number.NaN,
  },
});

assert.equal(spacing.letterSpacing, 300, "letter spacing should clamp high values");
assert.equal(spacing.spaceWidth, 120, "space width should clamp low values");
assert.equal(spacing.glyphAdvanceOverrides.A, 1200, "valid glyph override should survive normalization");
assert.equal(spacing.glyphAdvanceOverrides.Z, 120, "invalid glyph override values should clamp");
assert.equal(
  resolveGlyphAdvance(glyphA, { ...DEFAULT_SPACING, letterSpacing: 30 }),
  730,
  "letter spacing should affect resolved glyph advance",
);
assert.equal(
  resolveGlyphAdvance(glyphA, { ...DEFAULT_SPACING, glyphAdvanceOverrides: { A: 900 } }),
  900,
  "per-glyph override should replace automatic advance",
);
assert.deepEqual(
  normalizeKerningPairs([
    { left: "A", right: "V", value: -80 },
    { left: "A", right: "V", value: -90 },
    { left: "A", right: "🙂", value: -80 } as never,
    { left: "T", right: "A", value: 999 },
  ]),
  [
    { left: "A", right: "V", value: -90 },
    { left: "T", right: "A", value: 300 },
  ],
  "kerning pairs should sanitize, dedupe, clamp, and sort",
);
assert.equal(
  resolveKerningValue("A", "V", { ...DEFAULT_SPACING, kerningPairs: [{ left: "A", right: "V", value: -80 }] }),
  -80,
  "kerning lookup should return the configured pair value",
);

const tightMetricsWarnings = collectMetricsWarnings([glyphA], {
  ...DEFAULT_SPACING,
  letterSpacing: -100,
  spaceWidth: 150,
  glyphAdvanceOverrides: { A: 120 },
});
assert.ok(
  tightMetricsWarnings.some((warning) => warning.includes("Letter spacing -100")),
  "very tight letter spacing should warn",
);
assert.ok(
  tightMetricsWarnings.some((warning) => warning.includes("Space width 150")),
  "very narrow space width should warn",
);
assert.ok(
  tightMetricsWarnings.some((warning) => warning.includes("A export advance")),
  "very narrow glyph advance should warn",
);

const looseMetricsWarnings = collectMetricsWarnings([glyphA], {
  ...DEFAULT_SPACING,
  letterSpacing: 240,
  spaceWidth: 760,
  glyphAdvanceOverrides: { A: 1200 },
});
assert.ok(
  looseMetricsWarnings.some((warning) => warning.includes("Letter spacing 240")),
  "very loose letter spacing should warn",
);
assert.ok(
  looseMetricsWarnings.some((warning) => warning.includes("Space width 760")),
  "very wide space width should warn",
);
assert.ok(
  looseMetricsWarnings.some((warning) => warning.includes("A export advance")),
  "very wide glyph advance should warn",
);

const preview = layoutPreviewText("AZ #", [glyphA], DEFAULT_SPACING);
assert.equal(preview.items.length, 4, "preview should lay out all entered characters");
assert.equal(preview.missingChars.join(","), "Z,#", "missing supported glyphs should be tracked");
assert.equal(preview.unsupportedChars.join(","), "", "V9 punctuation should not be unsupported");
const defaultOverridePreview = layoutPreviewText("AA", [glyphA], DEFAULT_SPACING);
const wideOverridePreview = layoutPreviewText("AA", [glyphA], {
  ...DEFAULT_SPACING,
  glyphAdvanceOverrides: { A: 1000 },
});
const kernedPreview = layoutPreviewText("AA", [glyphA], {
  ...DEFAULT_SPACING,
  kerningPairs: [{ left: "A", right: "A", value: -80 }],
});
assert.equal(
  defaultOverridePreview.items[1]?.transform,
  "translate(740 830) scale(1 -1)",
  "default preview layout should position the second glyph after the base advance",
);
assert.equal(
  wideOverridePreview.items[1]?.transform,
  "translate(1040 830) scale(1 -1)",
  "preview layout should position repeated glyphs using the per-glyph advance override",
);
assert.equal(
  kernedPreview.items[1]?.transform,
  "translate(660 830) scale(1 -1)",
  "preview layout should apply kerning between adjacent glyphs",
);

const lowercasePreview = layoutPreviewText("Aa", [glyphA, glyphLowerA], DEFAULT_SPACING);
assert.equal(lowercasePreview.missingChars.length, 0, "lowercase pilot glyphs should preview when available");
assert.equal(lowercasePreview.unsupportedChars.length, 0, "lowercase pilot glyphs should not be unsupported");

for (const text of ["box", "go", "bag", "go ox"]) {
  const pilotWordPreview = layoutPreviewText(text, lowercasePilotGlyphs, DEFAULT_SPACING);
  assert.equal(pilotWordPreview.missingChars.length, 0, `${text} should have no missing lowercase pilot glyphs`);
  assert.equal(pilotWordPreview.unsupportedChars.length, 0, `${text} should have no unsupported lowercase pilot glyphs`);
}

const mixedPilotPreview = layoutPreviewText("ABC box 012", [glyphA, glyph2, ...lowercasePilotGlyphs], DEFAULT_SPACING);
assert.equal(mixedPilotPreview.unsupportedChars.length, 0, "ABC box 012 should only contain supported characters");
assert.deepEqual(mixedPilotPreview.missingChars, ["B", "C", "0", "1"], "ABC box 012 should only miss undrawn supported fixture glyphs");

for (const text of ["type", "glyph", "font", "quick", "boxing glyph"]) {
  const fullLowercasePreview = layoutPreviewText(text, fullLowercaseGlyphs, DEFAULT_SPACING);
  assert.equal(fullLowercasePreview.missingChars.length, 0, `${text} should have no missing full lowercase glyphs`);
  assert.equal(fullLowercasePreview.unsupportedChars.length, 0, `${text} should have no unsupported full lowercase glyphs`);
}

const commonSymbolPreview = layoutPreviewText("a/b @2+2", [glyphLowerA, glyphLowerB, glyph2, ...commonSymbolGlyphs], DEFAULT_SPACING);
assert.equal(commonSymbolPreview.missingChars.length, 0, "common symbol preview should have no missing glyphs");
assert.equal(commonSymbolPreview.unsupportedChars.length, 0, "common symbol preview should not be unsupported");

const numericPreview = layoutPreviewText("A2#", [glyphA, glyph2], DEFAULT_SPACING);
assert.equal(numericPreview.missingChars.join(","), "#", "V9 punctuation should be tracked as missing when unavailable");
assert.equal(numericPreview.unsupportedChars.length, 0, "V9 punctuation should not be unsupported");

const punctuationPreview = layoutPreviewText("A2!", [glyphA, glyph2, glyphExclamation], DEFAULT_SPACING);
assert.equal(punctuationPreview.missingChars.length, 0, "supported punctuation should preview when available");
assert.equal(punctuationPreview.unsupportedChars.length, 0, "supported punctuation should not be unsupported");
const narrowPunctuationPreview = layoutPreviewText("A.", [glyphA, glyphPeriod], DEFAULT_SPACING);
assert.equal(
  narrowPunctuationPreview.items.find((item) => item.kind === "glyph" && item.char === ".")?.advanceWidth,
  260,
  "period preview should use narrow punctuation advance",
);

const normalizedDot = normalizePathsForSlotMetrics(
  [
    {
      commands: [
        { type: "M", x: 72, y: 148 },
        { type: "L", x: 88, y: 148 },
        { type: "L", x: 88, y: 160 },
        { type: "L", x: 72, y: 160 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  { xMin: 0, yMin: 0, xMax: 160, yMax: 200 },
);
assert.ok(
  normalizedDot.bounds.yMax - normalizedDot.bounds.yMin < 120,
  "slot-relative normalization should keep a small period small",
);
assert.ok(
  normalizedDot.bounds.yMin >= 0 && normalizedDot.bounds.yMax <= 120,
  "slot-relative normalization should keep a period near the baseline",
);
const fittedDot = fitPathsToAdvance(normalizedDot, defaultAdvanceForChar("."));
assert.ok(
  Math.abs(fittedDot.bounds.xMin - (defaultAdvanceForChar(".") - (fittedDot.bounds.xMax - fittedDot.bounds.xMin)) / 2) <= 1,
  "punctuation fitting should balance the period's left side bearing",
);
assert.ok(
  fittedDot.bounds.xMax < defaultAdvanceForChar("."),
  "punctuation fitting should keep the period inside its advance width",
);

const normalizedLowercaseXHeight = normalizePathsForSlotMetrics(
  [
    {
      commands: [
        { type: "M", x: 40, y: 77 },
        { type: "L", x: 120, y: 77 },
        { type: "L", x: 120, y: 170 },
        { type: "L", x: 40, y: 170 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  { xMin: 0, yMin: 0, xMax: 160, yMax: 240 },
  LOWERCASE_GUIDE_PROFILE,
);
assert.ok(
  normalizedLowercaseXHeight.bounds.yMax >= 495 && normalizedLowercaseXHeight.bounds.yMax <= 505,
  "lowercase x-height guide should normalize near 500 font units",
);
assert.equal(normalizedLowercaseXHeight.bounds.yMin, 0, "lowercase baseline guide should normalize to zero");

const normalizedLowercaseDescender = normalizePathsForSlotMetrics(
  [
    {
      commands: [
        { type: "M", x: 72, y: 77 },
        { type: "L", x: 112, y: 77 },
        { type: "L", x: 112, y: 207 },
        { type: "L", x: 72, y: 207 },
        { type: "Z" },
      ],
      windingRule: "NONZERO",
    },
  ],
  { xMin: 0, yMin: 0, xMax: 160, yMax: 240 },
  LOWERCASE_GUIDE_PROFILE,
);
assert.ok(
  normalizedLowercaseDescender.bounds.yMin < 0,
  "lowercase descender guide should normalize below the baseline",
);

assert.equal(createFontDownloadName(" Typegen Demo! "), "Typegen-Demo.otf");
assert.equal(createCssDownloadName(" Typegen Demo! "), "Typegen-Demo.css");
assert.equal(createSmokeTestDownloadName(" Typegen Demo! "), "Typegen-Demo-smoke-test.html");
assert.equal(createPackageDownloadName(" Typegen Demo! "), "Typegen-Demo-web-test.zip");
assert.equal(createWeightedFontDownloadName(" Typegen Demo! ", "Regular"), "Typegen-Demo-Regular.otf");
assert.equal(createWeightedFontDownloadName(" Typegen Demo! ", "Bold"), "Typegen-Demo-Bold.otf");
assert.equal(createWeightedFontDownloadName(" Typegen Demo! ", "Black"), "Typegen-Demo-Black.otf");

const font = buildFont({
  familyName: "Typegen Regression",
  glyphs: [glyphA],
  spacing: DEFAULT_SPACING,
});

assert.equal(font.familyName, "Typegen Regression", "font family should use user input");
assert.equal(font.glyphCount, 1, "font generation should include one usable glyph");
assert.ok(font.arrayBuffer.byteLength > 0, "generated font should produce a non-empty buffer");
assert.ok(font.warnings.some((warning) => warning.includes("1/209")), "partial glyph-set warning should be preserved");
assert.equal(font.verification.failedGlyphs.length, 0, "single glyph font should verify cleanly");
assert.equal(font.verification.verifiedGlyphs.length, 1, "single glyph font should verify one glyph");
assert.ok(font.verification.parsedGlyphCount >= 3, "single glyph font should include notdef, space, and A");
assertRoundTripGlyph(font.arrayBuffer, "A", 700, "single glyph font should preserve A");
assert.equal(
  opentype.parse(font.arrayBuffer).glyphs.get(0).path.commands.length,
  0,
  "notdef should stay empty so browser fallback does not show Typegen artifacts",
);

const smokeHtml = createSmokeTestHtml(font, "A Z");
assert.ok(smokeHtml.includes("Typegen Regression smoke test"), "smoke HTML should include family name");
assert.ok(smokeHtml.includes("data:font/otf;base64,"), "smoke HTML should embed the generated OTF");
assert.ok(smokeHtml.includes("font-display: swap"), "smoke HTML should include practical font loading CSS");
assert.ok(smokeHtml.includes("A Z"), "smoke HTML should include sample text");
const fontFaceCss = createFontFaceCss(font);
assert.ok(fontFaceCss.includes('@font-face'), "CSS helper should include @font-face");
assert.ok(fontFaceCss.includes('font-family: "Typegen Regression"'), "CSS helper should include the generated family name");
assert.ok(fontFaceCss.includes('url("./Typegen-Regression.otf")'), "CSS helper should reference the exported OTF filename");
assert.ok(fontFaceCss.includes('font-display: swap'), "CSS helper should include font-display");
assert.ok(fontFaceCss.includes('font-kerning: normal'), "CSS helper should explicitly enable kerning");
const packageHtml = createFontPackageHtml([
  { result: font, style: "Regular" },
], "A Z");
assert.ok(packageHtml.includes("Typegen Regression weight test"), "package HTML should identify the weight test");
assert.ok(packageHtml.includes('url("./fonts/Typegen-Regression-Regular.otf")'), "package HTML should reference the Regular OTF");
assert.ok(packageHtml.includes("font-weight: 400"), "package HTML should map Regular to weight 400");
assert.ok(createFontPackageHtml([{ result: font, style: "Black" }], "A").includes("font-weight: 900"), "package HTML should map Black to weight 900");
assert.ok(packageHtml.includes("A Z"), "package HTML should include sample text");
const packageZip = createFontPackageZip([{ result: font, style: "Regular" }], "A Z");
assert.equal(packageZip.type, "application/zip", "package ZIP should use the zip MIME type");
assert.ok(packageZip.size > font.arrayBuffer.byteLength, "package ZIP should include font and HTML bytes");

const counterFont = buildFont({
  familyName: "Typegen Counter Regression",
  glyphs: [glyphO, glyphP],
  spacing: DEFAULT_SPACING,
});

assert.equal(counterFont.glyphCount, 2, "counter fixture should include O and P glyphs");
assert.ok(counterFont.arrayBuffer.byteLength > 0, "counter fixture should produce a non-empty font");
assert.equal(counterFont.verification.failedGlyphs.length, 0, "counter fixture should verify cleanly");
assert.equal(counterFont.verification.verifiedGlyphs.length, 2, "counter fixture should verify O and P");
assertRoundTripGlyph(counterFont.arrayBuffer, "O", 760, "counter fixture should preserve O");
assertRoundTripGlyph(counterFont.arrayBuffer, "P", 720, "counter fixture should preserve P");
assert.ok(
  createSmokeTestHtml(counterFont, "OP POP").includes("OP POP"),
  "counter smoke HTML should preserve counter sample text",
);

const sameDirectionCounterFont = buildFont({
  familyName: "Typegen Same Direction Counter Regression",
  glyphs: [glyphOSameDirectionCounter],
  spacing: DEFAULT_SPACING,
});
const sameDirectionContourAreas = collectParsedGlyphContourAreas(sameDirectionCounterFont.arrayBuffer, "O");
assert.equal(sameDirectionContourAreas.length, 2, "same-direction counter fixture should keep two contours");
assert.ok(
  sameDirectionContourAreas[0] > 0 && sameDirectionContourAreas[1] < 0,
  "same-direction counter fixture should be rewritten with opposite contour directions",
);

const overlappingShapeFont = buildFont({
  familyName: "Typegen Overlap Regression",
  glyphs: [glyphFOverlappingShapes],
  spacing: DEFAULT_SPACING,
});
const overlappingContourAreas = collectParsedGlyphContourAreas(overlappingShapeFont.arrayBuffer, "f");
assert.equal(overlappingContourAreas.length, 2, "overlapping construction fixture should keep two contours");
assert.ok(
  overlappingContourAreas.every((area) => area > 0),
  "overlapping construction contours should not be rewritten as counters",
);

const numericFont = buildFont({
  familyName: "Typegen Numeric Regression",
  glyphs: [glyphA, glyph2],
  spacing: DEFAULT_SPACING,
});

assert.equal(numericFont.glyphCount, 2, "numeric fixture should include A and 2 glyphs");
assert.equal(numericFont.verification.failedGlyphs.length, 0, "numeric fixture should verify cleanly");
assertRoundTripGlyph(numericFont.arrayBuffer, "2", 680, "numeric fixture should preserve 2");

const kerningFont = buildFont({
  familyName: "Typegen Kerning Regression",
  glyphs: [glyphA, makeRectGlyph("V", 86, "glyph-V", 40, 0, 650, 700)],
  spacing: {
    ...DEFAULT_SPACING,
    kerningPairs: [{ left: "A", right: "V", value: -80 }],
  },
});

assert.equal(kerningFont.verification.failedKerningPairs.length, 0, "kerning fixture should verify kern pairs");
assert.equal(kerningFont.verification.verifiedKerningPairs.length, 1, "kerning fixture should verify one pair");
assertRoundTripKerning(kerningFont.arrayBuffer, "A", "V", -80, "kerning fixture should preserve AV pair");
assertTableExists(kerningFont.arrayBuffer, "kern", "kerning fixture should include legacy kern table");
assertTableExists(kerningFont.arrayBuffer, "GPOS", "kerning fixture should include GPOS table for browser shaping");

const punctuationFont = buildFont({
  familyName: "Typegen Punctuation Regression",
  glyphs: [glyphA, glyphExclamation, glyphPeriod],
  spacing: DEFAULT_SPACING,
});

assert.equal(punctuationFont.glyphCount, 3, "punctuation fixture should include A, !, and . glyphs");
assert.equal(punctuationFont.verification.failedGlyphs.length, 0, "punctuation fixture should verify cleanly");
assertRoundTripGlyph(punctuationFont.arrayBuffer, "!", 360, "punctuation fixture should preserve !");
assertRoundTripGlyph(punctuationFont.arrayBuffer, ".", 260, "punctuation fixture should preserve narrow period advance");

const symbolFont = buildFont({
  familyName: "Typegen Symbol Regression",
  glyphs: [glyphAt, glyphPlus, glyphSlash],
  spacing: DEFAULT_SPACING,
});

assert.equal(symbolFont.glyphCount, 3, "symbol fixture should include @, +, and / glyphs");
assert.equal(symbolFont.verification.failedGlyphs.length, 0, "symbol fixture should verify cleanly");
assertRoundTripGlyph(symbolFont.arrayBuffer, "@", 760, "symbol fixture should preserve @");
assertRoundTripGlyph(symbolFont.arrayBuffer, "+", 560, "symbol fixture should preserve +");
assertRoundTripGlyph(symbolFont.arrayBuffer, "/", 420, "symbol fixture should preserve /");

const lowercasePilotFont = buildFont({
  familyName: "Typegen Lowercase Pilot Regression",
  glyphs: [glyphA, glyphLowerA],
  spacing: DEFAULT_SPACING,
});

assert.equal(lowercasePilotFont.glyphCount, 2, "lowercase pilot fixture should include A and a glyphs");
assert.equal(lowercasePilotFont.verification.failedGlyphs.length, 0, "lowercase pilot fixture should verify cleanly");
assertRoundTripGlyph(lowercasePilotFont.arrayBuffer, "a", 700, "lowercase pilot fixture should preserve a");

console.log("V5.0 export package regression baseline passed.");

function makeRectGlyph(
  char: string,
  unicode: number,
  name: string,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  advanceWidth = 700,
): GlyphModel {
  return {
    char,
    unicode,
    name,
    advanceWidth,
    bounds: {
      xMin,
      yMin,
      xMax,
      yMax,
    },
    paths: [
      {
        commands: [
          { type: "M", x: xMin, y: yMin },
          { type: "L", x: xMax, y: yMin },
          { type: "L", x: xMax, y: yMax },
          { type: "L", x: xMin, y: yMax },
          { type: "Z" },
        ],
        windingRule: "NONZERO",
      },
    ],
    warnings: [],
  };
}

function assertRoundTripGlyph(
  buffer: ArrayBuffer,
  char: string,
  expectedAdvanceWidth: number,
  message: string,
): void {
  const parsed = opentype.parse(buffer);
  const glyph = parsed.charToGlyph(char);

  assert.equal(glyph.unicode, char.charCodeAt(0), `${message}: unicode should survive font parse`);
  assert.equal(glyph.advanceWidth, expectedAdvanceWidth, `${message}: advance width should survive font parse`);
  assert.ok(glyph.path.commands.length > 0, `${message}: outline commands should survive font parse`);
}

function assertRoundTripKerning(
  buffer: ArrayBuffer,
  left: string,
  right: string,
  expectedValue: number,
  message: string,
): void {
  const parsed = opentype.parse(buffer);
  const value = parsed.getKerningValue(parsed.charToGlyph(left), parsed.charToGlyph(right));
  assert.equal(value, expectedValue, message);
}

function assertTableExists(buffer: ArrayBuffer, tag: string, message: string): void {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const tableCount = view.getUint16(4);

  for (let index = 0; index < tableCount; index++) {
    const offset = 12 + index * 16;
    const tableTag = String.fromCharCode(...bytes.slice(offset, offset + 4));
    if (tableTag === tag) {
      assert.ok(view.getUint32(offset + 12) > 0, message);
      return;
    }
  }

  assert.fail(message);
}

function collectParsedGlyphContourAreas(buffer: ArrayBuffer, char: string): number[] {
  const parsed = opentype.parse(buffer);
  const glyph = parsed.charToGlyph(char);
  const contours: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];

  for (const command of glyph.path.commands) {
    if (command.type === "M") {
      if (current.length > 0) {
        contours.push(current);
      }
      current = [{ x: command.x, y: command.y }];
    } else if (command.type === "L" || command.type === "Q" || command.type === "C") {
      current.push({ x: command.x, y: command.y });
    } else if (command.type === "Z") {
      if (current.length > 0) {
        contours.push(current);
      }
      current = [];
    }
  }

  if (current.length > 0) {
    contours.push(current);
  }

  return contours.map((contour) => {
    let area = 0;
    for (let index = 0; index < contour.length; index++) {
      const currentPoint = contour[index];
      const nextPoint = contour[(index + 1) % contour.length];
      area += currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y;
    }
    return area / 2;
  });
}
