import { ExternalLink, Trash2 } from 'lucide-react';
import { TopicBadge } from '@/components/topic/topic-badge.tsx';
import { PRIORITY_LABELS } from '@/lib/constants.ts';
import { format, isPast, isToday } from 'date-fns';
import type { Todo, Topic } from '@/db/schema.ts';

interface TodoItemProps {
  todo: Todo;
  topic?: Topic;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, topic, onToggleComplete, onEdit, onDelete }: TodoItemProps) {
  const isOverdue = todo.due_date && !todo.completed && isPast(new Date(todo.due_date)) && !isToday(new Date(todo.due_date));

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50">
      <button
        onClick={() => onToggleComplete(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          todo.completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/40 hover:border-primary'
        }`}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed === 1 && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <button
        onClick={() => onEdit(todo)}
        className="flex flex-1 flex-col gap-1 text-left"
      >
        <span className={`text-sm ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {todo.title}
        </span>
        {todo.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">{todo.description}</span>
        )}
      </button>

      <div className="flex items-center gap-2">
        {todo.link && (
          <a
            href={todo.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-primary"
            aria-label="Open link"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {todo.priority > 0 && (
          <span className={`text-xs font-medium ${
            todo.priority === 3 ? 'text-destructive' : todo.priority === 2 ? 'text-yellow-500' : 'text-muted-foreground'
          }`}>
            {PRIORITY_LABELS[todo.priority]}
          </span>
        )}

        {topic && <TopicBadge name={topic.name} color={topic.color} />}

        {todo.due_date && (
          <span className={`text-xs ${isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
            {format(new Date(todo.due_date), 'MMM d')}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
          className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
