"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type { MeResponse } from "@/lib/api/types";
import { useCallback, useEffect, useState } from "react";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  image: string | null;
  roles: string[];
  verified: boolean;
};

export type SessionData = {
  user: SessionUser;
};

type SessionState = {
  data: SessionData | null;
  isPending: boolean;
  error: string | null;
};

type AuthResult<T = unknown> = ApiResult<T>;

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

function mapSessionUser(user: MeResponse["user"]): SessionUser {
  return {
    id: user.id,
    name: user.userName,
    email: user.email,
    image: null,
    roles: user.roles,
    verified: user.verified,
  };
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    data: null,
    isPending: true,
    error: null,
  });

  const fetchSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isPending: true, error: null }));

    const result = await apiRequest<MeResponse>({
      url: "/user/me",
      method: "GET",
    });

    if (result.error || !result.data?.user) {
      setState({
        data: null,
        isPending: false,
        error: result.error?.message ?? null,
      });
      return;
    }

    setState({
      data: { user: mapSessionUser(result.data.user) },
      isPending: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  return state;
}

export async function getSession(): Promise<AuthResult<SessionData>> {
  const result = await apiRequest<MeResponse>({
    url: "/user/me",
    method: "GET",
  });
  if (result.error || !result.data?.user) {
    return { data: null, error: result.error };
  }

  return {
    data: { user: mapSessionUser(result.data.user) },
    error: null,
  };
}

export function login({ email, password }: LoginInput) {
  return apiRequest<{ message: string }>({
    url: "/user/login",
    method: "POST",
    data: { email, password },
  });
}

export function loginWithGoogle(idToken: string) {
  return apiRequest<{ message: string }>({
    url: "/user/auth/google",
    method: "POST",
    data: { idToken },
  });
}

export function register({ name, email, password }: RegisterInput) {
  return apiRequest<{ message: string; verifyToken?: string }>({
    url: "/user/register",
    method: "POST",
    data: {
      user_name: name,
      email,
      password,
      type: "default",
    },
  });
}

export async function logout(): Promise<AuthResult<{ message: string }>> {
  return apiRequest<{ message: string }>({
    url: "/user/logout",
    method: "POST",
  });
}
