"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { getValidImageUrl } from "@/lib/getImageUrl";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Trash2,
  ArrowRight,
} from "lucide-react";

type RecentItem = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  image: string;
  category?: string;
  brand?: string;
  viewedAt: number;
};

const STORAGE_KEY = "ionyx_recent_products";

export default function RecentlyViewedCarousel({
  currentId,
}: {
  currentId?: string;
}) {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [items, setItems] = useState<RecentItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const loadItems = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = currentId
            ? parsed.filter((it) => it._id !== currentId)
            : parsed;
          setItems(filtered);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadItems();

    const handleUpdate = () => loadItems();
    window.addEventListener("recent-products-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("recent-products-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [currentId]);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 350);
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
      window.dispatchEvent(new Event("recent-products-updated"));
    } catch (_) {}
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 pb-4 border-t border-slate-200 dark:border-zinc-800">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recently Viewed
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Pick up right where you left off
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition"
            title="Clear recently viewed history"
          >
            Clear History
          </button>

          {/* SCROLL BUTTONS */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-xl border border-slate-200 dark:border-zinc-800 transition ${
                canScrollLeft
                  ? "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 shadow-sm"
                  : "opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600"
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-xl border border-slate-200 dark:border-zinc-800 transition ${
                canScrollRight
                  ? "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 shadow-sm"
                  : "opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL */}
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const image = getValidImageUrl(item.image, item.category);
          const isWishlisted = isInWishlist(item._id);
          const discountPercent =
            item.mrp && item.price && item.mrp > item.price
              ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
              : null;

          return (
            <div
              key={item._id}
              className="min-w-[220px] max-w-[240px] shrink-0 snap-start group relative bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* THUMBNAIL */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800/40 mb-2.5">
                  <Link href={`/products/${item._id}`} className="block w-full h-full">
                    <img
                      src={image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* DISCOUNT BADGE */}
                  {discountPercent && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-red-600 text-white shadow-sm">
                      {discountPercent}% OFF
                    </span>
                  )}

                  {/* WISHLIST BUTTON */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(item._id, item.title);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:text-red-500 transition shadow-sm"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 transition-colors ${
                        isWishlisted ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* INFO */}
                <Link href={`/products/${item._id}`}>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    {item.title}
                  </h3>
                </Link>
              </div>

              {/* BOTTOM PRICE & VIEW LINK */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {formatPrice(item.price)}
                  </div>
                  {item.mrp && item.mrp > item.price && (
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 line-through">
                      {formatPrice(item.mrp)}
                    </div>
                  )}
                </div>

                <Link
                  href={`/products/${item._id}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
