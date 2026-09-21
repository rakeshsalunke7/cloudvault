import { useEffect, useState } from 'react';
import { Download, Eye, Share2 } from 'lucide-react';

import { sharingApi } from '@/api/sharingApi';
import { fileApi, downloadBlob } from '@/api/fileApi';

import { getFileIcon } from '@/utils/fileIcons';
import { formatRelativeTime } from '@/utils/formatDate';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { useToast } from '@/components/common/Toast';

import { getApiErrorMessage } from '@/utils/errorHandler';

import PdfViewer from '@/components/PdfViewer';

import type {
  ShareResponse,
  SharePermission,
} from '@/types/sharing';


function PermissionBadge({
  permission,
}: {
  permission: SharePermission;
}) {
  return permission === 'DOWNLOAD' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
      <Download className="h-3 w-3" />
      Download
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-surface-dark-muted dark:text-gray-400">
      <Eye className="h-3 w-3" />
      View only
    </span>
  );
}


export default function SharedWithMe() {

  const [files, setFiles] =
    useState<ShareResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const { showToast } =
    useToast();


  const load = () => {

    setLoading(true);
    setError(false);

    sharingApi
      .getSharedFiles()
      .then(setFiles)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    load();
  }, []);


  // =========================
  // Preview
  // =========================
const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
const [previewFileName, setPreviewFileName] = useState('');
const [previewCanDownload, setPreviewCanDownload] = useState(false);


const preview = async (file: ShareResponse) => {
  try {
    const blob = await fileApi.preview(file.fileId);

    setPreviewBlob(blob);
    setPreviewFileName(file.fileName);
    setPreviewCanDownload(file.permission === 'DOWNLOAD');
  } catch (err) {
    showToast(
      'error',
      getApiErrorMessage(err, 'Unable to open file')
    );
  }
};

  // =========================
  // Download
  // =========================

  const download = async (
    file: ShareResponse
  ) => {

    try {

      await downloadBlob(
        await fileApi.download(
          file.fileId
        ),
        file.fileName
      );

    } catch (err) {

      showToast(
        'error',
        getApiErrorMessage(
          err,
          'Download failed'
        )
      );
    }
  };


  if (error) {

    return (
      <ErrorState
        message="We couldn't load your shared files."
        action={
          <Button onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }


  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold tracking-tight">
          Shared with me
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Files other CloudVault users have shared with you.
        </p>

      </div>


      {loading ? (

        <div className="card divide-y divide-gray-100 dark:divide-surface-dark-border">

          {[1, 2, 3].map((i) => (

            <div
              key={i}
              className="flex items-center gap-4 p-4"
            >

              <Skeleton className="h-10 w-10 rounded-lg" />

              <div className="flex-1 space-y-2">

                <Skeleton className="h-4 w-1/3" />

                <Skeleton className="h-3 w-1/5" />

              </div>

            </div>

          ))}

        </div>

      ) : files.length === 0 ? (

        <div className="card">

          <EmptyState
            icon={
              <Share2 className="h-7 w-7" />
            }
            title="Nothing shared with you yet"
            description="Files shared with your account will appear here."
          />

        </div>

      ) : (

        <div className="card overflow-hidden">

          {/* Header */}

          <div className="hidden border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-surface-dark-border sm:flex">

            <div className="flex-1">
              File
            </div>

            <div className="w-48">
              Owner
            </div>

            <div className="w-32">
              Permission
            </div>

            <div className="w-28">
              Shared
            </div>

            <div className="w-10" />

          </div>


          {/* Rows */}

          <div className="divide-y divide-gray-100 dark:divide-surface-dark-border">

            {files.map((file) => {

              const {
                icon: Icon,
                color,
                bg,
              } = getFileIcon(
                file.fileName
              );


              return (

                <div
                  key={file.id}
                  onClick={() => preview(file)}
                  className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-surface-dark-muted/50"
                >

                  {/* File */}

                  <div className="flex min-w-0 flex-1 items-center gap-3">

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}
                    >

                      <Icon
                        className={`h-4.5 w-4.5 ${color}`}
                      />

                    </div>


                    <div className="min-w-0">

                      <p
                        className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>

                      <p className="text-xs text-gray-500">
                        Click to preview
                      </p>

                    </div>

                  </div>


                  {/* Owner */}

                  <div className="hidden w-48 truncate text-sm text-gray-600 dark:text-gray-400 sm:block">

                    {file.sharedByEmail || 'Unknown'}

                  </div>


                  {/* Permission */}

                  <div className="hidden w-32 sm:block">

                    <PermissionBadge
                      permission={
                        file.permission
                      }
                    />

                  </div>


                  {/* Shared */}

                  <div className="hidden w-28 text-sm text-gray-500 sm:block">

                    {formatRelativeTime(
                      file.createdAt
                    )}

                  </div>


                  {/* Actions */}

                  <div
                    className="flex w-10 justify-end"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >

                    {file.permission ===
                      'DOWNLOAD' && (

                      <button
                        onClick={() =>
                          download(file)
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-surface-dark-muted"
                        aria-label="Download"
                        title="Download"
                      >

                        <Download className="h-4 w-4" />

                      </button>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      )}

      {previewBlob && (
  <PdfViewer
    blob={previewBlob}
    fileName={previewFileName}
    canDownload={previewCanDownload}
    onClose={() => {
      setPreviewBlob(null);
      setPreviewFileName('');
      setPreviewCanDownload(false);
    }}
  />
)}

    </div>
  );
}