import {
  FONT_METRICS,
  DEFAULT_SPACING,
  type FontSpacingSettings,
  type GlyphChar,
  type GlyphModel,
  type NormalizedPathCommand,
  isGlyphChar,
  normalizeSpacingSettings,
  resolveKerningValue,
  resolveGlyphAdvance,
} from "../../font/glyphModel";

export type PreviewItem =
  | {
      kind: "glyph";
      char: GlyphChar;
      advanceWidth: number;
      pathData: string;
      transform: string;
      glyph: GlyphModel;
    }
  | {
      kind: "space";
      char: " ";
      advanceWidth: number;
      transform: string;
    }
  | {
      kind: "missing";
      char: GlyphChar;
      advanceWidth: number;
      transform: string;
    }
  | {
      kind: "unsupported";
      char: string;
      advanceWidth: number;
      transform: string;
    };

export type PreviewLayout = {
  items: PreviewItem[];
  missingChars: GlyphChar[];
  unsupportedChars: string[];
  width: number;
  height: number;
  viewBox: string;
};

const PREVIEW_SIDE_PADDING = 40;
const PREVIEW_TOP_PADDING = 30;
const PREVIEW_BOTTOM_PADDING = 40;
const PLACEHOLDER_ADVANCE_WIDTH = 620;

export function createGlyphLookup(glyphs: GlyphModel[]): Map<GlyphChar, GlyphModel> {
  const lookup = new Map<GlyphChar, GlyphModel>();

  for (const glyph of glyphs) {
    if (!lookup.has(glyph.char) && glyph.paths.some((path) => path.commands.length > 0)) {
      lookup.set(glyph.char, glyph);
    }
  }

  return lookup;
}

export function layoutPreviewText(
  previewText: string,
  glyphs: GlyphModel[],
  spacingInput?: Partial<FontSpacingSettings>,
): PreviewLayout {
  const glyphLookup = createGlyphLookup(glyphs);
  const spacing = normalizeSpacingSettings(spacingInput);
  const items: PreviewItem[] = [];
  const missingChars = new Set<GlyphChar>();
  const unsupportedChars = new Set<string>();
  const baselineY = FONT_METRICS.ascender + PREVIEW_TOP_PADDING;
  let cursorX = PREVIEW_SIDE_PADDING;

  const previewChars = Array.from(previewText);

  for (let index = 0; index < previewChars.length; index++) {
    const char = previewChars[index];
    const nextChar = previewChars[index + 1];
    const transform = `translate(${cursorX} ${baselineY}) scale(1 -1)`;

    if (char === " ") {
      items.push({
        kind: "space",
        char,
        advanceWidth: spacing.spaceWidth,
        transform,
      });
      cursorX += spacing.spaceWidth;
      continue;
    }

    if (!isGlyphChar(char)) {
      unsupportedChars.add(char);
      items.push({
        kind: "unsupported",
        char,
        advanceWidth: PLACEHOLDER_ADVANCE_WIDTH,
        transform,
      });
      cursorX += PLACEHOLDER_ADVANCE_WIDTH;
      continue;
    }

    const glyph = glyphLookup.get(char);

    if (!glyph) {
      missingChars.add(char);
      items.push({
        kind: "missing",
        char,
        advanceWidth: PLACEHOLDER_ADVANCE_WIDTH,
        transform,
      });
      cursorX += PLACEHOLDER_ADVANCE_WIDTH;
      continue;
    }

    const advanceWidth = positiveAdvanceWidth(resolveGlyphAdvance(glyph, spacing));
    items.push({
      kind: "glyph",
      char,
      advanceWidth,
      pathData: glyphToSvgPathData(glyph),
      transform,
      glyph,
    });
    cursorX += advanceWidth + (isGlyphChar(nextChar ?? "") ? resolveKerningValue(char, nextChar as GlyphChar, spacing) : 0);
  }

  const width = Math.max(
    cursorX + PREVIEW_SIDE_PADDING,
    PREVIEW_SIDE_PADDING * 2 + PLACEHOLDER_ADVANCE_WIDTH,
  );
  const height =
    FONT_METRICS.ascender - FONT_METRICS.descender + PREVIEW_TOP_PADDING + PREVIEW_BOTTOM_PADDING;

  return {
    items,
    missingChars: [...missingChars],
    unsupportedChars: [...unsupportedChars],
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
  };
}

