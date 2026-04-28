import { extractGlyphFromNode } from "./extractPaths";
import {
  glyphCharFromName,
  GlyphScanResult,
  GlyphScanSummary,
  SUPPORTED_CHARS,
  TYPEGEN_ROLE_KEY,
  glyphNameForChar,
  unicodeForChar,
} from "./pluginTypes";

type GlyphCandidate = {
  char: string;
  node: SceneNode;
};

export function scanSelectedGlyphs(selection: readonly SceneNode[]): {
  glyphs: GlyphScanResult[];
  summary: GlyphScanSummary;
} {
  const candidates = collectGlyphCandidates(selection);
  const firstByChar = new Map<string, SceneNode>();
  const duplicateTotals = new Map<string, number>();

  for (const candidate of candidates) {
    if (firstByChar.has(candidate.char)) {
      duplicateTotals.set(candidate.char, (duplicateTotals.get(candidate.char) ?? 1) + 1);
      continue;
    }

    firstByChar.set(candidate.char, candidate.node);
  }

  const glyphs = SUPPORTED_CHARS.map((char): GlyphScanResult => {
    const node = firstByChar.get(char);
    const glyphName = glyphNameForChar(char);
    const base = {
      char,
      unicode: unicodeForChar(char),
      name: glyphName,
      warnings: [] as string[],
    };

    if (!node) {
      return {
        ...base,
        status: "missing",
        message: `Glyph ${char} is missing. Select a board or node named ${glyphName}.`,
      };
    }

    const extraction = extractGlyphFromNode(node, char);
    const duplicateTotal = duplicateTotals.get(char) ?? 0;
    const warnings = extraction.issues.filter((issue) => issue.level === "warning").map((issue) => issue.message);

    if (duplicateTotal > 0) {
      warnings.push(`${duplicateTotal} ${glyphName} nodes were found. The first one was used; remove or rename duplicates.`);
    }

    const errors = extraction.issues.filter((issue) => issue.level === "error");
    if (errors.length > 0) {
      return {
        ...base,
        status: "unsupported",
        nodeId: node.id,
        message: errors[0].message,
        warnings,
      };
    }

    if (extraction.vectorCount === 0 || !extraction.glyph) {
      return {
        ...base,
        status: "empty",
        nodeId: node.id,
        message: `Glyph ${char} is empty. Add a simple filled vector path inside ${glyphName}.`,
        warnings,
      };
    }

    return {
      ...base,
      status: "valid",
      nodeId: node.id,
      message: `Glyph ${char} is valid.`,
      glyph: extraction.glyph,
      warnings,
    };
  });

  return {
    glyphs,
    summary: summarize(glyphs),
  };
}

function collectGlyphCandidates(selection: readonly SceneNode[]): GlyphCandidate[] {
  const candidates: GlyphCandidate[] = [];

  for (const node of selection) {
    walkNode(node, candidates);
  }

  return candidates;
}

function walkNode(node: SceneNode, candidates: GlyphCandidate[]): void {
  if (node.getPluginData(TYPEGEN_ROLE_KEY) === "helper") {
    return;
  }

  const char = glyphCharFromName(node.name);
  if (char) {
    candidates.push({ char, node });
    return;
  }

  if ("children" in node) {
    for (const child of node.children) {
      walkNode(child, candidates);
    }
  }
}

function summarize(glyphs: GlyphScanResult[]): GlyphScanSummary {
  return glyphs.reduce(
    (summary, glyph) => {
      summary[glyph.status] += 1;
      summary.warnings += glyph.warnings.length;
      return summary;
    },
    { valid: 0, empty: 0, unsupported: 0, missing: 0, warnings: 0 },
  );
}
