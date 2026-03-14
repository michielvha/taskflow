import { useState } from 'react';
import { X } from 'lucide-react';
import { GlassPanel } from '@/components/layout/glass-panel.tsx';
import type { Todo, Topic, Priority } from '@/db/schema.ts';
import { PRIORITY_LABELS } from '@/lib/constants.ts';

interface TodoFormProps {
  todo?: Todo;
  topics: Topic[];
  defaultTopicId?: string | null;
  onSubmit: (fields: {
    title: string;
    description?: string;
    link?: string;
    topic_id?: string;
    due_date?: string;
    priority?: Priority;
  }) => void;
  onClose: () => void;
}

export function TodoForm({ todo, topics, defaultTopicId, onSubmit, onClose }: TodoFormProps) {
  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [link, setLink] = useState(todo?.link ?? '');
  const [topicId, setTopicId] = useState(todo?.topic_id ?? defaultTopicId ?? '');
  const [dueDate, setDueDate] = useState(todo?.due_date ?? '');
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      link: link.trim() || undefined,
      topic_id: topicId || undefined,
      due_date: dueDate || undefined,
      priority,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <GlassPanel variant="heavy" className="w-full max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{todo ? 'Edit Todo' : 'Add Todo'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="todo-title" className="mb-1.5 block text-sm font-medium">Title</label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="todo-description" className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              id="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="todo-link" className="mb-1.5 block text-sm font-medium">Link</label>
            <input
              id="todo-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://... (optional)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="todo-topic" className="mb-1.5 block text-sm font-medium">Topic</label>
              <select
                id="todo-topic"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">None</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="todo-priority" className="mb-1.5 block text-sm font-medium">Priority</label>
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as Priority)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PRIORITY_LABELS.map((label, i) => (
                  <option key={i} value={i}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="todo-due-date" className="mb-1.5 block text-sm font-medium">Due Date</label>
            <input
              id="todo-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {todo ? 'Save' : 'Add Todo'}
            </button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
