import type { DatabaseAdapter } from '../database.ts';

export class TauriSqliteAdapter implements DatabaseAdapter {
  private db: TauriDatabase;

  private constructor(db: TauriDatabase) {
    this.db = db;
  }

  static async connect(): Promise<TauriSqliteAdapter> {
    const { default: Database } = await import('@tauri-apps/plugin-sql');
    const db = await Database.load('sqlite:taskflow.db');
    return new TauriSqliteAdapter(db as unknown as TauriDatabase);
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    await this.db.execute(sql, params);
  }

  async select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.db.select<T>(sql, params);
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}

interface TauriDatabase {
  execute(sql: string, params?: unknown[]): Promise<unknown>;
  select<T>(sql: string, params?: unknown[]): Promise<T[]>;
  close(): Promise<void>;
}
