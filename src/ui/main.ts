import { buildFont } from '../font/buildFont';
import { downloadFont, downloadSmokeTestHtml } from '../font/exportFont';
import {
  DEFAULT_SPACING,
  GLYPH_CHARS,
  collectMetricsWarnings,
  glyphNameForChar,
  isGlyphChar,
  resolveGlyphAdvance,
  type FontBuildResult,
  type FontSpacingSettings,
  type GlyphChar,
  type GlyphModel,
} from '../font/glyphModel';
import { postToPlugin, isPluginMessage, type PluginToUiMessage } from '../shared/messages';
import type { GlyphScanResult, PersistedTypegenSettings } from '../shared/types';
import { renderPreviewMarkup } from './preview/renderGlyphPreview';
import './styles.css';

type UiState = {
  fontName: string;
  previewText: string;
  glyphs: GlyphScanResult[];
  selectedGlyph: GlyphChar;
  lastScanNodeIds: string[];
  statusMessage: string;
  savedStatus: string;
  generatedFont: FontBuildResult | null;
  spacing: FontSpacingSettings;
  showRecipe: boolean;
  isScanning: boolean;
  isGenerating: boolean;
};

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

const state: UiState = {
  fontName: 'Typegen Demo',
  previewText: 'ABC 123!',
  glyphs: [],
  selectedGlyph: 'A',
  lastScanNodeIds: [],
  statusMessage: 'Create a board or select glyph slots named glyph-A through glyph-Z, glyph-0 through glyph-9, or supported punctuation slots.',
  savedStatus: 'No saved settings loaded yet.',
  generatedFont: null,
  spacing: { ...DEFAULT_SPACING, glyphAdvanceOverrides: {} },
  showRecipe: true,
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
  const validCount = validGlyphs().length;
  const canGenerate = validCount > 0 && !state.isGenerating;
  const scanWarning = createScanExportWarning();
  const previewWarning = createPreviewExportWarning();
  const generatedWarnings = state.generatedFont?.warnings ?? [];
  const diagnostics = createExportDiagnostics();
  const canExport = isGeneratedFontVerified();
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
      <header class="header">
        <div>
          <p class="eyebrow">Typegen V2.10.1</p>
          <h1>Figma glyphs to font file</h1>
        </div>
        <span class="count">${validCount}/${GLYPH_CHARS.length} ready</span>
      </header>

      <section class="panel">
        <label class="field">
          <span>Font name</span>
          <input id="font-name" value="${escapeAttr(state.fontName)}" />
        </label>
        <p class="instructions">
          Create a board, draw filled vector outlines in glyph slots, scan, preview, then export an OTF.
        </p>
        <div class="actions">
          <button id="create-board">Create/update glyph board</button>
          <button id="scan-glyphs">${state.isScanning ? 'Scanning...' : 'Scan selected glyphs'}</button>
          <button id="toggle-recipe">${state.showRecipe ? 'Hide recipe' : 'Show recipe'}</button>
        </div>
        <p class="status">${escapeHtml(state.statusMessage)}</p>
      </section>

      ${
        state.showRecipe
          ? `<section class="panel recipe-panel">
              <div class="section-head">
                <h2>Supported glyph recipe</h2>
                <span>A-Z + 0-9 + punctuation</span>
              </div>
              <ol class="recipe-list">
                <li>Name slots exactly <strong>glyph-A</strong> through <strong>glyph-Z</strong>, <strong>glyph-0</strong> through <strong>glyph-9</strong>, plus <strong>glyph-period</strong>, <strong>glyph-comma</strong>, <strong>glyph-exclamation</strong>, <strong>glyph-question</strong>, <strong>glyph-hyphen</strong>, and <strong>glyph-colon</strong>.</li>
                <li>Draw with simple filled vector paths inside each slot.</li>
                <li>Convert text and strokes to outlines before scanning.</li>
                <li>Avoid images, effects, gradients, masks, booleans, and live shape layers.</li>
                <li>Use preview, spacing, and the inspector before exporting.</li>
              </ol>
              <p class="status">Lowercase, extra symbols, kerning, variable fonts, and AI generation are intentionally outside this MVP.</p>
            </section>`
          : ''
      }

      <section class="panel compact-panel">
        <div class="section-head">
          <h2>Saved state</h2>
          <span>${countAdvanceOverrides()} overrides</span>
        </div>
        <p class="status">${escapeHtml(state.savedStatus)}</p>
        <div class="saved-stats">
          <span>Scan nodes: ${state.lastScanNodeIds.length}</span>
          <span>Preview: ${escapeHtml(state.previewText || 'empty')}</span>
        </div>
        <div class="actions">
          <button id="reset-settings" ${hasSavedState() ? '' : 'disabled'}>Reset saved settings</button>
        </div>
      </section>

      <section class="panel diagnostics-panel ${diagnostics.status}">
        <div class="section-head">
          <h2>Ready to export</h2>
          <span>${diagnostics.status === 'ready' ? 'Ready' : diagnostics.status === 'needs-scan' ? 'Scan needed' : 'Blocked'}</span>
        </div>
        <p class="${diagnostics.status === 'ready' ? 'status' : 'warning'}">${escapeHtml(diagnostics.headline)}</p>
        <div class="diagnostic-grid">
          <div>
            <span>Valid</span>
            <strong>${diagnostics.validCount}</strong>
          </div>
          <div>
            <span>Empty</span>
            <strong>${diagnostics.emptyCount}</strong>
          </div>
          <div>
            <span>Missing</span>
            <strong>${diagnostics.missingCount}</strong>
          </div>
          <div>
            <span>Unsupported</span>
            <strong>${diagnostics.unsupportedCount}</strong>
          </div>
          <div>
            <span>Preview gaps</span>
            <strong>${diagnostics.previewMissing.length + diagnostics.previewUnsupported.length}</strong>
          </div>
          <div>
            <span>Overrides</span>
            <strong>${diagnostics.overrideCount}</strong>
          </div>
        </div>
        ${
          diagnostics.details.length
            ? `<ul class="message-list">${diagnostics.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>`
            : ''
        }
      </section>

      <section class="panel">
        <div class="section-head">
          <h2>Glyph status</h2>
          <span>${validCount} valid</span>
        </div>
        ${scanWarning ? `<p class="warning">${escapeHtml(scanWarning)}</p>` : ''}
        <div class="glyph-table" role="table" aria-label="Glyph status">
          ${rows
            .map(
              (row) => `
                <button class="glyph-row ${row.status} ${row.char === state.selectedGlyph ? 'selected' : ''}" role="row" data-glyph="${row.char}">
                  <strong>${row.char}</strong>
                  <span>${row.name}</span>
                  <em>${row.status}</em>
                  <small>${escapeHtml(row.message)}</small>
                </button>
              `,
            )
            .join('')}
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <h2>Glyph inspector</h2>
          <span>${selectedGlyph.name}</span>
        </div>
        ${renderGlyphInspector(selectedGlyph)}
      </section>

      <section class="panel">
        <label class="field">
          <span>Preview text</span>
          <input id="preview-text" value="${escapeAttr(state.previewText)}" />
        </label>
        <div class="spacing-grid">
          <label class="field compact">
            <span>Letter spacing</span>
            <input id="letter-spacing" type="number" min="-120" max="300" step="10" value="${state.spacing.letterSpacing}" />
          </label>
          <label class="field compact">
            <span>Space width</span>
            <input id="space-width" type="number" min="120" max="900" step="10" value="${state.spacing.spaceWidth}" />
          </label>
        </div>
        <div class="preview">${renderPreviewMarkup(state.previewText, state.glyphs, state.spacing)}</div>
        ${previewWarning ? `<p class="warning">${escapeHtml(previewWarning)}</p>` : ''}
        <div class="actions">
          <button id="generate-font" ${canGenerate ? '' : 'disabled'}>${state.isGenerating ? 'Generating...' : 'Generate font file'}</button>
          <button id="export-font" ${canExport ? '' : 'disabled'}>Export OTF</button>
          <button id="export-smoke-test" ${canExport ? '' : 'disabled'}>Export smoke test HTML</button>
        </div>
        ${
          state.generatedFont
            ? `<p class="status">Font generated with ${state.generatedFont.glyphCount}/${GLYPH_CHARS.length} glyphs. Export includes: ${escapeHtml(exportedChars().join(', ') || 'none')}. Letter spacing: ${state.spacing.letterSpacing}, space width: ${state.spacing.spaceWidth}, overrides: ${countAdvanceOverrides()}.</p>`
            : ''
        }
        ${state.generatedFont ? renderFontVerification(state.generatedFont) : ''}
        ${
          generatedWarnings.length
            ? `<ul class="message-list">${generatedWarnings
                .map((warning) => `<li>${escapeHtml(warning)}</li>`)
                .join('')}</ul>`
            : ''
        }
      </section>
    </section>
  `;

  bindEvents();
  restoreRenderInteraction(interaction);
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

function bindEvents() {
  document.querySelector<HTMLInputElement>('#font-name')?.addEventListener('input', (event) => {
    state.fontName = (event.target as HTMLInputElement).value;
    state.generatedFont = null;
    persistSettings();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-glyph]').forEach((button) => {
    button.addEventListener('click', () => {
      const glyph = button.dataset.glyph;
      if (glyph && isGlyphChar(glyph)) {
        state.selectedGlyph = glyph;
        persistSettings();
        render();
      }
    });
  });

  document.querySelector<HTMLButtonElement>('#toggle-recipe')?.addEventListener('click', () => {
    state.showRecipe = !state.showRecipe;
    render();
  });

  document.querySelector<HTMLInputElement>('#preview-text')?.addEventListener('input', (event) => {
    state.previewText = (event.target as HTMLInputElement).value;
    persistSettings();
    render();
  });

  document.querySelector<HTMLInputElement>('#letter-spacing')?.addEventListener('input', (event) => {
    state.spacing.letterSpacing = readMetricInput(event.target as HTMLInputElement, -120, 300);
    state.generatedFont = null;
    persistSettings();
    render();
  });

  document.querySelector<HTMLInputElement>('#space-width')?.addEventListener('input', (event) => {
    state.spacing.spaceWidth = readMetricInput(event.target as HTMLInputElement, 120, 900);
    state.generatedFont = null;
    persistSettings();
    render();
  });

  document.querySelector<HTMLInputElement>('#advance-override')?.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.value.trim()) {
      delete state.spacing.glyphAdvanceOverrides[state.selectedGlyph];
    } else {
      state.spacing.glyphAdvanceOverrides[state.selectedGlyph] = readMetricInput(input, 120, 1400);
    }
    state.generatedFont = null;
    persistSettings();
    render();
  });

  document.querySelector<HTMLButtonElement>('#reset-advance')?.addEventListener('click', () => {
    delete state.spacing.glyphAdvanceOverrides[state.selectedGlyph];
    state.generatedFont = null;
    persistSettings();
    render();
  });

  document.querySelector<HTMLButtonElement>('#reset-settings')?.addEventListener('click', () => {
    resetLocalSettings();
    postToPlugin({ type: 'RESET_SETTINGS' });
    render();
  });

  document.querySelector<HTMLButtonElement>('#create-board')?.addEventListener('click', () => {
    state.statusMessage = 'Creating glyph board...';
    postToPlugin({ type: 'CREATE_GLYPH_BOARD' });
    render();
  });

  document.querySelector<HTMLButtonElement>('#scan-glyphs')?.addEventListener('click', () => {
    state.isScanning = true;
    state.statusMessage = 'Scanning current selection...';
    state.generatedFont = null;
    postToPlugin({ type: 'SCAN_SELECTED_GLYPHS' });
    render();
  });

  document.querySelector<HTMLButtonElement>('#generate-font')?.addEventListener('click', () => {
    try {
      state.isGenerating = true;
      render();
      state.generatedFont = buildFont({
        familyName: state.fontName,
        glyphs: validGlyphs().map((row) => row.glyph!),
        spacing: state.spacing,
      });
      state.statusMessage = `Generated ${state.generatedFont.familyName}.`;
    } catch (error) {
      state.statusMessage = error instanceof Error ? error.message : 'Font generation failed.';
    } finally {
      state.isGenerating = false;
      render();
    }
  });

  document.querySelector<HTMLButtonElement>('#export-font')?.addEventListener('click', () => {
    if (state.generatedFont && isGeneratedFontVerified()) {
      downloadFont(state.generatedFont);
    }
  });

  document.querySelector<HTMLButtonElement>('#export-smoke-test')?.addEventListener('click', () => {
    if (state.generatedFont && isGeneratedFontVerified()) {
      downloadSmokeTestHtml(state.generatedFont, createSmokeTestSampleText());
    }
  });
}

window.onmessage = (event: MessageEvent<{ pluginMessage?: PluginToUiMessage }>) => {
  const message = event.data.pluginMessage;
  if (!isPluginMessage(message)) return;

  if (message.type === 'PLUGIN_READY') {
    state.statusMessage = 'Plugin ready. Create a board or scan selected glyphs.';
  }

  if (message.type === 'SETTINGS_LOADED') {
    applyPersistedSettings(message.settings);
    if (state.lastScanNodeIds.length > 0) {
      state.statusMessage = 'Restoring saved glyph scan...';
      postToPlugin({ type: 'RESTORE_SAVED_SCAN', nodeIds: state.lastScanNodeIds });
    }
  }

  if (message.type === 'SETTINGS_RESET') {
    state.savedStatus = 'Saved settings cleared from this Figma file.';
  }

  if (message.type === 'GLYPH_BOARD_CREATED') {
    state.statusMessage = message.message;
  }

  if (message.type === 'GLYPHS_SCANNED') {
    state.glyphs = message.glyphs;
    state.lastScanNodeIds = collectScanNodeIds(message.glyphs);
    state.selectedGlyph = chooseSelectedGlyph(message.glyphs, state.selectedGlyph);
    state.isScanning = false;
    state.generatedFont = null;
    state.statusMessage = `Scan complete: ${message.summary.valid} valid, ${message.summary.empty} empty, ${message.summary.unsupported} unsupported.`;
    persistSettings();
  }

  if (message.type === 'VALIDATION_ERROR') {
    state.isScanning = false;
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
    return 'Preview includes unsupported characters. Exported fonts only include A-Z, 0-9, and supported punctuation glyphs that scanned as valid.';
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
      headline: 'Scan a selected glyph board before generating a font.',
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
    details.push('Preview contains unsupported characters; export only includes A-Z, 0-9, supported punctuation, and space.');
  }

  if (overrideCount > 0) {
    details.push(`${overrideCount} advance width overrides are active.`);
  }

  details.push(
    state.lastScanNodeIds.length > 0
      ? `Saved scan references ${state.lastScanNodeIds.length} Figma nodes.`
      : 'No saved scan nodes are currently stored.',
  );

  if (state.generatedFont) {
    if (isGeneratedFontVerified()) {
      details.push('Generated font verified and export actions are enabled.');
    } else {
      details.push('Generated font did not verify cleanly; export actions are blocked.');
    }
  } else if (validCount > 0) {
    details.push('Generate the font before exporting OTF or smoke-test HTML.');
  }

  if (validCount === 0) {
    return {
      status: 'blocked',
      headline: 'Export is blocked because no valid glyphs are ready.',
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
  return firstGlyphs.length > 0 ? firstGlyphs.join(' ') : 'ABC 123!';
}

function isGeneratedFontVerified(): boolean {
  return Boolean(
    state.generatedFont &&
      state.generatedFont.verification.failedGlyphs.length === 0 &&
      state.generatedFont.verification.verifiedGlyphs.length === state.generatedFont.glyphCount,
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

function renderGlyphInspector(row: GlyphScanResult): string {
  const glyph = row.glyph;
  const windingWarning = createWindingWarning(glyph);
  const warnings = [...row.warnings, ...(glyph?.warnings ?? []), windingWarning].filter(Boolean).filter(uniqueString);
  const bounds = glyph?.bounds;
  const commandCount = glyph?.paths.reduce((total, path) => total + path.commands.length, 0) ?? 0;
  const windingRules = glyph?.paths
    .map((path) => path.windingRule ?? 'NONZERO')
    .filter(uniqueString)
    .join(', ');
  const advanceOverride = state.spacing.glyphAdvanceOverrides[row.char];
  const exportAdvance = glyph ? resolveGlyphAdvance(glyph, state.spacing) : null;
  const canOverride = row.status === 'valid' && Boolean(glyph);

  return `
    <div class="inspector-grid">
      <div>
        <span>Status</span>
        <strong>${escapeHtml(row.status)}</strong>
      </div>
      <div>
        <span>Unicode</span>
        <strong>U+${row.char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}</strong>
      </div>
      <div>
        <span>Node</span>
        <strong>${escapeHtml(row.nodeId ?? 'none')}</strong>
      </div>
      <div>
        <span>Paths</span>
        <strong>${glyph?.paths.length ?? 0}</strong>
      </div>
      <div>
        <span>Commands</span>
        <strong>${commandCount}</strong>
      </div>
      <div>
        <span>Winding</span>
        <strong>${escapeHtml(windingRules || 'none')}${glyph && glyph.paths.length > 1 ? ` (${glyph.paths.length} contours)` : ''}</strong>
      </div>
      <div>
        <span>Base advance</span>
        <strong>${glyph?.advanceWidth ?? 'none'}</strong>
      </div>
      <div>
        <span>Override</span>
        <strong>${advanceOverride ?? 'auto'}</strong>
      </div>
      <div>
        <span>Export advance</span>
        <strong>${exportAdvance ?? 'none'}</strong>
      </div>
    </div>
    <div class="inspector-bounds">
      <span>Bounds</span>
      <strong>${bounds ? `${bounds.xMin}, ${bounds.yMin}, ${bounds.xMax}, ${bounds.yMax}` : 'none'}</strong>
    </div>
    <div class="metric-editor">
      <label class="field compact">
        <span>Advance width override</span>
        <input id="advance-override" type="number" min="120" max="1400" step="10" value="${advanceOverride ?? ''}" placeholder="${glyph?.advanceWidth ?? 'auto'}" ${canOverride ? '' : 'disabled'} />
      </label>
      <button id="reset-advance" ${advanceOverride !== undefined ? '' : 'disabled'}>Reset to auto</button>
    </div>
    <p class="status">${escapeHtml(row.message)}</p>
    ${
      warnings.length
        ? `<ul class="message-list">${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>`
        : '<p class="status">No glyph-specific warnings.</p>'
    }
  `;
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
    </div>
    ${
      failedChars.length
        ? `<p class="warning">Generated font parsed, but these glyphs did not verify cleanly: ${escapeHtml(failedChars.join(', '))}.</p>`
        : '<p class="status">Generated font parsed back successfully with matching unicode, advance width, and outline data.</p>'
    }
  `;
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

function persistSettings(): void {
  postToPlugin({
    type: 'SAVE_SETTINGS',
    settings: createPersistedSettings(),
  });
  state.savedStatus = `Saved to this Figma file: ${state.lastScanNodeIds.length} scan nodes, ${countAdvanceOverrides()} overrides.`;
}

function createPersistedSettings(): PersistedTypegenSettings {
  return {
    fontName: state.fontName,
    previewText: state.previewText,
    selectedGlyph: state.selectedGlyph,
    lastScanNodeIds: [...state.lastScanNodeIds],
    spacing: {
      letterSpacing: state.spacing.letterSpacing,
      spaceWidth: state.spacing.spaceWidth,
      glyphAdvanceOverrides: { ...state.spacing.glyphAdvanceOverrides },
    },
  };
}

function applyPersistedSettings(settings: PersistedTypegenSettings | null): void {
  if (!settings) {
    return;
  }

  state.fontName = settings.fontName || state.fontName;
  state.previewText = settings.previewText || state.previewText;
  state.selectedGlyph = isGlyphChar(settings.selectedGlyph) ? settings.selectedGlyph : state.selectedGlyph;
  state.lastScanNodeIds = Array.isArray(settings.lastScanNodeIds)
    ? settings.lastScanNodeIds.filter((id) => typeof id === 'string')
    : [];
  state.spacing = {
    letterSpacing: clampNumber(settings.spacing?.letterSpacing, -120, 300, DEFAULT_SPACING.letterSpacing),
    spaceWidth: clampNumber(settings.spacing?.spaceWidth, 120, 900, DEFAULT_SPACING.spaceWidth),
    glyphAdvanceOverrides: sanitizeAdvanceOverrides(settings.spacing?.glyphAdvanceOverrides),
  };
  state.generatedFont = null;
  state.statusMessage = 'Restored saved Typegen settings from this Figma file.';
  state.savedStatus = `Loaded saved settings: ${state.lastScanNodeIds.length} scan nodes, ${countAdvanceOverrides()} overrides.`;
}

function collectScanNodeIds(glyphs: GlyphScanResult[]): string[] {
  return [...new Set(glyphs.map((glyph) => glyph.nodeId).filter((id): id is string => Boolean(id)))];
}

function sanitizeAdvanceOverrides(
  overrides: PersistedTypegenSettings['spacing']['glyphAdvanceOverrides'] | undefined,
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

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.round(Math.min(max, Math.max(min, value as number)));
}

function hasSavedState(): boolean {
  return (
    state.fontName !== 'Typegen Demo' ||
    state.previewText !== 'ABC 123!' ||
    state.selectedGlyph !== 'A' ||
    state.lastScanNodeIds.length > 0 ||
    state.spacing.letterSpacing !== DEFAULT_SPACING.letterSpacing ||
    state.spacing.spaceWidth !== DEFAULT_SPACING.spaceWidth ||
    countAdvanceOverrides() > 0
  );
}

function resetLocalSettings(): void {
  state.fontName = 'Typegen Demo';
  state.previewText = 'ABC 123!';
  state.glyphs = [];
  state.selectedGlyph = 'A';
  state.lastScanNodeIds = [];
  state.statusMessage = 'Saved settings reset. Create a board or scan selected glyphs.';
  state.savedStatus = 'Reset requested.';
  state.generatedFont = null;
  state.spacing = { ...DEFAULT_SPACING, glyphAdvanceOverrides: {} };
  state.isScanning = false;
  state.isGenerating = false;
  state.showRecipe = true;
}

render();
