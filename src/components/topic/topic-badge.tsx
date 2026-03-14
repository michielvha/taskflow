import { cn } from '@/lib/utils.ts';

interface TopicBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export function TopicBadge({ name, color, className }: TopicBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
