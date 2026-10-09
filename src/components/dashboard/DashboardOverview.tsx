import React from 'react';
import {
  FolderKanban,
  CalendarDays,
  BookOpen,
  FolderGit2,
  Cpu,
  CheckCircle2,
  ArrowUpRight,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';
import { DashboardStats, Book, PdfProcessingJob, AuditLog } from '../../lib/types';

interface DashboardOverviewProps {
  stats: DashboardStats;
  books: Book[];
  jobs: PdfProcessingJob[];
  logs: AuditLog[];
  onSelectBook: (bookId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenCreateBook: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  books,
  jobs,
  logs,
  onSelectBook,
  onNavigateTab,
  onOpenCreateBook,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Publishing & PDF Processing Control Center
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Managing hierarchy: <strong>Subject → Year → Book → PDF File → Chapter → Subchapter</strong> with automated outline extraction.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('reader-simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <span>Launch Expo Simulator</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          <button
            onClick={onOpenCreateBook}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Create & Upload Book</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Subjects & Curriculum</span>
            <FolderKanban className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {stats.totalSubjects}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            <span>Across {stats.totalSubjectYears} distinct years</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Digital Books Catalog</span>
            <BookOpen className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {stats.totalBooks}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            <span>{stats.publishedBooks} published</span>
            <span className="mx-1">·</span>
            <span>{stats.draftBooks} draft</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Extracted Chapters</span>
            <FolderGit2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {stats.totalChapters}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            <span>Nested outline destinations</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Processing Queue Health</span>
            <Cpu className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {stats.activeProcessingCount > 0 ? `${stats.activeProcessingCount} Active` : 'Optimal'}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            <span>{stats.failedJobs} failed jobs needing review</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Books Table */}
        <div className="lg:col-span-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Active Books & Extraction Status
            </h2>
            <button
              onClick={() => onNavigateTab('books')}
              className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Book</th>
                  <th className="py-2.5 px-3 font-medium">Subject</th>
                  <th className="py-2.5 px-3 font-medium">Year</th>
                  <th className="py-2.5 px-3 font-medium">Chapters</th>
                  <th className="py-2.5 px-3 font-medium">Pages</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                {books.slice(0, 5).map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer"
                    onClick={() => onSelectBook(book.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-8 h-11 object-cover rounded border border-neutral-200 dark:border-neutral-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                            {book.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-mono">
                            {book.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                      {book.subjectName}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {book.year}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <span>{book.chapterCount || 0}</span>
                        {book.latestPdfFile?.hasOutline && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            [Outline]
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {book.totalPages} pp
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium ${
                          book.status === 'PUBLISHED'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : book.status === 'DRAFT'
                            ? 'text-neutral-600 dark:text-neutral-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBook(book.id);
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing Queue & Activity Stream */}
        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                PDF Extraction Queue
              </h3>
              <button
                onClick={() => onNavigateTab('processing')}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                All Jobs →
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {jobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-2.5 rounded border border-neutral-100 dark:border-neutral-900 bg-neutral-50/60 dark:bg-neutral-900/30 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
                      {job.pdfFileName || job.bookTitle}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : job.status === 'FAILED'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Attempts: {job.attempts}</span>
                    <span>{job.completedAt ? 'Finished' : 'Running'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              Audit Operations Log
            </h3>
            <div className="mt-3 space-y-2">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-b border-neutral-100 dark:border-neutral-900/60 pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-500">{log.action}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-neutral-600 dark:text-neutral-300 text-[11px] leading-snug line-clamp-2">
                    {log.metadata}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
