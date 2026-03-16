import { useState, useRef, useEffect } from 'react';
import { Check, ChevronRight, Copy, ExternalLink, ListChecks, Plus, Trash2, X } from 'lucide-react';
import { TopicBadge } from '@/components/topic/topic-badge.tsx';
import { PRIORITY_LABELS } from '@/lib/constants.ts';
import { format, isPast, isToday } from 'date-fns';
import type { Todo, Topic, Subtask } from '@/db/schema.ts';

interface TodoItemProps {
  todo: Todo;
  topic?: Topic;
  subtasks?: Subtask[];
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export function TodoItem({
  todo, topic, subtasks = [], onToggleComplete, onEdit, onDelete,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
}: TodoItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOverdue = todo.due_date && !todo.completed && isPast(new Date(todo.due_date)) && !isToday(new Date(todo.due_date));
  const completedCount = subtasks.filter((s) => s.completed === 1).length;
  const hasSubtasks = subtasks.length > 0;

  // Focus the input when expanding
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleAddSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    onAddSubtask(todo.id, title);
    setNewSubtask('');
    inputRef.current?.focus();
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const check = todo.completed ? 'x' : ' ';
    const lines: string[] = [`- [${check}] ${todo.title}`];
    if (todo.description) lines.push(`  ${todo.description}`);
    if (todo.link) lines.push(`  ${todo.link}`);
    const meta: string[] = [];
    if (todo.priority > 0) meta.push(PRIORITY_LABELS[todo.priority]);
    if (topic) meta.push(topic.name);
    if (todo.due_date) meta.push(`Due: ${format(new Date(todo.due_date), 'MMM d, yyyy')}`);
    if (meta.length > 0) lines.push(`  _${meta.join(' | ')}_`);
    for (const s of subtasks) {
      lines.push(`  - [${s.completed ? 'x' : ' '}] ${s.title}`);
    }
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50">
        <button
          onClick={() => onToggleComplete(todo.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            todo.completed
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/40 hover:border-primary'
          }`}
          aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {todo.completed === 1 && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <button
          onClick={() => onEdit(todo)}
          className="flex flex-1 flex-col gap-1 text-left"
        >
          <span className={`text-sm ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {todo.title}
          </span>
          {todo.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">{todo.description}</span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Subtask progress + expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-1 rounded px-1 py-0.5 text-muted-foreground transition-colors hover:text-foreground ${
              expanded ? 'bg-accent/50 text-foreground' : ''
            }`}
            aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {hasSubtasks ? (
              <>
                <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                <span className="text-xs">{completedCount}/{subtasks.length}</span>
              </>
            ) : (
              <ListChecks className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {todo.link && (
            <a
              href={todo.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1 text-muted-foreground transition-colors hover:text-primary"
              aria-label="Open link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {todo.priority > 0 && (
            <span className={`text-xs font-medium ${
              todo.priority === 3 ? 'text-destructive' : todo.priority === 2 ? 'text-yellow-500' : 'text-muted-foreground'
            }`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
          )}

          {topic && <TopicBadge name={topic.name} color={topic.color} />}

          {todo.due_date && (
            <span className={`text-xs ${isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
              {format(new Date(todo.due_date), 'MMM d')}
            </span>
          )}

          <button
            onClick={handleCopy}
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            aria-label="Copy as markdown"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Subtasks panel */}
      {expanded && (
        <div className="ml-11 mr-3 mb-1 flex flex-col gap-0.5">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="group/sub flex items-center gap-2 rounded px-2 py-1 hover:bg-accent/30">
              <button
                onClick={() => onToggleSubtask(subtask.id)}
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  subtask.completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/40 hover:border-primary'
                }`}
              >
                {subtask.completed === 1 && (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-xs ${subtask.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {subtask.title}
              </span>
              <button
                onClick={() => onDeleteSubtask(subtask.id)}
                className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/sub:opacity-100"
                aria-label="Delete subtask"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Inline add — always visible when expanded */}
          <div className="flex items-center gap-2 px-2 py-1">
            <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
                if (e.key === 'Escape') {
                  setNewSubtask('');
                  setExpanded(false);
                }
              }}
              placeholder="Add subtask..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
