import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './use-database.ts';
import { SettingsRepository } from '@/db/repositories/settings.repository.ts';

export function useSettings() {
  const { db } = useDatabase();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const repo = new SettingsRepository(db);
    repo.getAll().then((all) => {
      setSettings(all);
      setLoading(false);
    });
  }, [db]);

  const refresh = useCallback(async () => {
    if (!db) return;
    const repo = new SettingsRepository(db);
    const all = await repo.getAll();
    setSettings(all);
    setLoading(false);
  }, [db]);

  const setSetting = useCallback(async (key: string, value: string) => {
    if (!db) return;
    const repo = new SettingsRepository(db);
    await repo.set(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, [db]);

  const autoHideCompleted = settings.auto_hide_completed === 'true';
  const autoHideDelay = parseInt(settings.auto_hide_completed_delay_ms ?? '3000', 10);
  const defaultSort = (settings.default_sort ?? 'date') as 'date' | 'topic' | 'priority' | 'manual';

  return { settings, loading, setSetting, autoHideCompleted, autoHideDelay, defaultSort, refresh };
}
