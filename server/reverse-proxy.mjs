import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Чтение SSL сертификатов
const keyPath = path.resolve(rootDir, 'cert.key');
const certPath = path.resolve(rootDir, 'cert.crt');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('❌ SSL certificates (cert.key / cert.crt) not found! Run ./scripts/generate-cert.sh first.');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const PORT = process.env.PORT || 8443;
const BACKEND_TARGET = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
const MINIO_TARGET = process.env.MINIO_URL || 'http://127.0.0.1:9000';

// MIME типы для статики PWA и фронтенда
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.webmanifest': 'application/manifest+json',
};

// Функция реверс-проксирования
function proxyRequest(req, res, targetUrl) {
  const parsedTarget = new URL(targetUrl);
  
  const options = {
    hostname: parsedTarget.hostname,
    port: parsedTarget.port,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedTarget.host,
      'x-forwarded-proto': 'https',
      'x-forwarded-host': req.headers.host || '',
      'x-forwarded-for': req.socket.remoteAddress || '',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Пробрасываем статус и заголовки (включая Set-Cookie)
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] -> ${targetUrl}${req.url}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', message: err.message }));
  });

  req.pipe(proxyReq);
}

// Отдача статических файлов (SPA fallback на index.html)
function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(distDir, reqPath);

  // Проверяем существование файла
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: если файл не найден и это не запрос ассета, отдаем index.html
      const ext = path.extname(reqPath);
      if (!ext || ext === '.html') {
        filePath = path.join(distDir, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Кеширование для Service Worker и манифеста
    const headers = { 'Content-Type': contentType };
    if (ext === '.html' || reqPath === '/sw.js' || reqPath === '/registerSW.js') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

// Создание HTTPS сервера
const server = https.createServer(httpsOptions, (req, res) => {
  // CORS заголовки для работы в локальной сети
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url;

  // 1. Проксирование API на Go бэкенд
  if (url.startsWith('/api')) {
    proxyRequest(req, res, BACKEND_TARGET);
    return;
  }

  // 2. Проксирование медиа на MinIO хранилище
  if (url.startsWith('/system-components')) {
    proxyRequest(req, res, MINIO_TARGET);
    return;
  }

  // 3. Раздача статики PWA фронтенда
  serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS Reverse Proxy running on:`);
  console.log(`   - Local:   https://localhost:${PORT}`);
  console.log(`   - Network: https://0.0.0.0:${PORT}`);
  console.log(`   Proxies:`);
  console.log(`   - /api/*               -> ${BACKEND_TARGET}`);
  console.log(`   - /system-components/* -> ${MINIO_TARGET}`);
  console.log(`   - /*                   -> static SPA from ${distDir}`);
});
