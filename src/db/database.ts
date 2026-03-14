export interface DatabaseAdapter {
  execute(sql: string, params?: unknown[]): Promise<void>;
  select<T>(sql: string, params?: unknown[]): Promise<T[]>;
  close(): Promise<void>;
}

let dbInstance: DatabaseAdapter | null = null;

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

  if ('__TAURI_INTERNALS__' in window) {
    const { TauriSqliteAdapter } = await import('./adapters/tauri-adapter.ts');
    dbInstance = await TauriSqliteAdapter.connect();
  } else {
    const { WaSqliteAdapter } = await import('./adapters/wa-sqlite-adapter.ts');
    dbInstance = await WaSqliteAdapter.connect();
  }

  const { runMigrations } = await import('./migrations.ts');
  await runMigrations(dbInstance);

  return dbInstance;
}
