import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light-subtle px-4 dark:bg-surface-dark">
      <Logo size={40} />

      <div className="mt-10 text-center">
        <p className="text-7xl font-bold text-brand-600 dark:text-brand-400">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
