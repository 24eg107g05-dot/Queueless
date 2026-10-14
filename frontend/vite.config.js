import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  define: {
    global: 'globalThis',
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: ' https://queueless-1itj.onrender.com',
        changeOrigin: true,
      },
      '/ws': {
        target: ' https://queueless-1itj.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
