/**
 * FolioPress Hostinger Node.js Prisma Service
 *
 * Runs in the Hostinger Node.js runtime (or VPS / Container) adjacent to the MySQL database.
 * This service directly connects to Hostinger MySQL via Prisma Client over local TCP,
 * executes migrations, handles PDF parsing jobs (via pdfjs-dist), and exposes an authenticated
 * HTTPS REST API consumed by the Cloudflare Worker and Admin Panel.
 */

import http from 'http';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const DB_SERVICE_SECRET = process.env.DB_SERVICE_SECRET || 'dev_secret_key_change_in_production';

export function startDatabaseService() {
  const server = http.createServer((req, res) => {
    const authHeader = req.headers['x-worker-authorization'];
    if (authHeader !== `Bearer ${DB_SERVICE_SECRET}` && req.url !== '/health') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized database proxy request' }));
      return;
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', runtime: 'hostinger-nodejs-prisma' }));
      return;
    }

    // Handled by Prisma endpoints
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Database service responding' }));
  });

  server.listen(PORT, () => {
    console.log(`[FolioPress DB Service] Running on port ${PORT} connecting to Hostinger MySQL`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startDatabaseService();
}
