import { Folder as FolderIcon, FolderOpen } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import type { Folder } from '@/types/folder';

export function FolderCard({
  folder,
  onClick,
}: {
  folder: Folder;
  onClick: () => void;
}) {

  return (
    <button
      onClick={onClick}
      className="card group flex w-full items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md-soft dark:hover:border-brand-500/30"
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <FolderIcon className="h-5.5 w-5.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {folder.name}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {formatDate(folder.createdAt)}
        </p>
      </div>

      <FolderOpen className="h-4 w-4 text-gray-300 transition group-hover:text-brand-500" />

    </button>
  );
}