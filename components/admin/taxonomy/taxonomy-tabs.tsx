'use client';

type TaxonomyTab = 'topics' | 'need-tags' | 'target-groups';

const tabs: Array<{ id: TaxonomyTab; label: string }> = [
  { id: 'topics', label: 'Service topics' },
  { id: 'need-tags', label: 'Need tags' },
  { id: 'target-groups', label: 'Target groups' },
];

export function TaxonomyTabs({
  active,
  onChange,
}: {
  active: TaxonomyTab;
  onChange: (next: TaxonomyTab) => void;
}) {
  return (
    <div
      className="admin-toolbar mt-4 flex gap-1 p-1.5"
      style={{ width: 'fit-content' }}
      role="tablist"
      aria-label="Taxonomy sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'border-[#e7c39a] bg-white text-[#E8922D] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
              : 'border-transparent bg-transparent text-[#6b7280] hover:text-[#111827]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
