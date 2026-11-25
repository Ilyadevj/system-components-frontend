import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isGhPages = mode === 'gh-pages'
  const base = isGhPages ? '/system-components-frontend/' : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{html,js,css,svg,png}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallbackDenylist: isGhPages ? [] : [/^\/api(?:\/|$)/, /^\/static\//, /^\/system-components\/(?!feed(?:\/|$)|editor(?:\/|$))/],
        },
        manifest: {
          name: 'Системные компоненты - Расчет времени отклика',
          short_name: 'SysComponents',
          description: 'Адаптивное PWA приложение для мониторинга узлов архитектуры и расчета времени отклика',
          start_url: base,
          display: 'standalone',
          background_color: '#090A0C',
          theme_color: '#111317',
          orientation: 'portrait-primary',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      proxy: {
        // 1. Проксирование запросов к бэкенд API (порт 8080)
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
        // 2. Проксирование запросов к S3 / MinIO медиа-хранилищу (порт 9000)
        '^/system-components/(?!feed(?:/|$)|editor(?:/|$))': {
          target: 'http://127.0.0.1:9000',
          changeOrigin: true,
        },
        // 3. Проксирование статики бэкенда (дефолтные иконки и видео)
        '/static': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
