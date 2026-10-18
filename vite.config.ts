/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Relative asset paths so the built app works from any folder or static host.
  base: './',
  plugins: [react()],
  // SINGLE_FILE=1 builds one script (no lazy chunks) for the single-file shareable preview.
  // The Code Lab chunk (editor, parser, SQL engine) is large by nature and only loads when the Lab is opened.
  build: process.env.SINGLE_FILE ? { rolldownOptions: { output: { codeSplitting: false } }, chunkSizeWarningLimit: 2500 } : { chunkSizeWarningLimit: 800 },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // The local AI server (npm run server). Only used when Settings → AI is set to "Local server".
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    css: false,
  },
});
