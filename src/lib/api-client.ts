import { db } from './database';
import { Book, Chapter, Subject, SubjectYear, PdfProcessingJob, DashboardStats, Entitlement, AuditLog } from './types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * FolioPress REST API Client v1
 * Clean interfaces mapping directly to /api/v1 routes
 */
export const apiClient = {
  // Auth
  async getCurrentUser() {
    return {
      success: true,
      data: db.users[0],
    };
  },

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return {
      success: true,
      data: db.getDashboardStats(),
    };
  },

  async getRecentActivity(): Promise<ApiResponse<AuditLog[]>> {
    return {
      success: true,
      data: db.auditLogs.slice(0, 10),
    };
  },

  // Subjects
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    return {
      success: true,
      data: db.getSubjects(),
    };
  },

  async getSubject(id: string): Promise<ApiResponse<Subject>> {
    const sub = db.getSubjectById(id);
    if (!sub) return { success: false, error: { code: 'NOT_FOUND', message: 'Subject not found' } };
    return { success: true, data: sub };
  },

  async createSubject(data: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }): Promise<ApiResponse<Subject>> {
    try {
      const subject = db.createSubject(data);
      return { success: true, data: subject };
    } catch (err: any) {
      return { success: false, error: { code: 'CREATE_FAILED', message: err.message } };
    }
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<ApiResponse<Subject>> {
    try {
      const subject = db.updateSubject(id, updates);
      return { success: true, data: subject };
    } catch (err: any) {
      return { success: false, error: { code: 'UPDATE_FAILED', message: err.message } };
    }
  },

  async deleteSubject(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const deleted = db.deleteSubject(id);
      return { success: deleted, data: { deleted } };
    } catch (err: any) {
      return { success: false, error: { code: 'DELETE_FAILED', message: err.message } };
    }
  },

  // Subject Years
  async getSubjectYears(subjectId?: string): Promise<ApiResponse<SubjectYear[]>> {
    return {
      success: true,
      data: db.getSubjectYears(subjectId),
    };
  },

  async createSubjectYear(data: { subjectId: string; year: number; sortOrder?: number }): Promise<ApiResponse<SubjectYear>> {
    try {
      const year = db.createSubjectYear(data);
      return { success: true, data: year };
    } catch (err: any) {
      return { success: false, error: { code: 'CREATE_FAILED', message: err.message } };
    }
  },

  async updateSubjectYear(id: string, updates: { year?: number; sortOrder?: number }): Promise<ApiResponse<SubjectYear>> {
    try {
      const updated = db.updateSubjectYear(id, updates);
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: { code: 'UPDATE_FAILED', message: err.message } };
    }
  },

  async deleteSubjectYear(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const deleted = db.deleteSubjectYear(id);
      return { success: deleted, data: { deleted } };
    } catch (err: any) {
      return { success: false, error: { code: 'DELETE_FAILED', message: err.message } };
    }
  },

  // Books
  async getBooks(): Promise<ApiResponse<Book[]>> {
    return {
      success: true,
      data: db.getBooks(),
    };
  },

  async getBook(id: string): Promise<ApiResponse<Book>> {
    const book = db.getBookById(id);
    if (!book) {
      return { success: false, error: { code: 'NOT_FOUND', message: `Book ${id} was not found` } };
    }
    return { success: true, data: book };
  },

  async createBook(payload: {
    subjectYearId: string;
    title: string;
    slug?: string;
    description?: string;
    language?: string;
    isPaid: boolean;
    price?: number;
    coverUrl?: string;
  }): Promise<ApiResponse<Book>> {
    try {
      const book = db.createBook(payload);
      return { success: true, data: book };
    } catch (err: any) {
      return { success: false, error: { code: 'CREATE_FAILED', message: err.message } };
    }
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<ApiResponse<Book>> {
    try {
      const book = db.updateBook(id, updates);
      return { success: true, data: book };
    } catch (err: any) {
      return { success: false, error: { code: 'UPDATE_FAILED', message: err.message } };
    }
  },

  async deleteBook(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const success = db.deleteBook(id);
    return { success, data: { deleted: success } };
  },

  async publishBook(id: string): Promise<ApiResponse<Book>> {
    const book = db.updateBook(id, { status: 'PUBLISHED' });
    return { success: true, data: book };
  },

  async archiveBook(id: string): Promise<ApiResponse<Book>> {
    const book = db.updateBook(id, { status: 'ARCHIVED' });
    return { success: true, data: book };
  },

  // PDF Upload & Extraction
  async uploadPdfAndExtract(
    bookId: string,
    file: File | { name: string; buffer: ArrayBuffer; type?: string },
    forceMode?: 'OUTLINE' | 'TEXT' | 'AI'
  ): Promise<ApiResponse<{ pdfFile: any; job: PdfProcessingJob; extractedChapters: Chapter[] }>> {
    try {
      const result = await db.handlePdfUploadAndExtract(bookId, file, forceMode);
      return { success: true, data: result };
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'EXTRACTION_FAILED', message: err.message || 'PDF extraction encountered an error' },
      };
    }
  },

  // Chapters
  async getChapters(bookId: string): Promise<ApiResponse<Chapter[]>> {
    const chapters = db.getChaptersByBookId(bookId);
    return { success: true, data: chapters };
  },

  async createChapter(payload: {
    bookId: string;
    parentId?: string | null;
    title: string;
    chapterNumber?: number | null;
    sortOrder?: number;
    pageIndex: number;
    destinationX?: number | null;
    destinationY?: number | null;
    level?: number;
    source?: any;
    isVisible?: boolean;
  }): Promise<ApiResponse<Chapter>> {
    const chapter = db.createChapter(payload);
    return { success: true, data: chapter };
  },

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<ApiResponse<Chapter>> {
    try {
      const chapter = db.updateChapter(id, updates);
      return { success: true, data: chapter };
    } catch (err: any) {
      return { success: false, error: { code: 'UPDATE_FAILED', message: err.message } };
    }
  },

  async deleteChapter(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const deleted = db.deleteChapter(id);
    return { success: deleted, data: { deleted } };
  },

  async reorderChapters(
    bookId: string,
    items: Array<{ id: string; sortOrder: number; parentId?: string | null; level?: number }>
  ): Promise<ApiResponse<{ count: number }>> {
    db.reorderChapters(bookId, items);
    return { success: true, data: { count: items.length } };
  },

  // Processing Jobs
  async getProcessingJobs(): Promise<ApiResponse<PdfProcessingJob[]>> {
    return { success: true, data: db.processingJobs };
  },

  async retryJob(jobId: string): Promise<ApiResponse<PdfProcessingJob>> {
    try {
      const job = await db.retryJob(jobId);
      return { success: true, data: job };
    } catch (err: any) {
      return { success: false, error: { code: 'RETRY_FAILED', message: err.message } };
    }
  },

  // Users & Entitlements
  async getUsers(): Promise<ApiResponse<any[]>> {
    return { success: true, data: db.users };
  },

  async getEntitlements(): Promise<ApiResponse<Entitlement[]>> {
    return { success: true, data: db.entitlements };
  },

  // Public Reader API (for Expo React Native App consumption)
  async getPublicReaderCatalog(): Promise<ApiResponse<Book[]>> {
    const published = db.getBooks().filter(b => b.status === 'PUBLISHED');
    return { success: true, data: published };
  },

  async getPublicReaderChapters(bookId: string): Promise<ApiResponse<Chapter[]>> {
    const visibleChapters = db.getChaptersByBookId(bookId).filter(c => c.isVisible);
    return { success: true, data: visibleChapters };
  },

  async checkReadingAccess(userId: string, bookId: string): Promise<ApiResponse<{ hasAccess: boolean; reason: string }>> {
    const book = db.getBookById(bookId);
    if (!book) return { success: false, error: { code: 'NOT_FOUND', message: 'Book not found' } };
    if (!book.isPaid) return { success: true, data: { hasAccess: true, reason: 'FREE_BOOK' } };

    const entitlement = db.entitlements.find(e => e.userId === userId && e.bookId === bookId && e.status === 'ACTIVE');
    return {
      success: true,
      data: {
        hasAccess: !!entitlement,
        reason: entitlement ? 'ACTIVE_ENTITLEMENT' : 'PURCHASE_REQUIRED',
      },
    };
  },
};
