import { buildFont } from '../font/buildFont';
import {
  downloadFontPackageZip,
  type FontPackageItem,
  type FontPackageStyle,
} from '../font/exportFont';
import {
  DEFAULT_SPACING,
  FONT_METRICS,
  GLYPH_CHARS,
  collectMetricsWarnings,
  glyphLabelForChar,
  glyphNameForChar,
  isGlyphChar,
  normalizeKerningPairs,
  removeKerningPair,
  resolveKerningValue,
  upsertKerningPair,
  type FontBuildResult,
  type FontSpacingSettings,
  type GlyphChar,
  type GlyphModel,
} from '../font/glyphModel';
import { postToPlugin, isPluginMessage, type ActiveBoardInfo, type BoardScanResult, type BoardSettingsSource, type PluginToUiMessage } from '../shared/messages';
import {
  DEFAULT_FONT_WEIGHT_STYLE,
  FONT_WEIGHT_DEFINITIONS,
  GLYPH_CATEGORIES,
  glyphCategoryForChar,
  isFontWeightStyle,
  unifiedVisualGuideProfileForChar,
  type GlyphCategoryId,
  type FontWeightStyle,
  type GlyphScanResult,
  type PersistedTypegenSettings,
} from '../shared/types';
import { layoutPreviewText, renderPreviewMarkup } from './preview/renderGlyphPreview';
import './styles.css';

type UiState = {
  fontName: string;
  fontVersion: string;
  fontAuthor: string;
  previewText: string;
  previewFontSize: number;
  activeTab: UiTab;
  glyphDetailTab: GlyphDetailTab;
  kerningPairRight: GlyphChar;
  kerningPairInput: string;
  starterStyle: FontWeightStyle;
  glyphCategoryFilter: GlyphCategoryId | 'all';
  glyphSearch: string;
  glyphs: GlyphScanResult[];
  selectedGlyph: GlyphChar;
  activeBoard: ActiveBoardInfo | null;
  lastScanNodeIds: string[];
  statusMessage: string;
  generatedFont: FontBuildResult | null;
  spacing: FontSpacingSettings;
  showRecipeOverlay: boolean;
  boardCreationOverlayOpen: boolean;
  boardCreationStyle: FontWeightStyle;
  isCreatingBoard: boolean;
  importSettingsOverlayOpen: boolean;
  boardSettingsSources: BoardSettingsSource[];
  importSourceBoardId: string;
  importSpacingBasics: boolean;
  importAdvanceOverrides: boolean;
  importKerningPairs: boolean;
  glyphOverlayOpen: boolean;
  previewCollapsed: boolean;
  healthCollapsed: boolean;
  fontSettingsCollapsed: boolean;
  starterSettingsCollapsed: boolean;
  isScanning: boolean;
  isGenerating: boolean;
};

type UiTab = 'glyphs' | 'preview' | 'settings';
type GlyphDetailTab = 'glyph' | 'kerning';

type ExportDiagnostics = {
  status: 'ready' | 'blocked' | 'needs-scan';
  headline: string;
  details: string[];
  validCount: number;
  emptyCount: number;
  missingCount: number;
  unsupportedCount: number;
  warningCount: number;
  previewMissing: GlyphChar[];
  previewUnsupported: string[];
  overrideCount: number;
};

type PreviewPreset = {
  id: string;
  label: string;
  text: string;
};

const PREVIEW_PRESETS: PreviewPreset[] = [
  { id: 'default', label: 'Mixed', text: 'ABC box @2+2' },
  { id: 'headline', label: 'Headline', text: 'TYPEGEN quick fox' },
  { id: 'words', label: 'Words', text: 'façade jalapeño über niño' },
  { id: 'paragraph', label: 'Paragraph', text: 'The quick type glyphs box a font.' },
  { id: 'symbols', label: 'Symbols', text: 'A-Z / a-z @ 10+20 = 30 #&%' },
  { id: 'currency', label: 'Currency', text: '€20 £30 ¥40 ₹50 ₩60' },
  { id: 'math', label: 'Math', text: '± × ÷ ≈ ≠ ≤ ≥' },
  { id: 'latin', label: 'Latin', text: 'ÇÑ ÁÀÂÄÃÅ ÉÈÊË Œ ŠŽ Ł' },
];

const SHOW_DEBUG_CONTENT = false;

const state: UiState = {
  fontName: 'Typegen Demo',
  fontVersion: '1.0',
  fontAuthor: 'John Doe',
  previewText: "ABC box @2+2",
  previewFontSize: 24,
  activeTab: 'glyphs',
  glyphDetailTab: 'glyph',
  kerningPairRight: 'V',
  kerningPairInput: 'V',
  starterStyle: DEFAULT_FONT_WEIGHT_STYLE,
  glyphCategoryFilter: 'all',
  glyphSearch: '',
  glyphs: [],
  selectedGlyph: 'A',
  activeBoard: null,
  lastScanNodeIds: [],
  statusMessage: 'Select a Typegen glyph board to auto-scan, or create a starter board.',
  generatedFont: null,
  spacing: { ...DEFAULT_SPACING, glyphAdvanceOverrides: {}, kerningPairs: [] },
  showRecipeOverlay: false,
  boardCreationOverlayOpen: false,
  boardCreationStyle: DEFAULT_FONT_WEIGHT_STYLE,
  isCreatingBoard: false,
  importSettingsOverlayOpen: false,
  boardSettingsSources: [],
  importSourceBoardId: '',
  importSpacingBasics: true,
  importAdvanceOverrides: true,
  importKerningPairs: true,
  glyphOverlayOpen: false,
  previewCollapsed: false,
  healthCollapsed: false,
  fontSettingsCollapsed: false,
  starterSettingsCollapsed: false,
  isScanning: false,
  isGenerating: false,
};

const app = document.querySelector<HTMLDivElement>('#app');

function validGlyphs() {
  return state.glyphs.filter((glyph) => glyph.status === 'valid' && glyph.glyph);
}

function invalidGlyphs() {
  return state.glyphs.filter((glyph) => glyph.status !== 'valid');
}

function render() {
  if (!app) return;

  const interaction = captureRenderInteraction();
  const diagnostics = createExportDiagnostics();
  const rows: GlyphScanResult[] = state.glyphs.length
    ? state.glyphs
    : GLYPH_CHARS.map((char) => ({
        char,
        name: glyphNameForChar(char),
        status: 'missing' as const,
        message: 'Not scanned yet.',
        warnings: [],
      }));
  const selectedGlyph = getSelectedGlyph(rows);

  app.innerHTML = `
    <section class="shell">
      ${state.activeBoard ? renderTabbedPanel(rows, diagnostics) : renderEmptyPanel()}
      ${SHOW_DEBUG_CONTENT ? renderGeneratedPanel() : ''}
      ${state.showRecipeOverlay ? renderRecipeOverlay() : ''}
      ${state.boardCreationOverlayOpen ? renderBoardCreationOverlay() : ''}
      ${state.importSettingsOverlayOpen ? renderImportSettingsOverlay() : ''}
      ${state.glyphOverlayOpen ? renderGlyphOverlay(selectedGlyph) : ''}
    </section>
  `;

  bindEvents();
  restoreRenderInteraction(interaction);
}

function renderEmptyPanel(): string {
  return `
    ${renderTopHeader(false)}
    <section class="panel empty-panel">
      <div class="empty-content">
        <div>
          <h2>No Typegen board selected</h2>
          <p>Select a Typegen board to auto-scan status, weight, and preview data.</p>
        </div>
        <div class="empty-actions">
          <button id="open-board-creation">Create board</button>
          <button id="open-recipe" class="tertiary-action">Recipe</button>
        </div>
      </div>
    </section>
  `;
}

function renderTabbedPanel(rows: GlyphScanResult[], diagnostics: ExportDiagnostics): string {
  return `
    ${renderTopHeader(true)}
    ${state.activeTab === 'glyphs' ? renderGlyphsTab(rows, diagnostics) : ''}
    ${state.activeTab === 'preview' ? renderPreviewTab() : ''}
    ${state.activeTab === 'settings' ? renderSettingsTab() : ''}
  `;
}

function renderTopHeader(showBoardControls: boolean): string {
  const canGenerate = !state.isGenerating && Boolean(state.activeBoard);

  return `
    <section class="panel workflow-panel ${showBoardControls ? 'with-tabs' : 'empty-workflow'}">
      <div class="workflow-main">
        <div class="font-action-group">
          <label class="field font-name-field">
            <span>Font name</span>
            <input id="font-name" data-font-name value="${escapeAttr(state.fontName)}" />
          </label>
          <button id="generate-font" class="primary-action" ${canGenerate ? '' : 'disabled'}>${state.isGenerating ? 'Generating...' : 'Generate font'}</button>
        </div>
        ${
          showBoardControls
            ? `<div class="active-action-row">
                <div class="active-board">
                  <span>Active board</span>
                  <strong>${escapeHtml(state.activeBoard?.name ?? 'None selected')}</strong>
                </div>
                <button id="update-board">Update board</button>
              </div>`
            : ''
        }
      </div>
      ${showBoardControls ? renderTabs() : ''}
    </section>
  `;
}

