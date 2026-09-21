import { useEffect, useState } from 'react';
import {
  User,
  Palette,
  Shield,
  HardDrive,
  Mail,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { fileApi } from '@/api/fileApi';
import { formatFileSize } from '@/utils/formatFileSize';
import { Skeleton } from '@/components/common/Skeleton';
import type { StorageUsage } from '@/types/file';

type ThemeOption = 'light' | 'dark';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);

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

  const themeOptions: {
    value: ThemeOption;
    label: string;
    description: string;
  }[] = [
    {
      value: 'light',
      label: 'Light',
      description: 'Clean and bright',
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account and preferences.
        </p>
      </div>

      {/* Account */}
      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <User className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Account
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your account information
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {initials}
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Name
              </label>

              <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.fullName}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Email
              </label>

              <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            <Palette className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Appearance
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize how CloudVault looks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                theme === option.value
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-gray-200 hover:border-gray-300 dark:border-surface-dark-border dark:hover:border-surface-dark-border'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>

              {theme === option.value && (
                <Check className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <Shield className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Security
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Authentication and access
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-surface-dark-muted">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Authentication
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.authProvider === 'GOOGLE'
                    ? 'Google OAuth authentication'
                    : 'Email and password authentication'}
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
              <Check className="h-3.5 w-3.5" />
              Active
            </span>
          </div>

          {user?.authProvider === 'GOOGLE' && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-surface-dark-muted">
              <div className="flex items-center gap-3">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Google Account
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connected for sign-in
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                <Check className="h-3.5 w-3.5" />
                Connected
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Storage */}
      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <HardDrive className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Storage
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your stored data
            </p>
          </div>
        </div>

        {storageLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : storage ? (
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatFileSize(storage.usedBytes)}
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total data currently stored in CloudVault.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load storage information.
          </p>
        )}
      </section>
    </div>
  );
}