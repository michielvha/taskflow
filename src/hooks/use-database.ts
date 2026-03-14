import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getDatabase, type DatabaseAdapter } from '@/db/database.ts';
import React from 'react';

interface DatabaseContextValue {
  db: DatabaseAdapter | null;
  loading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  loading: true,
  error: null,
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DatabaseAdapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    try {
      const database = await getDatabase();
      setDb(database);
    } catch (err) {
      console.error('Failed to initialize database:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return React.createElement(
    DatabaseContext.Provider,
    { value: { db, loading, error } },
    children,
  );
}

export function useDatabase(): DatabaseContextValue {
  return useContext(DatabaseContext);
}
