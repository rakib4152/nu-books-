export interface CreateSubjectInput {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSubjectInput {
  name?: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateSubjectYearInput {
  subjectId: string;
  year: number;
  sortOrder?: number;
}

export interface UpdateSubjectYearInput {
  year?: number;
  sortOrder?: number;
}

export interface CreateBookInput {
  subjectYearId: string;
  title: string;
  slug?: string;
  description?: string;
  language?: string;
  isPaid: boolean;
  price?: number;
  coverUrl?: string;
}

export interface UpdateBookInput {
  subjectYearId?: string;
  title?: string;
  slug?: string;
  description?: string;
  language?: string;
  status?: 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED';
  isPaid?: boolean;
  price?: number;
  coverUrl?: string;
}

export interface CreateChapterInput {
  bookId: string;
  parentId?: string | null;
  title: string;
  chapterNumber?: number | null;
  sortOrder?: number;
  pageIndex: number;
  pageNumber?: number;
  destinationX?: number | null;
  destinationY?: number | null;
  level?: number;
  source?: 'PDF_OUTLINE' | 'TEXT_EXTRACTION' | 'OCR' | 'MANUAL' | 'AI';
  isVisible?: boolean;
}

export interface UpdateChapterInput {
  parentId?: string | null;
  title?: string;
  chapterNumber?: number | null;
  sortOrder?: number;
  pageIndex?: number;
  pageNumber?: number;
  destinationX?: number | null;
  destinationY?: number | null;
  level?: number;
  source?: 'PDF_OUTLINE' | 'TEXT_EXTRACTION' | 'OCR' | 'MANUAL' | 'AI';
  isVisible?: boolean;
}

export interface ReorderChaptersInput {
  chapters: Array<{
    id: string;
    sortOrder: number;
    parentId?: string | null;
    level?: number;
  }>;
}
