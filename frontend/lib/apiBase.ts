export function getApiBaseUrl(): string {
  // 1. Explicit environment variable check first
  const envUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (
    envUrl &&
    envUrl.startsWith("http") &&
    !envUrl.includes("172.") &&
    !envUrl.includes("10.") &&
    !envUrl.includes("192.168") &&
    !envUrl.includes("localhost")
  ) {
    return envUrl;
  }

  // 2. Client-side check on production/deployed domains (Vercel, Render, Custom domains)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://shopit-backend-4g44.onrender.com";
  }

  // 3. Server-side check on Vercel / Render / Production SSR
  if (
    typeof process !== "undefined" &&
    (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === "production")
  ) {
    return "https://shopit-backend-4g44.onrender.com";
  }

  return "http://localhost:4000";
}

export function getAdminAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") || "" : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const API_BASE = getApiBaseUrl();
