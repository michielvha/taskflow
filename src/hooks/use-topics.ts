import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatabase } from './use-database.ts';
import { TopicRepository } from '@/db/repositories/topic.repository.ts';
import type { Topic } from '@/db/schema.ts';

export function useTopics() {
  const { db } = useDatabase();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [todoCounts, setTodoCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const refreshRef = useRef(0);

  useEffect(() => {
    if (!db) return;
    const id = ++refreshRef.current;
    const repo = new TopicRepository(db);

    Promise.all([
      repo.getAll(),
      repo.getTodoCounts(),
    ]).then(([allTopics, counts]) => {
      if (id !== refreshRef.current) return;
      setTopics(allTopics);
      setTodoCounts(counts);
      setLoading(false);
    });
  }, [db]);

  const refresh = useCallback(async () => {
    if (!db) return;
    const repo = new TopicRepository(db);

    const [allTopics, counts] = await Promise.all([
      repo.getAll(),
      repo.getTodoCounts(),
    ]);

    setTopics(allTopics);
    setTodoCounts(counts);
    setLoading(false);
  }, [db]);

  const addTopic = useCallback(async (topic: { name: string; color?: string; icon?: string }) => {
    if (!db) return;
    const repo = new TopicRepository(db);
    await repo.create(topic);
    await refresh();
  }, [db, refresh]);

  const updateTopic = useCallback(async (id: string, fields: Partial<Topic>) => {
    if (!db) return;
    const repo = new TopicRepository(db);
    await repo.update(id, fields);
    await refresh();
  }, [db, refresh]);

  const deleteTopic = useCallback(async (id: string) => {
    if (!db) return;
    const repo = new TopicRepository(db);
    await repo.delete(id);
    await refresh();
  }, [db, refresh]);

  return { topics, todoCounts, loading, addTopic, updateTopic, deleteTopic, refresh };
}
