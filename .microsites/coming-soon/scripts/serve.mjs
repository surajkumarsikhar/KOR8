import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../out');
const port = Number(process.env.PORT || 3001);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer(async (req,res) => {
  try {
    const route = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    let file = path.resolve(root, '.' + route);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file,'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404, { 'Content-Type':'text/html' }); res.end(await fs.readFile(path.join(root,'404.html')).catch(()=>'Not found')); }
}).listen(port,'127.0.0.1',()=>console.log(`Static export: http://localhost:${port}`));
