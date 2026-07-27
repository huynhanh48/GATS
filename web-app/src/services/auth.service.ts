import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";
import type {
  AuthUser,
  LoginResponse,
  MeResponse,
  RegisterInput,
  RegisterResponse,
} from "@/types/auth";

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiClient.post(PathApi.auth.login, {
    email,
    password,
  }) as Promise<LoginResponse>;
}

export async function googleLoginRequest(
  idToken: string
): Promise<LoginResponse> {
  return apiClient.post(PathApi.auth.googleLogin, {
    idToken,
  }) as Promise<LoginResponse>;
}

export async function registerRequest(
  input: RegisterInput
): Promise<RegisterResponse> {
  return apiClient.post(PathApi.auth.register, {
    user_name: input.userName,
    email: input.email,
    password: input.password,
  }) as Promise<RegisterResponse>;
}

export async function fetchMe(): Promise<AuthUser> {
  const data = (await apiClient.get(PathApi.auth.me)) as MeResponse;
  return data.user;
}

export async function changePasswordRequest(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient.post(PathApi.auth.changePassword, {
    currentPassword,
    newPassword,
  }) as Promise<{ message: string }>;
}

export async function forgotPasswordRequest(
  email: string,
): Promise<{ message: string }> {
  return apiClient.post(PathApi.auth.forgotPassword, {
    email,
  }) as Promise<{ message: string }>;
}

export async function resetPasswordRequest(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient.post(PathApi.auth.resetPassword, {
    token,
    newPassword,
  }) as Promise<{ message: string }>;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post(PathApi.auth.logout);
}

export async function verifyEmailRequest(token: string): Promise<void> {
  await apiClient.post(PathApi.auth.verifyEmail, { token });
}