function renderTabs(): string {
  const tabs: Array<{ id: UiTab; label: string }> = [
    { id: 'glyphs', label: 'Glyphs' },
    { id: 'preview', label: 'Preview' },
    { id: 'settings', label: 'Settings' },
  ];

  return `
    <div class="tab-list" role="tablist" aria-label="Typegen panels">
      ${tabs
        .map(
          (tab) => `
            <button id="tab-${tab.id}" class="tab-button ${state.activeTab === tab.id ? 'active' : ''}" type="button" role="tab" aria-selected="${state.activeTab === tab.id}" data-tab="${tab.id}">
              ${escapeHtml(tab.label)}
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderGlyphsTab(rows: GlyphScanResult[], diagnostics: ExportDiagnostics): string {
  const scanWarning = createScanExportWarning();
  const missingTotal = diagnostics.emptyCount + diagnostics.missingCount;
  const issueTotal = diagnostics.unsupportedCount;
  const visibleRows = visibleGlyphRows(rows);

  return `
    <section class="panel diagnostics-panel ${diagnostics.status} ${state.healthCollapsed ? 'collapsed' : ''}">
      <div class="section-head">
        <h2>Glyph health</h2>
        <button id="toggle-health" class="collapse-button" type="button" aria-label="${state.healthCollapsed ? 'Expand glyph health' : 'Collapse glyph health'}">${renderChevronIcon(state.healthCollapsed)}</button>
      </div>
      ${
        state.healthCollapsed
          ? ''
          : `<div class="diagnostic-grid">
              <div>
                <span>Valid</span>
                <strong>${diagnostics.validCount}/${GLYPH_CHARS.length}</strong>
              </div>
              <div>
                <span>Missing</span>
                <strong>${missingTotal}/${GLYPH_CHARS.length}</strong>
              </div>
              <div>
                <span>Issues</span>
                <strong class="${issueTotal ? 'issue-count' : ''}">${issueTotal}</strong>
              </div>
              <div>
                <span>Warnings</span>
                <strong class="${diagnostics.warningCount ? 'warning-count' : ''}">${diagnostics.warningCount}</strong>
              </div>
            </div>
            ${scanWarning ? `<p class="warning">${escapeHtml(scanWarning)}</p>` : ''}
            ${
              SHOW_DEBUG_CONTENT && diagnostics.details.length
                ? `<details class="diagnostic-details"><summary>Details</summary><ul class="message-list">${diagnostics.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul></details>`
                : ''
            }`
      }
    </section>
    <section class="panel">
      <div class="section-head">
        <h2>Glyphs</h2>
        <span class="section-count">${visibleRows.length}</span>
      </div>
      ${renderGlyphCategoryControls(rows)}
      <div class="glyph-sections">
        ${renderGlyphSections(visibleRows)}
      </div>
    </section>
  `;
}

function renderPreviewTab(): string {
  const previewWarning = createPreviewExportWarning();

  return `
    <section class="panel preview-panel ${state.previewCollapsed ? 'collapsed' : ''}">
      <div class="section-head">
        <h2>Preview</h2>
        <button id="toggle-preview" class="collapse-button" type="button" aria-label="${state.previewCollapsed ? 'Expand preview' : 'Collapse preview'}">${renderChevronIcon(state.previewCollapsed)}</button>
      </div>
      ${
        state.previewCollapsed
          ? ''
          : `<input id="preview-text" class="preview-text-input" value="${escapeAttr(state.previewText)}" aria-label="Preview text" />
            <div class="preset-grid">
              ${PREVIEW_PRESETS.map((preset) => `<button type="button" data-preview-preset="${escapeAttr(preset.id)}">${escapeHtml(preset.label)}</button>`).join('')}
            </div>
            <div class="metric-slider-grid">
              ${renderMetricSlider('preview-font-size', 'Font Size', state.previewFontSize, 12, 96, 1, false, 'wide')}
              <div class="metric-two-up">
                ${renderMetricSlider('letter-spacing', 'Letter spacing', state.spacing.letterSpacing, -120, 300, 10)}
                ${renderMetricSlider('space-width', 'Space width', state.spacing.spaceWidth, 120, 900, 10)}
              </div>
            </div>
            <div class="preview" style="--preview-font-size: ${state.previewFontSize}px">${renderPreviewMarkup(state.previewText, state.glyphs, state.spacing)}</div>
            ${previewWarning ? `<p class="warning">${escapeHtml(previewWarning)}</p>` : ''}`
      }
    </section>
  `;
}

function renderSettingsTab(): string {
  return `
    <section class="panel settings-panel ${state.fontSettingsCollapsed ? 'collapsed' : ''}">
      <div class="section-head">
        <h2>Font Settings</h2>
        <button id="toggle-font-settings" class="collapse-button" type="button" aria-label="${state.fontSettingsCollapsed ? 'Expand font settings' : 'Collapse font settings'}">${renderChevronIcon(state.fontSettingsCollapsed)}</button>
      </div>
      ${
        state.fontSettingsCollapsed
          ? ''
          : `<label class="field">
              <span>Font name</span>
              <input id="font-name-setting" data-font-name value="${escapeAttr(state.fontName)}" />
            </label>
            <label class="field">
              <span>Font Version</span>
              <input id="font-version" value="${escapeAttr(state.fontVersion)}" />
            </label>
            <label class="field">
              <span>Font Author</span>
              <input id="font-author" value="${escapeAttr(state.fontAuthor)}" />
            </label>`
      }
    </section>
    <section class="panel settings-panel">
      <div class="section-head">
        <h2>Board Spacing</h2>
        <button id="open-import-settings" ${state.activeBoard ? '' : 'disabled'}>Import settings</button>
      </div>
      <p class="status">Spacing, advance overrides, space width, and kerning apply to the selected board only.</p>
      <div class="active-board board-settings-summary">
        <span>Selected</span>
        <strong>${escapeHtml(state.activeBoard?.name ?? 'No board selected')}</strong>
      </div>
    </section>
    <section class="panel settings-panel ${state.starterSettingsCollapsed ? 'collapsed' : ''}">
      <div class="section-head">
        <h2>Starter Glyphs</h2>
        <button id="toggle-starter-settings" class="collapse-button" type="button" aria-label="${state.starterSettingsCollapsed ? 'Expand starter glyphs' : 'Collapse starter glyphs'}">${renderChevronIcon(state.starterSettingsCollapsed)}</button>
      </div>
      ${
        state.starterSettingsCollapsed
          ? ''
          : `<div class="settings-starter-row">
              <label class="field starter-settings-field">
                <span>Generate starter glyphs on the selected board</span>
                <select id="starter-style">
                  ${renderWeightOptions(state.starterStyle)}
                </select>
              </label>
              <button id="generate-starters">Generate starters</button>
            </div>`
      }
    </section>
  `;
}

function renderGeneratedPanel(): string {
  const generatedWarnings = state.generatedFont?.warnings ?? [];

  if (!state.generatedFont && generatedWarnings.length === 0) {
    return '';
  }

  return `
    <section class="panel compact-panel">
      ${
        state.generatedFont
          ? `<p class="status">Font generated with ${state.generatedFont.glyphCount}/${GLYPH_CHARS.length} glyphs. Export includes ${GLYPH_CATEGORIES.length} organized sections. Letter spacing: ${state.spacing.letterSpacing}, space width: ${state.spacing.spaceWidth}, overrides: ${countAdvanceOverrides()}, kerning pairs: ${state.spacing.kerningPairs.length}.</p>`
          : ''
      }
      ${state.generatedFont ? renderFontVerification(state.generatedFont) : ''}
      ${
        generatedWarnings.length
          ? `<ul class="message-list">${generatedWarnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>`
          : ''
      }
    </section>
  `;
}

type RenderInteraction = {
  activeElementId: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  scrollTop: number;
  appScrollTop: number;
};

function captureRenderInteraction(): RenderInteraction {
  const active = document.activeElement instanceof HTMLInputElement ? document.activeElement : null;
  return {
    activeElementId: active?.id ?? '',
    selectionStart: active?.selectionStart ?? null,
    selectionEnd: active?.selectionEnd ?? null,
    scrollTop: document.scrollingElement?.scrollTop ?? 0,
    appScrollTop: app?.scrollTop ?? 0,
  };
}

function restoreRenderInteraction(interaction: RenderInteraction): void {
  if (interaction.activeElementId) {
    const nextActive = document.getElementById(interaction.activeElementId);
    if (nextActive instanceof HTMLInputElement && !nextActive.disabled) {
      nextActive.focus({ preventScroll: true });
      if (interaction.selectionStart !== null && interaction.selectionEnd !== null) {
        nextActive.setSelectionRange(interaction.selectionStart, interaction.selectionEnd);
      }
    }
  }

  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = interaction.scrollTop;
  }

  if (app) {
    app.scrollTop = interaction.appScrollTop;
  }
}

function visibleGlyphRows(rows: GlyphScanResult[]): GlyphScanResult[] {
  const search = state.glyphSearch.trim();
  return rows.filter((row) => {
    const categoryMatches = state.glyphCategoryFilter === 'all' || glyphCategoryForChar(row.char) === state.glyphCategoryFilter;
    return categoryMatches && glyphMatchesSearch(row, search);
  });
}

function glyphMatchesSearch(row: GlyphScanResult, search: string): boolean {
  if (!search) {
    return true;
  }

  const searchChars = Array.from(search);
  if (searchChars.length === 1) {
    return row.char === search;
  }

  const normalizedSearch = search.toLowerCase();
  return [
    row.char,
    glyphLabelForChar(row.char),
    glyphNameForChar(row.char),
    glyphCategoryForChar(row.char),
    row.status,
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function renderGlyphCategoryControls(rows: GlyphScanResult[]): string {
  return `
    <div class="glyph-controls">
      <select id="glyph-category-filter" class="glyph-category-filter" aria-label="Glyph category">
        <option value="all" ${state.glyphCategoryFilter === 'all' ? 'selected' : ''}>${escapeHtml(`All (${countCategoryRows(rows, 'all')})`)}</option>
        ${GLYPH_CATEGORIES.map((category) => {
          const count = countCategoryRows(rows, category.id);
          return `<option value="${escapeAttr(category.id)}" ${state.glyphCategoryFilter === category.id ? 'selected' : ''}>${escapeHtml(`${category.label} (${count})`)}</option>`;
        }).join('')}
      </select>
      <input id="glyph-search" class="glyph-search" value="${escapeAttr(state.glyphSearch)}" placeholder="Find glyph, name, or status" aria-label="Find glyph" />
    </div>
  `;
}

function countCategoryRows(rows: GlyphScanResult[], category: GlyphCategoryId | 'all'): string {
  const categoryRows = category === 'all' ? rows : rows.filter((row) => glyphCategoryForChar(row.char) === category);
  return String(categoryRows.length);
}

function renderGlyphSections(rows: GlyphScanResult[]): string {
  if (rows.length === 0) {
    return '<p class="status">No glyphs match the current filter.</p>';
  }

  return GLYPH_CATEGORIES.map((category) => {
    const categoryRows = rows.filter((row) => glyphCategoryForChar(row.char) === category.id);
    if (categoryRows.length === 0) {
      return '';
    }

    const valid = categoryRows.filter((row) => row.status === 'valid').length;
    const issues = categoryRows.filter((row) => row.status === 'unsupported').length;
    return `
      <section class="glyph-section">
        <div class="glyph-section-head">
          <div>
            <h3>${escapeHtml(category.label)}</h3>
            <p>${escapeHtml(category.description)}</p>
          </div>
          <span>${valid}/${categoryRows.length}${issues ? ` - ${issues} issues` : ''}</span>
        </div>
        <div class="glyph-grid" role="list" aria-label="${escapeAttr(category.label)} glyph status">
          ${categoryRows.map((row) => renderGlyphTile(row)).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function renderGlyphTile(row: GlyphScanResult): string {
  const isSelected = row.char === state.selectedGlyph;
  const hasWarning = hasGlyphTileWarning(row);
  const hasIssue = hasGlyphTileIssue(row);
  const label = glyphLabelForChar(row.char);
  const glyphMarkup = row.glyph
    ? renderGlyphTileSvg(row.glyph)
    : `<span>${escapeHtml(label)}</span>`;
  const title = hasIssue
    ? `${row.message} ${glyphTileIssueMessages(row).join(' ')}`
    : row.message;

  return `
    <button class="glyph-tile ${row.status} ${hasIssue ? 'has-issue' : ''} ${hasWarning ? 'has-warning' : ''} ${isSelected ? 'selected' : ''}" role="listitem" data-glyph="${escapeAttr(row.char)}" title="${escapeAttr(title)}">
      <em>${escapeHtml(label)}</em>
      <strong>${glyphMarkup}</strong>
    </button>
  `;
}

function hasGlyphTileIssue(row: GlyphScanResult): boolean {
  return row.status === 'unsupported';
}

function hasGlyphTileWarning(row: GlyphScanResult): boolean {
  return row.status === 'warning' || glyphTileIssueMessages(row).some((message) => !isInformationalGlyphWarning(message));
}

function glyphTileIssueMessages(row: GlyphScanResult): string[] {
  return [...row.warnings, ...(row.glyph?.warnings ?? []), createWindingWarning(row.glyph)].filter(Boolean).filter(uniqueString);
}

function isInformationalGlyphWarning(message: string): boolean {
  return message.includes('temporary flattened copy') || message.includes('temporary flattened slot copy') || message.includes('temporary outlined and flattened copy') || message.includes('temporary outlined copy');
}

function renderGlyphTileSvg(glyph: GlyphModel): string {
  const layout = layoutPreviewText(glyph.char, [glyph], state.spacing);
  const item = layout.items.find((previewItem) => previewItem.kind === 'glyph');

  if (!item || item.kind !== 'glyph') {
    return `<span>${escapeHtml(glyphLabelForChar(glyph.char))}</span>`;
  }

  const padding = 80;
  const advanceWidth = Math.max(120, item.advanceWidth);
  const metricHeight = FONT_METRICS.ascender - FONT_METRICS.descender;
  const viewBox = `${-padding} ${-padding} ${advanceWidth + padding * 2} ${metricHeight + padding * 2}`;
  const transform = `translate(0 ${FONT_METRICS.ascender}) scale(1 -1)`;

  return `<svg viewBox="${escapeAttr(viewBox)}" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><path d="${escapeAttr(item.pathData)}" transform="${escapeAttr(transform)}" /></svg>`;
}

function renderMetricSlider(
  id: string,
  label: string,
  value: number | string,
  min: number,
  max: number,
  step: number,
  disabled = false,
  variant = '',
): string {
  return `
    <label class="metric-slider ${variant}">
      <span>${escapeHtml(label)}</span>
      <div>
        <input data-metric="${escapeAttr(id)}" type="range" min="${min}" max="${max}" step="${step}" value="${escapeAttr(String(value))}" style="--value: ${metricPercent(Number(value), min, max)}%" ${disabled ? 'disabled' : ''} />
        <input data-metric="${escapeAttr(id)}" type="number" min="${min}" max="${max}" step="${step}" value="${escapeAttr(String(value))}" ${disabled ? 'disabled' : ''} />
      </div>
    </label>
  `;
}

function metricPercent(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max <= min) {
    return 0;
  }

  return Math.round(((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100);
}

function renderChevronIcon(collapsed: boolean): string {
  return `
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" class="${collapsed ? 'collapsed' : ''}">
      <path d="M2.25 4.5L6 8.25L9.75 4.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function renderRecipeOverlay(): string {
  return `
    <div class="overlay-backdrop" role="dialog" aria-modal="true" aria-label="Supported glyph recipe">
      <section class="overlay-card">
        <div class="overlay-head">
          <div>
            <p class="eyebrow">Recipe</p>
            <h2>Supported glyph recipe</h2>
          </div>
          <button id="close-recipe" class="icon-button" aria-label="Close recipe">Close</button>
        </div>
        <ol class="recipe-list">
          <li>Use the generated board names for the full V9 catalog, including safe names such as <strong>glyph-dollar</strong>, <strong>glyph-endash</strong>, <strong>glyph-euro</strong>, and <strong>glyph-not-equal</strong>.</li>
          <li>Draw filled vectors, filled live shapes, or live booleans inside each slot.</li>
          <li>Glyph slots are scanned from temporary flattened copies.</li>
          <li>Convert text, live lines, and strokes to filled outlines before scanning.</li>
          <li>Avoid images, effects, gradients, masks, and unsupported live shape layers.</li>
        </ol>
        <p class="status">V9 supports the expanded Latin, punctuation, symbol, currency, math, and standalone mark set through temporary slot flattening and manual pair kerning. Variable fonts, AI generation, live lines, and automatic accent composition remain outside this MVP.</p>
      </section>
    </div>
  `;
}

function renderWeightOptions(selectedStyle: FontWeightStyle): string {
  return FONT_WEIGHT_DEFINITIONS.map(
    (definition) => `<option value="${escapeAttr(definition.style)}" ${selectedStyle === definition.style ? 'selected' : ''}>${escapeHtml(definition.label)}</option>`,
  ).join('');
}

function renderBoardCreationOverlay(): string {
  const isCreating = state.isCreatingBoard;
  return `
    <div class="overlay-backdrop" role="dialog" aria-modal="true" aria-label="Create glyph board">
      <section class="overlay-card board-creation-overlay">
        <div class="overlay-head">
          <div>
            <p class="eyebrow">New board</p>
            <h2>Choose a weight</h2>
          </div>
          <button id="close-board-creation" class="icon-button" aria-label="Close board creation" ${isCreating ? 'disabled' : ''}>Close</button>
        </div>
        <p class="status">Typegen creates one board per weight. If that weight already exists, the existing board will be selected instead of creating a duplicate.</p>
        <div class="board-creation-row">
          <label class="field">
            <span>Weight</span>
            <select id="board-creation-style" ${isCreating ? 'disabled' : ''}>
              ${renderWeightOptions(state.boardCreationStyle)}
            </select>
          </label>
          <button id="confirm-board-creation" class="primary-action" ${isCreating ? 'disabled' : ''}>${isCreating ? 'Creating...' : `Create ${state.boardCreationStyle} board`}</button>
        </div>
      </section>
    </div>
  `;
}

function renderImportSettingsOverlay(): string {
  const sources = state.boardSettingsSources.filter((source) => source.activeBoard.id !== state.activeBoard?.id);
  const selectedSource = sources.find((source) => source.activeBoard.id === state.importSourceBoardId) ?? sources[0];
  const canImport = Boolean(
    selectedSource?.activeBoard.hasCustomSpacing &&
      (state.importSpacingBasics || state.importAdvanceOverrides || state.importKerningPairs),
  );

  return `
    <div class="overlay-backdrop" role="dialog" aria-modal="true" aria-label="Import board settings">
      <section class="overlay-card import-settings-overlay">
        <div class="overlay-head">
          <div>
            <p class="eyebrow">Board spacing</p>
            <h2>Import settings</h2>
          </div>
          <button id="close-import-settings" class="icon-button" aria-label="Close import settings">Close</button>
        </div>
        <label class="field">
          <span>Source board</span>
          <select id="import-settings-source" ${sources.length ? '' : 'disabled'}>
            ${
              sources.length
                ? sources.map((source) => `<option value="${escapeAttr(source.activeBoard.id)}" ${selectedSource?.activeBoard.id === source.activeBoard.id ? 'selected' : ''}>${escapeHtml(source.activeBoard.name)}</option>`).join('')
                : '<option>No other Typegen boards found</option>'
            }
          </select>
        </label>
        ${
          selectedSource && !selectedSource.activeBoard.hasCustomSpacing
            ? '<p class="warning">That board is still using default spacing settings.</p>'
            : '<p class="status">Choose which board-specific settings to copy into the current board.</p>'
        }
        <div class="checkbox-list">
          <label><input id="import-spacing-basics" type="checkbox" ${state.importSpacingBasics ? 'checked' : ''} /> Spacing and space width</label>
          <label><input id="import-advance-overrides" type="checkbox" ${state.importAdvanceOverrides ? 'checked' : ''} /> Advance overrides</label>
          <label><input id="import-kerning-pairs" type="checkbox" ${state.importKerningPairs ? 'checked' : ''} /> Kerning pairs</label>
        </div>
        <div class="actions overlay-actions">
          <button id="confirm-import-settings" class="primary-action" ${canImport ? '' : 'disabled'}>Import</button>
        </div>
      </section>
    </div>
  `;
}

function renderGlyphOverlay(row: GlyphScanResult): string {
  const glyph = row.glyph;
  const advanceOverride = state.spacing.glyphAdvanceOverrides[row.char];
  const overrideValue = advanceOverride ?? glyph?.advanceWidth ?? 700;
  const canOverride = row.status === 'valid' && Boolean(glyph);
  const tabs: Array<{ id: GlyphDetailTab; label: string }> = [
    { id: 'glyph', label: 'Glyph' },
    { id: 'kerning', label: 'Kerning' },
  ];

  return `
    <div class="overlay-backdrop" role="dialog" aria-modal="true" aria-label="Glyph details">
      <section class="overlay-card glyph-overlay">
        <div class="overlay-head">
          <p class="eyebrow">Glyph ${escapeHtml(row.char)}</p>
          <div class="glyph-detail-tabs" role="tablist" aria-label="Glyph detail sections">
            ${tabs
              .map(
                (tab) => `
                  <button class="detail-tab ${state.glyphDetailTab === tab.id ? 'active' : ''}" type="button" role="tab" aria-selected="${state.glyphDetailTab === tab.id}" data-glyph-detail-tab="${tab.id}">
                    ${escapeHtml(tab.label)}
                  </button>
                `,
              )
              .join('')}
          </div>
          <button id="close-glyph-overlay" class="icon-button" aria-label="Close glyph details">Close</button>
        </div>
        ${state.glyphDetailTab === 'glyph' ? renderGlyphDetailTab(row, overrideValue, canOverride) : renderKerningDetailTab(row)}
      </section>
    </div>
  `;
}

function renderGlyphDetailTab(row: GlyphScanResult, overrideValue: number, canOverride: boolean): string {
  return `
    ${renderGlyphSpecimen(row, overrideValue)}
    <div class="glyph-detail-stats">
      <div>
        <span>Status</span>
        <strong class="${row.status === 'valid' ? '' : 'issue-count'}">${escapeHtml(formatStatusLabel(row.status))}</strong>
      </div>
      <div>
        <span>Unicode</span>
        <strong>U+${row.char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}</strong>
      </div>
    </div>
    ${renderMetricSlider('advance-override', 'Advance width override', overrideValue, 120, 1400, 10, !canOverride)}
    ${renderGlyphOverlayMessage(row)}
  `;
}

function renderKerningDetailTab(row: GlyphScanResult): string {
  const right = getKerningPairRight();
  const canKern = row.status === 'valid' && Boolean(row.glyph);
  const hasInput = state.kerningPairInput.trim().length > 0;
  const rightIsExportable = Boolean(right && validGlyphs().some((glyph) => glyph.char === right));
  const value = right ? resolveKerningValue(row.char, right, state.spacing) : 0;
  const pairLabel = right ? `${glyphLabelForChar(row.char)}${glyphLabelForChar(right)}` : glyphLabelForChar(row.char);
  const message = !canKern
    ? 'Kerning is available after this glyph scans as valid.'
    : !hasInput
      ? 'Type one supported glyph to choose the right side of this kerning pair.'
      : !right
        ? `${state.kerningPairInput} is not a supported glyph in this font.`
    : !rightIsExportable
      ? `${glyphLabelForChar(right)} is not valid in the current scan; this pair will be ignored on export until that glyph is ready.`
      : value === 0
        ? `${pairLabel} uses default spacing. Add a value to create a kerning pair.`
        : `${pairLabel} kerning ${value} will preview and export.`;
  const tone = !canKern || !right || !rightIsExportable ? 'warning' : 'valid';

  return `
    ${renderKerningPairPreview(row, right)}
    <div class="kerning-fields">
      <label class="field compact">
        <span>Pair glyph</span>
        <input id="kerning-right-glyph" maxlength="1" value="${escapeAttr(state.kerningPairInput)}" placeholder="V" ${canKern ? '' : 'disabled'} />
      </label>
      <div class="kerning-amount-row">
        ${renderMetricSlider('kerning-value', 'Kerning amount', value, -300, 300, 10, !canKern || !right)}
        <button id="reset-kerning-pair" ${right && value !== 0 ? '' : 'disabled'}>Reset pair</button>
      </div>
    </div>
    <p class="glyph-message ${tone}">${escapeHtml(message)}</p>
  `;
}

function renderKerningPairPreview(row: GlyphScanResult, right: GlyphChar | null): string {
  const rightGlyph = right ? state.glyphs.find((glyph) => glyph.char === right)?.glyph : null;
  const glyphs = [row.glyph, rightGlyph].filter((glyph): glyph is GlyphModel => Boolean(glyph));
  const previewText = `${row.char}${right ?? ''}`;
  const layout = layoutPreviewText(previewText, glyphs, state.spacing);
  const width = Math.max(layout.width, 1180);
  const viewBox = `0 0 ${width} ${layout.height}`;
  const items = layout.items
    .map((item) => {
      if (item.kind !== 'glyph') {
        return '';
      }

      return `<path d="${escapeAttr(item.pathData)}" transform="${escapeAttr(item.transform)}" />`;
    })
    .join('');

  return `
    <div class="glyph-detail-preview kerning-preview" aria-hidden="true">
      <svg class="glyph-specimen-svg" viewBox="${escapeAttr(viewBox)}">${items || `<text x="48" y="120">${escapeHtml(previewText || row.char)}</text>`}</svg>
    </div>
  `;
}

function getKerningPairRight(): GlyphChar | null {
  const [char] = Array.from(state.kerningPairInput);
  return char && isGlyphChar(char) ? char : null;
}

function renderGlyphSpecimen(row: GlyphScanResult, advanceWidth: number): string {
  const glyph = row.glyph;
  const content = glyph
    ? renderGlyphSpecimenSvg(row.char, glyph, advanceWidth)
    : `<div class="glyph-specimen main"><span>${escapeHtml(row.char)}</span></div>`;

  return `
    <div class="glyph-detail-preview ${row.status}" aria-hidden="true">
      ${content}
    </div>
  `;
}

function renderGlyphSpecimenSvg(char: GlyphChar, glyph: GlyphModel, advanceWidth: number): string {
  const spacing: FontSpacingSettings = {
    ...state.spacing,
    glyphAdvanceOverrides: {
      ...state.spacing.glyphAdvanceOverrides,
      [char]: advanceWidth,
    },
  };
  const layout = layoutPreviewText(`${char}${char}${char}`, [glyph], spacing);
  const middleGlyph = layout.items[1];
  const middleOrigin = middleGlyph ? previewTransformX(middleGlyph.transform) : 0;
  const middleCenter = middleOrigin + glyph.bounds.xMin + (glyph.bounds.xMax - glyph.bounds.xMin) / 2;
  const viewBoxWidth = 2930;
  const viewBoxX = Math.round(middleCenter - viewBoxWidth / 2);
  const viewBox = `${viewBoxX} -150 ${viewBoxWidth} 1080`;
  const guides = renderGlyphSpecimenGuides(char, viewBoxX, viewBoxX + viewBoxWidth);
  const paths = layout.items
    .map((item, index) => {
      if (item.kind !== 'glyph') {
        return '';
      }

      const className = index === 1 ? 'specimen-main' : 'specimen-ghost';
      const transform = item.transform.replace(/\s830\)/, ' 700)');
      return `<path class="${className}" d="${escapeAttr(item.pathData)}" transform="${escapeAttr(transform)}" />`;
    })
    .join('');

  return `<svg class="glyph-specimen-svg" viewBox="${escapeAttr(viewBox)}" aria-hidden="true">${guides}${paths}</svg>`;
}

function renderGlyphSpecimenGuides(char: GlyphChar, xMin: number, xMax: number): string {
  const profile = unifiedVisualGuideProfileForChar(char);
  const designHeight = Math.max(1, profile.baselineY - profile.ascenderY);
  const ascenderY = profile.ascenderUnits;
  const xHeightY = ((profile.baselineY - (profile.xHeightY ?? profile.ascenderY)) / designHeight) * profile.ascenderUnits;
  const baselineY = 0;
  const descenderY = ((profile.baselineY - (profile.descenderY ?? profile.baselineY)) / designHeight) * profile.ascenderUnits;
  const transform = 'translate(0 700) scale(1 -1)';

  return `
    <g class="specimen-guides" transform="${escapeAttr(transform)}">
      <line x1="${roundSvg(xMin)}" y1="${roundSvg(ascenderY)}" x2="${roundSvg(xMax)}" y2="${roundSvg(ascenderY)}" />
      <line x1="${roundSvg(xMin)}" y1="${roundSvg(xHeightY)}" x2="${roundSvg(xMax)}" y2="${roundSvg(xHeightY)}" />
      <line x1="${roundSvg(xMin)}" y1="${roundSvg(baselineY)}" x2="${roundSvg(xMax)}" y2="${roundSvg(baselineY)}" />
      <line x1="${roundSvg(xMin)}" y1="${roundSvg(descenderY)}" x2="${roundSvg(xMax)}" y2="${roundSvg(descenderY)}" />
    </g>
  `;
}

function roundSvg(value: number): number {
  return Math.round(value * 10) / 10;
}

function previewTransformX(transform: string): number {
  const match = /^translate\(([-\d.]+)/.exec(transform);
  return match ? Number(match[1]) : 0;
}

function renderGlyphOverlayMessage(row: GlyphScanResult): string {
  const glyph = row.glyph;
  const windingWarning = createWindingWarning(glyph);
  const warnings = [...row.warnings, ...(glyph?.warnings ?? []), windingWarning].filter(Boolean).filter(uniqueString);
  const detail = warnings[0] ? ` ${warnings[0]}` : '';
  const tone = row.status === 'unsupported'
    ? 'issue'
    : warnings.length > 0 || row.status === 'warning'
      ? 'warning'
      : 'valid';

  return `<p class="glyph-message ${tone}">${escapeHtml(`${row.message}${detail}`)}</p>`;
}

function formatStatusLabel(status: GlyphScanResult['status']): string {
  if (status === 'valid') return 'Valid';
  if (status === 'empty') return 'Missing';
  if (status === 'unsupported') return 'Issue';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function bindEvents() {
  document.querySelectorAll<HTMLInputElement>('[data-font-name]').forEach((input) => input.addEventListener('input', (event) => {
    const nextName = (event.target as HTMLInputElement).value;
    state.fontName = nextName;
    document.querySelectorAll<HTMLInputElement>('[data-font-name]').forEach((peer) => {
      if (peer !== event.target) {
        peer.value = nextName;
      }
    });
    state.generatedFont = null;
    persistSettings();
  }));

  document.querySelector<HTMLInputElement>('#font-version')?.addEventListener('input', (event) => {
    state.fontVersion = (event.target as HTMLInputElement).value;
    persistSettings();
  });

  document.querySelector<HTMLInputElement>('#font-author')?.addEventListener('input', (event) => {
    state.fontAuthor = (event.target as HTMLInputElement).value;
    persistSettings();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      if (tab === 'glyphs' || tab === 'preview' || tab === 'settings') {
        state.activeTab = tab;
        render();
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-glyph-detail-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.glyphDetailTab;
      if (tab === 'glyph' || tab === 'kerning') {
        state.glyphDetailTab = tab;
        render();
      }
    });
  });

  document.querySelector<HTMLSelectElement>('#glyph-category-filter')?.addEventListener('change', (event) => {
    const category = (event.target as HTMLSelectElement).value;
    if (category === 'all' || GLYPH_CATEGORIES.some((item) => item.id === category)) {
      state.glyphCategoryFilter = category as GlyphCategoryId | 'all';
      render();
    }
  });

  document.querySelector<HTMLInputElement>('#glyph-search')?.addEventListener('input', (event) => {
    state.glyphSearch = (event.target as HTMLInputElement).value;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-glyph]').forEach((button) => {
    button.addEventListener('click', () => {
      const glyph = button.dataset.glyph;
      if (glyph && isGlyphChar(glyph)) {
        state.selectedGlyph = glyph;
        state.glyphOverlayOpen = true;
        persistSettings();
        render();
      }
    });
  });

  document.querySelector<HTMLButtonElement>('#open-recipe')?.addEventListener('click', () => {
    state.showRecipeOverlay = true;
    render();
  });

  document.querySelector<HTMLButtonElement>('#close-recipe')?.addEventListener('click', () => {
    state.showRecipeOverlay = false;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('#open-board-creation').forEach((button) => {
    button.addEventListener('click', () => {
      state.boardCreationStyle = state.starterStyle;
      state.boardCreationOverlayOpen = true;
      state.isCreatingBoard = false;
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#close-board-creation')?.addEventListener('click', () => {
    if (state.isCreatingBoard) {
      return;
    }
    state.boardCreationOverlayOpen = false;
    render();
  });

  document.querySelector<HTMLButtonElement>('#open-import-settings')?.addEventListener('click', () => {
    state.importSettingsOverlayOpen = true;
    state.boardSettingsSources = [];
    state.importSourceBoardId = '';
    state.importSpacingBasics = true;
    state.importAdvanceOverrides = true;
    state.importKerningPairs = true;
    postToPlugin({ type: 'REQUEST_BOARD_SETTINGS_SOURCES' });
    render();
  });

  document.querySelector<HTMLButtonElement>('#close-import-settings')?.addEventListener('click', () => {
    state.importSettingsOverlayOpen = false;
    render();
  });

  document.querySelector<HTMLSelectElement>('#import-settings-source')?.addEventListener('change', (event) => {
    state.importSourceBoardId = (event.target as HTMLSelectElement).value;
    render();
  });

  document.querySelector<HTMLInputElement>('#import-spacing-basics')?.addEventListener('change', (event) => {
    state.importSpacingBasics = (event.target as HTMLInputElement).checked;
    render();
  });

  document.querySelector<HTMLInputElement>('#import-advance-overrides')?.addEventListener('change', (event) => {
    state.importAdvanceOverrides = (event.target as HTMLInputElement).checked;
    render();
  });

  document.querySelector<HTMLInputElement>('#import-kerning-pairs')?.addEventListener('change', (event) => {
    state.importKerningPairs = (event.target as HTMLInputElement).checked;
    render();
  });

  document.querySelector<HTMLButtonElement>('#confirm-import-settings')?.addEventListener('click', () => {
    const sources = state.boardSettingsSources.filter((source) => source.activeBoard.id !== state.activeBoard?.id);
    const source = sources.find((item) => item.activeBoard.id === state.importSourceBoardId) ?? sources[0];
    if (!source || !source.activeBoard.hasCustomSpacing) {
      return;
    }

    const nextSpacing = cloneSpacingSettings(state.spacing);
    if (state.importSpacingBasics) {
      nextSpacing.letterSpacing = source.activeBoard.spacing.letterSpacing;
      nextSpacing.spaceWidth = source.activeBoard.spacing.spaceWidth;
    }
    if (state.importAdvanceOverrides) {
      nextSpacing.glyphAdvanceOverrides = { ...source.activeBoard.spacing.glyphAdvanceOverrides };
    }
    if (state.importKerningPairs) {
      nextSpacing.kerningPairs = source.activeBoard.spacing.kerningPairs.map((pair) => ({ ...pair }));
    }

    state.spacing = nextSpacing;
    state.generatedFont = null;
    state.importSettingsOverlayOpen = false;
    state.statusMessage = `Imported board settings from ${source.activeBoard.name}.`;
    persistActiveBoardSpacing();
    render();
  });

  document.querySelector<HTMLSelectElement>('#board-creation-style')?.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value;
    state.boardCreationStyle = isFontWeightStyle(value) ? value : DEFAULT_FONT_WEIGHT_STYLE;
    render();
  });

  document.querySelector<HTMLButtonElement>('#confirm-board-creation')?.addEventListener('click', () => {
    if (state.isCreatingBoard) {
      return;
    }
    state.starterStyle = state.boardCreationStyle;
    state.statusMessage = `Creating ${state.boardCreationStyle} glyph board...`;
    state.isCreatingBoard = true;
    postToPlugin({ type: 'CREATE_GLYPH_BOARD', style: state.boardCreationStyle, mode: 'new' });
    render();
  });

  document.querySelector<HTMLButtonElement>('#close-glyph-overlay')?.addEventListener('click', () => {
    state.glyphOverlayOpen = false;
    render();
  });

  document.querySelector<HTMLButtonElement>('#toggle-preview')?.addEventListener('click', () => {
    state.previewCollapsed = !state.previewCollapsed;
    render();
  });

  document.querySelector<HTMLButtonElement>('#toggle-health')?.addEventListener('click', () => {
    state.healthCollapsed = !state.healthCollapsed;
    render();
  });

  document.querySelector<HTMLButtonElement>('#toggle-font-settings')?.addEventListener('click', () => {
    state.fontSettingsCollapsed = !state.fontSettingsCollapsed;
    render();
  });

  document.querySelector<HTMLButtonElement>('#toggle-starter-settings')?.addEventListener('click', () => {
    state.starterSettingsCollapsed = !state.starterSettingsCollapsed;
    render();
  });

  document.querySelector<HTMLSelectElement>('#starter-style')?.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value;
    state.starterStyle = isFontWeightStyle(value) ? value : DEFAULT_FONT_WEIGHT_STYLE;
    state.statusMessage = `Starter weight set to ${state.starterStyle}.`;
    render();
  });

  document.querySelector<HTMLInputElement>('#preview-text')?.addEventListener('input', (event) => {
    state.previewText = (event.target as HTMLInputElement).value;
    persistSettings();
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-preview-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = PREVIEW_PRESETS.find((item) => item.id === button.dataset.previewPreset);
      if (!preset) {
        return;
      }

      state.previewText = preset.text;
      state.statusMessage = `Preview preset applied: ${preset.label}.`;
      persistSettings();
      render();
    });
  });

  bindMetricInputs('letter-spacing', -120, 300, (value) => {
    state.spacing.letterSpacing = value;
    state.generatedFont = null;
  }, persistActiveBoardSpacing);

  bindMetricInputs('space-width', 120, 900, (value) => {
    state.spacing.spaceWidth = value;
    state.generatedFont = null;
  }, persistActiveBoardSpacing);

  bindMetricInputs('preview-font-size', 12, 96, (value) => {
    state.previewFontSize = value;
  }, persistSettings);

  bindMetricInputs('advance-override', 120, 1400, (value) => {
    state.spacing.glyphAdvanceOverrides[state.selectedGlyph] = value;
    state.generatedFont = null;
  }, persistActiveBoardSpacing);

  bindMetricInputs('kerning-value', -300, 300, (value) => {
    const right = getKerningPairRight();
    if (!right) {
      return;
    }

    state.spacing.kerningPairs = upsertKerningPair(
      state.spacing.kerningPairs,
      state.selectedGlyph,
      right,
      value,
    );
    state.kerningPairRight = right;
    state.generatedFont = null;
  }, persistActiveBoardSpacing);

  document.querySelector<HTMLInputElement>('#kerning-right-glyph')?.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    const next = Array.from(input.value)[0] ?? '';
    state.kerningPairInput = next;

    if (isGlyphChar(next)) {
      state.kerningPairRight = next;
      state.generatedFont = null;
    }

    render();
  });

  document.querySelector<HTMLButtonElement>('#reset-kerning-pair')?.addEventListener('click', () => {
    const right = getKerningPairRight();
    if (!right) {
      return;
    }

    state.spacing.kerningPairs = removeKerningPair(state.spacing.kerningPairs, state.selectedGlyph, right);
    state.kerningPairRight = right;
    state.generatedFont = null;
    persistActiveBoardSpacing();
    render();
  });

  document.querySelector<HTMLButtonElement>('#update-board')?.addEventListener('click', () => {
    state.statusMessage = `Updating ${state.activeBoard?.name ?? 'selected Typegen board'}...`;
    postToPlugin({ type: 'CREATE_GLYPH_BOARD', style: state.starterStyle, mode: 'update' });
    render();
  });

  document.querySelector<HTMLButtonElement>('#generate-starters')?.addEventListener('click', () => {
    state.statusMessage = `Generating ${state.starterStyle} starter glyphs in empty slots...`;
    state.generatedFont = null;
    postToPlugin({ type: 'GENERATE_STARTER_GLYPHS', style: state.starterStyle });
    render();
  });

  document.querySelector<HTMLButtonElement>('#generate-font')?.addEventListener('click', () => {
    state.isGenerating = true;
    state.generatedFont = null;
    state.statusMessage = 'Scanning all Typegen glyph boards and generating the ZIP package...';
    postToPlugin({ type: 'SCAN_ALL_GLYPH_BOARDS' });
    render();
  });
}

