"use client";

import { useState } from "react";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Heart, Star, Sparkles } from "lucide-react";

export default function ProductCard({ product }: any) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const outOfStock = typeof product.stock === "number" && product.stock <= 0;
  const isLowStock = typeof product.stock === "number" && product.stock > 0 && product.stock <= 5;

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "/placeholder.png";

  const isNewLaunch = (createdAt?: string) => {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    return now - created <= SEVEN_DAYS;
  };

  const discountPercent =
    product.mrp && product.price && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <div
      className="
        group relative
        border border-gray-200/80 dark:border-zinc-800/80
        rounded-2xl
        bg-white dark:bg-zinc-900/90
        shadow-sm hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1
        p-4 flex flex-col justify-between
        overflow-hidden
      "
    >
      {/* TOP IMAGE & OVERLAY BADGES */}
      <div>
        <div className="relative w-full h-60 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800/50 mb-3">
          <Link href={`/products/${product._id}`} className="block w-full h-full relative overflow-hidden">
            <img
              src={primaryImage}
              alt={product.title}
              className={`w-full h-full object-cover transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 ${
                product.images?.[1] ? "group-hover:opacity-0" : ""
              }`}
            />
            {product.images?.[1] && (
              <img
                src={product.images[1]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-110"
              />
            )}
          </Link>

          {/* BADGES OVERLAY */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercent && (
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-red-600 text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {product.soldCount > 10 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-md bg-amber-500/90 text-white flex items-center gap-1 backdrop-blur-md shadow-sm">
                <BadgeCheck className="h-3 w-3" /> Best Seller
              </span>
            )}
            {isNewLaunch(product.createdAt) && (
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-md bg-emerald-600/90 text-white flex items-center gap-1 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3 w-3" /> New
              </span>
            )}
          </div>

          {/* WISHLIST HEART BUTTON */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 text-gray-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-500 transition shadow-sm z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>

          {/* STOCK OVERLAY IF OUT OF STOCK */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* BRAND & CATEGORY */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {product.brand || "Brand"}
          </span>
          <span className="capitalize">{product.category || "General"}</span>
        </div>

        {/* TITLE */}
        <Link href={`/products/${product._id}`} className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100 text-base line-clamp-1 mb-1">
            {product.title}
          </h2>
        </Link>

        {/* RATING */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2 text-xs text-amber-500 font-medium">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 text-gray-900 dark:text-zinc-200 font-bold">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
            {product.reviewCount > 0 && (
              <span className="text-gray-400 dark:text-zinc-500">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* DESCRIPTION */}
        <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2 mb-3 min-h-[2rem]">
          {product.description}
        </p>
      </div>

      {/* BOTTOM PRICE & CART BUTTON */}
      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          {isLowStock && (
            <span className="ml-auto text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Only {product.stock} left
            </span>
          )}
        </div>

        <AddToCartButton
          productId={product._id}
          title={product.title}
          price={product.price}
          image={primaryImage}
          stock={product.stock}
          quantity={1}
        />
      </div>
    </div>
  );
}
