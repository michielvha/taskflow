import { TodoItem } from './todo-item.tsx';
import { GlassPanel } from '@/components/layout/glass-panel.tsx';
import type { Todo, Topic, Subtask } from '@/db/schema.ts';

interface TodoListProps {
  todos: Todo[];
  topics: Topic[];
  subtaskMap: Map<string, Subtask[]>;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onUpdateSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export function TodoList({
  todos, topics, subtaskMap, onToggleComplete, onEdit, onDelete,
  onAddSubtask, onToggleSubtask, onUpdateSubtask, onDeleteSubtask,
}: TodoListProps) {
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
          subtasks={subtaskMap.get(todo.id)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onUpdateSubtask={onUpdateSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      ))}
    </GlassPanel>
  );
}