function bindMetricInputs(metric: string, min: number, max: number, applyValue: (value: number) => void, persistValue = persistSettings): void {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(`[data-metric="${metric}"]`));
  const ranges = inputs.filter((input) => input.type === 'range');
  const numbers = inputs.filter((input) => input.type === 'number');

  for (const input of inputs) {
    input.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const value = readMetricInput(target, min, max);
      applyValue(value);
      syncMetricInputs(ranges, numbers, value);

      if (target.type === 'range') {
        updateLiveMetricPreview(metric);
        return;
      }

      persistValue();
      render();
    });

    if (input.type === 'range') {
      input.addEventListener('change', () => {
        persistValue();
        render();
      });
    }
  }
}

function syncMetricInputs(ranges: HTMLInputElement[], numbers: HTMLInputElement[], value: number): void {
  for (const range of ranges) {
    range.value = String(value);
    updateRangeFill(range);
  }

  for (const number of numbers) {
    number.value = String(value);
  }
}

function updateRangeFill(input: HTMLInputElement): void {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  input.style.setProperty('--value', `${metricPercent(value, min, max)}%`);
}

function updateLiveMetricPreview(metric: string): void {
  if (metric === 'preview-font-size') {
    document.querySelector<HTMLElement>('.preview')?.style.setProperty('--preview-font-size', `${state.previewFontSize}px`);
    return;
  }

  if (metric === 'advance-override') {
    const value = state.spacing.glyphAdvanceOverrides[state.selectedGlyph] ?? 700;
    refreshGlyphSpecimen(value);
  }

  if (metric === 'kerning-value') {
    refreshKerningSpecimen();
  }

  if (metric === 'letter-spacing' || metric === 'space-width' || metric === 'advance-override' || metric === 'kerning-value') {
    refreshPreviewMarkup();
  }
}

