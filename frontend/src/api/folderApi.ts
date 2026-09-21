import api from './axios';
import type {
  CreateFolderRequest,
  Folder,
} from '@/types/folder';

export const folderApi = {

  getFolders: (
    parentFolderId?: number | null
  ) =>
    api
      .get<Folder[]>(
        '/api/folders',
        {
          params:
            parentFolderId == null
              ? {}
              : { parentFolderId },
        }
      )
      .then((response) => response.data),

  getById: (id: number) =>
    api
      .get<Folder>(
        `/api/folders/${id}`
      )
      .then((response) => response.data),

  create: (
    data: CreateFolderRequest
  ) =>
    api
      .post<Folder>(
        '/api/folders',
        data
      )
      .then((response) => response.data),
};