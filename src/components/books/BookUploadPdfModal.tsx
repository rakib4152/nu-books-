import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { Book } from '../../lib/types';
import { createSamplePdfBlob } from '../../lib/sample-pdfs';

interface BookUploadPdfModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onUpload: (bookId: string, file: File, forceMode?: 'OUTLINE' | 'TEXT' | 'AI') => Promise<void>;
}

export const BookUploadPdfModal: React.FC<BookUploadPdfModalProps> = ({
  isOpen,
  book,
  onClose,
  onUpload,
}) => {
  if (!isOpen || !book) return null;

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<'custom' | 'sample-outlines' | 'sample-text'>('sample-outlines');
  const [extractMode, setExtractMode] = useState<'OUTLINE' | 'TEXT' | 'AI'>('OUTLINE');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setSourceType('custom');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalFile = pdfFile;
      if (!finalFile) {
        if (sourceType === 'sample-outlines') {
          finalFile = createSamplePdfBlob({ title: book.title, withOutlines: true, pageCount: 32 }).file;
        } else if (sourceType === 'sample-text') {
          finalFile = createSamplePdfBlob({ title: book.title, withOutlines: false, pageCount: 20 }).file;
        }
      }

      if (finalFile) {
        await onUpload(book.id, finalFile, extractMode);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Upload PDF Version & Extract Chapters
            </h3>
            <p className="text-[11px] text-neutral-500 truncate max-w-sm">
              Target: {book.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {/* PDF Source Choice */}
          <div className="space-y-2">
            <label className="block font-medium text-neutral-700 dark:text-neutral-300">
              Select PDF File Stream
            </label>

            <div className="space-y-1.5 p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="radio"
                  name="uploadSource"
                  checked={sourceType === 'sample-outlines'}
                  onChange={() => {
                    setSourceType('sample-outlines');
                    setPdfFile(null);
                  }}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Generate Sample PDF with Native Bookmarks / Outlines (Instant test)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="radio"
                  name="uploadSource"
                  checked={sourceType === 'sample-text'}
                  onChange={() => {
                    setSourceType('sample-text');
                    setPdfFile(null);
                  }}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Generate Sample PDF (Text-only heading extraction test)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="radio"
                  name="uploadSource"
                  checked={sourceType === 'custom'}
                  onChange={() => setSourceType('custom')}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Upload Custom PDF File from Device
                </span>
              </label>

              {sourceType === 'custom' && (
                <div className="pt-2 pl-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-neutral-900 file:text-white dark:file:bg-neutral-100 dark:file:text-neutral-900 cursor-pointer"
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

          {/* Extraction Strategy */}
          <div className="space-y-1.5">
            <label className="block font-medium text-neutral-700 dark:text-neutral-300">
              Extraction Method Preference
            </label>
            <select
              value={extractMode}
              onChange={(e) => setExtractMode(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs"
            >
              <option value="OUTLINE">PDF Native Bookmarks & Outlines (Default)</option>
              <option value="TEXT">Document Text Heading Patterns Heuristics</option>
              <option value="AI">AI Structured Outline Modeling (Gemini)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Parsing PDF & Extracting...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Start Processing Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
