import type { DatabaseAdapter } from '../database.ts';
import type { Setting } from '../schema.ts';

export class SettingsRepository {
  private db: DatabaseAdapter;
  constructor(db: DatabaseAdapter) { this.db = db; }

  async get(key: string): Promise<string | null> {
    const results = await this.db.select<Setting>(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    );
    return results[0]?.value ?? null;
  }

  async getAll(): Promise<Record<string, string>> {
    const results = await this.db.select<Setting>('SELECT * FROM settings');
    const settings: Record<string, string> = {};
    for (const row of results) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  async set(key: string, value: string): Promise<void> {
    await this.db.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value],
    );
  }

  async exportAll(): Promise<Setting[]> {
    return this.db.select<Setting>('SELECT * FROM settings');
  }
}
