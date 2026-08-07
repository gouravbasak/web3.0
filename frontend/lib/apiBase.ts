export function getApiBaseUrl(): string {
  // Client-side check on Render / Production domain
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    return "https://shopit-backend-4g44.onrender.com";
  }

  // Server-side check on Render / Production deployment
  if (
    typeof process !== "undefined" &&
    (process.env.RENDER || process.env.NODE_ENV === "production")
  ) {
    return "https://shopit-backend-4g44.onrender.com";
  }

  const envUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (
    envUrl &&
    envUrl.startsWith("http") &&
    !envUrl.includes("172.") &&
    !envUrl.includes("10.") &&
    !envUrl.includes("192.168")
  ) {
    return envUrl;
  }

  return "http://localhost:4000";
}

export const API_BASE = getApiBaseUrl();
