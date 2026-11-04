// Local preview server that mimics Vercel: serves index.html and runs api/*.js functions.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const port = Number(process.env.PORT) || 3000;

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (obj) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(obj));
    };

    if (url.pathname.startsWith('/api/')) {
      const file = path.join(root, 'api', path.basename(url.pathname) + '.js');
      if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }
        Promise.resolve(require(file)(req, res)).catch((e) => res.status(500).json({ error: e.message }));
      });
      return;
    }

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(fs.readFileSync(path.join(root, 'index.html')));
  })
  .listen(port, () => console.log(`Paswig English dev server on http://localhost:${port}`));
