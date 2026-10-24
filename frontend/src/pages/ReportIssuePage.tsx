import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, ArrowLeft, CheckCircle2, Paperclip, X } from 'lucide-react';
import { issueService } from '../services/issueService';
import { categoryService } from '../services/categoryService';
import { userService } from '../services/userService';
import { IssueCategory, Priority, User } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { toast } from 'sonner';

const reportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  categoryId: z.string().min(1, 'Please select an issue category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      priority: 'MEDIUM',
      categoryId: '',
      assigneeId: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    Promise.all([
      categoryService.getCategories(),
      userService.getUsers(),
    ])
      .then(([cats, uList]) => {
        setCategories(cats);
        setUsers(uList);
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (values: ReportFormValues) => {
    try {
      setIsSubmitting(true);
      const newIssue = await issueService.createIssue({
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        priority: values.priority,
        assigneeId: values.assigneeId || null,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      });

      // If initial file attachment is selected, upload it
      if (selectedFile) {
        try {
          await issueService.uploadAttachment(newIssue.id, selectedFile);
        } catch (uploadErr) {
          console.error('File upload warning:', uploadErr);
        }
      }

      toast.success(`Issue ${newIssue.issueKey} created successfully!`);
      navigate(`/issues/${newIssue.issueKey}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Report New Issue</h1>
          <p className="text-sm text-slate-500">
            Submit a bug report, operational malfunction, or enhancement request.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <Input
                label="Issue Title"
                placeholder="e.g. Payment gateway timeout during peak checkout hours"
                error={errors.title?.message}
                required
                {...register('title')}
              />
              <p className="mt-1 text-xs text-slate-400">
                Be specific and concise so team members can quickly identify the problem.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe the steps to reproduce, expected vs actual behavior, error messages, and context..."
                className={`w-full p-3.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.description ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300'
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-600 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                error={errors.categoryId?.message}
                required
                {...register('categoryId')}
              >
                <option value="">Select an Issue Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Priority Level"
                error={errors.priority?.message}
                required
                {...register('priority')}
              >
                <option value="LOW">Low (Minor annoyance or enhancement)</option>
                <option value="MEDIUM">Medium (Normal business priority)</option>
                <option value="HIGH">High (Urgent blocker for workflow)</option>
                <option value="CRITICAL">Critical (System outage / Data integrity)</option>
              </Select>
            </div>

            {/* Assignee and Due Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assignee (Optional)"
                error={errors.assigneeId?.message}
                {...register('assigneeId')}
              >
                <option value="">Leave Unassigned (Open Pool)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </Select>

              <Input
                label="Due Date (Target SLA)"
                type="date"
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
            </div>

            {/* File Attachment Upload */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Attachment (Optional)
              </label>
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span>{selectedFile.name}</span>
                    <span className="text-slate-400">({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 hover:border-indigo-400 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-600 font-medium">
                        Click to upload screenshot, crash log, or spec file
                      </p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, PDF, TXT up to 10MB</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit Issue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
