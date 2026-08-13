const FALLBACK_IMAGES: Record<string, string> = {
  cable: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  powerbank: "https://images.unsplash.com/photo-1609592424089-866b1a206a5b?w=800&auto=format&fit=crop&q=80",
  earphone: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
};

export function getValidImageUrl(url?: string, category?: string): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return FALLBACK_IMAGES.default;
  }

  // If the image URL is from Firebase Storage (which returns 402 Payment Required),
  // fallback to a clean high-resolution product image based on product category.
  if (url.includes("firebasestorage.googleapis.com")) {
    const cat = (category || "").toLowerCase();
    if (cat.includes("cable") || cat.includes("data")) return FALLBACK_IMAGES.cable;
    if (cat.includes("power") || cat.includes("bank") || cat.includes("charger")) return FALLBACK_IMAGES.powerbank;
    return FALLBACK_IMAGES.earphone;
  }

  return url;
}
