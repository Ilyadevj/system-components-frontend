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

const PORT = Number(process.env.PORT || 8443);
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
  '.webp': 'image/webp',
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
    // Браузер обращается к API с того же origin, что и к приложению.
    const headers = Object.fromEntries(Object.entries(proxyRes.headers)
      .filter(([name]) => !name.startsWith('access-control-')));
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.on('error', () => res.destroy());
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] -> ${targetUrl}${req.url}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Сервис временно недоступен' }));
  });

  res.on('close', () => { if (!res.writableEnded) proxyReq.destroy(); });
  req.pipe(proxyReq);
}

async function serveStatic(req, res, pathname) {
  let filePath = path.resolve(distDir, `.${pathname}`);
  if (filePath !== distDir && !filePath.startsWith(distDir + path.sep)) {
    res.writeHead(404).end();
    return;
  }

  let stats = await fs.promises.stat(filePath).catch(() => null);
  if (!stats?.isFile() && !path.extname(pathname)) {
    filePath = path.join(distDir, 'index.html');
    stats = await fs.promises.stat(filePath).catch(() => null);
  }
  if (!stats?.isFile()) {
    res.writeHead(404).end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Content-Length': stats.size,
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}

const server = https.createServer(httpsOptions, (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'https://localhost').pathname);
    if (pathname.includes('\0')) throw new Error('Invalid path');
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }

  if (/^\/(api|static)(?:\/|$)/.test(pathname)) {
    const { origin, host } = req.headers;
    if (!['GET', 'HEAD'].includes(req.method) && origin && origin !== `https://${host}`) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    proxyRequest(req, res, BACKEND_TARGET);
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  if (pathname.startsWith('/system-components/') &&
      !['/system-components/feed', '/system-components/editor'].includes(pathname.replace(/\/$/, ''))) {
    proxyRequest(req, res, MINIO_TARGET);
    return;
  }

  void serveStatic(req, res, pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS Reverse Proxy running on:`);
  console.log(`   - Local:   https://localhost:${PORT}`);
  console.log(`   - Network: https://0.0.0.0:${PORT}`);
  console.log(`   Proxies:`);
  console.log(`   - /api/* and /static/* -> ${BACKEND_TARGET}`);
  console.log(`   - /system-components/* -> ${MINIO_TARGET}`);
  console.log(`   - /*                   -> static SPA from ${distDir}`);
});
