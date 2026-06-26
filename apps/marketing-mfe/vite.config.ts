import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@marketing/core': resolve(__dirname, 'src/core'),
      '@marketing/shared': resolve(__dirname, 'src/shared'),
      '@marketing/features': resolve(__dirname, 'src/features'),
      '@marketing/stores': resolve(__dirname, 'src/stores'),
      '@marketing/hooks': resolve(__dirname, 'src/hooks'),
      '@marketing/providers': resolve(__dirname, 'src/providers'),
      '@shared/validators': resolve(__dirname, '../../libs/shared/validators'),
    },
  },
  server: {
    port: 4300,
    strictPort: true,
  },
});
