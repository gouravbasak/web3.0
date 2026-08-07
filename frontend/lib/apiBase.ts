export function getApiBaseUrl(): string {
  // Always use HTTPS production backend when on hosted environment
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
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
