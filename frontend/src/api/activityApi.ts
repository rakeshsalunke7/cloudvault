import api from './axios';
import type { ActivityLog } from '@/types/activity';

export const activityApi = {
  getAll: () => api.get<ActivityLog[]>('/api/activity').then((r) => r.data),
};
