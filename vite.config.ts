import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.CAPACITOR_BUILD ? './' : '/',
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
          'vendor-zip': ['jszip', 'file-saver'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['pdf-lib', 'jszip', 'file-saver']
  }
});
