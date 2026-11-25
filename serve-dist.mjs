// Serveur statique pour dist/ (build prod) sur http://localhost:4173 — SPA fallback + MIME.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const ROOT = 'dist';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain' };
createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = normalize(join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (!existsSync(file) || !statSync(file).isFile()) file = join(ROOT, 'index.html'); // SPA fallback
  try {
    const data = readFileSync(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Service-Worker-Allowed': '/' });
    res.end(data);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(4173, () => console.log('dist static server on http://localhost:4173'));