function refreshPreviewMarkup(): void {
  const preview = document.querySelector<HTMLElement>('.preview');
  if (!preview) return;

  preview.innerHTML = renderPreviewMarkup(state.previewText, state.glyphs, state.spacing);
}

function refreshGlyphSpecimen(advanceWidth: number): void {
  const preview = document.querySelector<HTMLElement>('.glyph-detail-preview');
  if (!preview) return;

  const row = state.glyphs.find((glyph) => glyph.char === state.selectedGlyph);
  if (!row) return;

  preview.outerHTML = renderGlyphSpecimen(row, advanceWidth);
}

function refreshKerningSpecimen(): void {
  const preview = document.querySelector<HTMLElement>('.kerning-preview');
  if (!preview) return;

  const row = state.glyphs.find((glyph) => glyph.char === state.selectedGlyph);
  if (!row) return;

  preview.outerHTML = renderKerningPairPreview(row, getKerningPairRight());
}

window.onmessage = (event: MessageEvent<{ pluginMessage?: PluginToUiMessage }>) => {
  const message = event.data.pluginMessage;
  if (!isPluginMessage(message)) return;

  if (message.type === 'PLUGIN_READY') {
    state.statusMessage = 'Plugin ready. Select a Typegen board to auto-scan.';
  }

  if (message.type === 'SETTINGS_LOADED') {
    applyPersistedSettings(message.settings);
    if (state.lastScanNodeIds.length > 0) {
      state.statusMessage = 'Restoring saved glyph scan...';
      postToPlugin({ type: 'RESTORE_SAVED_SCAN', nodeIds: state.lastScanNodeIds });
    }
  }

  if (message.type === 'GLYPH_BOARD_CREATED') {
    applyActiveBoard(message.activeBoard);
    state.boardCreationStyle = message.activeBoard.style;
    state.boardCreationOverlayOpen = false;
    state.isCreatingBoard = false;
    state.generatedFont = null;
    state.statusMessage = message.message;
  }

  if (message.type === 'STARTER_GLYPHS_GENERATED') {
    applyActiveBoard(message.activeBoard);
    state.generatedFont = null;
    state.statusMessage = [message.message, ...message.warnings].join(' ');
  }

  if (message.type === 'GLYPHS_SCANNED') {
    if (message.activeBoard) {
      applyActiveBoard(message.activeBoard);
    }
    state.glyphs = message.glyphs;
    state.lastScanNodeIds = collectScanNodeIds(message.glyphs);
    state.selectedGlyph = chooseSelectedGlyph(message.glyphs, state.selectedGlyph);
    state.isScanning = false;
    state.generatedFont = null;
    state.statusMessage = `Auto-scan updated: ${message.summary.valid} valid, ${message.summary.empty} empty, ${message.summary.unsupported} unsupported.`;
    persistSettings();
  }

  if (message.type === 'BOARD_SELECTION_CLEARED') {
    state.activeBoard = null;
    state.glyphs = [];
    state.lastScanNodeIds = [];
    state.generatedFont = null;
    state.glyphOverlayOpen = false;
    state.spacing = createDefaultSpacing();
    state.importSettingsOverlayOpen = false;
    state.statusMessage = 'Select a Typegen board to auto-scan status, weight, and preview data.';
  }

  if (message.type === 'ALL_GLYPH_BOARDS_SCANNED') {
    generateFontPackageFromBoards(message.boards);
  }

  if (message.type === 'BOARD_SETTINGS_SOURCES') {
    state.boardSettingsSources = message.sources;
    const sources = message.sources.filter((source) => source.activeBoard.id !== state.activeBoard?.id);
    if (!state.importSourceBoardId || !sources.some((source) => source.activeBoard.id === state.importSourceBoardId)) {
      state.importSourceBoardId = sources[0]?.activeBoard.id ?? '';
    }
  }

  if (message.type === 'VALIDATION_ERROR') {
    state.isScanning = false;
    state.isGenerating = false;
    state.isCreatingBoard = false;
    state.statusMessage = message.message;
  }

  render();
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return entities[char];
  });
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function exportedChars(): GlyphChar[] {
  return validGlyphs().map((row) => row.char);
}

