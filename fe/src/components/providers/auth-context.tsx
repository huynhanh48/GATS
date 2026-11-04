"use client";

import { createContext, useContext } from "react";
import type { AuthStatus, AuthUser, RegisterInput } from "@/types/auth";

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (
    input: RegisterInput
  ) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
