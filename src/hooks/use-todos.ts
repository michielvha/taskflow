import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatabase } from './use-database.ts';
import { TodoRepository } from '@/db/repositories/todo.repository.ts';
import type { Todo, Priority, SortMode } from '@/db/schema.ts';

interface UseTodosOptions {
  topicId?: string | null;
  sort?: SortMode;
}

export function useTodos(options: UseTodosOptions = {}) {
  const { db } = useDatabase();
  const { topicId = null, sort = 'date' } = options;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [completed, setCompleted] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshRef = useRef(0);

  useEffect(() => {
    if (!db) return;
    const id = ++refreshRef.current;
    const repo = new TodoRepository(db);

    Promise.all([
      topicId ? repo.getByTopic(topicId, sort) : repo.getAll(sort),
      repo.getCompleted(),
    ]).then(([activeTodos, completedTodos]) => {
      if (id !== refreshRef.current) return;
      setTodos(activeTodos);
      setCompleted(completedTodos);
      setLoading(false);
    });
  }, [db, topicId, sort]);

  const refresh = useCallback(async () => {
    if (!db) return;
    const repo = new TodoRepository(db);

    const [activeTodos, completedTodos] = await Promise.all([
      topicId ? repo.getByTopic(topicId, sort) : repo.getAll(sort),
      repo.getCompleted(),
    ]);

    setTodos(activeTodos);
    setCompleted(completedTodos);
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

  return { todos, completed, loading, addTodo, updateTodo, toggleComplete, deleteTodo, refresh };
}
