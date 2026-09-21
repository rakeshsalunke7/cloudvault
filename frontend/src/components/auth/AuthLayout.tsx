import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, ShieldCheck, Lock, Cloud } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand-950 p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 30%, rgba(89,139,255,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(31,79,237,0.2) 0%, transparent 50%)'
        }} />

        <div className="relative">
          <Link to="/">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Cloud<span className="text-brand-300">Vault</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Secure cloud storage<br />for everything that matters.
          </h2>
          <p className="max-w-md text-base text-brand-200">
            Upload, organize, and share your files with confidence. End-to-end encrypted, lightning fast, and built for professionals.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-brand-200">
              <ShieldCheck className="h-5 w-5 text-brand-300" />
              Bank-grade encryption
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-200">
              <Lock className="h-5 w-5 text-brand-300" />
              Private by default
            </div>
          </div>
        </div>

        <div className="relative text-sm text-brand-300">
          © 2026 CloudVault. All rights reserved.
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo size={36} />
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-dark-muted"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden justify-end p-6 lg:flex">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-dark-muted"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-20">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
