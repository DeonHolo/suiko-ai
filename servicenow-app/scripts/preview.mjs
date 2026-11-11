import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPdiClient } from './pdi-client.mjs';

const root = path.resolve(fileURLToPath(new URL('../dist/static/', import.meta.url)));
const client = await createPdiClient();
const address = 'http://127.0.0.1:13542';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.jsdbx': 'text/javascript', '.css': 'text/css', '.map': 'application/json' };
// The instance renders Jelly tags. A local browser needs ordinary HTML.
const previewHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Suiko AI</title>
<script type="module" src="/x_2236136_suiko_ai/main.jsdbx"></script>
</head><body><div id="root"></div></body></html>`;
const server = http.createServer(async (request, response) => {
  try {
    if (request.headers.origin && request.headers.origin !== address) {
      response.writeHead(403).end('Use the local preview page.'); return;
    }
    const url = new URL(request.url, address);
    if (url.pathname.startsWith('/api/x_2236136_suiko_ai/')) {
      let raw = '';
      for await (const chunk of request) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 262144) throw new Error('The request is too large.');
      }
      const result = await client(url.pathname + url.search, {
        method: request.method, body: raw ? JSON.parse(raw) : undefined,
      });
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ result })); return;
    }
    let relative = decodeURIComponent(url.pathname).replace(/^\/x_2236136_suiko_ai\//, '/');
    if (relative === '/' || relative.endsWith('.do')) relative = '/index.html';
    const file = path.resolve(root, '.' + relative);
    if (!file.startsWith(root + path.sep)) throw new Error('Choose a preview asset.');
    await stat(file);
    const content = relative === '/index.html' ? previewHtml : await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(content);
  } catch (error) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ result: { message: error.message } }));
  }
});
server.listen(13542, '127.0.0.1', () => console.log('Local preview with the ServiceNow backend at ' + address));
