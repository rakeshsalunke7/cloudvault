import { NavLink } from 'react-router-dom';
import {
  FolderOpen,
  Share2,
  Activity,
  Settings,
  LogOut,
  Upload,
  Sun,
  Moon,
  HardDrive,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { formatFileSize } from '@/utils/formatFileSize';
import { fileApi } from '@/api/fileApi';
import { useEffect, useState } from 'react';
import type { StorageUsage } from '@/types/file';
import { Skeleton } from '@/components/common/Skeleton';

interface SidebarProps {
  onUploadClick: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  onUploadClick,
  onNavigate,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [storage, setStorage] =
    useState<StorageUsage | null>(null);

  const [storageLoading, setStorageLoading] =
    useState(true);

  useEffect(() => {
    fileApi
      .getStorage()
      .then(setStorage)
      .catch(() => {})
      .finally(() => setStorageLoading(false));
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const navItems = [
    {
      to: '/files',
      label: 'My Files',
      icon: FolderOpen,
    },
    {
      to: '/shared',
      label: 'Shared with me',
      icon: Share2,
    },
    {
      to: '/activity',
      label: 'Activity',
      icon: Activity,
    },
  ];

  return (
    <div className="flex h-full flex-col">

      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      {/* Upload button */}
      <div className="px-4 pb-4">
        <Button
          onClick={onUploadClick}
          className="w-full"
          size="md"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">

        <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-link ${
                isActive ? 'nav-link-active' : ''
              }`
            }
          >
            <item.icon
              className="h-4.5 w-4.5"
              style={{
                width: 18,
                height: 18,
              }}
            />

            {item.label}
          </NavLink>
        ))}

        <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          General
        </p>

        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-link ${
              isActive ? 'nav-link-active' : ''
            }`
          }
        >
          <Settings
            className="h-4.5 w-4.5"
            style={{
              width: 18,
              height: 18,
            }}
          />

          Settings
        </NavLink>
      </nav>

      {/* Storage usage */}
      <div className="px-4 pt-2">
        {storageLoading ? (
          <div className="card p-4">
            <Skeleton className="h-4 w-20" />

            <Skeleton className="mt-3 h-6 w-24" />

            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ) : storage ? (
          <div className="card p-4">

            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <HardDrive className="h-4 w-4 text-gray-400" />

              Storage
            </div>

            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
              {formatFileSize(storage.usedBytes)}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              data stored
            </p>

          </div>
        ) : null}
      </div>

      {/* User profile + actions */}
      <div className="border-t border-gray-100 p-3 dark:border-surface-dark-border">

        <div className="flex items-center gap-3 rounded-lg p-2">

          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.fullName}
            </p>

            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>

          </div>
        </div>

        <div className="mt-2 flex gap-1">

          <button
            onClick={toggleTheme}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-dark-muted"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}

            {theme === 'light'
              ? 'Dark'
              : 'Light'}
          </button>

          <button
            onClick={() => logout()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-dark-muted"
          >
            <LogOut className="h-4 w-4" />

            Logout
          </button>

        </div>
      </div>
    </div>
  );
}