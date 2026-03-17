import { useState } from 'react';
import { Header } from './header.tsx';
import { Sidebar } from './sidebar.tsx';
import { TodoList } from '@/components/todo/todo-list.tsx';
import { TodoFilters } from '@/components/todo/todo-filters.tsx';
import { CompletedSection } from '@/components/todo/completed-section.tsx';
import { TodoForm } from '@/components/todo/todo-form.tsx';
import { TopicForm } from '@/components/topic/topic-form.tsx';
import { SettingsDialog } from '@/components/settings/settings-dialog.tsx';
import { useTodos } from '@/hooks/use-todos.ts';
import { useTopics } from '@/hooks/use-topics.ts';
import { useSettings } from '@/hooks/use-settings.ts';
import { useDatabase } from '@/hooks/use-database.ts';
import { Plus } from 'lucide-react';
import type { SortMode, Todo } from '@/db/schema.ts';

export function AppShell() {
  const { db } = useDatabase();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    todos, completed, subtaskMap,
    addTodo, updateTodo, toggleComplete, deleteTodo,
    addSubtask, toggleSubtask, updateSubtask, deleteSubtask,
  } = useTodos({
    topicId: selectedTopicId,
    sort: sortMode,
  });
  const { topics, todoCounts, addTopic, refresh: refreshTopics } = useTopics();
  const { autoHideCompleted, autoHideDelay } = useSettings();

  const handleAddTodo = async (todo: Parameters<typeof addTodo>[0]) => {
    await addTodo(todo);
    await refreshTopics();
    setShowTodoForm(false);
  };

  const handleUpdateTodo = async (id: string, fields: Partial<Todo>) => {
    await updateTodo(id, fields);
    await refreshTopics();
    setEditingTodo(null);
  };

  const handleToggleComplete = async (id: string) => {
    await toggleComplete(id);
    await refreshTopics();
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
    await refreshTopics();
  };

  const handleAddTopic = async (topic: Parameters<typeof addTopic>[0]) => {
    await addTopic(topic);
    setShowTopicForm(false);
  };

  return (
    <div className="flex h-screen flex-col gap-2 p-2">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-60 shrink-0 md:block">
          <Sidebar
            topics={topics}
            todoCounts={todoCounts}
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            onAddTopic={() => setShowTopicForm(true)}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          <TodoFilters
            sortMode={sortMode}
            onSortChange={setSortMode}
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
          />

          <div className="flex-1 overflow-y-auto">
            <TodoList
              todos={todos}
              topics={topics}
              subtaskMap={subtaskMap}
              onToggleComplete={handleToggleComplete}
              onEdit={setEditingTodo}
              onDelete={handleDeleteTodo}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onUpdateSubtask={updateSubtask}
              onDeleteSubtask={deleteSubtask}
            />

            <CompletedSection
              completed={completed}
              topics={topics}
              subtaskMap={subtaskMap}
              autoHide={autoHideCompleted}
              autoHideDelay={autoHideDelay}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onUpdateSubtask={updateSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          </div>

          {/* Add todo button */}
          <button
            onClick={() => setShowTodoForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Todo
          </button>
        </div>
      </div>

      {/* Dialogs */}
      {showTodoForm && (
        <TodoForm
          topics={topics}
          defaultTopicId={selectedTopicId}
          onSubmit={handleAddTodo}
          onClose={() => setShowTodoForm(false)}
        />
      )}

      {editingTodo && (
        <TodoForm
          todo={editingTodo}
          topics={topics}
          onSubmit={(fields) => handleUpdateTodo(editingTodo.id, fields)}
          onClose={() => setEditingTodo(null)}
        />
      )}

      {showTopicForm && (
        <TopicForm
          onSubmit={handleAddTopic}
          onClose={() => setShowTopicForm(false)}
        />
      )}

      {showSettings && db && (
        <SettingsDialog
          db={db}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
