import React, { useState, useEffect } from 'react';
import { X, UploadCloud, BookCheck } from 'lucide-react';
import { Subject, SubjectYear } from '../../lib/types';
import { createSamplePdfBlob } from '../../lib/sample-pdfs';

interface BookCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  subjectYears: SubjectYear[];
  onSubmit: (data: {
    bookData: {
      subjectYearId: string;
      title: string;
      slug?: string;
      description?: string;
      language?: string;
      isPaid: boolean;
      price?: number;
      coverUrl?: string;
    };
    pdfFile?: File;
  }) => Promise<void>;
}

const PRESET_COVERS = [
  {
    name: 'Grammar & Architecture',
    url: '/src/assets/images/book_cover_architecture_1791564066341.jpg',
  },
  {
    name: 'Literature & AI Systems',
    url: '/src/assets/images/book_cover_ai_systems_1791564084734.jpg',
  },
  {
    name: 'Exam Prep & Cloud Scale',
    url: '/src/assets/images/book_cover_cloud_native_1791564095653.jpg',
  },
];

export const BookCreateModal: React.FC<BookCreateModalProps> = ({
  isOpen,
  onClose,
  subjects,
  subjectYears,
  onSubmit,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedSubjectYearId, setSelectedSubjectYearId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('19.99');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);

  // PDF upload
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfSampleType, setPdfSampleType] = useState<'sample-outlines' | 'sample-text' | 'custom'>('sample-outlines');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter available years when selected subject changes
  const yearsForSubject = subjectYears.filter(sy => sy.subjectId === selectedSubjectId);

  useEffect(() => {
    if (yearsForSubject.length > 0) {
      // Pick first year if current selected doesn't belong to subject
      const valid = yearsForSubject.some(sy => sy.id === selectedSubjectYearId);
      if (!valid) {
        setSelectedSubjectYearId(yearsForSubject[0].id);
      }
    } else {
      setSelectedSubjectYearId('');
    }
  }, [selectedSubjectId, subjectYears]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const suggested = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(suggested);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setPdfSampleType('custom');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (!selectedSubjectId) newErrors.subject = 'Please select a subject';
    if (!selectedSubjectYearId) newErrors.year = 'Please select a curriculum year for this subject';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPdf = pdfFile;
      if (!finalPdf) {
        if (pdfSampleType === 'sample-outlines') {
          finalPdf = createSamplePdfBlob({ title, withOutlines: true, pageCount: 28 }).file;
        } else if (pdfSampleType === 'sample-text') {
          finalPdf = createSamplePdfBlob({ title, withOutlines: false, pageCount: 20 }).file;
        }
      }

      await onSubmit({
        bookData: {
          subjectYearId: selectedSubjectYearId,
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          language,
          isPaid,
          price: isPaid ? parseFloat(price) || 0 : 0,
          coverUrl,
        },
        pdfFile: finalPdf || undefined,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Create New Digital Book
            </h2>
            <p className="text-[11px] text-neutral-500">
              Assign to Subject → Year hierarchy and upload source PDF for chapter extraction.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Subject & Year Dependent Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40">
            <div>
              <label className="block font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                1. Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-medium text-neutral-900 dark:text-neutral-100"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {errors.subject && <p className="text-[11px] text-rose-500 mt-0.5">{errors.subject}</p>}
            </div>

            <div>
              <label className="block font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                2. Curriculum Year (Filtered by Subject) *
              </label>
              <select
                value={selectedSubjectYearId}
                onChange={(e) => setSelectedSubjectYearId(e.target.value)}
                disabled={yearsForSubject.length === 0}
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-mono text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
              >
                {yearsForSubject.length === 0 ? (
                  <option value="">No years created for this subject</option>
                ) : (
                  yearsForSubject.map((sy) => (
                    <option key={sy.id} value={sy.id}>
                      Year {sy.year}
                    </option>
                  ))
                )}
              </select>
              {errors.year && <p className="text-[11px] text-rose-500 mt-0.5">{errors.year}</p>}
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. English Grammar & Composition PDF"
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 font-medium"
              />
              {errors.title && <p className="text-[11px] text-rose-500 mt-0.5">{errors.title}</p>}
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="english-grammar-composition"
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono text-[11px]"
              />
              {errors.slug && <p className="text-[11px] text-rose-500 mt-0.5">{errors.slug}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Synopsis
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus topics covered, practice exercises, target classes..."
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
            />
          </div>

          {/* Language & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs"
              >
                <option value="en">English (en)</option>
                <option value="bn">Bangla (bn)</option>
              </select>
            </div>

            <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50/50 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Paid Access</span>
                  <p className="text-[10px] text-neutral-500">Require reader purchase</p>
                </div>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </div>
              {isPaid && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-neutral-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-24 px-2 py-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono tabular-nums text-xs"
                  />
                  <span className="text-[10px] text-neutral-400">USD</span>
                </div>
              )}
            </div>
          </div>

          {/* Cover Art Selection */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Select Book Cover Artwork
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_COVERS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => setCoverUrl(preset.url)}
                  className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                    coverUrl === preset.url
                      ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white bg-neutral-100 dark:bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-20 object-cover rounded"
                  />
                  <p className="mt-1 text-[10px] text-center font-medium truncate text-neutral-700 dark:text-neutral-300">
                    {preset.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Initial PDF Extraction Source */}
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-900/50 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
              <UploadCloud className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>Initial PDF Source for Chapter Extraction</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pdfSource"
                  checked={pdfSampleType === 'sample-outlines'}
                  onChange={() => {
                    setPdfSampleType('sample-outlines');
                    setPdfFile(null);
                  }}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Generate Sample PDF with Native Bookmarks / Outlines (Instant test)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pdfSource"
                  checked={pdfSampleType === 'sample-text'}
                  onChange={() => {
                    setPdfSampleType('sample-text');
                    setPdfFile(null);
                  }}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Generate Sample PDF (Text-only heading extraction test)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pdfSource"
                  checked={pdfSampleType === 'custom'}
                  onChange={() => setPdfSampleType('custom')}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Upload Custom PDF File from Device
                </span>
              </label>

              {pdfSampleType === 'custom' && (
                <div className="pt-2 pl-5">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-neutral-500 file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white dark:file:bg-neutral-100 dark:file:text-neutral-900 cursor-pointer"
                  />
                  {pdfFile && (
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Selected: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Processing PDF...</span>
                </>
              ) : (
                <>
                  <BookCheck className="w-3.5 h-3.5" />
                  <span>Create Book & Extract Chapters</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
