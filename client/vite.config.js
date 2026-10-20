import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development React runs on :5173 and the API on :5000.
// The proxy forwards /api and /docs calls to the API, so the frontend can just call fetch('/api/...').
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/docs': 'http://localhost:5000',
    },
  },
});
