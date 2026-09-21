import { Activity as ActivityIcon, Download, FolderPlus, Link2, Link2Off, LogIn, Share2, Trash2, Upload, UserPlus } from 'lucide-react';
import { formatDateTime } from '@/utils/formatDate';
import type { ActivityLog } from '@/types/activity';

const icons: Record<string, typeof ActivityIcon> = { LOGIN: LogIn, USER_REGISTERED: UserPlus, FILE_UPLOADED: Upload, FILE_DOWNLOADED: Download, FILE_DELETED: Trash2, FOLDER_CREATED: FolderPlus, FILE_SHARED: Share2, SHARE_REVOKED: Share2, PUBLIC_LINK_CREATED: Link2, PUBLIC_LINK_REVOKED: Link2Off };
export function ActivityItem({ activity }: { activity: ActivityLog }) {
  const Icon = icons[activity.action] ?? ActivityIcon;
  return <div className="flex items-start gap-3.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1 pb-5"><p className="text-sm">{activity.description || activity.action}</p><p className="mt-0.5 text-xs text-gray-500">{formatDateTime(activity.createdAt)}</p></div></div>;
}
