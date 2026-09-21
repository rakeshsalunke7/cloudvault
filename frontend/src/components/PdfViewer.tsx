import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Document,
  Page,
  pdfjs,
} from 'react-pdf';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { downloadBlob } from '@/api/fileApi';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  blob: Blob;
  fileName: string;
  canDownload: boolean;
  onClose: () => void;
}

export default function PdfViewer({
  blob,
  fileName,
  canDownload,
  onClose,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  /*
   * Create a temporary URL for the PDF blob.
   * Clean it up when the viewer closes or the blob changes.
   */
  useEffect(() => {
    const url = URL.createObjectURL(blob);

    setPdfUrl(url);
    setPageNumber(1);
    setNumPages(0);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  /*
   * PDF loaded successfully.
   */
  const handleLoadSuccess = ({
    numPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  /*
   * Download is only possible when the
   * user has DOWNLOAD permission.
   */
  const handleDownload = async () => {
    if (!canDownload) {
      return;
    }

    await downloadBlob(blob, fileName);
  };

  /*
   * Don't render until the blob URL exists.
   */
  if (!pdfUrl) {
    return null;
  }

  /*
   * Render directly into <body>.
   *
   * This prevents parent layouts, overflow,
   * stacking contexts, or transforms from
   * affecting the full-screen viewer.
   */
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex h-screen w-screen flex-col bg-gray-900">

      {/* ========================================================= */}
      {/* HEADER                                                    */}
      {/* ========================================================= */}

      <div className="flex h-16 shrink-0 items-center border-b border-white/10 bg-gray-950 px-4 text-white">

        {/* File information */}
        <div className="flex min-w-0 flex-1 items-center gap-3">

          {/* PDF icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-red-400"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 2.75h8.5L19 7.25V21a1.25 1.25 0 0 1-1.25 1.25h-11.5A1.25 1.25 0 0 1 5 21V4a1.25 1.25 0 0 1 1.25-1.25Z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 2.75V7.5h4.75"
              />
            </svg>

          </div>

          {/* File name + permission */}
          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <p className="truncate text-sm font-medium">
                {fileName}
              </p>

              {/* Permission badge */}
              <span
                className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${
                  canDownload
                    ? 'bg-blue-500/10 text-blue-300'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {canDownload
                  ? 'Download allowed'
                  : 'View only'}
              </span>

            </div>

            <p className="text-xs text-gray-500">
              PDF document
            </p>

          </div>

        </div>

        {/* ======================================================= */}
        {/* PAGE INDICATOR                                          */}
        {/* ======================================================= */}

        <div className="mr-2 hidden items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 sm:flex">

          <span className="font-medium text-white">
            {pageNumber}
          </span>

          <span className="mx-1 text-gray-600">
            /
          </span>

          <span>
            {numPages || 1}
          </span>

        </div>

        {/* ======================================================= */}
        {/* ACTIONS                                                  */}
        {/* ======================================================= */}

        <div className="flex items-center gap-1">

          {/* Download */}
          {canDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Download file"
            >
              <Download className="h-4 w-4" />

              <span className="hidden md:inline">
                Download
              </span>
            </button>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

      </div>

      {/* ========================================================= */}
      {/* PDF CONTENT                                               */}
      {/* ========================================================= */}

      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-gray-900 p-6">

        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}

          loading={
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              Loading PDF...
            </div>
          }

          error={
            <div className="flex items-center justify-center py-10 text-sm text-red-400">
              Unable to load this PDF.
            </div>
          }
        >

          <Page
            pageNumber={pageNumber}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-2xl"
          />

        </Document>

      </div>

      {/* ========================================================= */}
      {/* PAGE NAVIGATION                                           */}
      {/* ========================================================= */}

      {numPages > 1 && (
        <div className="flex h-16 shrink-0 items-center justify-center gap-4 border-t border-white/10 bg-gray-900">

          {/* Previous */}
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() =>
              setPageNumber((page) =>
                Math.max(1, page - 1)
              )
            }
            className="rounded-lg p-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Page number */}
          <span className="text-sm text-gray-300">
            {pageNumber} / {numPages}
          </span>

          {/* Next */}
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() =>
              setPageNumber((page) =>
                Math.min(numPages, page + 1)
              )
            }
            className="rounded-lg p-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

        </div>
      )}

    </div>,

    document.body
  );
}