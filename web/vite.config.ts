import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // O frontend só conversa com o nosso backend; nunca diretamente com o MusicBrainz.
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
});
