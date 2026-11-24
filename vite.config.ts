import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Проверка наличия локальных SSL сертификатов
const certKeyPath = path.resolve(__dirname, 'cert.key')
const certCrtPath = path.resolve(__dirname, 'cert.crt')
const hasCerts = fs.existsSync(certKeyPath) && fs.existsSync(certCrtPath)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Базовый путь: на GitHub Pages равен '/system-components-frontend/', локально '/'
  const isGhPages =
    process.env.GITHUB_PAGES === 'true' ||
    process.env.DEPLOY_TARGET === 'gh-pages' ||
    mode === 'production' && Boolean(process.env.IS_GH_PAGES)
  const base = isGhPages ? '/system-components-frontend/' : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        includeAssets: [
          'favicon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'apple-touch-icon.png',
          'DefaultImage.png',
          'DefaultVideo.mp4',
        ],
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
      // Поддержка HTTPS для локальной сети и тестирования с телефона
      https: hasCerts
        ? {
            key: fs.readFileSync(certKeyPath),
            cert: fs.readFileSync(certCrtPath),
          }
        : undefined,
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
  }
})
