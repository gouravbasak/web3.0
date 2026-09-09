"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

type WishlistContextType = {
  wishlist: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productTitle?: string) => Promise<void>;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "ionyx_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist on initial mount
  useEffect(() => {
    let localItems: string[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        localItems = JSON.parse(stored);
        if (Array.isArray(localItems)) {
          setWishlist(localItems);
        }
      }
    } catch (_) {}

    // Check if user is logged in and sync with backend
    const syncWithServer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Sync local items to server first if any exist
        if (localItems.length > 0) {
          await fetch(`${API}/api/auth/wishlist/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ productIds: localItems }),
          });
        }

        // Fetch authoritative server wishlist
        const res = await fetch(`${API}/api/auth/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.wishlist)) {
            const serverIds = data.wishlist.map((item: any) =>
              typeof item === "string" ? item : item._id
            );
            setWishlist(serverIds);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverIds));
          }
        }
      } catch (_) {}
    };

    syncWithServer();

    // Listen to auth changes
    const handleAuthChange = () => syncWithServer();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return wishlist.includes(productId.toString());
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productTitle?: string) => {
      if (!productId) return;
      const pid = productId.toString();
      const alreadyIn = wishlist.includes(pid);

      // Optimistic update
      const updated = alreadyIn
        ? wishlist.filter((id) => id !== pid)
        : [...wishlist, pid];

      setWishlist(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}

      if (alreadyIn) {
        toast("Removed from wishlist", { icon: "💔" });
      } else {
        toast.success(
          productTitle
            ? `Added "${productTitle.slice(0, 24)}..." to wishlist!`
            : "Added to wishlist!",
          { icon: "❤️" }
        );
      }

      // Sync with server if logged in
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await fetch(`${API}/api/auth/wishlist/toggle`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ productId: pid }),
          });
        }
      } catch (_) {}
    },
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (_) {}
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
