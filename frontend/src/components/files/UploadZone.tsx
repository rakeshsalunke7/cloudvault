import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, X, CheckCircle2, File as FileIcon, AlertCircle } from 'lucide-react';
import { fileApi } from '@/api/fileApi';
import { getFileIcon, formatFileSize } from '@/utils/fileIcons';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { useToast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

interface UploadItem {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadZoneProps {
  open: boolean;
  onClose: () => void;
  folderId: number | null;
  onUploaded: () => void;
}

export function UploadZone({ open, onClose, folderId, onUploaded }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newItems: UploadItem[] = [];

      for (const file of Array.from(fileList)) {
        if (file.size === 0) {
          showToast('error', `${file.name} is empty and cannot be uploaded.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          showToast('error', `${file.name} exceeds the 50 MB limit.`);
          continue;
        }
        newItems.push({ file, progress: 0, status: 'uploading' });
      }

      if (newItems.length === 0) return;

      setItems((prev) => [...prev, ...newItems]);

      // Upload each file sequentially
      newItems.reduce((promise, item) => {
        return promise.then(() => {
          return fileApi
            .upload(item.file, folderId, (percent) => {
              setItems((prev) =>
                prev.map((p) => (p.file === item.file ? { ...p, progress: percent } : p))
              );
            })
            .then(() => {
              setItems((prev) =>
                prev.map((p) => (p.file === item.file ? { ...p, status: 'success', progress: 100 } : p))
              );
            })
            .catch((err) => {
              setItems((prev) =>
                prev.map((p) =>
                  p.file === item.file
                    ? { ...p, status: 'error', error: getApiErrorMessage(err) }
                    : p
                )
              );
            });
        });
      }, Promise.resolve()).then(() => {
        onUploaded();
      });
    },
    [folderId, showToast, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Reset when closed
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setItems([]), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const allDone = items.length > 0 && items.every((i) => i.status !== 'uploading');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload files"
      description="Drag and drop files here, or click to browse. Maximum 50 MB per file."
      size="lg"
      footer={
        <>
          {allDone && (
            <Button variant="outline" onClick={() => setItems([])}>
              Clear
            </Button>
          )}
          <Button variant={allDone ? 'primary' : 'outline'} onClick={onClose}>
            {allDone ? 'Done' : 'Close'}
          </Button>
        </>
      }
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/5'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50 dark:border-surface-dark-border dark:hover:bg-surface-dark-muted'
        }`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {dragging ? 'Drop files to upload' : 'Click to browse or drag files here'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Maximum file size is 50 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Upload list */}
      {items.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {items.filter((i) => i.status === 'uploading').length > 0
              ? 'Uploading...'
              : 'Uploads complete'}
          </p>
          {items.map((item, idx) => {
            const { icon: Icon, color, bg } = getFileIcon(item.file.name);
            return (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-surface-dark-border">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Icon className={`h-5 w-5 ${color}`} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.file.name}
                    </p>
                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(item.file.size)}
                    </span>
                  </div>
                  {item.status === 'uploading' && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-surface-dark-muted">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'success' && (
                    <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">Uploaded successfully</p>
                  )}
                  {item.status === 'error' && (
                    <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{item.error}</p>
                  )}
                  {item.status === 'uploading' && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.progress}%</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
