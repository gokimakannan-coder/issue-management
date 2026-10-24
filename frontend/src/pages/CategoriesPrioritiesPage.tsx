import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { IssueCategory } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

export const CategoriesPrioritiesPage: React.FC = () => {
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IssueCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<IssueCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#3b82f6');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: IssueCategory) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setColor(c.color || '#3b82f6');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const colorPresets = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#64748b', // Slate
  ];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Categories & Priorities"
        description="Configure issue categorization, visual tags, and organizational SLA response benchmarks."
      >
        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Issue Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton rows={4} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Color & Name</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Active Issues</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: c.color }}
                            />
                            <span>{c.name}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                            {c.description || '—'}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                            {c._count?.issues ?? 0} tickets
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(c)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Priority & SLA Reference Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Priority Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-rose-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Critical
                  </span>
                  <span>SLA: 4 Hours</span>
                </div>
                <p className="text-rose-700 leading-snug">
                  Production outage, security breach, or revenue-blocking failure. Immediate escalation.
                </p>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-orange-800">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> High
                  </span>
                  <span>SLA: 24 Hours</span>
                </div>
                <p className="text-orange-700 leading-snug">
                  Severe degradation with major workflow disruption. No immediate workaround.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-blue-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Medium
                  </span>
                  <span>SLA: 72 Hours</span>
                </div>
                <p className="text-blue-700 leading-snug">
                  Standard defect or request where viable workarounds exist.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Low
                  </span>
                  <span>SLA: 7 Days</span>
                </div>
                <p className="text-slate-600 leading-snug">
                  Minor cosmetic glitches, typography typos, or non-urgent refactor suggestions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        description="Define an issue classification tag and display color."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Security Vulnerability"
          />

          <div className="space-y-1.5">
            <label htmlFor="cat-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Description
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What types of problems belong in this bucket?"
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Tag Accent Color
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#3b82f6"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"?`}
        confirmLabel="Delete Category"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
