import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileNavbar } from './MobileNavbar';
import { UploadZone } from '@/components/files/UploadZone';

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const location = useLocation();
  const match = location.pathname.match(/^\/files\/(\d+)$/);
  const uploadFolderId = match ? Number(match[1]) : null;

  return <div className="flex h-screen overflow-hidden bg-surface-light-subtle dark:bg-surface-dark">
    <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white dark:border-surface-dark-border dark:bg-surface-dark-subtle lg:block"><Sidebar onUploadClick={() => setUploadOpen(true)} /></aside>
    <MobileNavbar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onUploadClick={() => { setMobileNavOpen(false); setUploadOpen(true); }} />
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden"><TopNavbar onMenuClick={() => setMobileNavOpen(true)} /><main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</div></main></div>
    <UploadZone open={uploadOpen} onClose={() => setUploadOpen(false)} folderId={uploadFolderId} onUploaded={() => {}} />
  </div>;
}
