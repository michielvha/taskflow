import { TodoItem } from './todo-item.tsx';
import { GlassPanel } from '@/components/layout/glass-panel.tsx';
import type { Todo, Topic } from '@/db/schema.ts';

interface TodoListProps {
  todos: Todo[];
  topics: Topic[];
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, topics, onToggleComplete, onEdit, onDelete }: TodoListProps) {
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  if (todos.length === 0) {
    return (
      <GlassPanel className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No todos yet</p>
        <p className="text-sm text-muted-foreground/60">Click "Add Todo" to get started</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="flex flex-col divide-y divide-border/50">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          topic={todo.topic_id ? topicMap.get(todo.topic_id) : undefined}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </GlassPanel>
  );
}
