import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic', // ✅ activa el runtime JSX moderno (React 17+)
  },
  server: {
    proxy: {
      '/upload_data': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
