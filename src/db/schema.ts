export interface Todo {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  topic_id: string | null;
  due_date: string | null;
  completed: 0 | 1;
  completed_at: string | null;
  priority: 0 | 1 | 2 | 3;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  completed: 0 | 1;
  sort_order: number;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

export type SortMode = 'date' | 'topic' | 'priority' | 'manual';
export type Priority = 0 | 1 | 2 | 3;
