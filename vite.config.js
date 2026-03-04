import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
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
  },
})
