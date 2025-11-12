import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/sse': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
      '/facts': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
});
