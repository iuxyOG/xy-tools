import { apiFetch } from "./api";

export type Me = { email: string; expiresAt: number };

export async function login(email: string, password: string) {
  return apiFetch<{ email: string; expiresAt: number }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  return apiFetch<Me>("/api/auth/me");
}

export async function logout() {
  return apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
}
