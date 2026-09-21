import {
  FileText,
  FileSpreadsheet,
  Presentation,
  File as FileIcon,
  FileArchive,
  Image,
  Film,
  Music,
  FileCode2,
  FileJson,
  FileText as FileTextIcon,
  type LucideIcon,
} from 'lucide-react';

interface FileIconInfo {
  icon: LucideIcon;
  color: string;
  bg: string;
}

const extensionMap: Record<string, FileIconInfo> = {
  pdf: {
    icon: FileText,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },

  doc: {
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },

  docx: {
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },

  xls: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-500/10',
  },

  xlsx: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-500/10',
  },

  ppt: {
    icon: Presentation,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },

  pptx: {
    icon: Presentation,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },

  txt: {
    icon: FileTextIcon,
    color: 'text-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-500/10',
  },

  zip: {
    icon: FileArchive,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },

  rar: {
    icon: FileArchive,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },

  '7z': {
    icon: FileArchive,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },

  jpg: {
    icon: Image,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },

  jpeg: {
    icon: Image,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },

  png: {
    icon: Image,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },

  gif: {
    icon: Image,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },

  svg: {
    icon: Image,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },

  webp: {
    icon: Image,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },

  mp4: {
    icon: Film,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-500/10',
  },

  mov: {
    icon: Film,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-500/10',
  },

  avi: {
    icon: Film,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-500/10',
  },

  mkv: {
    icon: Film,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-500/10',
  },

  mp3: {
    icon: Music,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },

  wav: {
    icon: Music,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },

  flac: {
    icon: Music,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },

  csv: {
    icon: FileSpreadsheet,
    color: 'text-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
  },

  json: {
    icon: FileJson,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
  },

  xml: {
    icon: FileCode2,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },

  html: {
    icon: FileCode2,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },

  js: {
    icon: FileCode2,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
  },

  ts: {
    icon: FileCode2,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },

  tsx: {
    icon: FileCode2,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },

  jsx: {
    icon: FileCode2,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
  },
};

export function getFileIcon(filename: string): FileIconInfo {
  const extension =
    filename.split('.').pop()?.toLowerCase() || '';

  return (
    extensionMap[extension] || {
      icon: FileIcon,
      color: 'text-gray-500',
      bg: 'bg-gray-50 dark:bg-gray-500/10',
    }
  );
}

export function getFileExtension(
  filename: string
): string {
  const extension =
    filename.split('.').pop()?.toLowerCase() || '';

  return extension
    ? extension.toUpperCase()
    : 'FILE';
}

export function formatFileSize(
  bytes: number
): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const units = [
    'Bytes',
    'KB',
    'MB',
    'GB',
    'TB',
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const value =
    bytes / Math.pow(1024, index);

  return `${value.toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

export function isImageFile(
  filename: string
): boolean {
  const extension =
    filename.split('.').pop()?.toLowerCase() || '';

  return [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'svg',
    'webp',
  ].includes(extension);
}

export function isPdfFile(
  filename: string
): boolean {
  const extension =
    filename.split('.').pop()?.toLowerCase() || '';

  return extension === 'pdf';
}

export function getFileTypeLabel(
  filename: string
): string {
  const extension =
    filename.split('.').pop()?.toLowerCase() || '';

  if (!extension) {
    return 'File';
  }

  return extension.toUpperCase();
}

export function getContentTypeLabel(
  contentType: string
): string {
  if (!contentType) {
    return 'File';
  }

  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/svg+xml': 'SVG',
    'video/mp4': 'MP4',
    'audio/mpeg': 'MP3',
    'application/zip': 'ZIP',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      'XLSX',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'DOCX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'PPTX',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'application/json': 'JSON',
  };

  return (
    map[contentType] ||
    contentType.split('/').pop()?.toUpperCase() ||
    'FILE'
  );
}