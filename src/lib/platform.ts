export function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

export function isBrowser(): boolean {
  return !isTauri();
}
