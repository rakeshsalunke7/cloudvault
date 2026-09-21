import {
  getFileIcon,
  formatFileSize,
  getContentTypeLabel,
} from '@/utils/fileIcons';
import { formatRelativeTime } from '@/utils/formatDate';
import { FileActions } from './FileActions';
import { fileApi } from '@/api/fileApi';
import type { FileEntity } from '@/types/file';

interface FileListProps {
  files: FileEntity[];
  onShare: (file: FileEntity) => void;
  onPublicLink: (file: FileEntity) => void;
  onDetails: (file: FileEntity) => void;
  onDelete: (file: FileEntity) => void;
}

export function FileList({
  files,
  onShare,
  onPublicLink,
  onDetails,
  onDelete,
}: FileListProps) {

  const handleDownload = (file: FileEntity) => {

    fileApi.download(file.id)
      .then((blob) => {

        const url =
          URL.createObjectURL(blob);

        const a =
          document.createElement('a');

        a.href = url;
        a.download =
          file.originalName;

        a.click();

        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="card overflow-visible">

      <div className="hidden border-b border-gray-100 px-4 py-3 dark:border-surface-dark-border sm:flex">

        <div className="flex-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Name
        </div>

        <div className="w-24 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Type
        </div>

        <div className="w-24 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Size
        </div>

        <div className="w-28 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Modified
        </div>

        <div className="w-10" />

      </div>

      <div className="divide-y divide-gray-50 dark:divide-surface-dark-border/50">

        {files.map((file) => {

          const {
            icon: Icon,
            color,
            bg,
          } =
            getFileIcon(
              file.originalName
            );

          return (
            <div
              key={file.id}
              className="group flex items-center px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-surface-dark-muted/50"
            >

              <div className="flex min-w-0 flex-1 items-center gap-3">

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 ${color}`}
                    style={{
                      width: 18,
                      height: 18,
                    }}
                  />
                </div>

                <p
                  className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                  title={file.originalName}
                >
                  {file.originalName}
                </p>

              </div>

              <div className="hidden w-24 text-sm text-gray-500 dark:text-gray-400 sm:block">
                {getContentTypeLabel(
                  file.contentType
                )}
              </div>

              <div className="hidden w-24 text-sm text-gray-500 dark:text-gray-400 sm:block">
                {formatFileSize(
                  file.size
                )}
              </div>

              <div className="hidden w-28 text-sm text-gray-500 dark:text-gray-400 sm:block">
                {formatRelativeTime(
                  file.createdAt
                )}
              </div>

              <div className="relative w-10">

                <FileActions
                  file={file}
                  onDownload={() =>
                    handleDownload(file)
                  }
                  onShare={() =>
                    onShare(file)
                  }
                  onPublicLink={() =>
                    onPublicLink(file)
                  }
                  onDetails={() =>
                    onDetails(file)
                  }
                  onDelete={() =>
                    onDelete(file)
                  }
                />

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}