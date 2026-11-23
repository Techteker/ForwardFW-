import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Models } from 'appwrite';
import { account, ID, isConfigured } from '../lib/appwrite';

type User = Models.User<Models.Preferences>;
interface AuthCtx {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  forgot: (email: string) => Promise<void>;
  reset: (userId: string, secret: string, password: string) => Promise<void>;
  changePassword: (oldPassword: string, password: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updatePrefs: (prefs: Record<string, unknown>) => Promise<void>;
}
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { try { setUser(await account.get()); } catch { setUser(null); } }, []);
  useEffect(() => { if (!isConfigured) { setLoading(false); return; } refresh().finally(() => setLoading(false)); }, [refresh]);

  const value = useMemo<AuthCtx>(() => ({
    user, loading,
    login: async (email, password) => { await account.createEmailPasswordSession(email, password); await refresh(); },
    register: async (name, email, password) => { await account.create(ID.unique(), email, password, name); await account.createEmailPasswordSession(email, password); await refresh(); },
    logout: async () => { await account.deleteSession('current'); setUser(null); },
    sendOtp: async (phone) => { const t = await account.createPhoneToken(ID.unique(), phone); sessionStorage.setItem('forword:otp-user', t.userId); sessionStorage.setItem('forword:otp-phone', phone); },
    verifyOtp: async (code) => { const id = sessionStorage.getItem('forword:otp-user'); if (!id) throw new Error('Request a new OTP first.'); await account.createSession(id, code); sessionStorage.removeItem('forword:otp-user'); await refresh(); },
    forgot: async (email) => { await account.createRecovery(email, `${window.location.origin}/reset-password`); },
    reset: async (userId, secret, password) => { await account.updateRecovery(userId, secret, password); },
    changePassword: async (oldPassword, password) => { await account.updatePassword(password, oldPassword); },
    updateName: async (name) => { await account.updateName(name); await refresh(); },
    updatePrefs: async (prefs) => { await account.updatePrefs({ ...(user?.prefs ?? {}), ...prefs }); await refresh(); },
  }), [user, loading, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
