import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './', // Use relative paths for static deployment
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
        'process.env.VITE_SHEETS_API_URL': JSON.stringify(env.VITE_SHEETS_API_URL || ""),
        'import.meta.env.VITE_SHEETS_API_URL': JSON.stringify(env.VITE_SHEETS_API_URL || "")
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
