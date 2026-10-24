import React, { useRef, useState } from 'react';
import { FileText, Paperclip, Download, Trash2, Upload, FileCode, Image as ImageIcon } from 'lucide-react';
import { Attachment } from '../../types';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface IssueAttachmentsProps {
  attachments: Attachment[];
  onUploadAttachment: (file: File) => Promise<void>;
  onDeleteAttachment: (id: string) => Promise<void>;
}

export const IssueAttachments: React.FC<IssueAttachmentsProps> = ({
  attachments,
  onUploadAttachment,
  onDeleteAttachment,
}) => {
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10MB');
      return;
    }

    try {
      setIsUploading(true);
      await onUploadAttachment(file);
      toast.success('File uploaded successfully');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}"?`)) return;
    try {
      setDeletingId(id);
      await onDeleteAttachment(id);
      toast.success('Attachment deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete attachment');
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) {
      return <FileCode className="w-5 h-5 text-amber-500" />;
    }
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload button & hidden input */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Attachments ({attachments.length})
        </h4>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload File
          </Button>
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all"
        >
          <Paperclip className="w-6 h-6 mx-auto text-slate-300 mb-1" />
          <p className="text-xs font-medium text-slate-600">No attachments yet</p>
          <p className="text-[11px] text-slate-400">Click to upload error screenshots, logs, or specs (up to 10MB)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att) => {
            const canDelete = isAdmin || att.uploaderId === user?.id;

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/80 hover:border-slate-300 shadow-xs transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
                    {getFileIcon(att.mimeType)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-slate-800 truncate" title={att.originalName}>
                      {att.originalName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatFileSize(att.fileSize)} • {att.uploader?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <a
                    href={att.filePath}
                    target="_blank"
                    rel="noreferrer"
                    download={att.originalName}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(att.id, att.originalName)}
                      disabled={deletingId === att.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
