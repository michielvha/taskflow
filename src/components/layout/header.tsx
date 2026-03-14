import { Settings } from 'lucide-react';
import { GlassPanel } from './glass-panel.tsx';
import { APP_NAME } from '@/lib/constants.ts';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <GlassPanel className="flex items-center justify-between px-6 py-3">
      <h1 className="text-lg font-semibold text-foreground">{APP_NAME}</h1>
      <button
        onClick={onOpenSettings}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
    </GlassPanel>
  );
}
