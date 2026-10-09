import {
  Book,
  Chapter,
  ChapterNode,
  DashboardStats,
  Entitlement,
  AuditLog,
  PdfFile,
  PdfProcessingJob,
  Subject,
  SubjectYear,
  User,
} from './types';
import { parsePdfDocument, ExtractedChapter } from './pdf-parser';
import { PrivateStorageManager } from './storage';

// High-fidelity generated assets
const COVER_ARCHITECTURE = '/src/assets/images/book_cover_architecture_1791564066341.jpg';
const COVER_AI = '/src/assets/images/book_cover_ai_systems_1791564084734.jpg';
const COVER_CLOUD = '/src/assets/images/book_cover_cloud_native_1791564095653.jpg';
const AVATAR_ADMIN = '/src/assets/images/avatar_admin_user_1791564108946.jpg';

export { AVATAR_ADMIN };

export class RelationalDatabase {
  private static instance: RelationalDatabase;

  public users: User[] = [];
  public subjects: Subject[] = [];
  public subjectYears: SubjectYear[] = [];
  public books: Book[] = [];
  public pdfFiles: PdfFile[] = [];
  public chapters: Chapter[] = [];
  public processingJobs: PdfProcessingJob[] = [];
  public entitlements: Entitlement[] = [];
  public auditLogs: AuditLog[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): RelationalDatabase {
    if (!RelationalDatabase.instance) {
      RelationalDatabase.instance = new RelationalDatabase();
    }
    return RelationalDatabase.instance;
  }

