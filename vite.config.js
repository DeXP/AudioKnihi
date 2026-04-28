// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  
  base: process.env.VITE_BASE || '/',
  
  build: {
    outDir: 'dist',
    emptyOutDir: true, // cleans old files before each build
    // improve caching with hash filenames
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  
  // Allow external access on Synology
  server: {
    host: '0.0.0.0',      // listen on all interfaces
    port: 5173,           // explicit port
    strictPort: true,     // fail if port is taken
  },
  
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})