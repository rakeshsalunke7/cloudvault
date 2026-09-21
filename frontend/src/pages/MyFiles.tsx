import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Grid3X3,
  List,
  FolderPlus,
  Upload,
  Search,
  ChevronRight,
  Home,
  X,
} from 'lucide-react';

import {
  fileApi,
  downloadBlob,
} from '@/api/fileApi';

import { folderApi } from '@/api/folderApi';

import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { FolderGrid } from '@/components/folders/FolderGrid';
import { CreateFolderModal } from '@/components/folders/CreateFolderModal';

import { ShareModal } from '@/components/sharing/ShareModal';
import { PublicLinkModal } from '@/components/sharing/PublicLinkModal';

import { FileDetails } from '@/components/files/FileDetails';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';

import {
  FileCardSkeleton,
  FolderCardSkeleton,
} from '@/components/common/Skeleton';

import { useToast } from '@/components/common/Toast';
import { getApiErrorMessage } from '@/utils/errorHandler';

import type { FileEntity } from '@/types/file';
import type { Folder } from '@/types/folder';

const VIEW_KEY = 'cloudvault_view';

const MAX_FILE_SIZE =
  50 * 1024 * 1024;

export default function MyFiles() {

  const { folderId } =
    useParams();

  const currentFolderId =
    folderId
      ? Number(folderId)
      : null;

  const navigate =
    useNavigate();

  const { showToast } =
    useToast();

  const [files, setFiles] =
    useState<FileEntity[]>([]);

  const [folders, setFolders] =
    useState<Folder[]>([]);

  const [breadcrumb, setBreadcrumb] =
    useState<Folder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [breadcrumbLoading, setBreadcrumbLoading] =
    useState(false);

  const [error, setError] =
    useState(false);

  const [view, setView] =
    useState<'grid' | 'list'>(() => {

      const saved =
        localStorage.getItem(
          VIEW_KEY
        );

      return saved === 'list'
        ? 'list'
        : 'grid';
    });

  const [searchQuery, setSearchQuery] =
    useState('');

  const [searchResults, setSearchResults] =
    useState<FileEntity[] | null>(
      null
    );

  const [searching, setSearching] =
    useState(false);

  const [createFolderOpen, setCreateFolderOpen] =
    useState(false);

  const [shareFile, setShareFile] =
    useState<FileEntity | null>(null);

  const [publicLinkFile, setPublicLinkFile] =
    useState<FileEntity | null>(null);

  const [detailsFile, setDetailsFile] =
    useState<FileEntity | null>(null);

  const [deleteFile, setDeleteFile] =
    useState<FileEntity | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  /*
   * Load current folder contents.
   */
  const loadData =
    useCallback(() => {

      setLoading(true);
      setError(false);

      Promise.all([
        fileApi.getFiles(
          currentFolderId
        ),

        folderApi.getFolders(
          currentFolderId
        ),
      ])
        .then(([fileData, folderData]) => {

          setFiles(fileData);
          setFolders(folderData);

        })
        .catch(() => {

          setError(true);

        })
        .finally(() => {

          setLoading(false);

        });

    }, [currentFolderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * Build breadcrumb.
   *
   * Example:
   *
   * Home
   *
   * Home > Projects
   *
   * Home > Projects > Backend
   */
  useEffect(() => {

    let cancelled = false;

    const loadBreadcrumb =
      async () => {

        if (currentFolderId === null) {

          setBreadcrumb([]);
          return;
        }

        setBreadcrumbLoading(true);

        try {

          const chain: Folder[] = [];

          let id:
            number | null =
            currentFolderId;

          /*
           * Walk upward through the
           * parentFolderId chain.
           */
          while (id !== null) {

            const folder =
              await folderApi.getById(id);

            chain.unshift(folder);

            id =
              folder.parentFolderId;
          }

          if (!cancelled) {
            setBreadcrumb(chain);
          }

        } catch {

          if (!cancelled) {
            setBreadcrumb([]);
          }

        } finally {

          if (!cancelled) {
            setBreadcrumbLoading(false);
          }
        }
      };

    loadBreadcrumb();

    return () => {
      cancelled = true;
    };

  }, [currentFolderId]);

  /*
   * Search.
   */
  useEffect(() => {

    if (!searchQuery.trim()) {

      setSearchResults(null);
      setSearching(false);

      return;
    }

    setSearching(true);

    const timer =
      window.setTimeout(() => {

        fileApi
          .search(
            searchQuery.trim()
          )
          .then(setSearchResults)
          .catch(() =>
            setSearchResults([])
          )
          .finally(() =>
            setSearching(false)
          );

      }, 350);

    return () =>
      window.clearTimeout(timer);

  }, [searchQuery]);

  /*
   * Create folder.
   *
   * At root:
   * parentFolderId = null
   *
   * Inside a folder:
   * parentFolderId = current folder ID
   */
  const createFolder =
    async (name: string) => {

      await folderApi.create({
        name,
        parentFolderId:
          currentFolderId,
      });

      showToast(
        'success',
        `Folder “${name}” created`
      );

      setCreateFolderOpen(false);

      loadData();
    };

  /*
   * Delete file.
   */
  const confirmDeleteFile =
    async () => {

      if (!deleteFile) {
        return;
      }

      setDeleting(true);

      try {

        await fileApi.delete(
          deleteFile.id
        );

        showToast(
          'success',
          `${deleteFile.originalName} deleted`
        );

        setDeleteFile(null);

        loadData();

      } catch (e) {

        showToast(
          'error',
          getApiErrorMessage(
            e,
            'Could not delete file'
          )
        );

      } finally {

        setDeleting(false);
      }
    };

  /*
   * Upload file.
   */
  const upload =
    async (file: File) => {

      if (!file.size) {

        showToast(
          'error',
          `${file.name} is empty`
        );

        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {

        showToast(
          'error',
          `${file.name} exceeds the 50 MB limit`
        );

        return;
      }

      try {

        await fileApi.upload(
          file,
          currentFolderId
        );

        showToast(
          'success',
          `${file.name} uploaded`
        );

        loadData();

      } catch (e) {

        showToast(
          'error',
          getApiErrorMessage(
            e,
            'Upload failed'
          )
        );
      }
    };

  /*
   * Display files.
   */
  const displayFiles =
    searchQuery.trim()
      ? searchResults ?? []
      : files;

  const isSearching =
    searchQuery.trim().length > 0;

  /*
   * Folder section behavior:
   *
   * ROOT:
   * Always show Folders.
   *
   * INSIDE FOLDER:
   * Only show Folders if
   * subfolders actually exist.
   */
  const showFoldersSection =
    !isSearching &&
    (
      currentFolderId === null ||
      folders.length > 0
    );

  if (error) {

    return (
      <ErrorState
        message="We couldn't load your files."
        action={
          <Button onClick={loadData}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold tracking-tight">
            My Files
          </h1>

          {/* Breadcrumb */}
          <nav className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">

            <button
              onClick={() =>
                navigate('/files')
              }
              className="inline-flex items-center gap-1 hover:text-brand-600"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </button>

            {breadcrumb.map(
              (folder) => (
                <span
                  key={folder.id}
                  className="inline-flex items-center gap-1.5"
                >

                  <ChevronRight className="h-3.5 w-3.5" />

                  <button
                    onClick={() =>
                      navigate(
                        `/files/${folder.id}`
                      )
                    }
                    className="hover:text-brand-600"
                  >
                    {folder.name}
                  </button>

                </span>
              )
            )}

            {breadcrumbLoading && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />

                <span className="text-gray-400">
                  Loading...
                </span>
              </>
            )}

          </nav>

        </div>

        {/* Actions */}
        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={() =>
              setCreateFolderOpen(true)
            }
          >
            <FolderPlus className="h-4 w-4" />

            <span className="hidden sm:inline">
              New Folder
            </span>
          </Button>

          <Button
            onClick={() =>
              document
                .getElementById(
                  'cloudvault-file-input'
                )
                ?.click()
            }
          >
            <Upload className="h-4 w-4" />

            <span>
              Upload
            </span>
          </Button>

          <input
            id="cloudvault-file-input"
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {

              if (event.target.files) {

                Array.from(
                  event.target.files
                ).forEach(upload);

              }

              event.currentTarget.value =
                '';
            }}
          />

        </div>
      </div>

      {/* Search */}
      <div className="relative">

        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(
              event.target.value
            )
          }
          placeholder="Search files across your vault..."
          className="input-base pl-10 pr-10"
        />

        {searchQuery && (
          <button
            onClick={() =>
              setSearchQuery('')
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}

      </div>

      {/* Loading */}
      {loading || searching ? (
        <>
          <section>

            <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-surface-dark-muted" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (
                  <FolderCardSkeleton
                    key={item}
                  />
                )
              )}

            </div>

          </section>

          <section>

            <div className="mb-3 h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-surface-dark-muted" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <FileCardSkeleton
                    key={item}
                  />
                )
              )}

            </div>

          </section>
        </>
      ) : (
        <>

          {/* Folders */}
          {showFoldersSection && (
            <section>

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Folders
                </h2>

                <span className="text-xs text-gray-400">
                  {folders.length}
                </span>

              </div>

              {folders.length > 0 ? (

                <FolderGrid
                  folders={folders}
                  onOpen={(folder) =>
                    navigate(
                      `/files/${folder.id}`
                    )
                  }
                />

              ) : (

                <div className="card">

                  <EmptyState
                    icon={
                      <FolderPlus className="h-5 w-5" />
                    }
                    title="No folders here"
                    description="Create a folder to organize your files."
                  />

                </div>

              )}

            </section>
          )}

          {/* Files */}
          <section>

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  {isSearching
                    ? 'Search results'
                    : 'Files'}
                </h2>

                {isSearching && (
                  <p className="mt-1 text-xs text-gray-500">
                    Matching “
                    {searchQuery}
                    ”
                  </p>
                )}

              </div>

              {/* View switcher */}
              <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-surface-dark-border dark:bg-surface-dark-subtle">

                <button
                  onClick={() => {

                    setView('grid');

                    localStorage.setItem(
                      VIEW_KEY,
                      'grid'
                    );
                  }}
                  className={`rounded-md p-1.5 ${
                    view === 'grid'
                      ? 'bg-gray-100 text-brand-600 dark:bg-surface-dark-muted'
                      : 'text-gray-400'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {

                    setView('list');

                    localStorage.setItem(
                      VIEW_KEY,
                      'list'
                    );
                  }}
                  className={`rounded-md p-1.5 ${
                    view === 'list'
                      ? 'bg-gray-100 text-brand-600 dark:bg-surface-dark-muted'
                      : 'text-gray-400'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>

              </div>

            </div>

            {displayFiles.length > 0 ? (

              view === 'grid' ? (

                <FileGrid
                  files={displayFiles}
                  onShare={setShareFile}
                  onPublicLink={
                    setPublicLinkFile
                  }
                  onDetails={setDetailsFile}
                  onDelete={setDeleteFile}
                />

              ) : (

                <FileList
                  files={displayFiles}
                  onShare={setShareFile}
                  onPublicLink={
                    setPublicLinkFile
                  }
                  onDetails={setDetailsFile}
                  onDelete={setDeleteFile}
                />

              )

            ) : (

              <div className="card">

                <EmptyState
                  icon={
                    <Upload className="h-7 w-7" />
                  }
                  title={
                    isSearching
                      ? 'No files found'
                      : currentFolderId !== null
                        ? 'No files in this folder'
                        : 'Your vault is empty'
                  }
                  description={
                    isSearching
                      ? 'Try another filename.'
                      : currentFolderId !== null
                        ? 'Upload a file to this folder to get started.'
                        : 'Upload your first file to get started.'
                  }
                />

              </div>

            )}

          </section>

        </>
      )}

      {/* Modals */}

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() =>
          setCreateFolderOpen(false)
        }
        onCreate={createFolder}
      />

      <ShareModal
        file={shareFile}
        open={!!shareFile}
        onClose={() =>
          setShareFile(null)
        }
      />

      <PublicLinkModal
        file={publicLinkFile}
        open={!!publicLinkFile}
        onClose={() =>
          setPublicLinkFile(null)
        }
      />

      <FileDetails
        file={detailsFile}
        open={!!detailsFile}
        onClose={() =>
          setDetailsFile(null)
        }
      />

      <ConfirmDialog
  open={!!deleteFile}
  title="Delete file?"
  message={
    deleteFile
      ? `“${deleteFile.originalName}” will be permanently removed from your vault.`
      : ''
  }
  confirmLabel="Delete"
  destructive
  loading={deleting}
  onClose={() => setDeleteFile(null)}
  onConfirm={confirmDeleteFile}
/>

    </div>
  );
}