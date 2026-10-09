import React, { useState } from 'react';
import { User, Entitlement, AuditLog, Book } from '../../lib/types';
import { KeyRound, Shield, History, UserCheck, DollarSign, CheckCircle2, Lock } from 'lucide-react';

interface AccessManagementViewProps {
  users: User[];
  entitlements: Entitlement[];
  auditLogs: AuditLog[];
  books: Book[];
}

export const AccessManagementView: React.FC<AccessManagementViewProps> = ({
  users,
  entitlements,
  auditLogs,
  books,
}) => {
  const [activeTab, setActiveTab] = useState<'entitlements' | 'users' | 'audit'>('entitlements');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Access Management & Entitlements
        </h1>
        <p className="text-xs text-neutral-500">
          Inspect registered readers, verify paid book entitlements, and monitor access audit events.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('entitlements')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'entitlements'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Book Entitlements ({entitlements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'entitlements' && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Reader Account</th>
                <th className="py-2.5 px-3 font-medium">Granted Book</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Payment Reference</th>
                <th className="py-2.5 px-4 font-medium">Granted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {entitlements.map((ent) => (
                <tr key={ent.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{ent.userName}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">{ent.userEmail}</p>
                  </td>
                  <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                    {ent.bookTitle}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {ent.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                    {ent.paymentReference || 'MANUAL_GRANT'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                    {new Date(ent.purchasedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Name & Email</th>
                <th className="py-2.5 px-3 font-medium">Role</th>
                <th className="py-2.5 px-3 font-medium">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">{user.email}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : user.role === 'EDITOR'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Timestamp</th>
                <th className="py-2.5 px-3 font-medium">Action</th>
                <th className="py-2.5 px-3 font-medium">Entity</th>
                <th className="py-2.5 px-3 font-medium">Actor</th>
                <th className="py-2.5 px-4 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40">
                  <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">
                    {log.entityType} ({log.entityId.slice(0, 10)}...)
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                    {log.actorName || 'System'}
                  </td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 text-[11px]">
                    {log.metadata}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
