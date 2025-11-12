import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/sse': {
        target: 'http://localhost:5174',
        changeOrigin: true
      },
      '/facts': {
        target: 'http://localhost:5174',
        changeOrigin: true
      }
    }
  }
});
