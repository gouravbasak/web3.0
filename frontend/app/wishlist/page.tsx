"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { getApiBaseUrl } from "@/lib/apiBase";
import { getValidImageUrl } from "@/lib/getImageUrl";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  Package,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const API = getApiBaseUrl();

type Product = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  images?: string[];
  stock?: number;
  category?: string;
  brand?: string;
  description?: string;
};

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadWishlistProducts() {
      if (!wishlist || wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Try authenticated endpoint first if user is logged in
        if (token) {
          try {
            const res = await fetch(`${API}/api/auth/wishlist`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.wishlist) && data.wishlist.length > 0 && typeof data.wishlist[0] === "object") {
                if (isMounted) {
                  setProducts(data.wishlist);
                  setLoading(false);
                  return;
                }
              }
            }
          } catch (_) {}
        }

        // Fallback: fetch from general products catalog
        const catRes = await fetch(`${API}/api/products`);
        if (catRes.ok) {
          const catData = await catRes.json();
          const allProducts: Product[] = Array.isArray(catData)
            ? catData
            : Array.isArray(catData.products)
            ? catData.products
            : [];
          const matched = allProducts.filter((p) => wishlist.includes(p._id));
          if (isMounted) {
            setProducts(matched);
          }
        }
      } catch (err) {
        console.error("Error loading wishlist products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWishlistProducts();
    return () => {
      isMounted = false;
    };
  }, [wishlist]);

  const handleMoveToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      title: product.title,
      price: product.price,
      qty: 1,
      image: product.images?.[0] || "",
    });
    toast.success(`Moved "${product.title.slice(0, 20)}..." to cart!`);
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              My Wishlist
            </h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Saved items synced across all your active sessions.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your entire wishlist?")) {
                clearWishlist();
                toast.success("Wishlist cleared");
              }
            }}
            className="self-start sm:self-auto text-xs font-semibold text-slate-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Wishlist
          </button>
        )}
      </div>

      {/* BODY */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Loading your saved gear...
          </p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Explore our certified MagSafe power banks, fast charging cables, and pro audio gear. Tap the heart on any product to save it here.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const rawImage =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "";
            const image = getValidImageUrl(rawImage, product.category);
            const discountPercent =
              product.mrp && product.price && product.mrp > product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : null;
            const isOutOfStock =
              typeof product.stock === "number" && product.stock <= 0;

            return (
              <div
                key={product._id}
                className="group relative bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div>
                  {/* IMAGE */}
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800/50 mb-3.5">
                    <Link href={`/products/${product._id}`} className="block w-full h-full">
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* DISCOUNT BADGE */}
                    {discountPercent && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-red-600 text-white shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    )}

                    {/* REMOVE BUTTON */}
                    <button
                      onClick={() => toggleWishlist(product._id, product.title)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shadow-sm"
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="space-y-1">
                    {product.brand && (
                      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500">
                        {product.brand}
                      </span>
                    )}
                    <Link href={`/products/${product._id}`}>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-red-500 dark:hover:text-red-400 transition">
                        {product.title}
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-xs text-slate-400 dark:text-zinc-500 line-through">
                        {formatPrice(product.mrp)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={isOutOfStock}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition ${
                      isOutOfStock
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? "Out of Stock" : "Move to Cart"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
