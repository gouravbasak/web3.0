import { getApiBaseUrl } from "./apiBase";

const API = getApiBaseUrl();

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API}/api/admin/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Failed to upload image");
  }

  return data.url;
}
