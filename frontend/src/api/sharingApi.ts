import api from './axios';
import type {
  PublicLink,
  ShareRequest,
  ShareResponse,
  InvitationResponse,
} from '@/types/sharing';
import type { FileEntity } from '@/types/file';

export const sharingApi = {
  // =========================================================
  // PRIVATE FILE SHARING
  // =========================================================

  shareFile: (data: ShareRequest) =>
    api
      .post<ShareResponse>('/api/shares', data)
      .then((r) => r.data),

  getSharedFiles: () =>
    api
      .get<ShareResponse[]>('/api/shares/shared-with-me')
      .then((r) => r.data),

  revokeShare: (shareId: number) =>
    api
      .delete<void>(`/api/shares/${shareId}`)
      .then((r) => r.data),

  // =========================================================
  // PUBLIC LINKS
  // =========================================================

  createPublicLink: (fileId: number) =>
    api
      .post<PublicLink>(
        '/api/shares/public',
        null,
        {
          params: {
            fileId,
          },
        }
      )
      .then((r) => r.data),
  
  getPublicLink: (fileId: number) =>
  api
    .get<PublicLink>('/api/shares/public', {
      params: {
        fileId,
      },
    })
    .then((r) => r.data),
  

  revokePublicLink: (publicLinkId: number) =>
    api
      .delete<void>(
        `/api/shares/public/${publicLinkId}`
      )
      .then((r) => r.data),

  /*
   * The backend currently returns the actual file bytes
   * from GET /api/shares/public/{token}.
   *
   * Therefore this method returns a Blob.
   */
  getPublicFile: (token: string) =>
    api
      .get<Blob>(
        `/api/shares/public/${token}`,
        {
          responseType: 'blob',
        }
      )
      .then((r) => r.data),

  /*
   * Public download currently uses the same backend endpoint
   * because the backend does not have a separate
   * /public/{token}/download endpoint.
   */
  downloadPublic: (token: string) =>
    api
      .get<Blob>(
        `/api/shares/public/${token}`,
        {
          responseType: 'blob',
        }
      )
      .then((r) => r.data),

  // =========================================================
  // INVITATIONS
  // =========================================================

  getInvitation: (token: string) =>
    api
      .get<InvitationResponse>(
        `/api/shares/invite/${token}`
      )
      .then((r) => r.data),

  acceptInvitation: (token: string) =>
    api
      .post<ShareResponse>(
        `/api/shares/invite/${token}/accept`
      )
      .then((r) => r.data),
};