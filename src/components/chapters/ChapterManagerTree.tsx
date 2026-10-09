import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  CornerUpLeft,
  Sparkles,
  RefreshCw,
  Save,
  AlertCircle,
  FileText,
  Compass,
} from 'lucide-react';
import { Chapter, Book, ChapterSource } from '../../lib/types';
import { ChapterEditModal } from './ChapterEditModal';

interface ChapterManagerTreeProps {
  book: Book;
  chapters: Chapter[];
  onSaveChapters: (updatedChapters: Chapter[]) => Promise<void>;
  onReprocessOutline: (mode: 'OUTLINE' | 'TEXT' | 'AI') => Promise<void>;
  onPreviewPage: (pageIndex: number, chapterTitle: string) => void;
}

export const ChapterManagerTree: React.FC<ChapterManagerTreeProps> = ({
  book,
  chapters: initialChapters,
  onSaveChapters,
  onReprocessOutline,
  onPreviewPage,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReprocessModal, setShowReprocessModal] = useState(false);
  const [reprocessMode, setReprocessMode] = useState<'OUTLINE' | 'TEXT' | 'AI'>('OUTLINE');
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [deleteConfirmChapter, setDeleteConfirmChapter] = useState<Chapter | null>(null);

  // Sync when prop updates and not dirty
  React.useEffect(() => {
    if (!isDirty) {
      setChapters(initialChapters);
    }
  }, [initialChapters, isDirty]);

  // Toggle Collapse
  const toggleCollapse = (id: string) => {
    const next = new Set(collapsedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsedIds(next);
  };

  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => {
    const parentIds = new Set(chapters.filter(c => c.parentId === null).map(c => c.id));
    setCollapsedIds(parentIds);
  };

  // Move Chapter Up/Down
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const copy = [...chapters];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Recalculate sortOrder
    copy.forEach((c, i) => {
      c.sortOrder = i + 1;
    });

    setChapters(copy);
    setIsDirty(true);
  };

  // Indent (make child of previous chapter)
  const indentItem = (index: number) => {
    if (index === 0) return;
    const current = chapters[index];
    const prev = chapters[index - 1];

    const copy = [...chapters];
    copy[index] = {
      ...current,
      parentId: prev.id,
      level: Math.min(3, prev.level + 1),
    };

    setChapters(copy);
    setIsDirty(true);
  };

  // Outdent (promote to top-level or parent's level)
  const outdentItem = (index: number) => {
    const current = chapters[index];
    if (!current.parentId) return;

    const copy = [...chapters];
    copy[index] = {
      ...current,
      parentId: null,
      level: 1,
    };

    setChapters(copy);
    setIsDirty(true);
  };

  // Toggle Visibility
  const toggleVisibility = (id: string) => {
    const copy = chapters.map(c => (c.id === id ? { ...c, isVisible: !c.isVisible } : c));
    setChapters(copy);
    setIsDirty(true);
  };

  // Add Manual Chapter
  const handleAddManual = () => {
    const maxPage = chapters.reduce((max, c) => Math.max(max, c.pageIndex), 0);
    const newChapter: Chapter = {
      id: `ch-manual-${Date.now()}`,
      bookId: book.id,
      parentId: null,
      title: `New Section ${chapters.length + 1}`,
      chapterNumber: chapters.length + 1,
      sortOrder: chapters.length + 1,
      pageIndex: Math.min(book.totalPages > 0 ? book.totalPages - 1 : 10, maxPage + 5),
      pageNumber: Math.min(book.totalPages > 0 ? book.totalPages : 11, maxPage + 6),
      destinationX: 72,
      destinationY: 720,
      level: 1,
      source: 'MANUAL',
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChapters([...chapters, newChapter]);
    setIsDirty(true);
  };

  // Save Modal Edits
  const handleModalSave = (id: string, updates: Partial<Chapter>) => {
    const copy = chapters.map(c => (c.id === id ? { ...c, ...updates } : c));
    setChapters(copy);
    setIsDirty(true);
  };

  // Delete Chapter
  const confirmDelete = () => {
    if (!deleteConfirmChapter) return;
    const toDeleteIds = new Set<string>([deleteConfirmChapter.id]);

    const findKids = (pId: string) => {
      chapters.filter(c => c.parentId === pId).forEach(c => {
        toDeleteIds.add(c.id);
        findKids(c.id);
      });
    };
    findKids(deleteConfirmChapter.id);

    const copy = chapters.filter(c => !toDeleteIds.has(c.id));
    copy.forEach((c, idx) => {
      c.sortOrder = idx + 1;
    });

    setChapters(copy);
    setIsDirty(true);
    setDeleteConfirmChapter(null);
  };

  // Save All to API
  const handleSaveBatch = async () => {
    setIsSaving(true);
    try {
      await onSaveChapters(chapters);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Reprocess
  const handleExecuteReprocess = async () => {
    setIsReprocessing(true);
    try {
      await onReprocessOutline(reprocessMode);
      setShowReprocessModal(false);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReprocessing(false);
    }
  };

  // Group chapters into parent-child structure for tree visualization
  const topLevelChapters = chapters.filter(c => !c.parentId);
  const getSubChapters = (parentId: string) => chapters.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Hierarchy & Outline Editor
          </h2>
          <span className="font-mono text-xs text-neutral-400 tabular-nums">
            ({chapters.length} total nodes)
          </span>
          {isDirty && (
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Expand/Collapse */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden text-xs">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              Expand All
            </button>
            <div className="w-px h-3 bg-neutral-200 dark:bg-neutral-800" />
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              Collapse
            </button>
          </div>

          {/* Add Manual */}
          <button
            onClick={handleAddManual}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chapter</span>
          </button>

          {/* Reprocess Trigger */}
          <button
            onClick={() => setShowReprocessModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-extract Outline</span>
          </button>

          {/* Save Changes */}
          <button
            onClick={handleSaveBatch}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium rounded-md transition-colors ${
              isDirty
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Chapter Tree</span>
          </button>
        </div>
      </div>

      {/* Chapter Tree List */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800/80 overflow-hidden">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
            <p>No chapters extracted or defined for this book yet.</p>
            <button
              onClick={() => setShowReprocessModal(true)}
              className="text-xs text-neutral-900 dark:text-neutral-100 font-semibold underline"
            >
              Run automatic PDF outline extraction
            </button>
          </div>
        ) : (
          chapters.map((chapter, index) => {
            const hasChildren = chapters.some(c => c.parentId === chapter.id);
            const isCollapsed = collapsedIds.has(chapter.id);
            const indentClass =
              chapter.level === 3 ? 'pl-14' : chapter.level === 2 ? 'pl-8' : 'pl-4';

            return (
              <div
                key={chapter.id}
                className={`flex items-center justify-between py-2.5 pr-4 ${indentClass} hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 transition-colors group ${
                  !chapter.isVisible ? 'opacity-60 bg-neutral-50/30' : ''
                }`}
              >
                {/* Left: Expand, Title, Badges */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Expand/Collapse or Leaf Spacer */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleCollapse(chapter.id)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : (
                    <div className="w-5.5" />
                  )}

                  {/* Level Indicator Line */}
                  {chapter.level > 1 && (
                    <div className="text-neutral-300 dark:text-neutral-700 font-mono text-[10px]">
                      {chapter.level === 2 ? '└─' : '└──'}
                    </div>
                  )}

                  {/* Chapter Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {chapter.title}
                      </span>

                      {/* Source Indicator (Zero-pill text separator) */}
                      <span className="text-[10px] text-neutral-400 font-mono">
                        [{chapter.source}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <span>
                        Page {chapter.pageNumber} (Index {chapter.pageIndex})
                      </span>
                      <span>·</span>
                      <span>Offset: {chapter.destinationX || 72}x, {chapter.destinationY || 720}y</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Preview destination */}
                  <button
                    onClick={() => onPreviewPage(chapter.pageIndex, chapter.title)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Preview page destination in PDF viewer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                  </button>

                  {/* Indent / Outdent hierarchy controls */}
                  <button
                    onClick={() => outdentItem(index)}
                    disabled={!chapter.parentId}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Promote (outdent) level"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => indentItem(index)}
                    disabled={index === 0}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Demote (indent) as sub-chapter"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Up/Down */}
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Move chapter up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === chapters.length - 1}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-20 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Move chapter down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleVisibility(chapter.id)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title={chapter.isVisible ? 'Hide from reader app' : 'Show in reader app'}
                  >
                    {chapter.isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => setEditingChapter(chapter)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Edit chapter title and destinations"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirmChapter(chapter)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      <ChapterEditModal
        isOpen={!!editingChapter}
        chapter={editingChapter}
        allChapters={chapters}
        totalPages={book.totalPages || 50}
        onClose={() => setEditingChapter(null)}
        onSave={handleModalSave}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmChapter && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Delete Chapter & Subsections
            </h3>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to delete <strong className="text-neutral-900 dark:text-neutral-100">"{deleteConfirmChapter.title}"</strong>?
              Any subsections nested under this chapter will also be deleted.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmChapter(null)}
                className="px-3 py-1.5 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs font-medium rounded bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-extraction Dialog with Warning */}
      {showReprocessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold">
                  Re-run Chapter Extraction
                </h3>
              </div>
              <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Warning: Re-extracting chapters will overwrite existing chapter titles, order, and manual modifications for this book.
              </p>
            </div>

            {/* Mode selection */}
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 cursor-pointer">
                <input
                  type="radio"
                  name="extractMode"
                  checked={reprocessMode === 'OUTLINE'}
                  onChange={() => setReprocessMode('OUTLINE')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    PDF Outlines & Bookmarks (Preferred)
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Parses the native PDF document catalog bookmarks tree.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 cursor-pointer">
                <input
                  type="radio"
                  name="extractMode"
                  checked={reprocessMode === 'TEXT'}
                  onChange={() => setReprocessMode('TEXT')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Document Text Heuristics
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Scans page content for "Chapter N", "Section", and roman numeral headings.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 cursor-pointer">
                <input
                  type="radio"
                  name="extractMode"
                  checked={reprocessMode === 'AI'}
                  onChange={() => setReprocessMode('AI')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>AI Structured Outline Proposal</span>
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Generates a clean normalized hierarchical outline structure using Gemini model.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReprocessModal(false)}
                disabled={isReprocessing}
                className="px-3 py-1.5 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReprocess}
                disabled={isReprocessing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white"
              >
                {isReprocessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Execute Re-extraction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
