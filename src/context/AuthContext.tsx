import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  api,
  ApiError,
  AuthUser,
  clearAuth,
  getStoredUser,
  getToken,
  normalizeUser,
  setStoredUser,
  setToken,
} from "../lib/api";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await api.auth.me();
      const u = normalizeUser(res.data || res.user || res);
      if (!u || u.role !== "student") {
        await clearAuth();
        setUser(null);
        return;
      }
      await setStoredUser(u);
      setUser(u);
    } catch {
      const cached = await getStoredUser();
      if (cached?.role === "student") setUser(cached);
      else {
        await clearAuth();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cached = await getStoredUser();
        if (cached?.role === "student") setUser(cached);
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email.trim(), password);
    const token = res.token || res.data?.token || res.accessToken;
    const rawUser = res.user || res.data?.user || res.data;
    const u = normalizeUser(rawUser);
    if (!token || !u) throw new ApiError("Invalid login response", 500);
    if (u.role !== "student") {
      throw new ApiError("This app is for students only. Use the web app for other roles.", 403);
    }
    await setToken(token);
    await setStoredUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
