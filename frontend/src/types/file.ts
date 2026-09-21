export interface FileEntity {
  id: number;
  originalName: string;
  contentType: string;
  size: number;
  createdAt: string;
  folderId?: number | null;
}

export interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
  freeBytes: number;
  usedPercentage: number;
}
