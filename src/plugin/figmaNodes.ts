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

type GlyphCandidateIndex = {
  firstByChar: Map<string, SceneNode>;
  duplicateTotals: Map<string, number>;
};

export function scanSelectedGlyphs(selection: readonly SceneNode[]): {
  glyphs: GlyphScanResult[];
  summary: GlyphScanSummary;
} {
  const index = createGlyphCandidateIndex(selection);

  const glyphs = SUPPORTED_CHARS.map((char): GlyphScanResult => {
    return scanGlyphFromIndex(char, index);
  });

  return {
    glyphs,
    summary: summarize(glyphs),
  };
}

export function scanSelectedGlyphsLightweight(selection: readonly SceneNode[]): {
  glyphs: GlyphScanResult[];
  summary: GlyphScanSummary;
} {
  const { firstByChar, duplicateTotals } = createGlyphCandidateIndex(selection);
  const glyphs = SUPPORTED_CHARS.map((char): GlyphScanResult => {
    return scanGlyphFromIndexLightweight(char, firstByChar, duplicateTotals);
  });

  return {
    glyphs,
    summary: summarize(glyphs),
  };
}

function createGlyphCandidateIndex(selection: readonly SceneNode[]): GlyphCandidateIndex {
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

  return { firstByChar, duplicateTotals };
}

function scanGlyphFromIndex(char: string, index: GlyphCandidateIndex): GlyphScanResult {
  const node = index.firstByChar.get(char);
  const glyphName = glyphNameForChar(char);
  const base = createGlyphResultBase(char, glyphName);

  if (!node) {
    return createMissingGlyphResult(base, char, glyphName);
  }

  const extraction = extractGlyphFromNode(node, char);
  const warnings = extraction.issues.filter((issue) => issue.level === "warning").map((issue) => issue.message);
  appendDuplicateWarning(warnings, index.duplicateTotals.get(char) ?? 0, glyphName);

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
    return createEmptyGlyphResult(base, node.id, char, glyphName, warnings);
  }

  return {
    ...base,
    status: "valid",
    nodeId: node.id,
    message: `Glyph ${char} is valid.`,
    glyph: extraction.glyph,
    warnings,
  };
}

function scanGlyphFromIndexLightweight(
  char: string,
  firstByChar: Map<string, SceneNode>,
  duplicateTotals: Map<string, number>,
): GlyphScanResult {
  const node = firstByChar.get(char);
  const glyphName = glyphNameForChar(char);
  const base = createGlyphResultBase(char, glyphName);

  if (!node) {
    return createMissingGlyphResult(base, char, glyphName);
  }

  const warnings: string[] = [];
  appendDuplicateWarning(warnings, duplicateTotals.get(char) ?? 0, glyphName);

  if (!hasGlyphArtwork(node)) {
    return createEmptyGlyphResult(base, node.id, char, glyphName, warnings);
  }

  return {
    ...base,
    status: "empty",
    nodeId: node.id,
    message: `Glyph ${char} has artwork. Full outline validation is queued.`,
    warnings,
  };
}

function createGlyphResultBase(char: string, glyphName: string): Pick<GlyphScanResult, "char" | "unicode" | "name" | "warnings"> {
  return {
    char,
    unicode: unicodeForChar(char),
    name: glyphName,
    warnings: [],
  };
}

function createMissingGlyphResult(
  base: Pick<GlyphScanResult, "char" | "unicode" | "name" | "warnings">,
  char: string,
  glyphName: string,
): GlyphScanResult {
  return {
    ...base,
    status: "missing",
    message: `Glyph ${char} is missing. Select a board or node named ${glyphName}.`,
  };
}

function createEmptyGlyphResult(
  base: Pick<GlyphScanResult, "char" | "unicode" | "name" | "warnings">,
  nodeId: string,
  char: string,
  glyphName: string,
  warnings: string[],
): GlyphScanResult {
  return {
    ...base,
    status: "empty",
    nodeId,
    message: `Glyph ${char} is empty. Add a simple filled vector path inside ${glyphName}.`,
    warnings,
  };
}

function appendDuplicateWarning(warnings: string[], duplicateTotal: number, glyphName: string): void {
  if (duplicateTotal > 0) {
    warnings.push(`${duplicateTotal} ${glyphName} nodes were found. The first one was used; remove or rename duplicates.`);
  }
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

function hasGlyphArtwork(node: SceneNode): boolean {
  if (!node.visible || node.getPluginData(TYPEGEN_ROLE_KEY) === "helper") {
    return false;
  }

  if (glyphCharFromName(node.name) && "children" in node) {
    return node.children.some((child) => hasGlyphArtwork(child));
  }

  if ("children" in node) {
    return node.children.some((child) => hasGlyphArtwork(child));
  }

  return true;
}

function summarize(glyphs: GlyphScanResult[]): GlyphScanSummary {
  return glyphs.reduce(
    (summary, glyph) => {
      summary[glyph.status] += 1;
      summary.warnings += glyph.warnings.length;
      return summary;
    },
    { valid: 0, empty: 0, unsupported: 0, missing: 0, warning: 0, warnings: 0 },
  );
}
