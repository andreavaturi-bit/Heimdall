
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Diciamo a Vite di non provare a risolvere questi pacchetti durante la build
      // perché verranno risolti dal browser tramite l'importmap nell'index.html
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'lucide-react',
        'date-fns',
        '@netlify/neon'
      ],
    },
  },
  // Inseriamo la variabile d'ambiente affinché sia disponibile nel frontend
  define: {
    'process.env.NETLIFY_DATABASE_URL': JSON.stringify(process.env.NETLIFY_DATABASE_URL),
  }
});
