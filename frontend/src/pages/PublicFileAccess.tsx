import { useEffect, useState } from 'react';
import {
  Download,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useParams } from 'react-router-dom';

import api from '@/api/axios';
import { sharingApi } from '@/api/sharingApi';
import { downloadBlob } from '@/api/fileApi';

import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';

import { formatFileSize } from '@/utils/formatFileSize';
import { getApiErrorMessage } from '@/utils/errorHandler';

export default function PublicFileAccess() {
  const { token } = useParams();

  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('Shared file');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      if (!token) {
        setError('Invalid public link.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<Blob>(
          `/api/shares/public/${token}`,
          {
            responseType: 'blob',
          }
        );

        const blob = response.data;

        setFileBlob(blob);

        /*
         * Try to read the filename from the backend's
         * Content-Disposition header.
         */
        const contentDisposition =
          response.headers['content-disposition'];

        if (contentDisposition) {
          const filenameMatch =
            contentDisposition.match(
              /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i
            );

          if (filenameMatch?.[1]) {
            try {
              setFileName(
                decodeURIComponent(filenameMatch[1])
              );
            } catch {
              setFileName(filenameMatch[1]);
            }
          }
        }
      } catch (e) {
        /*
         * If the backend returns an error response with
         * responseType=blob, Axios gives us a Blob instead
         * of the normal JSON error object.
         *
         * Convert it back to JSON so getApiErrorMessage()
         * can display the actual backend message.
         */
        if (
          e &&
          typeof e === 'object' &&
          'response' in e
        ) {
          const axiosError = e as {
            response?: {
              data?: Blob;
            };
          };

          const responseData = axiosError.response?.data;

          if (responseData instanceof Blob) {
            try {
              const text = await responseData.text();
              const parsed = JSON.parse(text);

              setError(
                parsed.message ||
                  'This public link is unavailable.'
              );
            } catch {
              setError(
                getApiErrorMessage(
                  e,
                  'This public link is unavailable.'
                )
              );
            }

            return;
          }
        }

        setError(
          getApiErrorMessage(
            e,
            'This public link is unavailable.'
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [token]);

  const download = async () => {
    if (!fileBlob) {
      return;
    }

    setDownloading(true);

    try {
      await downloadBlob(fileBlob, fileName);
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          'Download failed.'
        )
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light-subtle px-4 py-8 dark:bg-surface-dark">
      <div className="mx-auto max-w-xl">
        <Logo />

        <div className="card mt-12 overflow-hidden p-8 text-center sm:p-10">
          {/* Loading */}
          {loading && (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
          )}

          {/* Error */}
          {!loading && error && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <FileText />
              </div>

              <h1 className="mt-5 text-xl font-semibold">
                Link unavailable
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {error}
              </p>
            </>
          )}

          {/* File */}
          {!loading && !error && fileBlob && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <FileText className="h-8 w-8" />
              </div>

              <h1 className="mt-5 break-words text-xl font-semibold">
                {fileName}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {formatFileSize(fileBlob.size)}
              </p>

              <Button
                className="mt-6"
                onClick={download}
                loading={downloading}
              >
                <Download className="h-4 w-4" />
                Download file
              </Button>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="h-4 w-4" />
                Shared securely through CloudVault
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}