function createScanExportWarning(): string {
  if (state.glyphs.length === 0) {
    return '';
  }

  const invalid = invalidGlyphs();
  if (invalid.length === 0) {
    return '';
  }

  const unsupported = invalid.filter((glyph) => glyph.status === 'unsupported').length;
  const empty = invalid.filter((glyph) => glyph.status === 'empty').length;
  const missing = invalid.filter((glyph) => glyph.status === 'missing').length;
  const warning = invalid.filter((glyph) => glyph.status === 'warning').length;
  const parts = [
    unsupported ? `${unsupported} unsupported` : '',
    empty ? `${empty} empty` : '',
    missing ? `${missing} missing` : '',
    warning ? `${warning} warning` : '',
  ].filter(Boolean);

  return `${parts.join(', ')} glyphs will not export. Only valid filled vector glyphs are included.`;
}

function createPreviewExportWarning(): string {
  if (state.glyphs.length === 0 || state.previewText.length === 0) {
    return '';
  }

  const exportable = new Set(exportedChars());
  const missing = new Set<GlyphChar>();
  const unsupported = new Set<string>();

  for (const char of Array.from(state.previewText)) {
    if (char === ' ') {
      continue;
    }

    if (!isGlyphChar(char)) {
      unsupported.add(char);
      continue;
    }

    if (!exportable.has(char)) {
      missing.add(char);
    }
  }

  if (unsupported.size > 0) {
    return 'Preview includes unsupported characters. Exported fonts include the V9 glyph catalog and space when scanned as valid.';
  }

  if (missing.size > 0) {
    return `Preview includes glyphs not in this export: ${[...missing].join(', ')}.`;
  }

  return '';
}

