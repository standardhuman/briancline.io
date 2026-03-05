import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  plugins: [
    react({
      // Only apply React transform to files in src/services/
      include: ['src/services/**/*.jsx', 'src/services/**/*.js'],
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        diving: resolve(__dirname, 'diving.html'),
        training: resolve(__dirname, 'training.html'),
        deliveries: resolve(__dirname, 'deliveries.html'),
        fireshift: resolve(__dirname, 'projects/fireshift.html'),
        'podcast-renamer': resolve(__dirname, 'projects/podcast-renamer.html'),
        'training-faq': resolve(__dirname, 'training/faq.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    // Rewrite service routes to services.html in dev mode (matches vercel.json)
    middlewareMode: false,
  },
  appType: 'mpa',
})
