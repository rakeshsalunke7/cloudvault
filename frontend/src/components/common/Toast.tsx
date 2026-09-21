import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastIdCounter = 0;
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function emit() {
  toastListeners.forEach((l) => l([...currentToasts]));
}

function removeToast(id: number) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  emit();
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-brand-600 dark:text-brand-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdCounter;
    currentToasts = [...currentToasts, { id, type, message }];
    emit();
    setTimeout(() => removeToast(id), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = (id: number) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    emit();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className="card flex items-start gap-3 px-4 py-3 animate-slide-up min-w-[280px] max-w-[400px]"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${colors[toast.type]}`} />
            <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
