export interface Folder {
  id: number;
  name: string;
  parentFolderId: number | null;
  createdAt: string;
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: number | null;
}
