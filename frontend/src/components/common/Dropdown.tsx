import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  width?: number;
}

export function Dropdown({ trigger, children, align = 'right', width = 200 }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 shadow-md-soft animate-slide-down dark:border-surface-dark-border dark:bg-surface-dark-subtle ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ minWidth: width }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ icon, children, onClick, destructive, disabled }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        destructive
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-surface-dark-muted'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-gray-100 dark:bg-surface-dark-border" />;
}
