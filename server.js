const http = require('http');
const fs = require('fs');
const path = require('path');
const chatHandler = require('./api/chat');
const statusHandler = require('./api/status');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const reqPath = decodeURI(urlParts[0]);

  // Route API requests directly
  if (reqPath === '/api/chat') {
    return chatHandler(req, res);
  }
  if (reqPath === '/api/status') {
    return statusHandler(req, res);
  }

  let filePath = path.join(__dirname, reqPath === '/' ? '/index.html' : reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Clean URL fallback: e.g. /assistant -> /pages/assistant.html
      const altHtml = path.join(__dirname, 'pages', reqPath.replace(/^\//, '') + '.html');
      if (fs.existsSync(altHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(altHtml).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`EduFAZE server running at http://127.0.0.1:${PORT}/`);
});
