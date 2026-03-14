import type { DatabaseAdapter } from '../database.ts';
import type { Todo, Priority, SortMode } from '../schema.ts';

function generateId(): string {
  return crypto.randomUUID();
}

export class TodoRepository {
  private db: DatabaseAdapter;
  constructor(db: DatabaseAdapter) { this.db = db; }

  async getAll(sort: SortMode = 'date'): Promise<Todo[]> {
    const orderClause = {
      date: 'due_date ASC NULLS LAST, created_at DESC',
      topic: 'topic_id ASC NULLS LAST, created_at DESC',
      priority: 'priority DESC, created_at DESC',
      manual: 'sort_order ASC, created_at DESC',
    }[sort];

    return this.db.select<Todo>(
      `SELECT * FROM todos WHERE completed = 0 ORDER BY ${orderClause}`,
    );
  }

  async getCompleted(): Promise<Todo[]> {
    return this.db.select<Todo>(
      'SELECT * FROM todos WHERE completed = 1 ORDER BY completed_at DESC',
    );
  }

  async getByTopic(topicId: string, sort: SortMode = 'date'): Promise<Todo[]> {
    const orderClause = {
      date: 'due_date ASC NULLS LAST, created_at DESC',
      topic: 'created_at DESC',
      priority: 'priority DESC, created_at DESC',
      manual: 'sort_order ASC, created_at DESC',
    }[sort];

    return this.db.select<Todo>(
      `SELECT * FROM todos WHERE topic_id = ? AND completed = 0 ORDER BY ${orderClause}`,
      [topicId],
    );
  }

  async create(todo: {
    title: string;
    description?: string;
    link?: string;
    topic_id?: string;
    due_date?: string;
    priority?: Priority;
  }): Promise<Todo> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.execute(
      `INSERT INTO todos (id, title, description, link, topic_id, due_date, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        todo.title,
        todo.description ?? null,
        todo.link ?? null,
        todo.topic_id ?? null,
        todo.due_date ?? null,
        todo.priority ?? 0,
        now,
        now,
      ],
    );

    const results = await this.db.select<Todo>('SELECT * FROM todos WHERE id = ?', [id]);
    return results[0];
  }

  async update(id: string, fields: Partial<Omit<Todo, 'id' | 'created_at'>>): Promise<void> {
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
      `UPDATE todos SET ${setClauses.join(', ')} WHERE id = ?`,
      values,
    );
  }

  async toggleComplete(id: string): Promise<void> {
    const results = await this.db.select<Todo>('SELECT completed FROM todos WHERE id = ?', [id]);
    if (results.length === 0) return;

    const newCompleted = results[0].completed === 0 ? 1 : 0;
    const completedAt = newCompleted === 1 ? new Date().toISOString() : null;

    await this.db.execute(
      'UPDATE todos SET completed = ?, completed_at = ?, updated_at = ? WHERE id = ?',
      [newCompleted, completedAt, new Date().toISOString(), id],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM todos WHERE id = ?', [id]);
  }

  async exportAll(): Promise<Todo[]> {
    return this.db.select<Todo>('SELECT * FROM todos ORDER BY created_at ASC');
  }
}
