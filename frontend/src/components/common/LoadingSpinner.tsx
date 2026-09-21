import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} style={{ width: size, height: size }} />;
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <LoadingSpinner size={36} />
      {message && <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>}
    </div>
  );
}

export function CenterSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <LoadingSpinner size={28} />
      {message && <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>}
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function InlineLoader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <LoadingSpinner size={16} />
      {children}
    </div>
  );
}
