import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/common/Dropdown';
import { fileApi } from '@/api/fileApi';
import { getFileIcon, formatFileSize } from '@/utils/fileIcons';
import { formatRelativeTime } from '@/utils/formatDate';
import type { FileEntity } from '@/types/file';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/files': 'My Files',
  '/shared': 'Shared with me',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

export function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileEntity[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitles[location.pathname] || (location.pathname.startsWith('/files/') ? 'My Files' : 'CloudVault');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      fileApi
        .search(searchQuery)
        .then((results) => {
          setSearchResults(results);
          setShowResults(true);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-surface-dark-border dark:bg-surface-dark/80 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-dark-muted lg:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 lg:text-lg">{pageTitle}</h1>

      {/* Search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative" ref={searchContainerRef}>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search files..."
              className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:w-72 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-dark-border dark:bg-surface-dark-muted dark:text-gray-100 dark:focus:bg-surface-dark-subtle lg:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg-soft animate-slide-down dark:border-surface-dark-border dark:bg-surface-dark-subtle sm:left-1/2 sm:-translate-x-1/2">
              {searching ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">No files found</div>
              ) : (
                <div className="max-h-80 overflow-y-auto py-1.5">
                  {searchResults.map((file) => {
                    const { icon: Icon, color, bg } = getFileIcon(file.originalName);
                    return (
                      <button
                        key={file.id}
                        onClick={() => {
                          navigate('/files');
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-surface-dark-muted"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                          <Icon className={`h-4.5 w-4.5 ${color}`} style={{ width: 18, height: 18 }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)} · {formatRelativeTime(file.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-surface-dark-muted">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  {initials}
                </div>
              )}
              <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
            </button>
          }
        >
          <div className="px-3.5 py-2.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.fullName}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <DropdownDivider />
          <DropdownItem icon={<User className="h-4 w-4" />} onClick={() => navigate('/settings')}>
            Profile
          </DropdownItem>
          <DropdownItem icon={<Settings className="h-4 w-4" />} onClick={() => navigate('/settings')}>
            Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={<LogOut className="h-4 w-4" />} onClick={logout} destructive>
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
