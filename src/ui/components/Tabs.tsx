import type { UiTab } from '../state/types';

type TabsProps = {
  activeTab: UiTab;
  tabs: Array<{ id: UiTab; label: string }>;
  onSelect: (tab: UiTab) => void;
};

export function Tabs({ activeTab, tabs, onSelect }: TabsProps) {
  return (
    <div class="tab-list" role="tablist" aria-label="Typegen panels">
      {tabs.map((tab) => (
        <button
          class={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
