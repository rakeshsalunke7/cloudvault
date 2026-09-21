import { Cloud } from 'lucide-react';

interface LogoProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg' | string;
}

export function Logo({
  collapsed = false,
  size = 'md',
}: LogoProps) {
  const sizes = {
    sm: {
      icon: 20,
      text: 'text-lg',
    },
    md: {
      icon: 24,
      text: 'text-xl',
    },
    lg: {
      icon: 30,
      text: 'text-2xl',
    },
  };

  const currentSize =
    sizes[size as keyof typeof sizes] ?? sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="
          flex items-center justify-center
          rounded-xl
          bg-indigo-600
          text-white
          shadow-sm
          shrink-0
        "
        style={{
          width: currentSize.icon + 12,
          height: currentSize.icon + 12,
        }}
      >
        <Cloud
          size={currentSize.icon}
          strokeWidth={2}
        />
      </div>

      {!collapsed && (
        <span
          className={`
            ${currentSize.text}
            font-semibold
            tracking-tight
            text-gray-900
            dark:text-white
          `}
        >
          CloudVault
        </span>
      )}
    </div>
  );
}

export default Logo;