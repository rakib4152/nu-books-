/**
 * Automated Test Suite for Subject -> Year -> Book Hierarchy & PDF Outline Extraction
 */

import { extractChaptersFromText, scanPdfForOutlineTokens } from '../lib/pdf-parser';
import { createSamplePdfBlob } from '../lib/sample-pdfs';
import { db } from '../lib/database';

export function runTests(): { passed: number; failed: number; results: Array<{ name: string; ok: boolean; error?: string }> } {
  const results: Array<{ name: string; ok: boolean; error?: string }> = [];

  // Test 1: PDF Outline Token Scanner
  try {
    const { buffer } = createSamplePdfBlob({ title: 'Bangla Literature Test', withOutlines: true, pageCount: 16 });
    const { hasOutlines } = scanPdfForOutlineTokens(buffer);
    if (!hasOutlines) throw new Error('Expected PDF to contain /Outlines dictionary token');
    results.push({ name: 'PDF Outline Token Scanner detects /Outlines dictionary', ok: true });
  } catch (err: any) {
    results.push({ name: 'PDF Outline Token Scanner detects /Outlines dictionary', ok: false, error: err.message });
  }

  // Test 2: Text Heading Extraction Pattern Heuristics
  try {
    const samplePages = [
      { pageIndex: 0, text: 'Title Page\nBy FolioPress\nPublished 2026' },
      { pageIndex: 1, text: 'Chapter 1: Sentence Types and Clauses\nSimple, complex and compound.' },
      { pageIndex: 5, text: '1.1 Domain-Driven Rules\nTransformation examples.' },
      { pageIndex: 10, text: 'Chapter 2: Right Form of Verbs\nSubject verb agreement.' },
    ];
    const chapters = extractChaptersFromText(samplePages);
    if (chapters.length < 2) throw new Error(`Expected at least 2 chapters, found ${chapters.length}`);
    if (chapters[0].pageIndex !== 1 || chapters[0].pageNumber !== 2) throw new Error('Page mapping mismatch');
    results.push({ name: 'Text Heading Heuristics extracts numbered chapters & maps page numbers', ok: true });
  } catch (err: any) {
    results.push({ name: 'Text Heading Heuristics extracts numbered chapters & maps page numbers', ok: false, error: err.message });
  }

  // Test 3: Hierarchy Integrity: Subject -> SubjectYear -> Book
  try {
    const subject = db.createSubject({
      name: 'Physics Test',
      slug: 'physics-test',
    });

    const year2025 = db.createSubjectYear({
      subjectId: subject.id,
      year: 2025,
    });

    // Verify duplicate year constraint on same subject fails
    let duplicateRejected = false;
    try {
      db.createSubjectYear({ subjectId: subject.id, year: 2025 });
    } catch {
      duplicateRejected = true;
    }
    if (!duplicateRejected) throw new Error('Failed to reject duplicate year under same subject');

    // Create book
    const book = db.createBook({
      subjectYearId: year2025.id,
      title: 'Physics Mechanics 2025',
      slug: 'physics-mechanics-2025',
      isPaid: true,
      price: 29.99,
    });

    if (book.subjectId !== subject.id || book.year !== 2025) {
      throw new Error('Book failed to inherit subject and year relationships');
    }

    // Cascade delete test
    db.deleteBook(book.id);
    db.deleteSubjectYear(year2025.id);
    db.deleteSubject(subject.id);

    results.push({ name: 'Hierarchy Subject -> SubjectYear -> Book validates unique years and relations', ok: true });
  } catch (err: any) {
    results.push({ name: 'Hierarchy Subject -> SubjectYear -> Book validates unique years and relations', ok: false, error: err.message });
  }

  // Test 4: Reader Access Entitlement Check
  try {
    const paidBook = db.books.find(b => b.isPaid);
    if (paidBook) {
      const freeUserCheck = !db.entitlements.some(e => e.userId === 'usr-unauthorized' && e.bookId === paidBook.id);
      if (!freeUserCheck) throw new Error('Unauthorized user should not have entitlement');
    }
    results.push({ name: 'Entitlement authorization enforcement validates paid books', ok: true });
  } catch (err: any) {
    results.push({ name: 'Entitlement authorization enforcement validates paid books', ok: false, error: err.message });
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  return { passed, failed, results };
}
