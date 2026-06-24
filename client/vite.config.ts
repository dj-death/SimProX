import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: proxy API + socket calls to the existing Express server so the React app
// can run against the real backend without CORS. Point VITE_API_TARGET at the
// running server (default http://localhost:80).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/stratege/api': { target: process.env.VITE_API_TARGET || 'http://localhost:80', changeOrigin: true },
      '/e4e/api': { target: process.env.VITE_API_TARGET || 'http://localhost:80', changeOrigin: true },
      '/socket.io': { target: process.env.VITE_API_TARGET || 'http://localhost:80', ws: true, changeOrigin: true },
    },
  },
});
