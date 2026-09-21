export type SharePermission = 'VIEW' | 'DOWNLOAD';

export type ShareStatus = 'PENDING' | 'ACCEPTED';

export interface ShareRequest {
  fileId: number;
  sharedWithEmail: string;
  permission: SharePermission;
}

export interface ShareResponse {
  id: number;
  fileId: number;
  fileName: string;
  sharedByEmail: string;
  sharedWithEmail: string;
  permission: SharePermission;
  createdAt: string;

  // Invitation information
  status: ShareStatus;
  invitationToken?: string | null;
  invitationExpiresAt?: string | null;
}

export interface PublicLink {
  id: number;
  fileId: number;
  fileName: string;
  token: string;
  createdAt: string;
  expiresAt?: string | null;
  active: boolean;
}

export type SharedFile = ShareResponse;

export interface InvitationResponse {
  shareId: number;
  fileId: number;
  fileName: string;
  ownerEmail: string;
  recipientEmail: string;
  permission: SharePermission;
  expiresAt: string | null;
}