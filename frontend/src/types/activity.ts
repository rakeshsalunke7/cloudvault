export type ActivityType =
  | 'LOGIN'
  | 'USER_REGISTERED'
  | 'FILE_UPLOADED'
  | 'FILE_DOWNLOADED'
  | 'FILE_DELETED'
  | 'FOLDER_CREATED'
  | 'FILE_SHARED'
  | 'SHARE_REVOKED'
  | 'PUBLIC_LINK_CREATED'
  | 'PUBLIC_LINK_REVOKED'
  | string;

export interface ActivityLog {
  id: number;
  action: ActivityType;
  description?: string | null;
  fileId?: number | null;
  folderId?: number | null;
  createdAt: string;
}
