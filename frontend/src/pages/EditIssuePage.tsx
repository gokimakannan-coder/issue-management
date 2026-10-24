import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { issueService } from '../services/issueService';
import { categoryService } from '../services/categoryService';
import { IssueCategory, Priority } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { toast } from 'sonner';

const editSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  categoryId: z.string().min(1, 'Please select a category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export const EditIssuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      categoryService.getCategories(),
      issueService.getIssue(id),
    ])
      .then(([cats, issueData]) => {
        setCategories(cats);
        reset({
          title: issueData.title,
          description: issueData.description,
          categoryId: issueData.categoryId,
          priority: issueData.priority,
          dueDate: issueData.dueDate ? issueData.dueDate.split('T')[0] : '',
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load issue');
        navigate('/issues');
      });
  }, [id, reset, navigate]);

  const onSubmit = async (values: EditFormValues) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await issueService.updateIssue(id, {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        priority: values.priority,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      });

      toast.success('Issue updated successfully');
      navigate(`/issues/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded" />
        <div className="h-96 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/issues/${id}`)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Cancel
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Issue Details</h1>
          <p className="text-sm text-slate-500">Update ticket metadata, title, and SLA deadlines.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Issue Title"
              error={errors.title?.message}
              required
              {...register('title')}
            />

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                className={`w-full p-3.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.description ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300'
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-600 font-medium">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Category"
                error={errors.categoryId?.message}
                required
                {...register('categoryId')}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Priority"
                error={errors.priority?.message}
                required
                {...register('priority')}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>

              <Input
                label="Target Due Date"
                type="date"
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/issues/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
