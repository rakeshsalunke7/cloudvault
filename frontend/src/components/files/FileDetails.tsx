import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { getFileIcon, formatFileSize, getContentTypeLabel, isImageFile, isPdfFile } from '@/utils/fileIcons';
import { formatDateTime } from '@/utils/formatDate';
import { downloadBlob, fileApi } from '@/api/fileApi';
import { Download, Calendar, FileBox, HardDrive, Folder, Loader2 } from 'lucide-react';
import type { FileEntity } from '@/types/file';

export function FileDetails({ file, open, onClose }: { file: FileEntity | null; open: boolean; onClose: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !file || (!isImageFile(file.originalName) && !isPdfFile(file.originalName))) { setPreviewUrl(null); return; }
    let active = true;
    setLoadingPreview(true);
    fileApi.download(file.id).then((blob) => { if (active) setPreviewUrl(URL.createObjectURL(blob)); }).catch(() => setPreviewUrl(null)).finally(() => setLoadingPreview(false));
    return () => { active = false; setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return null; }); };
  }, [open, file]);

  if (!file) return null;
  const { icon: Icon, color, bg } = getFileIcon(file.originalName);
  const download = async () => { setDownloading(true); try { await downloadBlob(await fileApi.download(file.id), file.originalName); } finally { setDownloading(false); } };

  return <Modal open={open} onClose={onClose} title="File details" size="lg" footer={<Button onClick={download} loading={downloading}><Download className="h-4 w-4" />Download</Button>}>
    <div className="mb-6 flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-surface-dark-border dark:bg-surface-dark-muted">
      {loadingPreview ? <Loader2 className="h-7 w-7 animate-spin text-brand-500" /> : previewUrl && isImageFile(file.originalName) ? <img src={previewUrl} alt={file.originalName} className="max-h-80 max-w-full object-contain" /> : previewUrl && isPdfFile(file.originalName) ? <iframe src={previewUrl} className="h-80 w-full" title={file.originalName} /> : <div className={`flex h-24 w-24 items-center justify-center rounded-2xl ${bg}`}><Icon className={`h-12 w-12 ${color}`} /></div>}
    </div>
    <h3 className="truncate text-base font-semibold" title={file.originalName}>{file.originalName}</h3>
    <div className="mt-5 space-y-3">{[
      [FileBox, 'Type', getContentTypeLabel(file.contentType)],
      [HardDrive, 'Size', formatFileSize(file.size)],
      [Calendar, 'Created', formatDateTime(file.createdAt)],
      [Folder, 'Location', file.folderId ? `Folder ${file.folderId}` : 'My Files'],
    ].map(([IconComponent, label, value]) => { const I = IconComponent as typeof FileBox; return <div key={String(label)} className="flex items-center gap-3"><I className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">{String(label)}</span><span className="ml-auto text-sm font-medium">{String(value)}</span></div>; })}</div>
  </Modal>;
}
