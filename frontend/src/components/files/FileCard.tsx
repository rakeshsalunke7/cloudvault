import { getFileIcon, formatFileSize } from '@/utils/fileIcons';
import { formatRelativeTime } from '@/utils/formatDate';
import { FileActions } from './FileActions';
import type { FileEntity } from '@/types/file';
import { downloadBlob, fileApi } from '@/api/fileApi';

interface Props {
  file: FileEntity;
  onShare: (file: FileEntity) => void;
  onPublicLink: (file: FileEntity) => void;
  onDetails: (file: FileEntity) => void;
  onDelete: (file: FileEntity) => void;
}

export function FileCard({
  file,
  onShare,
  onPublicLink,
  onDetails,
  onDelete,
}: Props) {

  const {
    icon: Icon,
    color,
    bg,
  } = getFileIcon(file.originalName);

  const download = async () => {
    const blob = await fileApi.download(file.id);

    await downloadBlob(
      blob,
      file.originalName
    );
  };

  return (
    <div className="card group relative p-4 transition-all hover:-translate-y-0.5 hover:shadow-md-soft">

      <div className="flex items-start justify-between">

        <button
          onClick={() => onDetails(file)}
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}
          aria-label={`Open ${file.originalName}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </button>

        <FileActions
          file={file}
          onDownload={download}
          onShare={() => onShare(file)}
          onPublicLink={() => onPublicLink(file)}
          onDetails={() => onDetails(file)}
          onDelete={() => onDelete(file)}
        />

      </div>

      <button
        onClick={() => onDetails(file)}
        className="mt-3 block w-full text-left"
      >
        <p
          className="truncate text-sm font-semibold"
          title={file.originalName}
        >
          {file.originalName}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {formatFileSize(file.size)}
          {' · '}
          {formatRelativeTime(file.createdAt)}
        </p>
      </button>

    </div>
  );
}