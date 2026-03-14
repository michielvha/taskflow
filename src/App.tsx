import { DatabaseProvider, useDatabase } from '@/hooks/use-database.ts';
import { AppShell } from '@/components/layout/app-shell.tsx';

function AppContent() {
  const { loading, error } = useDatabase();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Failed to load database: {error}</p>
      </div>
    );
  }

  return <AppShell />;
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}
