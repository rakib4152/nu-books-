export type Role = 'ADMIN' | 'EDITOR' | 'USER';
export type BookStatus = 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED';
export type ChapterSource = 'PDF_OUTLINE' | 'TEXT_EXTRACTION' | 'OCR' | 'MANUAL' | 'AI';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type EntitlementStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  bookCount?: number;
  yearCount?: number;
  years?: SubjectYear[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectYear {
  id: string;
  subjectId: string;
  subjectName?: string;
  year: number;
  sortOrder: number;
  bookCount?: number;
  books?: Book[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  parentId?: string | null;
  title: string;
  chapterNumber?: number | null;
  sortOrder: number;
  pageIndex: number; // 0-based
  pageNumber: number; // 1-based
  destinationX?: number | null;
  destinationY?: number | null;
  level: number; // 1: chapter, 2: section, 3: subsection
  source: ChapterSource;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterNode extends Chapter {
  children?: ChapterNode[];
}

export interface PdfFile {
  id: string;
  bookId: string;
  version: number;
  originalName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
  totalPages: number;
  hasOutline: boolean;
  outlineExtractedAt?: string | null;
  createdAt: string;
}

export interface PdfProcessingJob {
  id: string;
  bookId: string;
  bookTitle?: string;
  pdfFileId?: string | null;
  pdfFileName?: string | null;
  status: JobStatus;
  attempts: number;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  subjectYearId: string;
  subjectId: string;
  subjectName: string;
  year: number;
  title: string;
  slug: string;
  description?: string;
  language: string;
  coverUrl?: string;
  status: BookStatus;
  isPaid: boolean;
  price: number;
  totalPages: number;
  latestPdfFile?: PdfFile | null;
  chapterCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  status: EntitlementStatus;
  purchasedAt: string;
  expiresAt?: string | null;
  paymentReference?: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSubjects: number;
  totalSubjectYears: number;
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  failedJobs: number;
  totalChapters: number;
  recentUploadsCount: number;
  activeProcessingCount: number;
  totalUsers: number;
}
