import type { Topic } from '@/db/schema.ts';

interface TopicListProps {
  topics: Topic[];
  todoCounts: Map<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TopicList({ topics, todoCounts, selectedId, onSelect }: TopicListProps) {
  return (
    <div className="flex flex-col gap-1">
      {topics.map((topic) => {
        const count = todoCounts.get(topic.id) ?? 0;
        const isSelected = selectedId === topic.id;

        return (
          <button
            key={topic.id}
            onClick={() => onSelect(topic.id)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isSelected
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: topic.color }}
            />
            <span className="flex-1 truncate text-left">{topic.name}</span>
            {count > 0 && (
              <span className="text-xs text-muted-foreground">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
