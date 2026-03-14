import { X, Download, Upload } from 'lucide-react';
import { GlassPanel } from '@/components/layout/glass-panel.tsx';
import { useSettings } from '@/hooks/use-settings.ts';
import { exportData, importData } from '@/lib/export-import.ts';
import type { DatabaseAdapter } from '@/db/database.ts';

interface SettingsDialogProps {
  db: DatabaseAdapter;
  onClose: () => void;
}

export function SettingsDialog({ db, onClose }: SettingsDialogProps) {
  const { autoHideCompleted, autoHideDelay, setSetting } = useSettings();

  const handleExport = async () => {
    const json = await exportData(db);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const json = await file.text();
      await importData(db, json);
      window.location.reload();
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <GlassPanel variant="heavy" className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Auto-hide completed */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-hide completed</p>
              <p className="text-xs text-muted-foreground">Hide completed todos after a delay</p>
            </div>
            <button
              onClick={() => setSetting('auto_hide_completed', autoHideCompleted ? 'false' : 'true')}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                autoHideCompleted ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
                  autoHideCompleted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto-hide delay */}
          {autoHideCompleted && (
            <div>
              <label htmlFor="hide-delay" className="mb-1.5 block text-sm font-medium">
                Hide delay: {autoHideDelay / 1000}s
              </label>
              <input
                id="hide-delay"
                type="range"
                min="1000"
                max="10000"
                step="1000"
                value={autoHideDelay}
                onChange={(e) => setSetting('auto_hide_completed_delay_ms', e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="h-px bg-border" />

          {/* Data management */}
          <div>
            <p className="mb-3 text-sm font-medium">Data</p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Export or import your data as JSON for backup or device transfer.
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
