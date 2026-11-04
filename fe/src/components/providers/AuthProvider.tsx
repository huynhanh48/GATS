"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMe,
  loginRequest,
  googleLoginRequest,
  logoutRequest,
  registerRequest,
  verifyEmailRequest,
} from "@/services/auth.service";
import { setUnauthorizedSessionHandler } from "@/lib/apiClient";
import type { AuthStatus, AuthUser, RegisterInput } from "@/types/auth";
import { AuthContext, type AuthContextValue } from "./auth-context";

/** One-time cleanup of legacy Bearer/token localStorage keys. */
function clearLegacyAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("userName");
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const markAnonymous = useCallback(() => {
    setUser(null);
    setStatus("anonymous");
  }, []);

  const markAuthenticated = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const me = await fetchMe();
      markAuthenticated(me);
    } catch {
      markAnonymous();
    }
  }, [markAuthenticated, markAnonymous]);

  useEffect(() => {
    clearLegacyAuthStorage();

    let cancelled = false;

    async function hydrate() {
      try {
        const me = await fetchMe();
        if (!cancelled) markAuthenticated(me);
      } catch {
        if (!cancelled) markAnonymous();
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [markAuthenticated, markAnonymous]);

  useEffect(() => {
    setUnauthorizedSessionHandler(() => {
      // Only flip once when we believed we were authenticated
      if (statusRef.current === "authenticated") {
        markAnonymous();
      }
    });
    return () => setUnauthorizedSessionHandler(null);
  }, [markAnonymous]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginRequest(email, password);
      const me = await fetchMe();
      markAuthenticated(me);
    },
    [markAuthenticated]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      await googleLoginRequest(idToken);
      const me = await fetchMe();
      markAuthenticated(me);
    },
    [markAuthenticated]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await registerRequest(input);

      if (result.verifyToken) {
        await verifyEmailRequest(result.verifyToken);
        await login(input.email, input.password);
        return { needsVerification: false };
      }

      return { needsVerification: true };
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Always clear client session even if BE is unreachable
    } finally {
      markAnonymous();
    }
  }, [markAnonymous]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated" && user !== null,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshSession,
    }),
    [status, user, login, loginWithGoogle, register, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from "./auth-context";
