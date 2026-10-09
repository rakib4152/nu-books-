export type Role = 'ADMIN' | 'EDITOR' | 'USER';
export type BookStatus = 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED';
export type ChapterSource = 'PDF_OUTLINE' | 'TEXT_EXTRACTION' | 'OCR' | 'MANUAL' | 'AI';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type EntitlementStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  years?: SubjectYearDto[];
  bookCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectYearDto {
  id: string;
  subjectId: string;
  subjectName?: string;
  year: number;
  sortOrder: number;
  bookCount?: number;
  books?: BookDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDto {
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
  level: number;
  source: ChapterSource;
  isVisible: boolean;
  children?: ChapterDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PdfFileDto {
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

export interface PdfProcessingJobDto {
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

export interface BookDto {
  id: string;
  subjectYearId: string;
  subjectId?: string;
  subjectName?: string;
  year?: number;
  title: string;
  slug: string;
  description?: string | null;
  language: string;
  coverUrl?: string | null;
  status: BookStatus;
  isPaid: boolean;
  price: number;
  totalPages: number;
  latestPdfFile?: PdfFileDto | null;
  chapterCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStatsDto {
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    requestId?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
