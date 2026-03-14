import type { DatabaseAdapter } from './database.ts';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS topics (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  icon        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS todos (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  link          TEXT,
  topic_id      TEXT REFERENCES topics(id) ON DELETE SET NULL,
  due_date      TEXT,
  completed     INTEGER NOT NULL DEFAULT 0,
  completed_at  TEXT,
  priority      INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_todos_topic ON todos(topic_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
`;

const DEFAULT_SETTINGS = [
  ['auto_hide_completed', 'false'],
  ['auto_hide_completed_delay_ms', '3000'],
  ['default_sort', 'date'],
  ['theme', 'dark'],
];

export async function runMigrations(db: DatabaseAdapter): Promise<void> {
  const statements = MIGRATION_SQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement);
  }

  for (const [key, value] of DEFAULT_SETTINGS) {
    await db.execute(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      [key, value],
    );
  }
}
