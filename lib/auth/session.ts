import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import type { AdminUser, LoginInput, LoginResponse } from "@/lib/types";

export const SESSION_COOKIE = "wm_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function getAdminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = await getAdminToken();
  if (!token) return null;

  try {
    return await apiFetch<AdminUser>("/admin/auth/me", { token });
  } catch {
    return null;
  }
}

export function loginWithCredentials(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: input,
  });
}

export async function createSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
