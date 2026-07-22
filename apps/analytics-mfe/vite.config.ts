/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../..');

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared/validators': resolve(rootDir, 'libs/shared/validators'),
      '@shared/api-types': resolve(rootDir, 'libs/shared/api-types/src'),
      '@shared/data-access': resolve(rootDir, 'libs/shared/data-access/src'),
    },
  },
  server: {
    port: 4400,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
