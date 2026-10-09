import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  BookOpen,
  List,
  ChevronLeft,
  ChevronRight,
  Unlock,
  Lock,
  SlidersHorizontal,
  FolderKanban,
  Calendar,
} from 'lucide-react';
import { Book, Chapter } from '../../lib/types';
import { apiClient } from '../../lib/api-client';

interface ExpoReaderSimulatorProps {
  books: Book[];
  initialBookId?: string;
  initialPageIndex?: number;
  onSelectBook: (bookId: string) => void;
}

export const ExpoReaderSimulator: React.FC<ExpoReaderSimulatorProps> = ({
  books,
  initialBookId,
  initialPageIndex = 0,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId || books[0]?.id || '');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(initialPageIndex);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const currentBook = books.find(b => b.id === selectedBookId) || books[0];

  useEffect(() => {
    if (!currentBook) return;
    apiClient.getPublicReaderChapters(currentBook.id).then(res => {
      if (res.data) setChapters(res.data);
    });

    apiClient.checkReadingAccess('usr-reader-01', currentBook.id).then(res => {
      setHasAccess(res.data?.hasAccess ?? true);
    });
  }, [currentBook?.id]);

  useEffect(() => {
    if (initialPageIndex !== undefined) {
      setCurrentPageIndex(initialPageIndex);
    }
  }, [initialPageIndex]);

  const totalPages = currentBook?.totalPages || 50;
  const progressPercent = Math.min(100, Math.round(((currentPageIndex + 1) / totalPages) * 100));

  const activeChapter = chapters
    .filter(c => c.pageIndex <= currentPageIndex)
    .sort((a, b) => b.pageIndex - a.pageIndex)[0];

  return (
    <div className="space-y-6">
      {/* Kicker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Expo React Native Reading App Simulator
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Subject → Year → Book hierarchy reading simulator consuming <code>/api/v1/books/:id/chapters</code>.
          </p>
        </div>

        {/* Book Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500 whitespace-nowrap">Active Book:</label>
          <select
            value={selectedBookId}
            onChange={(e) => {
              setSelectedBookId(e.target.value);
              setCurrentPageIndex(0);
            }}
            className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs font-medium text-neutral-900 dark:text-neutral-100"
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>
                [{b.subjectName} {b.year}] {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Device Frame */}
      <div className="flex justify-center items-center py-4">
        <div className="w-[360px] h-[680px] bg-neutral-950 rounded-[40px] p-3 shadow-2xl border-4 border-neutral-800 relative flex flex-col overflow-hidden">
          {/* Top Speaker Bar */}
          <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-neutral-800" />
          </div>

          {/* Screen Content Viewport */}
          <div className="flex-1 bg-white dark:bg-neutral-900 rounded-[28px] overflow-hidden flex flex-col relative text-neutral-900 dark:text-neutral-100 select-none">
            {/* App Header */}
            <div className="h-12 px-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
              <button
                onClick={() => setShowToc(!showToc)}
                className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                title="Table of Contents"
              >
                <List className="w-4 h-4" />
              </button>

              <div className="text-center min-w-0 px-2 flex-1">
                <span className="text-[11px] font-bold block truncate">
                  {currentBook?.title}
                </span>
                <span className="text-[9px] text-neutral-400 block truncate font-mono">
                  {currentBook?.subjectName} · {currentBook?.year}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-800"
                  title="Toggle typography scale"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <div title={hasAccess ? 'Entitlement verified' : 'Paid unlock required'}>
                  {hasAccess ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Reading Viewport */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono border-b border-neutral-200/60 dark:border-neutral-800 pb-1.5">
                  <span className="truncate max-w-[180px]">{currentBook?.title}</span>
                  <span className="tabular-nums">p. {currentPageIndex + 1} / {totalPages}</span>
                </div>

                {currentPageIndex === 0 ? (
                  <div className="py-6 text-center space-y-3">
                    <img
                      src={currentBook?.coverUrl}
                      alt={currentBook?.title}
                      referrerPolicy="no-referrer"
                      className="w-28 h-40 object-cover mx-auto rounded shadow-md border border-neutral-200 dark:border-neutral-800"
                    />
                    <h2 className="text-sm font-bold tracking-tight px-4 leading-snug">
                      {currentBook?.title}
                    </h2>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Subject: {currentBook?.subjectName} · Year: {currentBook?.year}
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {currentBook?.isPaid ? `$${currentBook.price.toFixed(2)} USD` : 'FREE EDITION'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                        {activeChapter?.level === 2 ? 'Section Heading' : 'Chapter Heading'}
                      </span>
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {activeChapter?.title || `Page ${currentPageIndex + 1}`}
                      </h3>
                      {activeChapter && (
                        <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                          Source: {activeChapter.source} · Target: {activeChapter.destinationX || 72}x, {activeChapter.destinationY || 720}y
                        </p>
                      )}
                    </div>

                    <div className={`space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif ${
                      fontSize === 'large' ? 'text-xs' : 'text-[11px]'
                    }`}>
                      <p>
                        Comprehensive preparation requires mastering structured syllabus divisions.
                        Every section matches the official {currentBook?.year} curriculum standards.
                      </p>
                      <p>
                        The chapter outline extracted from this source PDF links directly to page index{' '}
                        <strong className="font-mono text-neutral-900 dark:text-neutral-100">{currentPageIndex}</strong>{' '}
                        (printed page number {currentPageIndex + 1}).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>Reading Progress</span>
                  <span className="tabular-nums">{progressPercent}%</span>
                </div>
                <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-white transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="h-12 px-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="flex items-center gap-1 text-[11px] font-medium disabled:opacity-30 text-neutral-700 dark:text-neutral-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                {currentPageIndex + 1} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
                disabled={currentPageIndex >= totalPages - 1}
                className="flex items-center gap-1 text-[11px] font-medium disabled:opacity-30 text-neutral-700 dark:text-neutral-300"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TOC Drawer Overlay */}
            {showToc && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 flex flex-col justify-end">
                <div className="h-4/5 bg-white dark:bg-neutral-900 rounded-t-2xl flex flex-col p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold">Table of Contents</span>
                    <button
                      onClick={() => setShowToc(false)}
                      className="text-[11px] text-neutral-400 font-medium hover:text-neutral-800 dark:hover:text-neutral-100"
                    >
                      Done
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80 mt-2">
                    {chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setCurrentPageIndex(ch.pageIndex);
                          setShowToc(false);
                        }}
                        className={`w-full text-left py-2 px-1 flex items-center justify-between text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                          ch.level === 2 ? 'pl-4 text-neutral-600 dark:text-neutral-400' : 'font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{ch.title}</span>
                        <span className="font-mono text-[10px] text-neutral-400 tabular-nums shrink-0">
                          p. {ch.pageNumber}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
