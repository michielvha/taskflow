// Type declarations for modules that are only available at runtime

// wa-sqlite main entry: exports Factory as a named export + SQLite constants
declare module 'wa-sqlite' {
  export function Factory(module: unknown): unknown;
  export const SQLITE_ROW: number;
  export const SQLITE_DONE: number;
}

// wa-sqlite WASM module factories (Emscripten-generated)
declare module 'wa-sqlite/dist/wa-sqlite-async.mjs' {
  export default function SQLiteESMFactory(): Promise<unknown>;
}

declare module 'wa-sqlite/dist/wa-sqlite.mjs' {
  export default function SQLiteESMFactory(): Promise<unknown>;
}

declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js' {
  export class IDBBatchAtomicVFS {
    constructor(name: string);
  }
}

// Tauri plugin is only available in the Tauri runtime
declare module '@tauri-apps/plugin-sql' {
  interface Database {
    execute(sql: string, params?: unknown[]): Promise<unknown>;
    select<T>(sql: string, params?: unknown[]): Promise<T[]>;
    close(): Promise<void>;
  }
  const _default: {
    load(path: string): Promise<Database>;
  };
  export default _default;
}
