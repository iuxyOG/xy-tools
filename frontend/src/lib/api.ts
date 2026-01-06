const rawApiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "";
const normalizedApiBase = rawApiBase.replace(/\/$/, "");
const isProd = process.env.NODE_ENV === "production";

if (isProd && !normalizedApiBase) {
  throw new Error("NEXT_PUBLIC_API_URL is required in production.");
}

if (isProd && !normalizedApiBase.startsWith("https://")) {
  throw new Error("NEXT_PUBLIC_API_URL must start with https:// in production.");
}

export const API_BASE = normalizedApiBase;

// If backend returns relative URLs like /uploads/... we want them to work in both
// proxy mode (Next rewrites) and direct mode (NEXT_PUBLIC_API_URL set).
export function resolvePublicUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_BASE) return url;
  return `${API_BASE}${url}`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const text = await resp.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!resp.ok) {
    const msg = json?.message || text || `HTTP ${resp.status}`;
    console.error("API error", { path, status: resp.status, message: msg });
    const err = new Error(msg);
    (err as Error & { status?: number }).status = resp.status;
    throw err;
  }

  return (json?.data ?? json) as T;
}