function createExportDiagnostics(): ExportDiagnostics {
  const validCount = validGlyphs().length;
  const emptyCount = state.glyphs.filter((glyph) => glyph.status === 'empty').length;
  const missingCount = state.glyphs.filter((glyph) => glyph.status === 'missing').length;
  const unsupportedCount = state.glyphs.filter((glyph) => glyph.status === 'unsupported').length;
  const windingWarnings = collectWindingWarnings();
  const metricsWarnings = collectMetricsWarnings(
    validGlyphs().map((row) => row.glyph!),
    state.spacing,
  );
  const warningCount =
    state.glyphs.filter((glyph) => glyph.status === 'warning').length +
    state.glyphs.reduce((total, glyph) => total + glyph.warnings.length + (glyph.glyph?.warnings.length ?? 0), 0) +
    windingWarnings.length +
    metricsWarnings.length;
  const { previewMissing, previewUnsupported } = collectPreviewIssues();
  const details: string[] = [];
  const overrideCount = countAdvanceOverrides();

  if (state.glyphs.length === 0) {
    return {
      status: 'needs-scan',
      headline: 'Scan a selected glyph board to preview it, or generate font to package all boards.',
      details: [
        state.lastScanNodeIds.length > 0
          ? `${state.lastScanNodeIds.length} saved scan nodes are available for restore.`
          : 'No scan results are loaded yet.',
      ],
      validCount,
      emptyCount,
      missingCount,
      unsupportedCount,
      warningCount,
      previewMissing,
      previewUnsupported,
      overrideCount,
    };
  }

  if (emptyCount > 0) {
    details.push(`${emptyCount} empty glyphs will not export.`);
  }

  if (missingCount > 0) {
    details.push(`${missingCount} missing glyphs are outside this export.`);
  }

  if (unsupportedCount > 0) {
    details.push(`${unsupportedCount} unsupported glyphs need vector-outline fixes.`);
  }

  if (warningCount > 0) {
    details.push(`${warningCount} glyph warnings should be reviewed in the inspector.`);
  }

  for (const warning of metricsWarnings.slice(0, 4)) {
    details.push(warning);
  }

  if (metricsWarnings.length > 4) {
    details.push(`${metricsWarnings.length - 4} more metrics warnings are available after spacing changes.`);
  }

  for (const warning of windingWarnings.slice(0, 3)) {
    details.push(warning);
  }

  if (windingWarnings.length > 3) {
    details.push(`${windingWarnings.length - 3} more winding warnings are available in the glyph inspector.`);
  }

  if (previewMissing.length > 0) {
    details.push(`Preview uses glyphs not in this export: ${previewMissing.join(', ')}.`);
  }

  if (previewUnsupported.length > 0) {
    details.push('Preview contains unsupported characters; export only includes the V9 glyph catalog and space.');
  }

  if (overrideCount > 0) {
    details.push(`${overrideCount} advance width overrides are active.`);
  }

  if (state.spacing.kerningPairs.length > 0) {
    details.push(`${state.spacing.kerningPairs.length} kerning pairs are active.`);
  }

  details.push(
    state.lastScanNodeIds.length > 0
      ? `Saved scan references ${state.lastScanNodeIds.length} Figma nodes.`
      : 'No saved scan nodes are currently stored.',
  );

  if (state.generatedFont) {
    if (isGeneratedFontVerified()) {
      details.push('Last generated package font verified successfully.');
    } else {
      details.push('Last generated package font did not verify cleanly.');
    }
  } else {
    details.push('Generate font scans all Typegen boards and downloads one ZIP package.');
  }

  if (validCount === 0) {
    return {
      status: 'blocked',
      headline: 'Current preview scan has no valid glyphs.',
      details,
      validCount,
      emptyCount,
      missingCount,
      unsupportedCount,
      warningCount,
      previewMissing,
      previewUnsupported,
      overrideCount,
    };
  }

  const hasPreviewIssues = previewMissing.length > 0 || previewUnsupported.length > 0;
  const hasVerificationFailure = Boolean(state.generatedFont && !isGeneratedFontVerified());
  return {
    status: hasPreviewIssues || hasVerificationFailure ? 'blocked' : 'ready',
    headline: hasVerificationFailure
      ? 'Generated font failed verification. Fix glyphs or regenerate before export.'
      : hasPreviewIssues
      ? 'Font generation is possible, but the current preview includes characters that will not export.'
      : state.generatedFont
        ? 'Generated font is ready to export.'
        : 'Glyphs are ready; generate the font to enable export.',
    details,
    validCount,
    emptyCount,
    missingCount,
    unsupportedCount,
    warningCount,
    previewMissing,
    previewUnsupported,
    overrideCount,
  };
}

