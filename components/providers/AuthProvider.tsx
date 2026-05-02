"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  const authActionIdRef = useRef(0);

  const clearUser = useCallback(() => {
    authActionIdRef.current += 1;
    setUser(null);
    setLoading(false);
    setInitialized(true);
  }, []);

  const refreshUser = useCallback(async () => {
    const actionId = ++authActionIdRef.current;

    setLoading(true);

    try {
      const nextUser = await authAPI.getCurrentUser();

      if (authActionIdRef.current === actionId) {
        setUser(nextUser);
      }

      return nextUser;
    } catch {
      if (authActionIdRef.current === actionId) {
        setUser(null);
      }

      return null;
    } finally {
      if (authActionIdRef.current === actionId) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const actionId = ++authActionIdRef.current;

    setLoading(true);

    try {
      await authAPI.login(payload);

      const nextUser = await authAPI.getCurrentUser();

      if (authActionIdRef.current === actionId) {
        setUser(nextUser);
        setInitialized(true);
      }

      return nextUser;
    } finally {
      if (authActionIdRef.current === actionId) {
        setLoading(false);
      }
    }
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const actionId = ++authActionIdRef.current;

    setLoading(true);

    try {
      await authAPI.register(payload);

      const nextUser = await authAPI.getCurrentUser();

      if (authActionIdRef.current === actionId) {
        setUser(nextUser);
        setInitialized(true);
      }

      return nextUser;
    } finally {
      if (authActionIdRef.current === actionId) {
        setLoading(false);
      }
    }
  }, []);

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
    const timer = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => window.clearTimeout(timer);
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