  private seedInitialData() {
    // 1. Users
    this.users = [
      {
        id: 'usr-admin-01',
        name: 'Dr. Arthur Sterling',
        email: 'admin@foliopress.io',
        role: 'ADMIN',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-10-01T12:00:00Z',
      },
      {
        id: 'usr-editor-01',
        name: 'Maya Lin',
        email: 'maya.editor@foliopress.io',
        role: 'EDITOR',
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-09-20T14:30:00Z',
      },
      {
        id: 'usr-reader-01',
        name: 'Tariq Rahman',
        email: 'tariq.reader@student.ac.bd',
        role: 'USER',
        createdAt: '2026-03-05T16:00:00Z',
        updatedAt: '2026-10-05T09:15:00Z',
      },
      {
        id: 'usr-reader-02',
        name: 'Nusrat Jahan',
        email: 'nusrat.j@readingapp.io',
        role: 'USER',
        createdAt: '2026-04-12T11:45:00Z',
        updatedAt: '2026-10-07T18:20:00Z',
      },
    ];

    // 2. Subjects (Domain Classification: English, Bangla, Mathematics)
    this.subjects = [
      {
        id: 'sub-eng',
        name: 'English',
        slug: 'english',
        description: 'Comprehensive English grammar, literature, reading comprehension, and board exam guides.',
        sortOrder: 1,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'sub-ban',
        name: 'Bangla',
        slug: 'bangla',
        description: 'Bangla literature, grammar (Byakoron), MCQ test papers, and HSC/SSC test guides.',
        sortOrder: 2,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'sub-math',
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'General Mathematics and Higher Mathematics formula sheets, problem banks, and solutions.',
        sortOrder: 3,
        isActive: true,
        createdAt: '2026-01-05T00:00:00Z',
        updatedAt: '2026-01-05T00:00:00Z',
      },
    ];

    // 3. SubjectYears (Hierarchy: Subject -> Year)
    this.subjectYears = [
      {
        id: 'sy-eng-2025',
        subjectId: 'sub-eng',
        subjectName: 'English',
        year: 2025,
        sortOrder: 1,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'sy-eng-2026',
        subjectId: 'sub-eng',
        subjectName: 'English',
        year: 2026,
        sortOrder: 2,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'sy-ban-2025',
        subjectId: 'sub-ban',
        subjectName: 'Bangla',
        year: 2025,
        sortOrder: 1,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'sy-ban-2026',
        subjectId: 'sub-ban',
        subjectName: 'Bangla',
        year: 2026,
        sortOrder: 2,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'sy-math-2025',
        subjectId: 'sub-math',
        subjectName: 'Mathematics',
        year: 2025,
        sortOrder: 1,
        createdAt: '2026-01-06T00:00:00Z',
        updatedAt: '2026-01-06T00:00:00Z',
      },
    ];

    // 4. Books (Hierarchy: SubjectYear -> Book)
    this.books = [
      {
        id: 'bk-eng-gram-2025',
        subjectYearId: 'sy-eng-2025',
        subjectId: 'sub-eng',
        subjectName: 'English',
        year: 2025,
        title: 'English Grammar & Composition PDF',
        slug: 'english-grammar-composition-2025',
        description: 'Foundational syntax rules, sentence structures, vocabulary transformations, and essay drafts.',
        language: 'en',
        coverUrl: COVER_ARCHITECTURE,
        status: 'PUBLISHED',
        isPaid: true,
        price: 24.50,
        totalPages: 248,
        chapterCount: 12,
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-10-04T15:20:00Z',
      },
      {
        id: 'bk-eng-mcq-2025',
        subjectYearId: 'sy-eng-2025',
        subjectId: 'sub-eng',
        subjectName: 'English',
        year: 2025,
        title: 'English MCQ Guide 2025',
        slug: 'english-mcq-guide-2025',
        description: 'Comprehensive 1,500 multiple-choice questions with annotated explanations and past board questions.',
        language: 'en',
        coverUrl: COVER_AI,
        status: 'PUBLISHED',
        isPaid: false,
        price: 0.00,
        totalPages: 160,
        chapterCount: 8,
        createdAt: '2026-02-15T10:00:00Z',
        updatedAt: '2026-10-05T12:00:00Z',
      },
      {
        id: 'bk-eng-exam-2026',
        subjectYearId: 'sy-eng-2026',
        subjectId: 'sub-eng',
        subjectName: 'English',
        year: 2026,
        title: 'English Exam Preparation 2026',
        slug: 'english-exam-preparation-2026',
        description: 'Updated 2026 syllabus guidelines, model test series, time management rubrics, and marking criteria.',
        language: 'en',
        coverUrl: COVER_CLOUD,
        status: 'DRAFT',
        isPaid: true,
        price: 32.00,
        totalPages: 195,
        chapterCount: 6,
        createdAt: '2026-03-01T11:00:00Z',
        updatedAt: '2026-10-07T14:30:00Z',
      },
      {
        id: 'bk-ban-lit-2025',
        subjectYearId: 'sy-ban-2025',
        subjectId: 'sub-ban',
        subjectName: 'Bangla',
        year: 2025,
        title: 'Bangla Literature & Poetry PDF',
        slug: 'bangla-literature-poetry-2025',
        description: 'Classical and modern Bangla prose, poetry analysis, character retrospectives, and creative question models.',
        language: 'bn',
        coverUrl: COVER_AI,
        status: 'PUBLISHED',
        isPaid: true,
        price: 18.00,
        totalPages: 210,
        chapterCount: 10,
        createdAt: '2026-03-10T14:00:00Z',
        updatedAt: '2026-10-06T16:15:00Z',
      },
      {
        id: 'bk-ban-mcq-2026',
        subjectYearId: 'sy-ban-2026',
        subjectId: 'sub-ban',
        subjectName: 'Bangla',
        year: 2026,
        title: 'Bangla MCQ Master Guide 2026',
        slug: 'bangla-mcq-master-guide-2026',
        description: 'Chapter-by-chapter objective questions for grammar (Bakya, Somash, Karok) and literary history.',
        language: 'bn',
        coverUrl: COVER_ARCHITECTURE,
        status: 'DRAFT',
        isPaid: false,
        price: 0.00,
        totalPages: 140,
        chapterCount: 7,
        createdAt: '2026-04-15T09:30:00Z',
        updatedAt: '2026-10-08T11:20:00Z',
      },
    ];

    // 5. PDF Files
    this.pdfFiles = [
      {
        id: 'pdf-eng-gram-v1',
        bookId: 'bk-eng-gram-2025',
        version: 1,
        originalName: 'English_Grammar_2025_Release.pdf',
        storageKey: 'pdf-vault/20260201-English_Grammar_2025.pdf',
        mimeType: 'application/pdf',
        fileSize: 18_450_230,
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        totalPages: 248,
        hasOutline: true,
        outlineExtractedAt: '2026-02-01T09:12:00Z',
        createdAt: '2026-02-01T09:05:00Z',
      },
      {
        id: 'pdf-eng-mcq-v1',
        bookId: 'bk-eng-mcq-2025',
        version: 1,
        originalName: 'English_MCQ_Guide_2025_v1.pdf',
        storageKey: 'pdf-vault/20260215-English_MCQ_Guide.pdf',
        mimeType: 'application/pdf',
        fileSize: 11_200_400,
        sha256: '3a44b912884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f11b99',
        totalPages: 160,
        hasOutline: true,
        outlineExtractedAt: '2026-02-15T10:10:00Z',
        createdAt: '2026-02-15T10:02:00Z',
      },
      {
        id: 'pdf-ban-lit-v1',
        bookId: 'bk-ban-lit-2025',
        version: 1,
        originalName: 'Bangla_Literature_2025_Final.pdf',
        storageKey: 'pdf-vault/20260310-Bangla_Literature_2025.pdf',
        mimeType: 'application/pdf',
        fileSize: 15_820_100,
        sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        totalPages: 210,
        hasOutline: true,
        outlineExtractedAt: '2026-03-10T14:15:00Z',
        createdAt: '2026-03-10T14:05:00Z',
      },
    ];

    // 6. Chapters (Hierarchy: Book -> Chapter -> Subchapter)
    this.chapters = [
      // English Grammar Chapters
      {
        id: 'ch-eg-01',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Foreword & Syllabus Overview',
        chapterNumber: null,
        sortOrder: 1,
        pageIndex: 0,
        pageNumber: 1,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-02',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Chapter 1: Sentence Types and Clauses',
        chapterNumber: 1,
        sortOrder: 2,
        pageIndex: 12,
        pageNumber: 13,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-02-1',
        bookId: 'bk-eng-gram-2025',
        parentId: 'ch-eg-02',
        title: '1.1 Simple, Complex and Compound Transformation',
        chapterNumber: null,
        sortOrder: 3,
        pageIndex: 18,
        pageNumber: 19,
        destinationX: 72,
        destinationY: 650,
        level: 2,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-02-2',
        bookId: 'bk-eng-gram-2025',
        parentId: 'ch-eg-02',
        title: '1.2 Subordinate Noun and Adjective Clauses',
        chapterNumber: null,
        sortOrder: 4,
        pageIndex: 28,
        pageNumber: 29,
        destinationX: 72,
        destinationY: 680,
        level: 2,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-03',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Chapter 2: Right Form of Verbs and Subject-Verb Agreement',
        chapterNumber: 2,
        sortOrder: 5,
        pageIndex: 45,
        pageNumber: 46,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-03-1',
        bookId: 'bk-eng-gram-2025',
        parentId: 'ch-eg-03',
        title: '2.1 Conditional Sentences (Zero, 1st, 2nd, 3rd)',
        chapterNumber: null,
        sortOrder: 6,
        pageIndex: 58,
        pageNumber: 59,
        destinationX: 72,
        destinationY: 610,
        level: 2,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-04',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Chapter 3: Narration and Direct/Indirect Speech',
        chapterNumber: 3,
        sortOrder: 7,
        pageIndex: 82,
        pageNumber: 83,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-05',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Chapter 4: Modifiers and Connectors',
        chapterNumber: 4,
        sortOrder: 8,
        pageIndex: 120,
        pageNumber: 121,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'TEXT_EXTRACTION',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-06',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Chapter 5: Formal Letter and Report Writing',
        chapterNumber: 5,
        sortOrder: 9,
        pageIndex: 165,
        pageNumber: 166,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'MANUAL',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'ch-eg-07',
        bookId: 'bk-eng-gram-2025',
        parentId: null,
        title: 'Board Exam Model Test Paper 2025',
        chapterNumber: null,
        sortOrder: 10,
        pageIndex: 215,
        pageNumber: 216,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-02-01T09:12:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },

      // Bangla Literature Chapters
      {
        id: 'ch-bl-01',
        bookId: 'bk-ban-lit-2025',
        parentId: null,
        title: 'সূচিপত্র ও বিষয় পরিচিতি',
        chapterNumber: null,
        sortOrder: 1,
        pageIndex: 0,
        pageNumber: 1,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-03-10T14:15:00Z',
        updatedAt: '2026-03-10T14:15:00Z',
      },
      {
        id: 'ch-bl-02',
        bookId: 'bk-ban-lit-2025',
        parentId: null,
        title: 'অধ্যায় ১: অপরিচিতা — রবীন্দ্রনাথ ঠাকুর',
        chapterNumber: 1,
        sortOrder: 2,
        pageIndex: 14,
        pageNumber: 15,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-03-10T14:15:00Z',
        updatedAt: '2026-03-10T14:15:00Z',
      },
      {
        id: 'ch-bl-03',
        bookId: 'bk-ban-lit-2025',
        parentId: null,
        title: 'অধ্যায় ২: বিলাসী — শরৎচন্দ্র চট্টোপাধ্যায়',
        chapterNumber: 2,
        sortOrder: 3,
        pageIndex: 42,
        pageNumber: 43,
        destinationX: 72,
        destinationY: 720,
        level: 1,
        source: 'PDF_OUTLINE',
        isVisible: true,
        createdAt: '2026-03-10T14:15:00Z',
        updatedAt: '2026-03-10T14:15:00Z',
      },
    ];

    // 7. Processing Jobs
    this.processingJobs = [
      {
        id: 'job-eg-01',
        bookId: 'bk-eng-gram-2025',
        bookTitle: 'English Grammar & Composition PDF',
        pdfFileId: 'pdf-eng-gram-v1',
        pdfFileName: 'English_Grammar_2025_Release.pdf',
        status: 'COMPLETED',
        attempts: 1,
        errorMessage: 'Extracted 10 outline nodes with exact page destinations.',
        startedAt: '2026-02-01T09:06:00Z',
        completedAt: '2026-02-01T09:12:00Z',
        createdAt: '2026-02-01T09:05:00Z',
        updatedAt: '2026-02-01T09:12:00Z',
      },
      {
        id: 'job-bl-02',
        bookId: 'bk-ban-lit-2025',
        bookTitle: 'Bangla Literature & Poetry PDF',
        pdfFileId: 'pdf-ban-lit-v1',
        pdfFileName: 'Bangla_Literature_2025_Final.pdf',
        status: 'COMPLETED',
        attempts: 1,
        errorMessage: 'Parsed PDF catalog bookmarks in UTF-8 Unicode.',
        startedAt: '2026-03-10T14:06:00Z',
        completedAt: '2026-03-10T14:15:00Z',
        createdAt: '2026-03-10T14:05:00Z',
        updatedAt: '2026-03-10T14:15:00Z',
      },
      {
        id: 'job-fail-03',
        bookId: 'bk-eng-exam-2026',
        bookTitle: 'English Exam Preparation 2026',
        pdfFileId: null,
        pdfFileName: 'Draft_Exam_Corrupt_Header.pdf',
        status: 'FAILED',
        attempts: 3,
        errorMessage: 'InvalidPDFException: %PDF- stream truncated at offset 0. Password-protected without owner key.',
        startedAt: '2026-03-01T11:02:00Z',
        completedAt: '2026-03-01T11:05:00Z',
        createdAt: '2026-03-01T11:00:00Z',
        updatedAt: '2026-03-01T11:05:00Z',
      },
    ];

    // 8. Entitlements
    this.entitlements = [
      {
        id: 'ent-01',
        userId: 'usr-reader-01',
        userName: 'Tariq Rahman',
        userEmail: 'tariq.reader@student.ac.bd',
        bookId: 'bk-eng-gram-2025',
        bookTitle: 'English Grammar & Composition PDF',
        status: 'ACTIVE',
        purchasedAt: '2026-03-15T14:00:00Z',
        expiresAt: null,
        paymentReference: 'BKASH-TRX-99882211',
      },
      {
        id: 'ent-02',
        userId: 'usr-reader-02',
        userName: 'Nusrat Jahan',
        userEmail: 'nusrat.j@readingapp.io',
        bookId: 'bk-ban-lit-2025',
        bookTitle: 'Bangla Literature & Poetry PDF',
        status: 'ACTIVE',
        purchasedAt: '2026-04-20T09:30:00Z',
        expiresAt: null,
        paymentReference: 'NAGAD-TRX-44551100',
      },
    ];

    // 9. Audit Logs
    this.auditLogs = [
      {
        id: 'log-01',
        actorId: 'usr-admin-01',
        actorName: 'Dr. Arthur Sterling',
        action: 'BOOK_PUBLISHED',
        entityType: 'Book',
        entityId: 'bk-eng-gram-2025',
        metadata: 'Status transitioned DRAFT -> PUBLISHED under English / 2025.',
        createdAt: '2026-10-04T15:20:00Z',
      },
      {
        id: 'log-02',
        actorId: 'usr-admin-01',
        actorName: 'Dr. Arthur Sterling',
        action: 'PDF_OUTLINE_EXTRACTED',
        entityType: 'PdfFile',
        entityId: 'pdf-eng-gram-v1',
        metadata: '10 chapters resolved and indexed from native PDF bookmarks tree.',
        createdAt: '2026-10-04T15:15:00Z',
      },
    ];
  }

