import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Trash2, Send, MessageSquare } from 'lucide-react';
import { Comment } from '../../types';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface IssueCommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

export const IssueComments: React.FC<IssueCommentsProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const { user, isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddComment(content.trim());
      setContent('');
      toast.success('Comment posted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      setDeletingId(id);
      await onDeleteComment(id);
      toast.success('Comment deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No comments yet</p>
            <p className="text-xs text-slate-400">Be the first to share an update or question on this issue.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const canDelete = isAdmin || comment.authorId === user?.id;

            return (
              <div
                key={comment.id}
                className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        comment.author?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          comment.author?.name || 'User'
                        )}`
                      }
                      alt={comment.author?.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {comment.author?.name}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {comment.author?.role}
                        </span>
                      </div>
                      <span
                        className="text-[11px] text-slate-400"
                        title={format(new Date(comment.createdAt), 'PPpp')}
                      >
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-11">
                  {comment.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
        <label htmlFor="comment-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Add Comment
        </label>
        <textarea
          id="comment-input"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment, status note, or technical finding..."
          className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
        />
        <div className="mt-2.5 flex justify-end">
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={!content.trim()}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  );
};
