#!/usr/bin/env node
/** Local preview that resolves URLs as GitHub Pages does: `/expertises` serves
 * `expertises.html`, a folder serves its `index.html`, anything else gets `404.html`.
 *   node tools/serve.mjs [port]      (default 4173, bound to 127.0.0.1)
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const file = pathname => {
  const local = path.join(root, path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, ''));
  if (!local.startsWith(root)) return null;
  for (const candidate of [local, `${local}.html`, path.join(local, 'index.html')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
};

http.createServer((request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');
  // A folder without its trailing slash redirects, as on GitHub Pages.
  if (!pathname.endsWith('/') && fs.existsSync(path.join(root, pathname, 'index.html'))) {
    response.writeHead(301, { Location: `${pathname}/` }).end();
    return;
  }
  const found = file(pathname);
  const served = found || path.join(root, pathname.startsWith('/en/') ? 'en/404.html' : '404.html');
  const body = fs.readFileSync(served);
  const range = request.headers.range?.match(/bytes=(\d*)-(\d*)/);
  const headers = { 'Content-Type': types[path.extname(served)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
  // Safari plays a video only when byte ranges are honoured.
  if (found && range) {
    const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : body.length - 1;
    response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
    response.end(body.subarray(start, end + 1));
    return;
  }
  response.writeHead(found ? 200 : 404, { ...headers, 'Content-Length': body.length }).end(body);
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/`));
