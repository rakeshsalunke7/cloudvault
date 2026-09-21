import { FileCard } from './FileCard';
import type { FileEntity } from '@/types/file';

interface FileGridProps {
  files: FileEntity[];

  onShare: (file: FileEntity) => void;
  onPublicLink: (file: FileEntity) => void;
  onDetails: (file: FileEntity) => void;
  onDelete: (file: FileEntity) => void;
}

export function FileGrid(props: FileGridProps) {

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {props.files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onShare={props.onShare}
          onPublicLink={props.onPublicLink}
          onDetails={props.onDetails}
          onDelete={props.onDelete}
        />
      ))}
    </div>
  );
}