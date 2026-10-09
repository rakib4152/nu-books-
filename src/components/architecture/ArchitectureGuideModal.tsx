import React, { useState } from 'react';
import { Server, Database, Cloud, Shield, Terminal, ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';

export const ArchitectureGuideModal: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Production Architecture & Hostinger MySQL Connectivity
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Detailed technical specifications for Cloudflare Worker edge routing, Node.js Prisma Hostinger service, and MySQL persistence.
        </p>
      </div>

      {/* Visual Topology Diagram */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          1. System Component Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Edge Worker */}
          <div className="p-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>Layer 1: Edge Routing</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              <strong>Cloudflare Worker + Hono</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300">
              <li>Low-latency TLS edge termination</li>
              <li>Zod request input validation</li>
              <li>JWT / Session token authentication</li>
              <li>Presigned R2/S3 upload URLs</li>
            </ul>
          </div>

          {/* Secure Bridge */}
          <div className="p-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Layer 2: Database Service</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              <strong>Hostinger Node.js Prisma Daemon</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300">
              <li>Native TCP MySQL connections</li>
              <li>Prisma Client ORM with connection pooling</li>
              <li>PDF Outline parsing (<code>pdfjs-dist</code>)</li>
              <li>Asynchronous background worker queue</li>
            </ul>
          </div>

          {/* Database */}
          <div className="p-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Layer 3: MySQL Storage</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              <strong>Hostinger Business MySQL</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300">
              <li>InnoDB engine with utf8mb4 collation</li>
              <li>Relational integrity (Foreign Keys & Cascades)</li>
              <li>Indexed chapter sortOrder and bookId</li>
              <li>Immutable audit logging</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected Connectivity Approach & Trade-offs */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-3 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          2. The Cloudflare Workers-to-Hostinger MySQL Connectivity Solution
        </h2>
        <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
          <p>
            <strong>The Problem:</strong> Cloudflare Workers execute inside V8 isolates rather than a full Node.js POSIX runtime.
            Standard Node.js MySQL drivers (like <code>mysql2</code> used by Prisma) require raw TCP socket connections. While Cloudflare Workers
            supports <code>connect()</code> from <code>cloudflare:sockets</code>, Hostinger Shared MySQL blocks arbitrary incoming TCP
            connections from dynamic cloud edge IP pools due to firewall restrictions (cPanel / CloudLinux mod_security).
          </p>
          <p>
            <strong>The Architected Solution:</strong> We deploy a dedicated lightweight Node.js service (<code>apps/database-service</code>)
            on the Hostinger Node.js hosting runtime (or Hostinger VPS). This service runs locally alongside MySQL with standard TCP loopback
            (<code>127.0.0.1:3306</code>) where Prisma Client is 100% native. The Cloudflare Worker communicates with this service over
            authenticated HTTPS using mutual shared secrets (<code>X-Worker-Authorization: Bearer [SECRET]</code>).
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800">
            <span className="font-semibold block mb-1">Trade-off Analysis:</span>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
              <li><strong>Pros:</strong> Zero firewall blocking on Hostinger; native Prisma migration compatibility; heavy PDF bookmark parsing (via <code>pdfjs-dist</code>) runs in a dedicated Node.js memory space without Worker isolate CPU limits.</li>
              <li><strong>Cons:</strong> Adds one HTTPS hop (~15-30ms) between edge and database; requires running the Hostinger Node.js daemon (managed via PM2 or Hostinger Application Manager).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Terminal Deployment Commands */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-500" />
          <span>3. Deployment & Migration Runbook</span>
        </h2>

        <div className="space-y-3 font-mono text-[11px]">
          <div>
            <span className="text-neutral-500 font-sans block text-xs font-semibold mb-1">
              Step A: Database Migration on Hostinger
            </span>
            <div className="p-3 bg-neutral-900 text-neutral-200 rounded-md relative">
              <pre className="overflow-x-auto">
{`# In apps/database-service or project root
export DATABASE_URL="mysql://u123456_admin:StrongPass123!@localhost:3306/u123456_foliopress"
npx prisma migrate deploy
npx prisma generate`}
              </pre>
              <button
                onClick={() => copyToClipboard(`export DATABASE_URL="mysql://u123456_admin:StrongPass123!@localhost:3306/u123456_foliopress"\nnpx prisma migrate deploy\nnpx prisma generate`, 1)}
                className="absolute top-2 right-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-neutral-500 font-sans block text-xs font-semibold mb-1">
              Step B: Start Hostinger Node.js Prisma Service
            </span>
            <div className="p-3 bg-neutral-900 text-neutral-200 rounded-md relative">
              <pre className="overflow-x-auto">
{`# Start via PM2 daemon
pm2 start dist/server.js --name "foliopress-db-service" --env production
pm2 save`}
              </pre>
              <button
                onClick={() => copyToClipboard(`pm2 start dist/server.js --name "foliopress-db-service" --env production\npm2 save`, 2)}
                className="absolute top-2 right-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-neutral-500 font-sans block text-xs font-semibold mb-1">
              Step C: Deploy Cloudflare Worker
            </span>
            <div className="p-3 bg-neutral-900 text-neutral-200 rounded-md relative">
              <pre className="overflow-x-auto">
{`cd apps/api
wrangler secret put DB_SERVICE_URL
wrangler secret put DB_SERVICE_SECRET
wrangler secret put SESSION_SECRET
wrangler deploy`}
              </pre>
              <button
                onClick={() => copyToClipboard(`cd apps/api\nwrangler secret put DB_SERVICE_URL\nwrangler secret put DB_SERVICE_SECRET\nwrangler secret put SESSION_SECRET\nwrangler deploy`, 3)}
                className="absolute top-2 right-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
