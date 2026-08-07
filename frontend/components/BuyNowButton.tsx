// components/BuyNowButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { IconShoppingBagCheck } from "@tabler/icons-react";

type Props = {
  productId: string;
  title: string;
  price: number;
  image?: string;
  stock?: number;
  size?: string; // This will only come from selectedOptions.Size
  quantity: number;
  selectedOptions?: Record<string, string>;
  sku?: string;
  className?: string;
};

export default function BuyNowButton({
  productId,
  title,
  price,
  image,
  stock,
  size,
  quantity,
  selectedOptions = {},
  sku,
  className = "",
}: Props) {
  const router = useRouter();
  const { addToCart, clearCart } = useCart();

  const outOfStock = typeof stock === "number" && stock <= 0;

  const handleBuyNow = () => {
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

    // 🔐 Check login
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue");
      router.push(`/login?redirect=/checkout?product=${productId}`);
      return;
    }

    // Create a display string for the variant
    const variantDisplay = Object.values(selectedOptions).join(" / ");

    // 🛒 Fresh Buy Now flow
    clearCart();

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

    router.push("/checkout");
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={outOfStock}
      size="lg"
      variant="outline"
      className={`
        w-full font-semibold text-sm
        dark:border-white/40
        dark:text-white
        dark:hover:bg-white/10
        ${
          outOfStock
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "hover:bg-accent"
        }
        ${className}
      `}
    >
      <IconShoppingBagCheck stroke={2} />
      Buy Now
    </Button>
  );
}