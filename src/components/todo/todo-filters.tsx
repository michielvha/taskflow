import { GlassPanel } from '@/components/layout/glass-panel.tsx';
import { SORT_MODES } from '@/lib/constants.ts';
import type { SortMode, Topic } from '@/db/schema.ts';

interface TodoFiltersProps {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  topics: Topic[];
  selectedTopicId: string | null;
  onSelectTopic: (id: string | null) => void;
}

const SORT_LABELS: Record<SortMode, string> = {
  date: 'Date',
  topic: 'Topic',
  priority: 'Priority',
  manual: 'Manual',
};

export function TodoFilters({ sortMode, onSortChange, topics, selectedTopicId, onSelectTopic }: TodoFiltersProps) {
  return (
    <GlassPanel className="flex items-center gap-4 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-xs font-medium text-muted-foreground">Sort</label>
        <select
          id="sort-select"
          value={sortMode}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
          className="rounded-md border border-border bg-transparent px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {SORT_MODES.map((mode) => (
            <option key={mode} value={mode}>{SORT_LABELS[mode]}</option>
          ))}
        </select>
      </div>

      {/* Mobile topic filter (hidden on md+ where sidebar handles this) */}
      <div className="flex items-center gap-2 md:hidden">
        <label htmlFor="topic-filter" className="text-xs font-medium text-muted-foreground">Topic</label>
        <select
          id="topic-filter"
          value={selectedTopicId ?? ''}
          onChange={(e) => onSelectTopic(e.target.value || null)}
          className="rounded-md border border-border bg-transparent px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
    </GlassPanel>
  );
}
