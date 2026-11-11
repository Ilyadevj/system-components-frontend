import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      // 1. Проксирование запросов к бэкенд API (порт 8080)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 2. Проксирование запросов к S3 / MinIO медиа-хранилищу (порт 9000)
      '/system-components': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
})
