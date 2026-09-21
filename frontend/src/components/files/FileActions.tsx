import { useRef, type ReactNode } from 'react';
import {
  MoreVertical,
  Download,
  Share2,
  Link2,
  Info,
  Trash2,
} from 'lucide-react';

import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from '@/components/common/Dropdown';

import {
  getFileIcon,
  formatFileSize,
  getFileExtension,
} from '@/utils/fileIcons';

import { formatRelativeTime } from '@/utils/formatDate';

import type { FileEntity } from '@/types/file';

interface FileActionsProps {
  file: FileEntity;
  onDownload: () => void;
  onShare: () => void;
  onPublicLink: () => void;
  onDetails: () => void;
  onDelete: () => void;
  trigger?: ReactNode;
}

export function FileActions({
  file,
  onDownload,
  onShare,
  onPublicLink,
  onDetails,
  onDelete,
  trigger,
}: FileActionsProps) {

  const containerRef =
    useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <Dropdown
        trigger={
          trigger || (
            <button
              type="button"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-surface-dark-muted dark:hover:text-gray-300"
              aria-label={`Actions for ${file.originalName}`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )
        }
        width={180}
      >

        <DropdownItem
          icon={
            <Download className="h-4 w-4" />
          }
          onClick={onDownload}
        >
          Download
        </DropdownItem>

        <DropdownItem
          icon={
            <Share2 className="h-4 w-4" />
          }
          onClick={onShare}
        >
          Share
        </DropdownItem>

        <DropdownItem
          icon={
            <Link2 className="h-4 w-4" />
          }
          onClick={onPublicLink}
        >
          Public link
        </DropdownItem>

        <DropdownItem
          icon={
            <Info className="h-4 w-4" />
          }
          onClick={onDetails}
        >
          Details
        </DropdownItem>

        <DropdownDivider />

        <DropdownItem
          icon={
            <Trash2 className="h-4 w-4" />
          }
          onClick={onDelete}
          destructive
        >
          Delete
        </DropdownItem>

      </Dropdown>

    </div>
  );
}

export {
  getFileIcon,
  formatFileSize,
  getFileExtension,
  formatRelativeTime,
};