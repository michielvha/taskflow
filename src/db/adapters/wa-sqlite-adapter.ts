import type { DatabaseAdapter } from '../database.ts';

/**
 * Simple async mutex to serialize database operations.
 * wa-sqlite's internal tmpPtr buffer is shared across calls, so concurrent
 * async operations (e.g. two React effects calling select simultaneously)
 * can corrupt each other's results.
 */
class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.locked = false;
    }
  }
}

export class WaSqliteAdapter implements DatabaseAdapter {
  private db: number;
  private sqlite: WaSqliteAPI;
  private SQLITE_ROW: number;
  private mutex = new Mutex();

  private constructor(sqlite: WaSqliteAPI, db: number, sqliteRow: number) {
    this.sqlite = sqlite;
    this.db = db;
    this.SQLITE_ROW = sqliteRow;
  }

  static async connect(): Promise<WaSqliteAdapter> {
    const { default: SQLiteESMFactory } = await import('wa-sqlite/dist/wa-sqlite-async.mjs');
    const { Factory, SQLITE_ROW } = await import('wa-sqlite');
    const { IDBBatchAtomicVFS } = await import('wa-sqlite/src/examples/IDBBatchAtomicVFS.js');

    const module = await SQLiteESMFactory();
    const sqlite = Factory(module) as WaSqliteAPI;

    const vfs = new IDBBatchAtomicVFS('taskflow-vfs');
    sqlite.vfs_register(vfs, true);

    const db = await sqlite.open_v2('taskflow.db');
    return new WaSqliteAdapter(sqlite, db, SQLITE_ROW as number);
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    await this.mutex.acquire();
    try {
      if (params.length === 0) {
        await this.sqlite.exec(this.db, sql);
        return;
      }

      for await (const stmt of this.sqlite.statements(this.db, sql)) {
        this.sqlite.bind_collection(stmt, params as SQLiteCompatibleType[]);
        await this.sqlite.step(stmt);
      }
    } finally {
      this.mutex.release();
    }
  }

  async select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.mutex.acquire();
    try {
      const results: T[] = [];

      for await (const stmt of this.sqlite.statements(this.db, sql)) {
        if (params.length > 0) {
          this.sqlite.bind_collection(stmt, params as SQLiteCompatibleType[]);
        }
        const columns = this.sqlite.column_names(stmt);
        while (await this.sqlite.step(stmt) === this.SQLITE_ROW) {
          const obj: Record<string, unknown> = {};
          columns.forEach((col, i) => {
            obj[col] = this.sqlite.column(stmt, i);
          });
          results.push(obj as T);
        }
      }

      return results;
    } finally {
      this.mutex.release();
    }
  }

  async close(): Promise<void> {
    await this.sqlite.close(this.db);
  }
}

interface WaSqliteAPI {
  vfs_register(vfs: unknown, makeDefault: boolean): void;
  open_v2(filename: string): Promise<number>;
  exec(db: number, sql: string): Promise<number>;
  statements(db: number, sql: string): AsyncIterable<number>;
  bind_collection(stmt: number, bindings: SQLiteCompatibleType[]): number;
  step(stmt: number): Promise<number>;
  column_names(stmt: number): string[];
  column(stmt: number, i: number): SQLiteCompatibleType;
  close(db: number): Promise<void>;
}

type SQLiteCompatibleType = string | number | null | Uint8Array;