function collectPreviewIssues(): { previewMissing: GlyphChar[]; previewUnsupported: string[] } {
  const exportable = new Set(exportedChars());
  const previewMissing = new Set<GlyphChar>();
  const previewUnsupported = new Set<string>();

  for (const char of Array.from(state.previewText)) {
    if (char === ' ') {
      continue;
    }

    if (!isGlyphChar(char)) {
      previewUnsupported.add(char);
      continue;
    }

    if (state.glyphs.length > 0 && !exportable.has(char)) {
      previewMissing.add(char);
    }
  }

  return {
    previewMissing: [...previewMissing],
    previewUnsupported: [...previewUnsupported],
  };
}

function collectWindingWarnings(): string[] {
  return state.glyphs
    .map((row) => createWindingWarning(row.glyph))
    .filter((warning): warning is string => Boolean(warning));
}

function createWindingWarning(glyph: GlyphModel | undefined): string {
  if (!glyph || glyph.paths.length <= 1) {
    return '';
  }

  const windingRules = glyph.paths
    .map((path) => path.windingRule ?? 'NONZERO')
    .filter(uniqueString);

  if (windingRules.length > 1) {
    return `${glyph.char}: mixed winding rules (${windingRules.join(', ')}) may make counters differ between preview and exported font.`;
  }

  return `${glyph.char}: multiple contours detected. If this glyph has counters, confirm the preview and exported font both keep holes open.`;
}

function createSmokeTestSampleText(): string {
  const previewChars = Array.from(state.previewText).filter((char) => char === ' ' || isGlyphChar(char));
  const hasExportablePreviewText = previewChars.some((char) => char !== ' ' && exportedChars().includes(char as GlyphChar));

  if (hasExportablePreviewText) {
    return previewChars.join('');
  }

  const firstGlyphs = GLYPH_CHARS.filter((char) => exportedChars().includes(char)).slice(0, 8);
  return firstGlyphs.length > 0 ? firstGlyphs.join(' ') : "ABC box @2+2";
}

