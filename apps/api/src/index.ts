/**
 * FolioPress Cloudflare Worker API
 * Built with Hono, TypeScript, and edge runtime safety.
 *
 * Connectivity Architecture:
 * Cloudflare Workers communicate with the Hostinger MySQL database through the
 * authenticated Hostinger Node.js Prisma Database Service (apps/database-service)
 * over mutual-secret authenticated HTTPS.
 */

export interface Env {
  ENVIRONMENT: string;
  DB_SERVICE_URL: string;
  DB_SERVICE_SECRET: string;
  SESSION_SECRET: string;
  R2_PDF_BUCKET?: any;
}

// In standard Cloudflare Worker deployment, Hono handles all /api/v1 routes:
// - /api/v1/auth/*
// - /api/v1/admin/books/*
// - /api/v1/admin/chapters/*
// - /api/v1/admin/processing-jobs/*
// - /api/v1/admin/categories/*
// - /api/v1/admin/authors/*
// - /api/v1/books/* (Public Reader endpoints)

export const handleApiRequest = async (request: Request, env: Env): Promise<Response> => {
  const url = new URL(request.url);

  // Health check
  if (url.pathname === '/api/v1/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      service: 'foliopress-edge-worker',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Forward authenticated database queries to Hostinger Prisma Service
  const dbServiceResponse = await fetch(`${env.DB_SERVICE_URL}${url.pathname}${url.search}`, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Worker-Authorization': `Bearer ${env.DB_SERVICE_SECRET}`,
      'Cookie': request.headers.get('Cookie') || '',
      'Authorization': request.headers.get('Authorization') || '',
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
  });

  return new Response(dbServiceResponse.body, {
    status: dbServiceResponse.status,
    headers: dbServiceResponse.headers,
  });
};

export default {
  fetch(request: Request, env: Env) {
    return handleApiRequest(request, env);
  }
};
