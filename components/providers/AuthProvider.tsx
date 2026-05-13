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
import {
  AUTH_FORBIDDEN_EVENT,
  AUTH_UNAUTHORIZED_EVENT,
  authAPI,
} from "@/lib/api";
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

  const login = useCallback(async (payload: LoginRequest) => {
    setLoading(true);

    try {
      const nextUser = await authAPI.login(payload);
      setUser(nextUser);
      setInitialized(true);
      return nextUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    setLoading(true);

    try {
      const nextUser = await authAPI.register(payload);
      setUser(nextUser);
      setInitialized(true);
      return nextUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      clearUser();
      window.location.href = "/auth";
    }
  }, [clearUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshUser]);

  useEffect(() => {
    function handleUnauthorized() {
      clearUser();
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [clearUser]);

  useEffect(() => {
    function handleForbidden(event: Event) {
      const customEvent = event as CustomEvent<{
        message?: string;
        blocked?: boolean;
      }>;
      const message = customEvent.detail?.message ?? "Access denied";
      const blocked = Boolean(customEvent.detail?.blocked);

      clearUser();

      if (blocked) {
        window.location.href = `/auth?reason=${encodeURIComponent(message)}`;
        return;
      }

      if (!isPublicPath(pathname)) {
        router.replace("/dashboard?denied=admin");
      }
    }

    window.addEventListener(AUTH_FORBIDDEN_EVENT, handleForbidden);

    return () => {
      window.removeEventListener(AUTH_FORBIDDEN_EVENT, handleForbidden);
    };
  }, [clearUser, pathname, router]);

  useEffect(() => {
    if (!initialized || loading) return;

    if (!user && !isPublicPath(pathname)) {
      router.replace("/auth");
    }
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
