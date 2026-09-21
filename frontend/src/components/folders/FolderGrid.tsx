import { FolderCard } from './FolderCard';
import type { Folder } from '@/types/folder';

export function FolderGrid({
  folders,
  onOpen,
}: {
  folders: Folder[];
  onOpen: (folder: Folder) => void;
}) {

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onClick={() => onOpen(folder)}
        />
      ))}
    </div>
  );
}