import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backendfms.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '$': 'jquery',
      'jQuery': 'jquery',
      'jquery': 'jquery'
    }
  }
})
