import type { DatabaseAdapter } from '../database.ts';
import type { Topic } from '../schema.ts';

function generateId(): string {
  return crypto.randomUUID();
}

export class TopicRepository {
  private db: DatabaseAdapter;
  constructor(db: DatabaseAdapter) { this.db = db; }

  async getAll(): Promise<Topic[]> {
    return this.db.select<Topic>('SELECT * FROM topics ORDER BY sort_order ASC, name ASC');
  }

  async getById(id: string): Promise<Topic | null> {
    const results = await this.db.select<Topic>('SELECT * FROM topics WHERE id = ?', [id]);
    return results[0] ?? null;
  }

  async create(topic: { name: string; color?: string; icon?: string }): Promise<Topic> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.execute(
      `INSERT INTO topics (id, name, color, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, topic.name, topic.color ?? '#6366f1', topic.icon ?? null, now, now],
    );

    const results = await this.db.select<Topic>('SELECT * FROM topics WHERE id = ?', [id]);
    return results[0];
  }

  async update(id: string, fields: Partial<Omit<Topic, 'id' | 'created_at'>>): Promise<void> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'updated_at') continue;
      setClauses.push(`${key} = ?`);
      values.push(value);
    }

    setClauses.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.execute(
      `UPDATE topics SET ${setClauses.join(', ')} WHERE id = ?`,
      values,
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM topics WHERE id = ?', [id]);
  }

  async getTodoCounts(): Promise<Map<string, number>> {
    const results = await this.db.select<{ topic_id: string; count: number }>(
      'SELECT topic_id, COUNT(*) as count FROM todos WHERE completed = 0 AND topic_id IS NOT NULL GROUP BY topic_id',
    );

    const counts = new Map<string, number>();
    for (const row of results) {
      counts.set(row.topic_id, row.count);
    }
    return counts;
  }

  async exportAll(): Promise<Topic[]> {
    return this.db.select<Topic>('SELECT * FROM topics ORDER BY sort_order ASC');
  }
}
