import { cn } from '@/lib/utils.ts';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'heavy' | 'gradient';
}

export function GlassPanel({ children, variant = 'default', className, ...props }: GlassPanelProps) {
  const variantClass = {
    default: 'glass',
    heavy: 'glass-heavy',
    gradient: 'glass-gradient',
  }[variant];

  return (
    <div className={cn(variantClass, 'rounded-lg', className)} {...props}>
      {children}
    </div>
  );
}
