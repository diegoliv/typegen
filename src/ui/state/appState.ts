import { computed, signal } from '@preact/signals';

export type UiSnapshot = {
  activeTab: string;
  glyphCount: number;
  isScanning: boolean;
  isGenerating: boolean;
  activeBoardName: string | null;
};

export const uiSnapshot = signal<UiSnapshot>({
  activeTab: 'glyphs',
  glyphCount: 0,
  isScanning: false,
  isGenerating: false,
  activeBoardName: null,
});

export const hasLoadedGlyphs = computed(() => uiSnapshot.value.glyphCount > 0);

export function syncUiSnapshot(snapshot: UiSnapshot): void {
  uiSnapshot.value = snapshot;
}
