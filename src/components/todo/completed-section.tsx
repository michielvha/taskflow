import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TodoItem } from './todo-item.tsx';
import { GlassPanel } from '@/components/layout/glass-panel.tsx';
import type { Todo, Topic, Subtask } from '@/db/schema.ts';

interface CompletedSectionProps {
  completed: Todo[];
  topics: Topic[];
  subtaskMap: Map<string, Subtask[]>;
  autoHide: boolean;
  autoHideDelay: number;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export function CompletedSection({
  completed,
  topics,
  subtaskMap,
  autoHide,
  autoHideDelay,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: CompletedSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [hidden, setHidden] = useState(false);

  const scheduleHide = useCallback(() => {
    if (!autoHide) return;
    const timer = setTimeout(() => {
      setHidden(true);
      setIsOpen(false);
    }, autoHideDelay);
    return () => clearTimeout(timer);
  }, [autoHide, autoHideDelay]);

  const handleToggle = useCallback((id: string) => {
    onToggleComplete(id);
    setHidden(false);
    setIsOpen(true);
    scheduleHide();
  }, [onToggleComplete, scheduleHide]);

  if (completed.length === 0) return null;
  if (hidden && autoHide) return null;

  const topicMap = new Map(topics.map((t) => [t.id, t]));

  return (
    <GlassPanel className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span>Completed ({completed.length})</span>
      </button>

      {isOpen && (
        <div className="flex flex-col divide-y divide-border/50">
          {completed.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              topic={todo.topic_id ? topicMap.get(todo.topic_id) : undefined}
              subtasks={subtaskMap.get(todo.id)}
              onToggleComplete={handleToggle}
              onEdit={() => {}}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
            />
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
