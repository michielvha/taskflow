export const APP_NAME = 'Taskflow';
export const DB_NAME = 'taskflow.db';

export const DEFAULT_SETTINGS = {
  auto_hide_completed: 'false',
  auto_hide_completed_delay_ms: '3000',
  default_sort: 'date',
  theme: 'dark',
} as const;

export const PRIORITY_LABELS = ['None', 'Low', 'Medium', 'High'] as const;

export const SORT_MODES = ['date', 'topic', 'priority', 'manual'] as const;
