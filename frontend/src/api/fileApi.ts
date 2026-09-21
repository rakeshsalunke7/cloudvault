import api from './axios';
import type { FileEntity, StorageUsage } from '@/types/file';

export const fileApi = {
  getFiles: (folderId?: number | null) =>
    api.get<FileEntity[]>('/api/files', { params: folderId == null ? {} : { folderId } }).then((r) => r.data),

  upload: (file: File, folderId: number | null, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<FileEntity>('/api/files/upload', formData, {
        params: folderId == null ? {} : { folderId },
        onUploadProgress: (event) => {
          if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      })
      .then((r) => r.data);
  },

  download: (id: number) =>
    api.get<Blob>(`/api/files/${id}/download`, { responseType: 'blob' }).then((r) => r.data),

  preview: (id: number) =>
  api
    .get<Blob>(`/api/files/${id}/preview`, {
      responseType: 'blob',
    })
    .then((r) => r.data),

  delete: (id: number) => api.delete<void>(`/api/files/${id}`).then((r) => r.data),

  search: (query: string) =>
    api.get<FileEntity[]>('/api/files/search', { params: { query } }).then((r) => r.data),

  getStorage: () => api.get<StorageUsage>('/api/files/storage').then((r) => r.data),
};

export async function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
