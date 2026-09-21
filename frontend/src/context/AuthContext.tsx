import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '@/api/axios';
import type { User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user?: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(window.atob(normalized)))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function userFromToken(token: string): User {
  const payload = decodeJwtPayload(token);
  const email = typeof payload?.sub === 'string' ? payload.sub : 'CloudVault user';
  return {
    email,
    fullName: email.includes('@') ? email.split('@')[0] : email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved ? userFromToken(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setUser(userFromToken(saved));
    }
    setLoading(false);
  }, []);

  const login = async (newToken: string, suppliedUser?: Partial<User>) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser({ ...userFromToken(newToken), ...suppliedUser });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    window.location.assign('/login');
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
