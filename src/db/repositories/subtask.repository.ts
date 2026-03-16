import type { DatabaseAdapter } from '../database.ts';
import type { Subtask } from '../schema.ts';

function generateId(): string {
  return crypto.randomUUID();
}

export class SubtaskRepository {
  private db: DatabaseAdapter;
  constructor(db: DatabaseAdapter) { this.db = db; }

  async getByTodoId(todoId: string): Promise<Subtask[]> {
    return this.db.select<Subtask>(
      'SELECT * FROM subtasks WHERE todo_id = ? ORDER BY sort_order ASC, created_at ASC',
      [todoId],
    );
  }

  async getAllByTodoIds(todoIds: string[]): Promise<Map<string, Subtask[]>> {
    if (todoIds.length === 0) return new Map();

    const placeholders = todoIds.map(() => '?').join(', ');
    const rows = await this.db.select<Subtask>(
      `SELECT * FROM subtasks WHERE todo_id IN (${placeholders}) ORDER BY sort_order ASC, created_at ASC`,
      todoIds,
    );

    const map = new Map<string, Subtask[]>();
    for (const row of rows) {
      const list = map.get(row.todo_id) ?? [];
      list.push(row);
      map.set(row.todo_id, list);
    }
    return map;
  }

  async create(todoId: string, title: string): Promise<Subtask> {
    const id = generateId();
    const now = new Date().toISOString();

    const maxOrder = await this.db.select<{ max_order: number | null }>(
      'SELECT MAX(sort_order) as max_order FROM subtasks WHERE todo_id = ?',
      [todoId],
    );
    const sortOrder = (maxOrder[0]?.max_order ?? -1) + 1;

    await this.db.execute(
      'INSERT INTO subtasks (id, todo_id, title, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, todoId, title, sortOrder, now],
    );

    return { id, todo_id: todoId, title, completed: 0, sort_order: sortOrder, created_at: now };
  }

  async toggleComplete(id: string): Promise<void> {
    const rows = await this.db.select<Subtask>('SELECT completed FROM subtasks WHERE id = ?', [id]);
    if (rows.length === 0) return;
    const newCompleted = rows[0].completed === 0 ? 1 : 0;
    await this.db.execute('UPDATE subtasks SET completed = ? WHERE id = ?', [newCompleted, id]);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM subtasks WHERE id = ?', [id]);
  }

  async deleteByTodoId(todoId: string): Promise<void> {
    await this.db.execute('DELETE FROM subtasks WHERE todo_id = ?', [todoId]);
  }

  async exportAll(): Promise<Subtask[]> {
    return this.db.select<Subtask>('SELECT * FROM subtasks ORDER BY todo_id, sort_order ASC');
  }
}
