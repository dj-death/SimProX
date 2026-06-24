/**
 * Auth state: holds the token + current user, persists the token, and exposes
 * login/logout. Login flow mirrors the backend: POST credentials -> receive
 * { token } -> store it -> fetch the user document.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginRequest, User } from '@simprox/api-types';
import { tokenStore } from '../api/client';
import { studentLogin, adminLogin, getCurrentUser, logout as logoutApi } from '../api/auth';

type Audience = 'student' | 'admin';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (credentials: LoginRequest, audience?: Audience) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [status, setStatus] = useState<AuthState['status']>(token ? 'loading' : 'anonymous');

  // On boot with a stored token, restore the session by fetching the user.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getCurrentUser()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        tokenStore.clear();
        setToken(null);
        setStatus('anonymous');
      });
    return () => {
      cancelled = true;
    };
    // run once on mount for the initial token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(credentials: LoginRequest, audience: Audience = 'student') {
    const { token: newToken } = await (audience === 'admin' ? adminLogin : studentLogin)(credentials);
    tokenStore.set(newToken);
    setToken(newToken);
    const u = await getCurrentUser();
    setUser(u);
    setStatus('authenticated');
  }

  async function logout() {
    try {
      await logoutApi();
    } finally {
      tokenStore.clear();
      setToken(null);
      setUser(null);
      setStatus('anonymous');
    }
  }

  const value = useMemo<AuthState>(
    () => ({ user, token, status, login, logout }),
    [user, token, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
