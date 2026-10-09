import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  FolderTree,
  History,
  Settings,
  Upload,
  CheckCircle,
  Archive,
  Smartphone,
  Calendar,
  CalendarDays,
  FolderKanban,
} from 'lucide-react';
import { Book, Chapter, PdfProcessingJob } from '../../lib/types';
import { ChapterManagerTree } from '../chapters/ChapterManagerTree';

interface BookDetailsViewProps {
  book: Book;
  chapters: Chapter[];
  jobs: PdfProcessingJob[];
  onBack: () => void;
  onUpdateBook: (updates: Partial<Book>) => Promise<void>;
  onPublishBook: (id: string) => Promise<void>;
  onArchiveBook: (id: string) => Promise<void>;
  onSaveChapters: (chapters: Chapter[]) => Promise<void>;
  onReprocessOutline: (mode: 'OUTLINE' | 'TEXT' | 'AI') => Promise<void>;
  onOpenUploadPdf: (bookId: string) => void;
  onOpenReaderSimulator: (bookId: string, initialPageIndex?: number) => void;
}

export const BookDetailsView: React.FC<BookDetailsViewProps> = ({
  book,
  chapters,
  jobs,
  onBack,
  onUpdateBook,
  onPublishBook,
  onArchiveBook,
  onSaveChapters,
  onReprocessOutline,
  onOpenUploadPdf,
  onOpenReaderSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'overview' | 'files' | 'history' | 'settings'>('chapters');

  const bookJobs = jobs.filter(j => j.bookId === book.id);
  const latestPdf = book.latestPdfFile;

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-md">
                {book.title}
              </h1>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  book.status === 'PUBLISHED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : book.status === 'DRAFT'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {book.status}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Subject: <strong>{book.subjectName}</strong> · Year: <strong>{book.year}</strong> · Slug: {book.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenReaderSimulator(book.id, 0)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
            <span>Expo Mobile Preview</span>
          </button>

          <button
            onClick={() => onOpenUploadPdf(book.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New PDF</span>
          </button>

          {book.status !== 'PUBLISHED' ? (
            <button
              onClick={() => onPublishBook(book.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Publish Book</span>
            </button>
          ) : (
            <button
              onClick={() => onArchiveBook(book.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === 'chapters'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Chapters & Outline Tree ({chapters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Overview & Classification</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF Files & Versions</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Processing Jobs ({bookJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Reader Access Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'chapters' && (
        <ChapterManagerTree
          book={book}
          chapters={chapters}
          onSaveChapters={onSaveChapters}
          onReprocessOutline={onReprocessOutline}
          onPreviewPage={(pageIdx) => onOpenReaderSimulator(book.id, pageIdx)}
        />
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover & Quick Specs */}
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-3">
            <img
              src={book.coverUrl}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-full h-64 object-cover rounded-md border border-neutral-200 dark:border-neutral-800"
            />
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Subject:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{book.subjectName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Curriculum Year:</span>
                <span className="font-mono font-semibold">{book.year}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Total Pages:</span>
                <span className="font-mono font-semibold tabular-nums">{book.totalPages} pp</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Access Tier:</span>
                <span className="font-mono font-semibold">
                  {book.isPaid ? `$${book.price.toFixed(2)} USD` : 'Free Public Book'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Language:</span>
                <span className="font-mono">{book.language.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Hierarchy Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Hierarchy Association
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Parent Subject</span>
                  </div>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{book.subjectName}</p>
                </div>

                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Target Year</span>
                  </div>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 font-mono">{book.year}</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Description & Syllabus Coverage
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {book.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                PDF File Versions & Object Storage
              </h3>
              <p className="text-[11px] text-neutral-500">
                PDF files are stored in private storage (R2/S3). Only metadata and SHA-256 hashes are persisted in MySQL.
              </p>
            </div>
            <button
              onClick={() => onOpenUploadPdf(book.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Version</span>
            </button>
          </div>

          {latestPdf ? (
            <div className="p-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span>Version {latestPdf.version}: {latestPdf.originalName}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {latestPdf.hasOutline ? 'Outline Extracted' : 'No Native Bookmarks'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <span>Storage Key:</span>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 truncate">{latestPdf.storageKey}</p>
                </div>
                <div>
                  <span>File Size:</span>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200">
                    {(latestPdf.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <span>SHA-256 Checksum:</span>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200 truncate" title={latestPdf.sha256}>
                    {latestPdf.sha256.slice(0, 16)}...
                  </p>
                </div>
                <div>
                  <span>Total Pages:</span>
                  <p className="font-mono text-neutral-800 dark:text-neutral-200">{latestPdf.totalPages} pages</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400">No PDF uploaded yet for this book.</p>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Processing Jobs & Extraction Attempts
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Job ID</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Attempts</th>
                <th className="py-2.5 px-3 font-medium">Started</th>
                <th className="py-2.5 px-4 font-medium">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {bookJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    No processing jobs recorded.
                  </td>
                </tr>
              ) : (
                bookJobs.map(job => (
                  <tr key={job.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40">
                    <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300">{job.id}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">{job.attempts}</td>
                    <td className="py-3 px-3 font-mono text-neutral-400 text-[11px]">
                      {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 text-[11px]">
                      {job.errorMessage || 'Processed without errors.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
              Reader Access Control
            </h3>
            <p className="text-[11px] text-neutral-500">
              Settings governing Expo React Native reader authorization for this title.
            </p>
          </div>

          <div className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">Payment Status</span>
              <span className="font-mono">{book.isPaid ? 'PAID ENFORCEMENT' : 'FREE CATALOG'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">Catalog Price</span>
              <span className="font-mono font-semibold">${book.price.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