export function glyphToSvgPathData(glyph: GlyphModel): string {
  return glyph.paths
    .flatMap((path) => path.commands.map(commandToSvgSegment))
    .join(" ")
    .trim();
}

export function createPlaceholderPathData(
  advanceWidth = PLACEHOLDER_ADVANCE_WIDTH,
): string {
  const x = 60;
  const y = 0;
  const width = Math.max(advanceWidth - 120, 120);
  const height = 700;

  return [
    `M ${x} ${y}`,
    `L ${x + width} ${y}`,
    `L ${x + width} ${y + height}`,
    `L ${x} ${y + height}`,
    "Z",
    `M ${x} ${y}`,
    `L ${x + width} ${y + height}`,
    `M ${x + width} ${y}`,
    `L ${x} ${y + height}`,
  ].join(" ");
}

export function createPreviewStatus(layout: PreviewLayout): string {
  if (layout.items.length === 0) {
    return "No supported characters in preview text.";
  }

  if (layout.unsupportedChars.length > 0) {
    return "Preview contains unsupported characters. Use A-Z, a-z, 0-9, supported punctuation, common symbols, and spaces.";
  }

  if (layout.missingChars.length > 0) {
    return `Missing: ${layout.missingChars.join(", ")}`;
  }

  return "Preview ready.";
}

export function renderPreviewMarkup(
  previewText: string,
  scanResults: { glyph?: GlyphModel }[],
  spacing: FontSpacingSettings = DEFAULT_SPACING,
): string {
  const glyphs = scanResults.map((result) => result.glyph).filter((glyph): glyph is GlyphModel => Boolean(glyph));
  const layout = layoutPreviewText(previewText, glyphs, spacing);
  const items = layout.items
    .map((item) => {
      if (item.kind === "space") {
        return "";
      }

      if (item.kind === "glyph") {
        return `<path d="${escapeAttr(item.pathData)}" transform="${escapeAttr(item.transform)}" fill="#202622" />`;
      }

      const label = escapeHtml(item.char);
      const pathData = createPlaceholderPathData(item.advanceWidth);
      return `
        <g transform="${escapeAttr(item.transform)}">
          <path d="${escapeAttr(pathData)}" fill="none" stroke="#9b6b5e" stroke-width="24" />
          <text x="${item.advanceWidth / 2}" y="330" transform="scale(1 -1)" text-anchor="middle" fill="#9b6b5e" font-size="220" font-family="system-ui, sans-serif">${label}</text>
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="${layout.viewBox}" role="img" aria-label="Glyph preview">
      ${items || '<text x="24" y="48" fill="#68726b" font-size="28" font-family="system-ui, sans-serif">No preview text.</text>'}
    </svg>
    <p class="status">${escapeHtml(createPreviewStatus(layout))}</p>
  `;
}

function commandToSvgSegment(command: NormalizedPathCommand): string {
  switch (command.type) {
    case "M":
      return `M ${command.x} ${command.y}`;
    case "L":
      return `L ${command.x} ${command.y}`;
    case "C":
      return `C ${command.x1} ${command.y1} ${command.x2} ${command.y2} ${command.x} ${command.y}`;
    case "Q":
      return `Q ${command.x1} ${command.y1} ${command.x} ${command.y}`;
    case "Z":
      return "Z";
  }
}

function positiveAdvanceWidth(value: number): number {
  return Number.isFinite(value) && value > 0
    ? value
    : FONT_METRICS.defaultAdvanceWidth;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
