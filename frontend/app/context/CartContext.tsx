// app/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type CartItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string | null;
  size?: string; // Keep for backward compatibility
  selectedOptions?: Record<string, string>; // New: store selected variant options
  sku?: string; // New: store SKU for the variant
  variantDisplay?: string; // New: pre-formatted display string (e.g., "Black / M")
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  updateQty: (productId: string, qty: number, size?: string, selectedOptions?: Record<string, string>) => void;
  removeItem: (productId: string, size?: string, selectedOptions?: Record<string, string>) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ================= LOAD FROM STORAGE ================= */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {}
  }, []);

  /* ================= SAVE TO STORAGE ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Helper function to generate a unique key for cart items
  const getItemKey = (item: CartItem) => {
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.productId}-${JSON.stringify(item.selectedOptions)}`;
    }
    return `${item.productId}-${item.size || 'default'}`;
  };

  // Helper function to find matching item
  const findMatchingItem = (
    items: CartItem[],
    productId: string,
    size?: string,
    selectedOptions?: Record<string, string>
  ) => {
    return items.find((item) => {
      if (item.productId !== productId) return false;

      const itemHasOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
      const targetHasOptions = selectedOptions && Object.keys(selectedOptions).length > 0;

      if (itemHasOptions || targetHasOptions) {
        return JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {});
      }

      return (item.size || "") === (size || "");
    });
  };

  /* ---------- ADD ---------- */
  const addToCart = (item: CartItem) => {
    // Create a display string for the variant if not provided
    if (!item.variantDisplay && item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      item.variantDisplay = Object.values(item.selectedOptions).join(" / ");
    }

    setCart((prev) => {
      const exists = findMatchingItem(
        prev,
        item.productId,
        item.size,
        item.selectedOptions
      );

      if (exists) {
        return prev.map((p) => {
          if (p.productId !== item.productId) return p;

          const itemHasOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
          const pHasOptions = p.selectedOptions && Object.keys(p.selectedOptions).length > 0;

          let matches = false;
          if (itemHasOptions || pHasOptions) {
            matches = JSON.stringify(p.selectedOptions || {}) === JSON.stringify(item.selectedOptions || {});
          } else {
            matches = (p.size || "") === (item.size || "");
          }

          return matches ? { ...p, qty: p.qty + item.qty } : p;
        });
      }

      return [...prev, item];
    });
  };

  /* ---------- UPDATE QTY ---------- */
  const updateQty = (
    productId: string,
    qty: number,
    size?: string,
    selectedOptions?: Record<string, string>
  ) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((item) => {
            if (item.productId !== productId) return true;
            const itemHasOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
            const targetHasOptions = selectedOptions && Object.keys(selectedOptions).length > 0;
            if (itemHasOptions || targetHasOptions) {
              return JSON.stringify(item.selectedOptions || {}) !== JSON.stringify(selectedOptions || {});
            }
            return (item.size || "") !== (size || "");
          })
        : prev.map((item) => {
            if (item.productId !== productId) return item;
            const itemHasOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
            const targetHasOptions = selectedOptions && Object.keys(selectedOptions).length > 0;
            let matches = false;
            if (itemHasOptions || targetHasOptions) {
              matches = JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {});
            } else {
              matches = (item.size || "") === (size || "");
            }
            return matches ? { ...item, qty } : item;
          })
    );
  };

  /* ---------- REMOVE ---------- */
  const removeItem = (
    productId: string,
    size?: string,
    selectedOptions?: Record<string, string>
  ) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.productId !== productId) return true;
        const itemHasOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
        const targetHasOptions = selectedOptions && Object.keys(selectedOptions).length > 0;
        if (itemHasOptions || targetHasOptions) {
          return JSON.stringify(item.selectedOptions || {}) !== JSON.stringify(selectedOptions || {});
        }
        return (item.size || "") !== (size || "");
      })
    );
  };

  /* ---------- CLEAR ---------- */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}