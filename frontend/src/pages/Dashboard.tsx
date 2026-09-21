import { useEffect, useState } from 'react';
import { Activity, ArrowRight, FileText, FolderOpen, HardDrive, Share2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fileApi } from '@/api/fileApi';
import { folderApi } from '@/api/folderApi';
import { activityApi } from '@/api/activityApi';
import { sharingApi } from '@/api/sharingApi';
import { formatFileSize } from '@/utils/formatFileSize';
import { formatRelativeTime } from '@/utils/formatDate';
import { getFileIcon } from '@/utils/fileIcons';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ActivityItem } from '@/components/activity/ActivityItem';
import { FolderCard } from '@/components/folders/FolderCard';
import type { FileEntity, StorageUsage } from '@/types/file';
import type { Folder } from '@/types/folder';
import type { ActivityLog } from '@/types/activity';
import type { ShareResponse } from '@/types/sharing';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [shared, setShared] = useState<ShareResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fileApi.getStorage().catch(() => null),
      fileApi.getFiles(null).catch(() => []),
      folderApi.getFolders(null).catch(() => []),
      activityApi.getAll().catch(() => []),
      sharingApi.getSharedFiles().catch(() => []),
    ]).then(([s, f, fld, act, sh]) => {
      setStorage(s); setFiles(f); setFolders(fld); setActivities(act.slice(0, 5)); setShared(sh);
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const recent = [...files].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);

  const cards = [
    { label: 'Storage used', value: storage ? formatFileSize(storage.usedBytes) : '—', hint: storage ? `of ${formatFileSize(storage.totalBytes)}` : 'Loading', icon: HardDrive },
    { label: 'Files', value: String(files.length), hint: 'in your vault', icon: FileText },
    { label: 'Shared with you', value: String(shared.length), hint: 'shared files', icon: Share2 },
    { label: 'Recent activity', value: String(activities.length), hint: 'latest events', icon: Activity },
  ];

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-brand-600 dark:text-brand-400">Your private cloud</p><h1 className="mt-1 text-2xl font-bold tracking-tight">{greeting}, {firstName}</h1><p className="mt-1 text-sm text-gray-500">Everything in your vault, in one place.</p></div><Button onClick={() => navigate('/files')}><Upload className="h-4 w-4" />Open My Files</Button></header>

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, hint, icon: Icon }) => <div key={label} className="card p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-2 text-2xl font-bold">{loading ? '—' : value}</p><p className="mt-1 text-xs text-gray-500">{hint}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Icon className="h-5 w-5" /></div></div>{label === 'Storage used' && storage && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-surface-dark-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(storage.usedPercentage, 100)}%` }} /></div>}</div>)}</section>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
      <section><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Recent files</h2><button onClick={() => navigate('/files')} className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <ArrowRight className="h-3.5 w-3.5" /></button></div>{recent.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{recent.map(file => { const { icon: Icon, color, bg } = getFileIcon(file.originalName); return <button key={file.id} onClick={() => navigate('/files')} className="card group p-4 text-left hover:-translate-y-0.5 hover:shadow-md-soft"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}><Icon className={`h-5.5 w-5.5 ${color}`} /></div><p className="mt-3 truncate text-sm font-semibold">{file.originalName}</p><p className="mt-1 text-xs text-gray-500">{formatFileSize(file.size)} · {formatRelativeTime(file.createdAt)}</p></button>; })}</div> : <div className="card"><EmptyState icon={<FileText className="h-7 w-7" />} title="No files yet" description="Upload your first file to get started." action={<Button onClick={() => navigate('/files')}>Upload a file</Button>} /></div>}</section>
      <section><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Recent activity</h2><button onClick={() => navigate('/activity')} className="text-sm font-medium text-brand-600">View all</button></div><div className="card p-4">{activities.length ? activities.map(item => <ActivityItem key={item.id} activity={item} />) : <EmptyState icon={<Activity className="h-6 w-6" />} title="No activity yet" description="Your recent actions will appear here." compact />}</div></section>
    </div>

    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Quick access</h2><button onClick={() => navigate('/files')} className="text-sm font-medium text-brand-600">All folders</button></div>{folders.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{folders.slice(0,4).map(folder => <FolderCard key={folder.id} folder={folder} onClick={() => navigate(`/files/${folder.id}`)} />)}</div> : <div className="card"><EmptyState compact icon={<FolderOpen className="h-6 w-6" />} title="No folders yet" description="Create folders from My Files to keep things organized." /></div>}</section>
  </div>;
}
