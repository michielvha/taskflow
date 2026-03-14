import type { DatabaseAdapter } from '@/db/database.ts';
import { TodoRepository } from '@/db/repositories/todo.repository.ts';
import { TopicRepository } from '@/db/repositories/topic.repository.ts';
import { SettingsRepository } from '@/db/repositories/settings.repository.ts';
import type { Todo, Topic, Setting } from '@/db/schema.ts';

interface ExportData {
  version: 1;
  exported_at: string;
  topics: Topic[];
  todos: Todo[];
  settings: Setting[];
}

export async function exportData(db: DatabaseAdapter): Promise<string> {
  const todoRepo = new TodoRepository(db);
  const topicRepo = new TopicRepository(db);
  const settingsRepo = new SettingsRepository(db);

  const data: ExportData = {
    version: 1,
    exported_at: new Date().toISOString(),
    topics: await topicRepo.exportAll(),
    todos: await todoRepo.exportAll(),
    settings: await settingsRepo.exportAll(),
  };

  return JSON.stringify(data, null, 2);
}

export async function importData(db: DatabaseAdapter, json: string): Promise<void> {
  const data = JSON.parse(json) as ExportData;

  if (data.version !== 1) {
    throw new Error(`Unsupported export version: ${data.version}`);
  }

  // Clear existing data
  await db.execute('DELETE FROM todos');
  await db.execute('DELETE FROM topics');
  await db.execute('DELETE FROM settings');

  // Import topics first (todos reference them)
  for (const topic of data.topics) {
    await db.execute(
      `INSERT INTO topics (id, name, color, icon, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [topic.id, topic.name, topic.color, topic.icon, topic.sort_order, topic.created_at, topic.updated_at],
    );
  }

  // Import todos
  for (const todo of data.todos) {
    await db.execute(
      `INSERT INTO todos (id, title, description, topic_id, due_date, completed, completed_at, priority, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [todo.id, todo.title, todo.description, todo.topic_id, todo.due_date, todo.completed, todo.completed_at, todo.priority, todo.sort_order, todo.created_at, todo.updated_at],
    );
  }

  // Import settings
  for (const setting of data.settings) {
    await db.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [setting.key, setting.value],
    );
  }
}
