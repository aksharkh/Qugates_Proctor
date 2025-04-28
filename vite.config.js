import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,  // Increase if Tensorflow chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tensorflow')) return 'tensorflow'
            if (id.includes('@mui')) return 'mui'
            if (id.includes('face-api')) return 'faceapi'
            return 'vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@vladmandic/face-api', '@mui/material'],
    exclude: [],
  }
})
