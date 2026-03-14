import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // wa-sqlite uses Emscripten which locates .wasm files relative to the .mjs file.
    // Pre-bundling breaks this, so exclude it from optimization.
    exclude: ['wa-sqlite'],
  },
  build: {
    rollupOptions: {
      // Tauri modules are only available in the Tauri runtime, not in web builds
      external: ['@tauri-apps/plugin-sql', '@tauri-apps/api'],
    },
  },
  server: {
    port: 3000,
  },
});
