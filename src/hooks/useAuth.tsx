import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isUsingMocks, getAuthAdapter } from '@/lib/server-adapter';

/* ─── Guest ID generation ─── */
const ADJECTIVES = ['amber', 'crimson', 'shadow', 'iron', 'neon', 'frost', 'ghost', 'void', 'solar', 'cyber'];
const NOUNS = ['fox', 'wolf', 'hawk', 'viper', 'raven', 'lynx', 'cobra', 'titan', 'storm', 'blade'];

function generateGuestId(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}-${noun}-${num}`;
}

function getOrCreateGuestId(): string {
  const stored = sessionStorage.getItem('guest-actor-id');
  if (stored) return stored;
  const id = generateGuestId();
  sessionStorage.setItem('guest-actor-id', id);
  return id;
}

/* ─── Types ─── */
interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  actorId: string;
  displayName: string;
  login: (username: string, pin?: string) => void;
  logout: () => void;
  /** Dev toggle for testing (mock mode only) */
  toggleAuth: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/* ─── Mock logged-in user ─── */
const MOCK_USER: AuthUser = {
  id: 'usr_8f42b1c3',
  username: 'FragMaster',
  displayName: 'FragMaster',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [guestId] = useState(getOrCreateGuestId);

  const actorId = isLoggedIn && user ? user.id : guestId;
  const displayName = isLoggedIn && user ? user.displayName : guestId;

  // Restore session on mount (real mode only)
  useEffect(() => {
    if (isUsingMocks()) return;
    getAuthAdapter().restoreSession().then(u => {
      if (u) {
        setUser(u);
        setIsLoggedIn(true);
      }
    }).catch(() => { /* no session */ });
  }, []);

  const login = useCallback((username: string, pin?: string) => {
    if (isUsingMocks()) {
      // Mock: instant login
      const u: AuthUser = { id: `usr_${Date.now().toString(36)}`, username, displayName: username };
      setUser(u);
      setIsLoggedIn(true);
      return;
    }
    // Real: call server adapter
    getAuthAdapter().login(username, pin || '').then(u => {
      setUser(u);
      setIsLoggedIn(true);
    }).catch(err => {
      console.error('[Auth] Login failed:', err);
    });
  }, []);

  const logout = useCallback(() => {
    if (!isUsingMocks()) {
      getAuthAdapter().logout().catch(() => {});
    }
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const toggleAuth = useCallback(() => {
    if (isLoggedIn) {
      logout();
    } else {
      setUser(MOCK_USER);
      setIsLoggedIn(true);
    }
  }, [isLoggedIn, logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, actorId, displayName, login, logout, toggleAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
