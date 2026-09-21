import { Sidebar } from './Sidebar';

interface MobileNavbarProps {
  open: boolean;
  onClose: () => void;
  onUploadClick: () => void;
}

export function MobileNavbar({ open, onClose, onUploadClick }: MobileNavbarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white dark:bg-surface-dark-subtle shadow-lg-soft animate-slide-down">
        <Sidebar onUploadClick={onUploadClick} onNavigate={onClose} />
      </div>
    </div>
  );
}
