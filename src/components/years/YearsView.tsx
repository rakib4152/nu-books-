import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CalendarDays, BookOpen, ChevronRight, X } from 'lucide-react';
import { Subject, SubjectYear } from '../../lib/types';

interface YearsViewProps {
  subjects: Subject[];
  subjectYears: SubjectYear[];
  selectedSubjectId?: string;
  onSelectSubjectId: (id: string) => void;
  onCreateYear: (data: { subjectId: string; year: number; sortOrder?: number }) => Promise<void>;
  onUpdateYear: (id: string, updates: { year?: number; sortOrder?: number }) => Promise<void>;
  onDeleteYear: (id: string) => Promise<void>;
  onNavigateToBooks: (subjectYearId: string) => void;
}

export const YearsView: React.FC<YearsViewProps> = ({
  subjects,
  subjectYears,
  selectedSubjectId,
  onSelectSubjectId,
  onCreateYear,
  onUpdateYear,
  onDeleteYear,
  onNavigateToBooks,
}) => {
  const [filterSubjectId, setFilterSubjectId] = useState<string>(selectedSubjectId || 'ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<SubjectYear | null>(null);

  // Form states
  const [modalSubjectId, setModalSubjectId] = useState<string>(
    selectedSubjectId && selectedSubjectId !== 'ALL' ? selectedSubjectId : subjects[0]?.id || ''
  );
  const [yearValue, setYearValue] = useState<number>(new Date().getFullYear());
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmYear, setDeleteConfirmYear] = useState<SubjectYear | null>(null);

  const displayedYears = subjectYears.filter(sy =>
    filterSubjectId === 'ALL' || sy.subjectId === filterSubjectId
  );

  const openCreateModal = () => {
    setEditingYear(null);
    setFormError(null);
    if (filterSubjectId !== 'ALL') {
      setModalSubjectId(filterSubjectId);
    } else {
      setModalSubjectId(subjects[0]?.id || '');
    }
    setYearValue(2026);
    setSortOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (sy: SubjectYear) => {
    setEditingYear(sy);
    setFormError(null);
    setModalSubjectId(sy.subjectId);
    setYearValue(sy.year);
    setSortOrder(sy.sortOrder);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    setIsSubmitting(true);
    try {
      if (editingYear) {
        await onUpdateYear(editingYear.id, { year: yearValue, sortOrder });
      } else {
        await onCreateYear({ subjectId: modalSubjectId, year: yearValue, sortOrder });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmYear) return;
    try {
      await onDeleteYear(deleteConfirmYear.id);
      setDeleteConfirmYear(null);
    } catch (err: any) {
      alert(err.message || 'Cannot delete year');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Curriculum Years Management
          </h1>
          <p className="text-xs text-neutral-500">
            Rule: A Subject contains multiple years. Different subjects can contain the same year (e.g. English 2025, Bangla 2025).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Year to Subject</span>
        </button>
      </div>

      {/* Filter by Subject Bar */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs">
        <span className="font-medium text-neutral-600 dark:text-neutral-400">Filter Subject:</span>
        <select
          value={filterSubjectId}
          onChange={(e) => {
            setFilterSubjectId(e.target.value);
            onSelectSubjectId(e.target.value);
          }}
          className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
        >
          <option value="ALL">All Subjects ({subjectYears.length} total years)</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        <span className="ml-auto font-mono text-[11px] text-neutral-400 tabular-nums">
          Showing {displayedYears.length} year entries
        </span>
      </div>

      {/* Grid of Subject Years */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedYears.map((sy) => (
          <div
            key={sy.id}
            className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 font-mono uppercase tracking-wider">
                  {sy.subjectName}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(sy)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Edit year"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmYear(sy)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete year"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                  {sy.year}
                </h3>
                <span className="text-[11px] text-neutral-400">Curriculum</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-neutral-500 tabular-nums">
                {sy.bookCount || 0} books
              </span>

              <button
                onClick={() => onNavigateToBooks(sy.id)}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
              >
                <span>View Books</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit Year */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {editingYear ? 'Edit Subject Year' : 'Add Year to Subject'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Target Subject *</label>
                <select
                  disabled={!!editingYear}
                  value={modalSubjectId}
                  onChange={(e) => setModalSubjectId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-60"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Curriculum Year (e.g. 2025, 2026) *</label>
                <input
                  type="number"
                  min={2000}
                  max={2050}
                  required
                  value={yearValue}
                  onChange={(e) => setYearValue(parseInt(e.target.value, 10) || 2025)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium"
                >
                  {editingYear ? 'Save Changes' : 'Create Subject Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmYear && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Confirm Delete Subject Year
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to delete year <strong className="text-neutral-900 dark:text-neutral-100">{deleteConfirmYear.year}</strong> under <strong className="text-neutral-900 dark:text-neutral-100">{deleteConfirmYear.subjectName}</strong>?
              Note: A year containing books cannot be deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmYear(null)}
                className="px-3 py-1.5 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-1.5 text-xs font-medium rounded bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete Year
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
