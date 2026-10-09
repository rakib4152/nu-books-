import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, ArrowUpDown, ChevronRight, X, Calendar } from 'lucide-react';
import { Subject } from '../../lib/types';

interface SubjectsViewProps {
  subjects: Subject[];
  onCreateSubject: (data: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }) => Promise<void>;
  onUpdateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onNavigateToYears: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onNavigateToYears,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder(subjects.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setSlug(subject.slug);
    setDescription(subject.description || '');
    setSortOrder(subject.sortOrder);
    setIsActive(subject.isActive);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSubject) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await onUpdateSubject(editingSubject.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          sortOrder,
          isActive,
        });
      } else {
        await onCreateSubject({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          sortOrder,
          isActive,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmSubject) return;
    try {
      await onDeleteSubject(deleteConfirmSubject.id);
      setDeleteConfirmSubject(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Subject Management
          </h1>
          <p className="text-xs text-neutral-500">
            Primary classification for digital books. Each subject contains multiple curriculum years.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search subjects by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
          />
        </div>
        <span className="ml-auto font-mono text-[11px] text-neutral-400 tabular-nums">
          {filtered.length} subjects
        </span>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((subject) => (
          <div
            key={subject.id}
            className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {subject.name}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      subject.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(subject)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Edit subject"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmSubject(subject)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="font-mono text-[11px] text-neutral-400 mt-0.5">
                Slug: {subject.slug} · Sort Order: {subject.sortOrder}
              </p>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed line-clamp-2">
                {subject.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                <span>{subject.yearCount || subject.years?.length || 0} years</span>
                <span>·</span>
                <span>{subject.bookCount || 0} books</span>
              </div>

              <button
                onClick={() => onNavigateToYears(subject.id)}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
              >
                <span>Manage Years</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. English, Bangla, Mathematics"
                  className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Curriculum scope, textbook standards..."
                  className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">Active</span>
                  </label>
                </div>
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
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSubject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Confirm Delete Subject
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to delete <strong className="text-neutral-900 dark:text-neutral-100">"{deleteConfirmSubject.name}"</strong>?
              Note: Subjects containing active books cannot be deleted until all books are reassigned or removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmSubject(null)}
                className="px-3 py-1.5 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-1.5 text-xs font-medium rounded bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
