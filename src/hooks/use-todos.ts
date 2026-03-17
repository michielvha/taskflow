import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatabase } from './use-database.ts';
import { TodoRepository } from '@/db/repositories/todo.repository.ts';
import { SubtaskRepository } from '@/db/repositories/subtask.repository.ts';
import type { Todo, Subtask, Priority, SortMode } from '@/db/schema.ts';

interface UseTodosOptions {
  topicId?: string | null;
  sort?: SortMode;
}

export function useTodos(options: UseTodosOptions = {}) {
  const { db } = useDatabase();
  const { topicId = null, sort = 'date' } = options;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [completed, setCompleted] = useState<Todo[]>([]);
  const [subtaskMap, setSubtaskMap] = useState<Map<string, Subtask[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const refreshRef = useRef(0);

  useEffect(() => {
    if (!db) return;
    const id = ++refreshRef.current;
    const todoRepo = new TodoRepository(db);
    const subtaskRepo = new SubtaskRepository(db);

    Promise.all([
      topicId ? todoRepo.getByTopic(topicId, sort) : todoRepo.getAll(sort),
      todoRepo.getCompleted(),
    ]).then(async ([activeTodos, completedTodos]) => {
      if (id !== refreshRef.current) return;
      const allIds = [...activeTodos, ...completedTodos].map((t) => t.id);
      const sMap = await subtaskRepo.getAllByTodoIds(allIds);
      if (id !== refreshRef.current) return;
      setTodos(activeTodos);
      setCompleted(completedTodos);
      setSubtaskMap(sMap);
      setLoading(false);
    });
  }, [db, topicId, sort]);

  const refresh = useCallback(async () => {
    if (!db) return;
    const todoRepo = new TodoRepository(db);
    const subtaskRepo = new SubtaskRepository(db);

    const [activeTodos, completedTodos] = await Promise.all([
      topicId ? todoRepo.getByTopic(topicId, sort) : todoRepo.getAll(sort),
      todoRepo.getCompleted(),
    ]);

    const allIds = [...activeTodos, ...completedTodos].map((t) => t.id);
    const sMap = await subtaskRepo.getAllByTodoIds(allIds);

    setTodos(activeTodos);
    setCompleted(completedTodos);
    setSubtaskMap(sMap);
    setLoading(false);
  }, [db, topicId, sort]);

  const addTodo = useCallback(async (todo: {
    title: string;
    description?: string;
    link?: string;
    topic_id?: string;
    due_date?: string;
    priority?: Priority;
  }) => {
    if (!db) return;
    const repo = new TodoRepository(db);
    await repo.create(todo);
    await refresh();
  }, [db, refresh]);

  const updateTodo = useCallback(async (id: string, fields: Partial<Todo>) => {
    if (!db) return;
    const repo = new TodoRepository(db);
    await repo.update(id, fields);
    await refresh();
  }, [db, refresh]);

  const toggleComplete = useCallback(async (id: string) => {
    if (!db) return;
    const repo = new TodoRepository(db);
    await repo.toggleComplete(id);
    await refresh();
  }, [db, refresh]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!db) return;
    const repo = new TodoRepository(db);
    await repo.delete(id);
    await refresh();
  }, [db, refresh]);

  // Subtask operations use optimistic updates — local state updates immediately,
  // DB persistence happens in the background. No full refresh needed.

  const addSubtask = useCallback(async (todoId: string, title: string) => {
    if (!db) return;
    const repo = new SubtaskRepository(db);
    const subtask = await repo.create(todoId, title);
    setSubtaskMap((prev) => {
      const next = new Map(prev);
      next.set(todoId, [...(prev.get(todoId) ?? []), subtask]);
      return next;
    });
  }, [db]);

  const toggleSubtask = useCallback(async (subtaskId: string) => {
    if (!db) return;
    // Optimistic: flip in local state immediately
    setSubtaskMap((prev) => {
      const next = new Map(prev);
      for (const [todoId, subtasks] of next) {
        const idx = subtasks.findIndex((s) => s.id === subtaskId);
        if (idx !== -1) {
          const updated = [...subtasks];
          updated[idx] = { ...updated[idx], completed: updated[idx].completed === 0 ? 1 : 0 };
          next.set(todoId, updated);
          break;
        }
      }
      return next;
    });
    // Persist
    const repo = new SubtaskRepository(db);
    await repo.toggleComplete(subtaskId);
  }, [db]);

  const updateSubtask = useCallback(async (subtaskId: string, title: string) => {
    if (!db) return;
    setSubtaskMap((prev) => {
      const next = new Map(prev);
      for (const [todoId, subtasks] of next) {
        const idx = subtasks.findIndex((s) => s.id === subtaskId);
        if (idx !== -1) {
          const updated = [...subtasks];
          updated[idx] = { ...updated[idx], title };
          next.set(todoId, updated);
          break;
        }
      }
      return next;
    });
    const repo = new SubtaskRepository(db);
    await repo.updateTitle(subtaskId, title);
  }, [db]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!db) return;
    // Optimistic: remove from local state immediately
    setSubtaskMap((prev) => {
      const next = new Map(prev);
      for (const [todoId, subtasks] of next) {
        const filtered = subtasks.filter((s) => s.id !== subtaskId);
        if (filtered.length !== subtasks.length) {
          if (filtered.length === 0) {
            next.delete(todoId);
          } else {
            next.set(todoId, filtered);
          }
          break;
        }
      }
      return next;
    });
    // Persist
    const repo = new SubtaskRepository(db);
    await repo.delete(subtaskId);
  }, [db]);

  return {
    todos, completed, subtaskMap, loading,
    addTodo, updateTodo, toggleComplete, deleteTodo,
    addSubtask, toggleSubtask, updateSubtask, deleteSubtask,
    refresh,
  };
}
