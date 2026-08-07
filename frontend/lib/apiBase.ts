export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE && process.env.NEXT_PUBLIC_API_BASE.startsWith("http")) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    return "https://shopit-backend-4g44.onrender.com";
  }
  return "http://localhost:4000";
}

export const API_BASE = getApiBaseUrl();
