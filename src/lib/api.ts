import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/** Change this to your QuizMind backend (same API as the web app). */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:4000/api/v1";

const TOKEN_KEY = "quizmind_token";
const USER_KEY = "quizmind_user";

export type UserRole = "teacher" | "student" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  school?: string | null;
  phone?: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function storageGet(key: string) {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDel(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getToken() {
  return storageGet(TOKEN_KEY);
}

export async function setToken(token: string) {
  await storageSet(TOKEN_KEY, token);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await storageGet(USER_KEY);
  if (!raw) return null;
  try {
    return normalizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function setStoredUser(user: AuthUser) {
  const n = normalizeUser(user);
  if (n) await storageSet(USER_KEY, JSON.stringify(n));
}

export async function clearAuth() {
  await storageDel(TOKEN_KEY);
  await storageDel(USER_KEY);
}

export function normalizeUser(raw: any): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;
  const name = raw.name || raw.names || "";
  const email = raw.email || "";
  const role = raw.role as UserRole;
  if (!email || !role) return null;
  return {
    id,
    name,
    email,
    role,
    school: raw.school || null,
    phone: raw.phone || null,
  };
}

export function initials(name?: string | null) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function apiRequest<T = any>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    throw new ApiError(data?.message || data?.error || "Request failed", res.status);
  }
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      }),
    me: () => apiRequest("/auth/me"),
  },
  quizzes: {
    studentUpcoming: () => apiRequest("/quizzes/student/upcoming"),
    studentCompleted: () => apiRequest("/quizzes/student/completed"),
    studentResults: (id: string | number) =>
      apiRequest(`/quizzes/student/${id}/results`),
    get: (id: string | number) => apiRequest(`/quizzes/${id}`),
    submit: (id: string | number, body: unknown) =>
      apiRequest(`/quizzes/${id}/submissions`, { method: "POST", body }),
  },
  classes: {
    list: () => apiRequest("/classes"),
    join: (code: string) =>
      apiRequest("/classes/join", { method: "POST", body: { code } }),
    get: (id: string | number) => apiRequest(`/classes/${id}`),
  },
  progress: {
    me: () => apiRequest("/progress"),
  },
  announcements: {
    list: () => apiRequest("/announcements"),
  },
  notifications: {
    list: () => apiRequest("/notifications"),
    markRead: (id: string | number) =>
      apiRequest(`/notifications/read/${id}`, { method: "PUT" }),
    markAllRead: () => apiRequest("/notifications/read-all", { method: "PUT" }),
  },
  messages: {
    list: () => apiRequest("/conversations"),
    get: (id: string | number) => apiRequest(`/conversations/${id}`),
    send: (id: string | number, body: string) =>
      apiRequest(`/conversations/${id}/messages`, {
        method: "POST",
        body: { body },
      }),
  },
  feedback: {
    create: (body: { rating: number; message: string; category?: string }) =>
      apiRequest("/feedback", { method: "POST", body }),
  },
  users: {
    changePassword: (body: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      apiRequest("/users/changePassword", {
        method: "PUT",
        body: {
          oldPassword: body.currentPassword,
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
          confirmPassword: body.confirmPassword,
        },
      }),
  },
};
