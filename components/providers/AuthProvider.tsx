"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_UNAUTHORIZED_EVENT, authAPI } from "@/lib/api";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname.startsWith("/auth");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const clearUser = useCallback(() => {
    setUser(null);
    setLoading(false);
    setInitialized(true);
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const nextUser = await authAPI.getCurrentUser();
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const nextUser = await authAPI.login(payload);
      setUser(nextUser);
      setInitialized(true);
      return nextUser;
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const nextUser = await authAPI.register(payload);
      setUser(nextUser);
      setInitialized(true);
      return nextUser;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      clearUser();
      router.replace("/auth");
      router.refresh();
    }
  }, [clearUser, router]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshUser();
    });
  }, [refreshUser]);

  useEffect(() => {
    function handleUnauthorized() {
      clearUser();
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [clearUser]);

  useEffect(() => {
    if (!initialized || loading || user || isPublicPath(pathname)) {
      return;
    }

    router.replace("/auth");
  }, [initialized, loading, pathname, router, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      refreshUser,
      clearUser,
    }),
    [clearUser, loading, login, logout, refreshUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
