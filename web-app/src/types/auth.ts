export type AuthType = "facebook" | "apple" | "google" | "default";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthUser = {
  id: number;
  userName: string;
  verified: boolean;
  email: string;
  type: AuthType;
  roles: string[];
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export type AuthModalMode = "login" | "register";

/** Cookie is set by BE; body has no access token. */
export type LoginResponse = {
  message: string;
  expiresAt: string;
};

export type RegisterResponse = {
  message: string;
  verifyToken?: string;
};

export type MeResponse = {
  user: AuthUser;
};

export type RegisterInput = {
  userName: string;
  email: string;
  password: string;
};
