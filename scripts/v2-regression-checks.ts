import assert from "node:assert/strict";
import * as opentype from "opentype.js";
import { buildFont } from "../src/font/buildFont";
import {
  DEFAULT_SPACING,
  GLYPH_CHARS,
  collectMetricsWarnings,
  defaultAdvanceForChar,
  isGlyphChar,
  normalizeSpacingSettings,
  resolveGlyphAdvance,
  type GlyphModel,
} from "../src/font/glyphModel";
import {
  createFontDownloadName,
  createSmokeTestDownloadName,
  createSmokeTestHtml,
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

assert.equal(GLYPH_CHARS.length, 42, "supported glyph list should contain A-Z, 0-9, and six punctuation glyphs");
assert.equal(isGlyphChar("A"), true, "A should be supported");
assert.equal(isGlyphChar("2"), true, "numeric glyphs should be supported");
assert.equal(isGlyphChar("!"), true, "supported punctuation glyphs should be supported");
assert.equal(isGlyphChar("a"), false, "lowercase should remain unsupported");
assert.equal(defaultAdvanceForChar("."), 260, "periods should have a narrow default advance");
assert.equal(defaultAdvanceForChar(","), 260, "commas should have a narrow default advance");
assert.equal(defaultAdvanceForChar("!"), 320, "exclamation should have a narrow default advance");
assert.equal(defaultAdvanceForChar("?"), 560, "question should have a medium default advance");
assert.equal(defaultAdvanceForChar("A"), 700, "letters should keep the standard default advance");

assert.equal(isSupportedGlyphName("glyph-A"), true, "strict uppercase glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-2"), true, "strict numeric glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-exclamation"), true, "strict punctuation glyph name should parse");
assert.equal(isSupportedGlyphName("glyph-!"), true, "raw punctuation alias should parse");
assert.equal(isSupportedGlyphName("glyph-."), true, "raw period alias should parse");
assert.equal(isSupportedGlyphName("glyph-?"), true, "raw question alias should parse");
assert.equal(isSupportedGlyphName("glyph-a"), false, "lowercase glyph names should stay unsupported");
assert.equal(isSupportedGlyphName("glyph-AA"), false, "multi-character glyph names should stay unsupported");
assert.equal(glyphCharFromName("glyph-Z"), "Z", "glyph-Z should map to Z");
assert.equal(glyphCharFromName("glyph-0"), "0", "glyph-0 should map to 0");
assert.equal(glyphCharFromName("glyph-exclamation"), "!", "glyph-exclamation should map to !");
assert.equal(glyphCharFromName("glyph-!"), "!", "glyph-! alias should map to !");
assert.equal(glyphCharFromName("glyph-."), ".", "glyph-. alias should map to period");
assert.equal(glyphCharFromName("Glyph-Z"), null, "name parsing should be case-sensitive");
assert.equal(unicodeForChar("A"), 65, "A unicode should be stable");
assert.equal(unicodeForChar("2"), 50, "2 unicode should be stable");
assert.equal(unicodeForChar("!"), 33, "! unicode should be stable");

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

const preview = layoutPreviewText("AZ a", [glyphA], DEFAULT_SPACING);
assert.equal(preview.items.length, 4, "preview should lay out all entered characters");
assert.equal(preview.missingChars.join(","), "Z", "missing supported glyphs should be tracked");
assert.equal(preview.unsupportedChars.join(","), "a", "unsupported characters should be tracked");

const numericPreview = layoutPreviewText("A2#", [glyphA, glyph2], DEFAULT_SPACING);
assert.equal(numericPreview.missingChars.length, 0, "numeric glyphs should preview when available");
assert.equal(numericPreview.unsupportedChars.join(","), "#", "unsupported punctuation should remain unsupported");

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

assert.equal(createFontDownloadName(" Typegen Demo! "), "Typegen-Demo.otf");
assert.equal(createSmokeTestDownloadName(" Typegen Demo! "), "Typegen-Demo-smoke-test.html");

const font = buildFont({
  familyName: "Typegen Regression",
  glyphs: [glyphA],
  spacing: DEFAULT_SPACING,
});

assert.equal(font.familyName, "Typegen Regression", "font family should use user input");
assert.equal(font.glyphCount, 1, "font generation should include one usable glyph");
assert.ok(font.arrayBuffer.byteLength > 0, "generated font should produce a non-empty buffer");
assert.ok(font.warnings.some((warning) => warning.includes("1/42")), "partial glyph-set warning should be preserved");
assert.equal(font.verification.failedGlyphs.length, 0, "single glyph font should verify cleanly");
assert.equal(font.verification.verifiedGlyphs.length, 1, "single glyph font should verify one glyph");
assert.ok(font.verification.parsedGlyphCount >= 3, "single glyph font should include notdef, space, and A");
assertRoundTripGlyph(font.arrayBuffer, "A", 700, "single glyph font should preserve A");

const smokeHtml = createSmokeTestHtml(font, "A Z");
assert.ok(smokeHtml.includes("Typegen Regression smoke test"), "smoke HTML should include family name");
assert.ok(smokeHtml.includes("data:font/otf;base64,"), "smoke HTML should embed the generated OTF");
assert.ok(smokeHtml.includes("A Z"), "smoke HTML should include sample text");

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

const numericFont = buildFont({
  familyName: "Typegen Numeric Regression",
  glyphs: [glyphA, glyph2],
  spacing: DEFAULT_SPACING,
});

assert.equal(numericFont.glyphCount, 2, "numeric fixture should include A and 2 glyphs");
assert.equal(numericFont.verification.failedGlyphs.length, 0, "numeric fixture should verify cleanly");
assertRoundTripGlyph(numericFont.arrayBuffer, "2", 680, "numeric fixture should preserve 2");

const punctuationFont = buildFont({
  familyName: "Typegen Punctuation Regression",
  glyphs: [glyphA, glyphExclamation, glyphPeriod],
  spacing: DEFAULT_SPACING,
});

assert.equal(punctuationFont.glyphCount, 3, "punctuation fixture should include A, !, and . glyphs");
assert.equal(punctuationFont.verification.failedGlyphs.length, 0, "punctuation fixture should verify cleanly");
assertRoundTripGlyph(punctuationFont.arrayBuffer, "!", 360, "punctuation fixture should preserve !");
assertRoundTripGlyph(punctuationFont.arrayBuffer, ".", 260, "punctuation fixture should preserve narrow period advance");

console.log("V2 regression checks passed.");

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