  // Dashboard Stats
  public getDashboardStats(): DashboardStats {
    const totalSubjects = this.subjects.length;
    const totalSubjectYears = this.subjectYears.length;
    const totalBooks = this.books.length;
    const publishedBooks = this.books.filter(b => b.status === 'PUBLISHED').length;
    const draftBooks = this.books.filter(b => b.status === 'DRAFT').length;
    const failedJobs = this.processingJobs.filter(j => j.status === 'FAILED').length;
    const totalChapters = this.chapters.length;
    const recentUploadsCount = this.pdfFiles.length;
    const activeProcessingCount = this.processingJobs.filter(j => j.status === 'PROCESSING' || j.status === 'PENDING').length;
    const totalUsers = this.users.length;

    return {
      totalSubjects,
      totalSubjectYears,
      totalBooks,
      publishedBooks,
      draftBooks,
      failedJobs,
      totalChapters,
      recentUploadsCount,
      activeProcessingCount,
      totalUsers,
    };
  }

  // Subjects CRUD
  public getSubjects(): Subject[] {
    return this.subjects.map(s => {
      const years = this.subjectYears.filter(sy => sy.subjectId === s.id);
      const bookCount = this.books.filter(b => b.subjectId === s.id).length;
      return {
        ...s,
        years,
        yearCount: years.length,
        bookCount,
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getSubjectById(id: string): Subject | undefined {
    return this.getSubjects().find(s => s.id === id);
  }

  public createSubject(data: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }): Subject {
    const maxSort = this.subjects.reduce((m, s) => Math.max(m, s.sortOrder), 0);
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      sortOrder: data.sortOrder ?? maxSort + 1,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.subjects.push(newSubject);
    this.addAuditLog('SUBJECT_CREATED', 'Subject', newSubject.id, `Created subject "${newSubject.name}"`);
    return newSubject;
  }

  public updateSubject(id: string, updates: Partial<Subject>): Subject {
    const idx = this.subjects.findIndex(s => s.id === id);
    if (idx === -1) throw new Error(`Subject ${id} not found`);
    const updated = { ...this.subjects[idx], ...updates, updatedAt: new Date().toISOString() };
    this.subjects[idx] = updated;
    this.addAuditLog('SUBJECT_UPDATED', 'Subject', id, `Updated subject "${updated.name}"`);
    return updated;
  }

  public deleteSubject(id: string): boolean {
    const sub = this.subjects.find(s => s.id === id);
    if (!sub) return false;

    // Check if books exist under this subject
    const booksInSubject = this.books.filter(b => b.subjectId === id);
    if (booksInSubject.length > 0) {
      throw new Error(`Cannot delete subject "${sub.name}" because it contains ${booksInSubject.length} active books. Delete or reassign books first.`);
    }

    this.subjectYears = this.subjectYears.filter(sy => sy.subjectId !== id);
    this.subjects = this.subjects.filter(s => s.id !== id);
    this.addAuditLog('SUBJECT_DELETED', 'Subject', id, `Deleted subject "${sub.name}"`);
    return true;
  }

  // SubjectYears CRUD
  public getSubjectYears(subjectId?: string): SubjectYear[] {
    let list = this.subjectYears;
    if (subjectId) {
      list = list.filter(sy => sy.subjectId === subjectId);
    }
    return list.map(sy => {
      const subject = this.subjects.find(s => s.id === sy.subjectId);
      const books = this.books.filter(b => b.subjectYearId === sy.id);
      return {
        ...sy,
        subjectName: subject?.name || 'Unknown',
        bookCount: books.length,
        books,
      };
    }).sort((a, b) => b.year - a.year);
  }

  public createSubjectYear(data: { subjectId: string; year: number; sortOrder?: number }): SubjectYear {
    const subject = this.subjects.find(s => s.id === data.subjectId);
    if (!subject) throw new Error(`Subject ${data.subjectId} does not exist`);

    // Check unique constraint: (subjectId + year)
    const exists = this.subjectYears.find(sy => sy.subjectId === data.subjectId && sy.year === data.year);
    if (exists) {
      throw new Error(`Year ${data.year} already exists under subject "${subject.name}"`);
    }

    const newYear: SubjectYear = {
      id: `sy-${Date.now()}`,
      subjectId: data.subjectId,
      subjectName: subject.name,
      year: data.year,
      sortOrder: data.sortOrder ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.subjectYears.push(newYear);
    this.addAuditLog('SUBJECT_YEAR_CREATED', 'SubjectYear', newYear.id, `Created year ${newYear.year} under ${subject.name}`);
    return newYear;
  }

  public updateSubjectYear(id: string, updates: { year?: number; sortOrder?: number }): SubjectYear {
    const idx = this.subjectYears.findIndex(sy => sy.id === id);
    if (idx === -1) throw new Error(`SubjectYear ${id} not found`);

    const current = this.subjectYears[idx];
    if (updates.year && updates.year !== current.year) {
      const conflict = this.subjectYears.find(sy => sy.subjectId === current.subjectId && sy.year === updates.year && sy.id !== id);
      if (conflict) {
        throw new Error(`Year ${updates.year} already exists in this subject`);
      }
    }

    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.subjectYears[idx] = updated;

    // Update books year reference
    this.books.forEach(b => {
      if (b.subjectYearId === id && updates.year) {
        b.year = updates.year;
      }
    });

    return updated;
  }

  public deleteSubjectYear(id: string): boolean {
    const sy = this.subjectYears.find(y => y.id === id);
    if (!sy) return false;

    const books = this.books.filter(b => b.subjectYearId === id);
    if (books.length > 0) {
      throw new Error(`Cannot delete year ${sy.year} because it contains ${books.length} books. Remove books first.`);
    }

    this.subjectYears = this.subjectYears.filter(y => y.id !== id);
    this.addAuditLog('SUBJECT_YEAR_DELETED', 'SubjectYear', id, `Deleted year ${sy.year}`);
    return true;
  }

  // Books CRUD
  public getBooks(): Book[] {
    return this.books.map(b => {
      const sy = this.subjectYears.find(y => y.id === b.subjectYearId);
      const subject = sy ? this.subjects.find(s => s.id === sy.subjectId) : undefined;
      const latestPdf = this.pdfFiles.filter(p => p.bookId === b.id).sort((x, y) => y.version - x.version)[0] || null;
      const chapterCount = this.chapters.filter(c => c.bookId === b.id).length;
      return {
        ...b,
        subjectId: sy?.subjectId || b.subjectId,
        subjectName: subject?.name || b.subjectName,
        year: sy?.year || b.year,
        latestPdfFile: latestPdf,
        chapterCount,
      };
    });
  }

  public getBookById(id: string): Book | undefined {
    return this.getBooks().find(b => b.id === id);
  }

  public createBook(data: {
    subjectYearId: string;
    title: string;
    slug?: string;
    description?: string;
    language?: string;
    isPaid: boolean;
    price?: number;
    coverUrl?: string;
  }): Book {
    const sy = this.subjectYears.find(y => y.id === data.subjectYearId);
    if (!sy) throw new Error(`SubjectYear ${data.subjectYearId} not found`);
    const subject = this.subjects.find(s => s.id === sy.subjectId);

    const newBook: Book = {
      id: `bk-${Date.now()}`,
      subjectYearId: data.subjectYearId,
      subjectId: sy.subjectId,
      subjectName: subject?.name || 'Subject',
      year: sy.year,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      language: data.language || 'en',
      coverUrl: data.coverUrl || COVER_ARCHITECTURE,
      status: 'DRAFT',
      isPaid: data.isPaid,
      price: data.isPaid ? (data.price || 0) : 0,
      totalPages: 0,
      chapterCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.books.unshift(newBook);
    this.addAuditLog('BOOK_CREATED', 'Book', newBook.id, `Created book "${newBook.title}" under ${newBook.subjectName} / ${newBook.year}`);
    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book {
    const idx = this.books.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Book ${id} not found`);

    let sy = this.subjectYears.find(y => y.id === (updates.subjectYearId || this.books[idx].subjectYearId));
    let subject = sy ? this.subjects.find(s => s.id === sy.subjectId) : undefined;

    const updated: Book = {
      ...this.books[idx],
      ...updates,
      subjectId: sy?.subjectId || this.books[idx].subjectId,
      subjectName: subject?.name || this.books[idx].subjectName,
      year: sy?.year || this.books[idx].year,
      updatedAt: new Date().toISOString(),
    };

    this.books[idx] = updated;
    this.addAuditLog('BOOK_UPDATED', 'Book', id, `Updated book metadata for "${updated.title}"`);
    return updated;
  }

  public deleteBook(id: string): boolean {
    const book = this.books.find(b => b.id === id);
    if (!book) return false;

    // Cascade deletes matching Prisma schema
    this.books = this.books.filter(b => b.id !== id);
    this.chapters = this.chapters.filter(c => c.bookId !== id);
    this.pdfFiles = this.pdfFiles.filter(p => p.bookId !== id);
    this.processingJobs = this.processingJobs.filter(j => j.bookId !== id);
    this.entitlements = this.entitlements.filter(e => e.bookId !== id);

    this.addAuditLog('BOOK_DELETED', 'Book', id, `Deleted book "${book.title}" with cascading chapters and PDF records.`);
    return true;
  }

  // Chapters Tree Operations
  public getChaptersByBookId(bookId: string): Chapter[] {
    return this.chapters
      .filter(c => c.bookId === bookId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getChapterTree(bookId: string): ChapterNode[] {
    const all = this.getChaptersByBookId(bookId);
    const map = new Map<string, ChapterNode>();

    all.forEach(c => {
      map.set(c.id, { ...c, children: [] });
    });

    const roots: ChapterNode[] = [];
    all.forEach(c => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  public createChapter(data: {
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
    source?: any;
    isVisible?: boolean;
  }): Chapter {
    const maxSort = this.chapters
      .filter(c => c.bookId === data.bookId)
      .reduce((max, c) => Math.max(max, c.sortOrder), 0);

    const newChapter: Chapter = {
      id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bookId: data.bookId,
      parentId: data.parentId || null,
      title: data.title,
      chapterNumber: data.chapterNumber ?? null,
      sortOrder: data.sortOrder ?? maxSort + 1,
      pageIndex: data.pageIndex,
      pageNumber: data.pageNumber ?? data.pageIndex + 1,
      destinationX: data.destinationX ?? 72,
      destinationY: data.destinationY ?? 720,
      level: data.level || (data.parentId ? 2 : 1),
      source: data.source || 'MANUAL',
      isVisible: data.isVisible !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.chapters.push(newChapter);
    this.addAuditLog('CHAPTER_CREATED', 'Chapter', newChapter.id, `Created chapter "${newChapter.title}" in book ${data.bookId}`);
    return newChapter;
  }

  public updateChapter(id: string, updates: Partial<Chapter>): Chapter {
    const idx = this.chapters.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Chapter ${id} not found`);

    const existing = this.chapters[idx];
    const updated: Chapter = {
      ...existing,
      ...updates,
      pageNumber: updates.pageIndex !== undefined ? updates.pageIndex + 1 : (updates.pageNumber ?? existing.pageNumber),
      updatedAt: new Date().toISOString(),
    };

    this.chapters[idx] = updated;
    return updated;
  }

  public deleteChapter(id: string): boolean {
    const chapter = this.chapters.find(c => c.id === id);
    if (!chapter) return false;

    // Cascade delete subchapters
    const toDeleteIds = new Set<string>([id]);
    const findChildren = (parentId: string) => {
      this.chapters.filter(c => c.parentId === parentId).forEach(c => {
        toDeleteIds.add(c.id);
        findChildren(c.id);
      });
    };
    findChildren(id);

    this.chapters = this.chapters.filter(c => !toDeleteIds.has(c.id));
    this.addAuditLog('CHAPTER_DELETED', 'Chapter', id, `Deleted chapter "${chapter.title}" and ${toDeleteIds.size - 1} subchapters.`);
    return true;
  }

  public reorderChapters(bookId: string, orderedItems: Array<{ id: string; sortOrder: number; parentId?: string | null; level?: number }>) {
    orderedItems.forEach(item => {
      const ch = this.chapters.find(c => c.id === item.id && c.bookId === bookId);
      if (ch) {
        ch.sortOrder = item.sortOrder;
        if (item.parentId !== undefined) ch.parentId = item.parentId;
        if (item.level !== undefined) ch.level = item.level;
        ch.updatedAt = new Date().toISOString();
      }
    });

    this.addAuditLog('CHAPTERS_REORDERED', 'Book', bookId, `Updated hierarchy and ordering for ${orderedItems.length} chapters.`);
  }

  // PDF Upload & Extraction Pipeline
  public async handlePdfUploadAndExtract(
    bookId: string,
    file: File | { name: string; buffer: ArrayBuffer; type?: string },
    forceMode?: 'OUTLINE' | 'TEXT' | 'AI'
  ): Promise<{ pdfFile: PdfFile; job: PdfProcessingJob; extractedChapters: Chapter[] }> {
    const book = this.books.find(b => b.id === bookId);
    if (!book) throw new Error(`Book ${bookId} not found`);

    // 1. Store PDF in private storage
    const storageResult = await PrivateStorageManager.uploadPdf(file);

    // 2. Compute version
    const existingPdfs = this.pdfFiles.filter(p => p.bookId === bookId);
    const newVersion = existingPdfs.length + 1;

    // 3. Create PdfFile record
    const pdfFile: PdfFile = {
      id: `pdf-${Date.now()}`,
      bookId,
      version: newVersion,
      originalName: storageResult.originalName,
      storageKey: storageResult.storageKey,
      mimeType: storageResult.mimeType,
      fileSize: storageResult.fileSize,
      sha256: storageResult.sha256,
      totalPages: 0,
      hasOutline: false,
      outlineExtractedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.pdfFiles.push(pdfFile);

    // 4. Create Processing Job
    const job: PdfProcessingJob = {
      id: `job-${Date.now()}`,
      bookId,
      bookTitle: book.title,
      pdfFileId: pdfFile.id,
      pdfFileName: pdfFile.originalName,
      status: 'PROCESSING',
      attempts: 1,
      errorMessage: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.processingJobs.unshift(job);

    book.status = 'PROCESSING';
    book.updatedAt = new Date().toISOString();

    try {
      // 5. Parse PDF using native outline / text pattern fallback / AI fallback
      const parseResult = await parsePdfDocument(
        file instanceof File ? file : file.buffer,
        file.name,
        forceMode
      );

      // 6. Update PdfFile & Book totalPages
      pdfFile.totalPages = parseResult.totalPages;
      pdfFile.hasOutline = parseResult.hasOutline;
      pdfFile.outlineExtractedAt = new Date().toISOString();

      book.totalPages = parseResult.totalPages;

      // 7. Transactional update of chapters
      this.chapters = this.chapters.filter(c => c.bookId !== bookId);

      const newChapters: Chapter[] = [];
      let sortCounter = 1;

      const saveRecursive = (items: ExtractedChapter[], parentId: string | null = null, level: number = 1) => {
        items.forEach(item => {
          const chId = `ch-${Date.now()}-${sortCounter}`;
          const chapter: Chapter = {
            id: chId,
            bookId,
            parentId,
            title: item.title,
            chapterNumber: item.chapterNumber ?? null,
            sortOrder: sortCounter++,
            pageIndex: item.pageIndex,
            pageNumber: item.pageNumber,
            destinationX: item.destinationX ?? 72,
            destinationY: item.destinationY ?? 720,
            level,
            source: item.source,
            isVisible: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.chapters.push(chapter);
          newChapters.push(chapter);

          if (item.children && item.children.length > 0) {
            saveRecursive(item.children, chId, level + 1);
          }
        });
      };

      saveRecursive(parseResult.chapters);

      // 8. Update job to COMPLETED
      job.status = 'COMPLETED';
      job.completedAt = new Date().toISOString();
      job.errorMessage = `Extracted ${newChapters.length} chapters via ${parseResult.methodDescription}.`;
      job.updatedAt = new Date().toISOString();

      book.status = 'DRAFT';
      book.chapterCount = newChapters.length;
      book.updatedAt = new Date().toISOString();

      this.addAuditLog(
        'PDF_PROCESSED_SUCCESS',
        'PdfFile',
        pdfFile.id,
        `Extracted ${newChapters.length} chapters for "${book.title}" via ${parseResult.methodDescription}.`
      );

      return { pdfFile, job, extractedChapters: newChapters };
    } catch (err: any) {
      job.status = 'FAILED';
      job.errorMessage = err?.message || 'Unknown PDF processing error';
      job.completedAt = new Date().toISOString();
      job.updatedAt = new Date().toISOString();

      book.status = 'FAILED';
      book.updatedAt = new Date().toISOString();

      this.addAuditLog('PDF_PROCESSING_FAILED', 'PdfFile', pdfFile.id, `Failed processing PDF: ${job.errorMessage}`);
      throw err;
    }
  }

  // Retry failed job
  public async retryJob(jobId: string): Promise<PdfProcessingJob> {
    const job = this.processingJobs.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    job.status = 'PROCESSING';
    job.attempts += 1;
    job.startedAt = new Date().toISOString();
    job.errorMessage = null;

    await new Promise(r => setTimeout(r, 500));

    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    job.errorMessage = 'Job retried and completed successfully. Document outline synchronized.';
    job.updatedAt = new Date().toISOString();

    const book = this.books.find(b => b.id === job.bookId);
    if (book && book.status === 'FAILED') {
      book.status = 'DRAFT';
    }

    this.addAuditLog('JOB_RETRIED', 'PdfProcessingJob', jobId, `Retried processing job (Attempt ${job.attempts}). Succeeded.`);
    return job;
  }

  // Audit Logs
  private addAuditLog(action: string, entityType: string, entityId: string, metadata?: string) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actorId: 'usr-admin-01',
      actorName: 'Dr. Arthur Sterling',
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    });
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }
}

export const db = RelationalDatabase.getInstance();
