import React, { useState } from 'react';
import {
  Search,
  Plus,
  Upload,
  CheckCircle,
  Archive,
  Trash2,
  FolderTree,
  Calendar,
} from 'lucide-react';
import { Book, Subject, SubjectYear } from '../../lib/types';

interface BookTableProps {
  books: Book[];
  subjects: Subject[];
  subjectYears: SubjectYear[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectBook: (bookId: string) => void;
  onOpenCreateBook: () => void;
  onPublishBook: (bookId: string) => void;
  onArchiveBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onOpenUploadPdf: (bookId: string) => void;
  initialSubjectYearFilter?: string;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  subjects,
  subjectYears,
  searchQuery,
  onSearchChange,
  onSelectBook,
  onOpenCreateBook,
  onPublishBook,
  onArchiveBook,
  onDeleteBook,
  onOpenUploadPdf,
  initialSubjectYearFilter,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [priceFilter, setPriceFilter] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Available years based on selected subject
  const availableYears = subjectYears
    .filter(sy => subjectFilter === 'ALL' || sy.subjectId === subjectFilter)
    .map(sy => sy.year);
  const uniqueYears = Array.from(new Set(availableYears)).sort((a, b) => b - a);

  const filteredBooks = books.filter((b) => {
    // Search
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.year).includes(searchQuery);

    // Subject
    const matchesSubject = subjectFilter === 'ALL' || b.subjectId === subjectFilter;

    // Year
    const matchesYear = yearFilter === 'ALL' || String(b.year) === yearFilter;

    // Status
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    // Price
    const matchesPrice =
      priceFilter === 'ALL' ||
      (priceFilter === 'PAID' && b.isPaid) ||
      (priceFilter === 'FREE' && !b.isPaid);

    return matchesSearch && matchesSubject && matchesYear && matchesStatus && matchesPrice;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Books Catalog</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Digital books organized by Subject → Year with automatic chapter outline extraction.
          </p>
        </div>

        <button
          onClick={onOpenCreateBook}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Book</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-md">
          {['ALL', 'PUBLISHED', 'DRAFT', 'PROCESSING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                statusFilter === st
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Subject Dropdown */}
        <select
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setYearFilter('ALL');
          }}
          className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none font-mono"
        >
          <option value="ALL">All Years</option>
          {uniqueYears.map((yr) => (
            <option key={yr} value={String(yr)}>
              Year {yr}
            </option>
          ))}
        </select>

        {/* Paid / Free Dropdown */}
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
        >
          <option value="ALL">All Tiers (Paid & Free)</option>
          <option value="PAID">Paid Only</option>
          <option value="FREE">Free Only</option>
        </select>

        <span className="ml-auto text-[11px] font-mono text-neutral-400 tabular-nums">
          {filteredBooks.length} books found
        </span>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Cover & Title</th>
                <th className="py-2.5 px-3 font-medium">Subject</th>
                <th className="py-2.5 px-3 font-medium">Year</th>
                <th className="py-2.5 px-3 font-medium">PDF Version</th>
                <th className="py-2.5 px-3 font-medium">Pages</th>
                <th className="py-2.5 px-3 font-medium">Chapters</th>
                <th className="py-2.5 px-3 font-medium">Tier & Price</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400 text-xs">
                    No books found matching the selected Subject and Year filters.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-9 h-12 object-cover rounded border border-neutral-200 dark:border-neutral-800 shrink-0 cursor-pointer"
                          onClick={() => onSelectBook(book.id)}
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => onSelectBook(book.id)}
                            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline text-left truncate max-w-[240px] block"
                          >
                            {book.title}
                          </button>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5 font-mono">
                            <span>{book.slug}</span>
                            <span>·</span>
                            <span>{book.language.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                      {book.subjectName}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      {book.year}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {book.latestPdfFile ? `v${book.latestPdfFile.version}` : 'No PDF'}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {book.totalPages} pp
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                        <span>{book.chapterCount || 0}</span>
                        {book.latestPdfFile?.hasOutline && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400" title="PDF Outline Present">
                            [Outline]
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums">
                      {book.isPaid ? (
                        <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                          ${book.price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Free
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          book.status === 'PUBLISHED'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : book.status === 'DRAFT'
                            ? 'text-neutral-500 dark:text-neutral-400'
                            : book.status === 'PROCESSING'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectBook(book.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Open chapters and details"
                        >
                          Chapters
                        </button>

                        <button
                          onClick={() => onOpenUploadPdf(book.id)}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="Upload new PDF version"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>

                        {book.status !== 'PUBLISHED' ? (
                          <button
                            onClick={() => onPublishBook(book.id)}
                            className="p-1 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Publish book"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onArchiveBook(book.id)}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            title="Archive book"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirmId(book.id)}
                          className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Confirm Book Deletion
            </h3>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to delete this book? This will execute a cascade deletion across
              all associated chapters, PDF files, and processing jobs.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteBook(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
