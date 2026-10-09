import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SubjectsView } from './components/subjects/SubjectsView';
import { YearsView } from './components/years/YearsView';
import { BookTable } from './components/books/BookTable';
import { BookDetailsView } from './components/books/BookDetailsView';
import { BookCreateModal } from './components/books/BookCreateModal';
import { BookUploadPdfModal } from './components/books/BookUploadPdfModal';
import { JobsTable } from './components/processing/JobsTable';
import { AccessManagementView } from './components/access/AccessManagementView';
import { ExpoReaderSimulator } from './components/pdf/ExpoReaderSimulator';
import { ArchitectureGuideModal } from './components/architecture/ArchitectureGuideModal';

import { db } from './lib/database';
import { apiClient } from './lib/api-client';
import { Book, Chapter, Subject, SubjectYear, PdfProcessingJob, DashboardStats, Entitlement, AuditLog } from './lib/types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item filters
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedSubjectIdForYears, setSelectedSubjectIdForYears] = useState<string | undefined>(undefined);
  const [simulatorInitialPage, setSimulatorInitialPage] = useState<number>(0);

  // Modals
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [uploadPdfBookId, setUploadPdfBookId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State from database
  const [stats, setStats] = useState<DashboardStats>(db.getDashboardStats());
  const [subjects, setSubjects] = useState<Subject[]>(db.getSubjects());
  const [subjectYears, setSubjectYears] = useState<SubjectYear[]>(db.getSubjectYears());
  const [books, setBooks] = useState<Book[]>(db.getBooks());
  const [jobs, setJobs] = useState<PdfProcessingJob[]>(db.processingJobs);
  const [users, setUsers] = useState(db.users);
  const [entitlements, setEntitlements] = useState<Entitlement[]>(db.entitlements);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(db.auditLogs);

  const refreshState = () => {
    setStats(db.getDashboardStats());
    setSubjects(db.getSubjects());
    setSubjectYears(db.getSubjectYears());
    setBooks(db.getBooks());
    setJobs([...db.processingJobs]);
    setUsers([...db.users]);
    setEntitlements([...db.entitlements]);
    setAuditLogs([...db.auditLogs]);
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Subject Handlers
  const handleCreateSubject = async (data: any) => {
    const res = await apiClient.createSubject(data);
    if (res.success) {
      showToast('success', `Subject "${data.name}" created.`);
      refreshState();
    } else {
      showToast('error', res.error?.message || 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async (id: string, updates: any) => {
    const res = await apiClient.updateSubject(id, updates);
    if (res.success) {
      showToast('success', 'Subject updated.');
      refreshState();
    } else {
      showToast('error', res.error?.message || 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    const res = await apiClient.deleteSubject(id);
    if (res.success) {
      showToast('info', 'Subject deleted.');
      refreshState();
    } else {
      showToast('error', res.error?.message || 'Cannot delete subject');
    }
  };

  // Year Handlers
  const handleCreateYear = async (data: any) => {
    const res = await apiClient.createSubjectYear(data);
    if (res.success) {
      showToast('success', `Year ${data.year} added to subject.`);
      refreshState();
    } else {
      showToast('error', res.error?.message || 'Failed to create year');
    }
  };

  const handleUpdateYear = async (id: string, updates: any) => {
    const res = await apiClient.updateSubjectYear(id, updates);
    if (res.success) {
      showToast('success', 'Year updated.');
      refreshState();
    } else {
      showToast('error', res.error?.message || 'Failed to update year');
    }
  };

  const handleDeleteYear = async (id: string) => {
    const res = await apiClient.deleteSubjectYear(id);
    if (res.success) {
      showToast('info', 'Year deleted.');
      refreshState();
    } else {
      showToast('error', res.error?.message || 'Cannot delete year');
    }
  };

  // Book Handlers
  const handleCreateBook = async (payload: { bookData: any; pdfFile?: File }) => {
    try {
      const res = await apiClient.createBook(payload.bookData);
      if (res.success && res.data) {
        if (payload.pdfFile) {
          showToast('info', 'Book created! Parsing PDF outline extraction...');
          await apiClient.uploadPdfAndExtract(res.data.id, payload.pdfFile);
          showToast('success', `PDF processed! Chapters extracted and saved.`);
        } else {
          showToast('success', `Book "${res.data.title}" created.`);
        }
        refreshState();
        setSelectedBookId(res.data.id);
      } else {
        showToast('error', res.error?.message || 'Failed to create book');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create book');
    }
  };

  const handleUpdateBook = async (bookId: string, updates: Partial<Book>) => {
    const res = await apiClient.updateBook(bookId, updates);
    if (res.success) {
      showToast('success', 'Book metadata updated.');
      refreshState();
    }
  };

  const handlePublishBook = async (bookId: string) => {
    const res = await apiClient.publishBook(bookId);
    if (res.success) {
      showToast('success', 'Book published to reader catalog.');
      refreshState();
    }
  };

  const handleArchiveBook = async (bookId: string) => {
    const res = await apiClient.archiveBook(bookId);
    if (res.success) {
      showToast('info', 'Book moved to archives.');
      refreshState();
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const res = await apiClient.deleteBook(bookId);
    if (res.success) {
      showToast('info', 'Book deleted.');
      if (selectedBookId === bookId) setSelectedBookId(null);
      refreshState();
    }
  };

  const handleUploadPdf = async (bookId: string, file: File, forceMode?: 'OUTLINE' | 'TEXT' | 'AI') => {
    showToast('info', 'Uploading and parsing PDF outline...');
    const res = await apiClient.uploadPdfAndExtract(bookId, file, forceMode);
    if (res.success) {
      showToast('success', `Outline parsed! ${res.data?.extractedChapters.length} chapters extracted.`);
      refreshState();
    } else {
      showToast('error', res.error?.message || 'PDF extraction encountered an issue.');
      refreshState();
    }
  };

  const handleSaveChapters = async (bookId: string, updatedChapters: Chapter[]) => {
    const reorderPayload = updatedChapters.map(c => ({
      id: c.id,
      sortOrder: c.sortOrder,
      parentId: c.parentId,
      level: c.level,
    }));

    await apiClient.reorderChapters(bookId, reorderPayload);

    for (const ch of updatedChapters) {
      await apiClient.updateChapter(ch.id, {
        title: ch.title,
        chapterNumber: ch.chapterNumber,
        pageIndex: ch.pageIndex,
        destinationX: ch.destinationX,
        destinationY: ch.destinationY,
        source: ch.source,
        isVisible: ch.isVisible,
      });
    }

    showToast('success', 'Chapter tree and page destinations saved.');
    refreshState();
  };

  const handleReprocessOutline = async (bookId: string, mode: 'OUTLINE' | 'TEXT' | 'AI') => {
    const book = db.getBookById(bookId);
    if (!book) return;

    showToast('info', `Re-extracting document outline (${mode})...`);
    const latestPdf = book.latestPdfFile;
    if (latestPdf) {
      const fileData = db.pdfFiles.find(p => p.id === latestPdf.id);
      if (fileData) {
        await apiClient.uploadPdfAndExtract(
          bookId,
          { name: fileData.originalName, buffer: new ArrayBuffer(fileData.fileSize) },
          mode
        );
        showToast('success', 'Outline re-extracted.');
        refreshState();
      }
    }
  };

  const handleRetryJob = async (jobId: string) => {
    showToast('info', 'Retrying processing job...');
    const res = await apiClient.retryJob(jobId);
    if (res.success) {
      showToast('success', 'Job recovered and completed.');
      refreshState();
    }
  };

  const handleLaunchSimulator = (bookId: string, pageIdx: number = 0) => {
    setSelectedBookId(bookId);
    setSimulatorInitialPage(pageIdx);
    setCurrentTab('reader-simulator');
  };

  // Breadcrumbs
  const getBreadcrumb = (): string[] => {
    if (selectedBookId && currentTab === 'books') {
      const b = books.find(item => item.id === selectedBookId);
      return ['Books', b ? `${b.subjectName} / ${b.year}` : '', b ? b.title : selectedBookId];
    }
    const tabLabels: Record<NavTab, string> = {
      dashboard: 'Dashboard',
      subjects: 'Subject Management',
      years: 'Curriculum Years',
      books: 'Books Catalog',
      processing: 'PDF Processing Queue',
      access: 'Access Management',
      'reader-simulator': 'Expo Reader Simulator',
      architecture: 'Settings & Hostinger Guide',
    };
    return [tabLabels[currentTab]];
  };

  const selectedBook = selectedBookId ? books.find(b => b.id === selectedBookId) : null;
  const selectedBookChapters = selectedBookId ? db.getChaptersByBookId(selectedBookId) : [];

  return (
    <div className={`min-h-screen flex bg-neutral-100/60 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 antialiased ${theme}`}>
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'books') setSelectedBookId(null);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeProcessingCount={stats.activeProcessingCount}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          breadcrumb={getBreadcrumb()}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenCreateBook={() => setIsCreateBookOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* 1. Dashboard */}
            {currentTab === 'dashboard' && (
              <DashboardOverview
                stats={stats}
                books={books}
                jobs={jobs}
                logs={auditLogs}
                onSelectBook={(bId) => {
                  setSelectedBookId(bId);
                  setCurrentTab('books');
                }}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenCreateBook={() => setIsCreateBookOpen(true)}
              />
            )}

            {/* 2. Subjects */}
            {currentTab === 'subjects' && (
              <SubjectsView
                subjects={subjects}
                onCreateSubject={handleCreateSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                onNavigateToYears={(subId) => {
                  setSelectedSubjectIdForYears(subId);
                  setCurrentTab('years');
                }}
              />
            )}

            {/* 3. Years */}
            {currentTab === 'years' && (
              <YearsView
                subjects={subjects}
                subjectYears={subjectYears}
                selectedSubjectId={selectedSubjectIdForYears}
                onSelectSubjectId={setSelectedSubjectIdForYears}
                onCreateYear={handleCreateYear}
                onUpdateYear={handleUpdateYear}
                onDeleteYear={handleDeleteYear}
                onNavigateToBooks={() => setCurrentTab('books')}
              />
            )}

            {/* 4. Books Table */}
            {currentTab === 'books' && !selectedBook && (
              <BookTable
                books={books}
                subjects={subjects}
                subjectYears={subjectYears}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectBook={(bId) => setSelectedBookId(bId)}
                onOpenCreateBook={() => setIsCreateBookOpen(true)}
                onPublishBook={handlePublishBook}
                onArchiveBook={handleArchiveBook}
                onDeleteBook={handleDeleteBook}
                onOpenUploadPdf={(bId) => setUploadPdfBookId(bId)}
              />
            )}

            {/* 4B. Book Details & Chapter Tree */}
            {currentTab === 'books' && selectedBook && (
              <BookDetailsView
                book={selectedBook}
                chapters={selectedBookChapters}
                jobs={jobs}
                onBack={() => setSelectedBookId(null)}
                onUpdateBook={(updates) => handleUpdateBook(selectedBook.id, updates)}
                onPublishBook={() => handlePublishBook(selectedBook.id)}
                onArchiveBook={() => handleArchiveBook(selectedBook.id)}
                onSaveChapters={(updated) => handleSaveChapters(selectedBook.id, updated)}
                onReprocessOutline={(mode) => handleReprocessOutline(selectedBook.id, mode)}
                onOpenUploadPdf={(bId) => setUploadPdfBookId(bId)}
                onOpenReaderSimulator={handleLaunchSimulator}
              />
            )}

            {/* 5. PDF Processing */}
            {currentTab === 'processing' && (
              <JobsTable
                jobs={jobs}
                onRetryJob={handleRetryJob}
                onSelectBook={(bId) => {
                  setSelectedBookId(bId);
                  setCurrentTab('books');
                }}
              />
            )}

            {/* 6. Access Management */}
            {currentTab === 'access' && (
              <AccessManagementView
                users={users}
                entitlements={entitlements}
                auditLogs={auditLogs}
                books={books}
              />
            )}

            {/* 7. Expo Reader Simulator */}
            {currentTab === 'reader-simulator' && (
              <ExpoReaderSimulator
                books={books}
                initialBookId={selectedBookId || undefined}
                initialPageIndex={simulatorInitialPage}
                onSelectBook={(bId) => setSelectedBookId(bId)}
              />
            )}

            {/* 8. Architecture & Settings */}
            {currentTab === 'architecture' && (
              <ArchitectureGuideModal />
            )}
          </div>
        </main>
      </div>

      {/* Create Book Modal */}
      <BookCreateModal
        isOpen={isCreateBookOpen}
        onClose={() => setIsCreateBookOpen(false)}
        subjects={subjects}
        subjectYears={subjectYears}
        onSubmit={handleCreateBook}
      />

      {/* Upload PDF Modal */}
      {uploadPdfBookId && (
        <BookUploadPdfModal
          isOpen={!!uploadPdfBookId}
          book={books.find(b => b.id === uploadPdfBookId) || null}
          onClose={() => setUploadPdfBookId(null)}
          onUpload={handleUploadPdf}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-lg text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800 dark:bg-white dark:text-neutral-900'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-neutral-800 text-white border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span className="font-medium leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
