import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/functions/v1': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
      },
      '/api/v1/portal': {
        target: 'http://127.0.0.1:54321/functions/v1/outbox-processor',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/portal/, '')
      }
    }
  }
})

