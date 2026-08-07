// components/AddToCartButton.tsx
"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { IconShoppingCartCopy } from "@tabler/icons-react";

type Props = {
  productId: string;
  title: string;
  price: number;
  image?: string | null;
  stock?: number | null;
  size?: string; // Now this will only come from selectedOptions.Size
  quantity?: number;
  selectedOptions?: Record<string, string>;
  sku?: string;
  className?: string;
};

export default function AddToCartButton({
  productId,
  title,
  price,
  image,
  stock,
  size,
  quantity = 1,
  selectedOptions = {},
  sku,
  className = "",
}: Props) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const outOfStock = typeof stock === "number" && stock <= 0;

  const handleAdd = () => {
    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }

    // Check if variant options are selected
    if (Object.keys(selectedOptions).length > 0) {
      const missingSelections = Object.entries(selectedOptions).some(
        ([_, value]) => !value
      );
      if (missingSelections) {
        toast.error("Please select all variant options");
        return;
      }
    }

    setLoading(true);

    // Create a display string for the variant
    const variantDisplay = Object.values(selectedOptions).join(" / ");

    // Only include size in cart item if it exists in selectedOptions
    const cartItem: any = {
      productId,
      title,
      price,
      image: image || "/placeholder.png",
      qty: quantity,
      selectedOptions,
      sku,
      variantDisplay: variantDisplay || undefined,
    };

    // Only add size if it exists in selectedOptions
    if (selectedOptions.Size) {
      cartItem.size = selectedOptions.Size;
    }

    addToCart(cartItem);

    setLoading(false);
    toast.success("Added to cart");
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={loading || outOfStock}
      size="lg"
      variant="outline"
      className={`
        w-full font-semibold text-sm 
        text-white hover:text-white
        dark:border-white/40
        dark:text-white
        dark:hover:bg-white/10
        ${
          outOfStock
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-black text-white hover:bg-black/80"
        }
        ${className}
      `}
    >
      <IconShoppingCartCopy stroke={2} />
      {loading
        ? "Adding…"
        : outOfStock
        ? "Out of Stock"
        : "Add to Cart"}
    </Button>
  );
}