function isGeneratedFontVerified(result = state.generatedFont): boolean {
  return Boolean(
    result &&
      result.verification.failedGlyphs.length === 0 &&
      result.verification.failedKerningPairs.length === 0 &&
      result.verification.verifiedGlyphs.length === result.glyphCount,
  );
}

function getSelectedGlyph(rows: GlyphScanResult[]): GlyphScanResult {
  return (
    rows.find((row) => row.char === state.selectedGlyph) ??
    rows.find((row) => row.status === 'valid') ??
    rows[0]
  );
}

function chooseSelectedGlyph(glyphs: GlyphScanResult[], current: GlyphChar): GlyphChar {
  if (glyphs.some((glyph) => glyph.char === current)) {
    return current;
  }

  return glyphs.find((glyph) => glyph.status === 'valid')?.char ?? 'A';
}

function renderFontVerification(result: FontBuildResult): string {
  const verifiedChars = result.verification.verifiedGlyphs.map((glyph) => glyph.char);
  const failedChars = result.verification.failedGlyphs;
  const sample = result.verification.verifiedGlyphs
    .slice(0, 6)
    .map((glyph) => `${glyph.char} ${glyph.advanceWidth}/${glyph.commandCount}`)
    .join(', ');

  return `
    <div class="verification-box ${failedChars.length ? 'blocked' : 'ready'}">
      <div>
        <span>Parsed glyphs</span>
        <strong>${result.verification.parsedGlyphCount}</strong>
      </div>
      <div>
        <span>Verified</span>
        <strong>${verifiedChars.length}/${result.glyphCount}</strong>
      </div>
      <div>
        <span>Sample</span>
        <strong>${escapeHtml(sample || 'none')}</strong>
      </div>
      <div>
        <span>Kerning</span>
        <strong>${result.verification.verifiedKerningPairs.length}/${result.verification.verifiedKerningPairs.length + result.verification.failedKerningPairs.length}</strong>
      </div>
    </div>
    ${
      failedChars.length
        ? `<p class="warning">Generated font parsed, but these glyphs did not verify cleanly: ${escapeHtml(failedChars.join(', '))}.</p>`
        : result.verification.failedKerningPairs.length
          ? `<p class="warning">Generated font parsed, but these kerning pairs did not verify cleanly: ${escapeHtml(result.verification.failedKerningPairs.map((pair) => `${pair.left}${pair.right}`).join(', '))}.</p>`
        : '<p class="status">Generated font parsed back successfully with matching unicode, advance width, and outline data.</p>'
    }
  `;
}

function generateFontPackageFromBoards(boards: BoardScanResult[]): void {
  try {
    const items: FontPackageItem[] = [];
    const seenStyles = new Set<FontPackageStyle>();
    const skipped: string[] = [];

    for (const board of boards) {
      const style = board.activeBoard.style;
      const validGlyphsForBoard = board.glyphs
        .filter((glyph) => glyph.status === 'valid' && glyph.glyph)
        .map((glyph) => glyph.glyph!);

      if (validGlyphsForBoard.length === 0) {
        skipped.push(`${board.activeBoard.name} has no valid glyphs`);
        continue;
      }

      if (seenStyles.has(style)) {
        skipped.push(`${board.activeBoard.name} duplicates ${style}; first ${style} board was packaged`);
        continue;
      }

      const result = buildFont(
        {
          familyName: state.fontName,
          glyphs: validGlyphsForBoard,
          spacing: board.activeBoard.spacing,
        },
        {
          styleName: style,
        },
      );

      if (!isGeneratedFontVerified(result)) {
        skipped.push(`${board.activeBoard.name} did not verify cleanly`);
        continue;
      }

      items.push({ result, style });
      seenStyles.add(style);
      state.generatedFont = result;
    }

    if (items.length === 0) {
      state.statusMessage = skipped.length
        ? `No verified fonts were generated. ${skipped.join(' ')}.`
        : 'No verified fonts were generated. Add valid glyphs to a Typegen board and try again.';
      return;
    }

    downloadFontPackageZip(items, createSmokeTestSampleText());
    const weights = items.map((item) => item.style).join(', ');
    state.statusMessage = `Generated ZIP package for ${weights}. ${skipped.length ? `Skipped: ${skipped.join(' ')}` : ''}`.trim();
  } catch (error) {
    state.statusMessage = error instanceof Error ? error.message : 'Font package generation failed.';
  } finally {
    state.isGenerating = false;
  }
}

function uniqueString(value: string, index: number, values: string[]): boolean {
  return values.indexOf(value) === index;
}

function readMetricInput(input: HTMLInputElement, min: number, max: number): number {
  const value = Number(input.value);
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.round(Math.min(max, Math.max(min, value)));
}

function countAdvanceOverrides(): number {
  return Object.keys(state.spacing.glyphAdvanceOverrides).length;
}

function applyActiveBoard(activeBoard: ActiveBoardInfo): void {
  state.activeBoard = activeBoard;
  state.starterStyle = activeBoard.style;
  state.spacing = cloneSpacingSettings(activeBoard.spacing);
}

function persistSettings(): void {
  postToPlugin({
    type: 'SAVE_SETTINGS',
    settings: createPersistedSettings(),
  });
}

function persistActiveBoardSpacing(): void {
  if (!state.activeBoard) {
    return;
  }

  const spacing = cloneSpacingSettings(state.spacing);
  state.activeBoard = {
    ...state.activeBoard,
    spacing,
    hasCustomSpacing: true,
  };
  postToPlugin({
    type: 'SAVE_BOARD_SPACING',
    boardId: state.activeBoard.id,
    spacing,
  });
}

function createPersistedSettings(): PersistedTypegenSettings {
  return {
    fontName: state.fontName,
    fontVersion: state.fontVersion,
    fontAuthor: state.fontAuthor,
    previewText: state.previewText,
    previewFontSize: state.previewFontSize,
    selectedGlyph: state.selectedGlyph,
    lastScanNodeIds: [...state.lastScanNodeIds],
  };
}

function applyPersistedSettings(settings: PersistedTypegenSettings | null): void {
  if (!settings) {
    return;
  }

  state.fontName = settings.fontName || state.fontName;
  state.fontVersion = settings.fontVersion || state.fontVersion;
  state.fontAuthor = settings.fontAuthor || state.fontAuthor;
  state.previewText = settings.previewText || state.previewText;
  state.previewFontSize = clampNumber(settings.previewFontSize, 12, 96, state.previewFontSize);
  state.selectedGlyph = isGlyphChar(settings.selectedGlyph) ? settings.selectedGlyph : state.selectedGlyph;
  state.lastScanNodeIds = Array.isArray(settings.lastScanNodeIds)
    ? settings.lastScanNodeIds.filter((id) => typeof id === 'string')
    : [];
  state.generatedFont = null;
  state.statusMessage = 'Restored saved Typegen settings from this Figma file.';
}

function createDefaultSpacing(): FontSpacingSettings {
  return {
    letterSpacing: DEFAULT_SPACING.letterSpacing,
    spaceWidth: DEFAULT_SPACING.spaceWidth,
    glyphAdvanceOverrides: {},
    kerningPairs: [],
  };
}

function cloneSpacingSettings(spacing: Partial<FontSpacingSettings> | undefined): FontSpacingSettings {
  return {
    letterSpacing: clampNumber(spacing?.letterSpacing, -120, 300, DEFAULT_SPACING.letterSpacing),
    spaceWidth: clampNumber(spacing?.spaceWidth, 120, 900, DEFAULT_SPACING.spaceWidth),
    glyphAdvanceOverrides: sanitizeAdvanceOverrides(spacing?.glyphAdvanceOverrides),
    kerningPairs: sanitizeKerningPairs(spacing?.kerningPairs),
  };
}

function collectScanNodeIds(glyphs: GlyphScanResult[]): string[] {
  return [...new Set(glyphs.map((glyph) => glyph.nodeId).filter((id): id is string => Boolean(id)))];
}

function sanitizeAdvanceOverrides(
  overrides: Partial<Record<GlyphChar, number>> | undefined,
): FontSpacingSettings['glyphAdvanceOverrides'] {
  if (!overrides) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(overrides)
      .filter(([char]) => isGlyphChar(char))
      .map(([char, value]) => [char, clampNumber(value, 120, 1400, 700)]),
  ) as FontSpacingSettings['glyphAdvanceOverrides'];
}

function sanitizeKerningPairs(pairs: FontSpacingSettings['kerningPairs'] | undefined): FontSpacingSettings['kerningPairs'] {
  if (!Array.isArray(pairs)) {
    return [];
  }

  return normalizeKerningPairs(pairs
    .filter((pair) => pair && isGlyphChar(pair.left) && isGlyphChar(pair.right))
    .map((pair) => ({
      left: pair.left,
      right: pair.right,
      value: clampNumber(pair.value, -300, 300, 0),
    }))
    .filter((pair) => pair.value !== 0));
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.round(Math.min(max, Math.max(min, value as number)));
}

render();
