import { List, Plus } from 'lucide-react';
import { GlassPanel } from './glass-panel.tsx';
import { TopicList } from '@/components/topic/topic-list.tsx';
import type { Topic } from '@/db/schema.ts';

interface SidebarProps {
  topics: Topic[];
  todoCounts: Map<string, number>;
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string | null) => void;
  onAddTopic: () => void;
}

export function Sidebar({ topics, todoCounts, selectedTopicId, onSelectTopic, onAddTopic }: SidebarProps) {
  return (
    <GlassPanel variant="heavy" className="flex h-full flex-col gap-2 p-4">
      <button
        onClick={() => onSelectTopic(null)}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          selectedTopicId === null
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <List className="h-4 w-4" />
        <span>All</span>
      </button>

      <div className="my-2 h-px bg-border" />

      <TopicList
        topics={topics}
        todoCounts={todoCounts}
        selectedId={selectedTopicId}
        onSelect={onSelectTopic}
      />

      <button
        onClick={onAddTopic}
        className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        <span>Add Topic</span>
      </button>
    </GlassPanel>
  );
}
