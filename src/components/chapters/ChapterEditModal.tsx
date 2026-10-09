import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Chapter, ChapterSource } from '../../lib/types';

interface ChapterEditModalProps {
  isOpen: boolean;
  chapter: Chapter | null;
  allChapters: Chapter[];
  totalPages: number;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Chapter>) => void;
}

export const ChapterEditModal: React.FC<ChapterEditModalProps> = ({
  isOpen,
  chapter,
  allChapters,
  totalPages,
  onClose,
  onSave,
}) => {
  if (!isOpen || !chapter) return null;

  const [title, setTitle] = useState(chapter.title);
  const [chapterNumber, setChapterNumber] = useState<string>(
    chapter.chapterNumber !== null && chapter.chapterNumber !== undefined ? String(chapter.chapterNumber) : ''
  );
  const [pageIndex, setPageIndex] = useState<number>(chapter.pageIndex);
  const [parentId, setParentId] = useState<string | null>(chapter.parentId || null);
  const [level, setLevel] = useState<number>(chapter.level);
  const [destinationX, setDestinationX] = useState<number>(chapter.destinationX || 72);
  const [destinationY, setDestinationY] = useState<number>(chapter.destinationY || 720);
  const [source, setSource] = useState<ChapterSource>(chapter.source);
  const [isVisible, setIsVisible] = useState<boolean>(chapter.isVisible);

  const potentialParents = allChapters.filter(c => c.id !== chapter.id && c.parentId === null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(chapter.id, {
      title: title.trim(),
      chapterNumber: chapterNumber ? parseInt(chapterNumber, 10) : null,
      pageIndex,
      pageNumber: pageIndex + 1,
      parentId,
      level: parentId ? 2 : level,
      destinationX,
      destinationY,
      source,
      isVisible,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Edit Chapter & Page Destination
            </h3>
            <p className="text-[11px] text-neutral-500">
              Modify chapter numbering, tree level, and exact PDF navigation offsets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Chapter Title */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Chapter / Section Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 font-medium"
            />
          </div>

          {/* Chapter Number & Parent */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Chapter Number (Optional)
              </label>
              <input
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                placeholder="e.g. 1, 2"
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Parent Chapter (Nesting)
              </label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
              >
                <option value="">None (Top-Level Chapter)</option>
                {potentialParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Indices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Page Index (0-based) *
              </label>
              <input
                type="number"
                min={0}
                max={Math.max(0, totalPages - 1)}
                value={pageIndex}
                onChange={(e) => setPageIndex(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono tabular-nums"
              />
              <span className="text-[10px] text-neutral-400">
                Maps to Page Number: <strong className="font-mono">{pageIndex + 1}</strong>
              </span>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Source Type
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ChapterSource)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
              >
                <option value="PDF_OUTLINE">PDF_OUTLINE</option>
                <option value="TEXT_EXTRACTION">TEXT_EXTRACTION</option>
                <option value="AI">AI</option>
                <option value="MANUAL">MANUAL</option>
                <option value="OCR">OCR</option>
              </select>
            </div>
          </div>

          {/* Coordinates */}
          <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              PDF Viewport Navigation Offsets
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">X Offset (pt)</label>
                <input
                  type="number"
                  value={destinationX}
                  onChange={(e) => setDestinationX(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono tabular-nums text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Y Offset (pt)</label>
                <input
                  type="number"
                  value={destinationY}
                  onChange={(e) => setDestinationY(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded font-mono tabular-nums text-xs"
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded"
            />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Visible in Mobile Reading Application Table of Contents
            </span>
          </label>

          {/* Buttons */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
