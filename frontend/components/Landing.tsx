"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ArrowRight,
  BadgeCheck,
  ShoppingBag,
  Layers,
  Flame,
  Award,
  ChevronRight
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

type AdProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  brand: string;
  category: string;
  images?: string[];
  averageRating?: number;
  reviewCount?: number;
};

export default function UniversalLanding() {
  const [ads, setAds] = useState<AdProduct[]>([]);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [loadingAds, setLoadingAds] = useState(true);
  const [hasAdminSelectedAds, setHasAdminSelectedAds] = useState(false);

  useEffect(() => {
    async function fetchAds() {
      try {
        // 1. Check for admin-selected ad products (isFeatured: true)
        let res = await fetch(`${API}/api/products/featured`, { cache: "no-store" });
        
        if (!res.ok) {
          res = await fetch(`${API}/api/products?isFeatured=true`, { cache: "no-store" });
        }

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const featuredList = data.filter((p: any) => p.isFeatured);
            if (featuredList.length > 0) {
              setAds(featuredList);
              setHasAdminSelectedAds(true);
              return;
            }
          }
        }

        // 2. FALLBACK: If NO products are selected as Ads by admin, show ONLY the Top Selling Product
        setHasAdminSelectedAds(false);
        const topSellingRes = await fetch(`${API}/api/products/best-sellers`, { cache: "no-store" });
        if (topSellingRes.ok) {
          const bestSellers = await topSellingRes.json();
          if (Array.isArray(bestSellers) && bestSellers.length > 0) {
            setAds([bestSellers[0]]);
            return;
          }
        }

        // 3. Ultimate Fallback: Single most recent product
        const fallbackRes = await fetch(`${API}/api/products`, { cache: "no-store" });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            setAds([fallbackData[0]]);
          }
        }
      } catch (err) {
        console.error("Failed to load ad products:", err);
      } finally {
        setLoadingAds(false);
      }
    }
    fetchAds();
  }, []);



  // 🔁 1-BY-1 AUTO SLIDESHOW FOR ADS
  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % ads.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [ads.length]);

  return (

    <>
      {/* ================= NIKE / APPLE STYLED UNIVERSAL HERO SHOWCASE ================= */}
      <section className="relative w-full min-h-[88vh] bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white overflow-hidden flex items-center pt-8 pb-16 px-4 sm:px-6 lg:px-12 border-b border-slate-200/80 dark:border-emerald-950/40 transition-colors duration-300">
        
        {/* LIGHT & DARK MODE BACKGROUND GLOW ORBS */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 via-slate-50 to-white dark:from-emerald-950/50 dark:via-[#060814] dark:to-[#03040a] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 dark:bg-slate-200/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-5 dark:opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* HERO LEFT CONTENT */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Category Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-slate-100 text-xs font-bold uppercase tracking-widest shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <span>Fashion • Tech • Sports • Lifestyle</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Curated Essentials. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-emerald-300 bg-clip-text text-transparent">
                  Engineered for Life.
                </span>
              </h1>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Discover a flagship multi-category store featuring premium apparel, cutting-edge technology, pro sports equipment, and daily luxury essentials.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/products"
                  className="group relative inline-flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Explore All Products
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/products?sort=newest"
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-slate-200 font-bold text-base px-6 py-4 rounded-2xl transition"
                >
                  <Flame className="h-5 w-5 text-amber-500" /> New Arrivals
                </Link>
              </div>

              {/* Value proposition badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/10">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Free Shipping over ₹1,500
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> 100% Genuine Guarantee
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <RotateCcw className="h-4 w-4 text-amber-500" /> 7-Day Hassle-Free Return
                </span>
              </div>

            </div>

            {/* HERO RIGHT SHOWCASE: DYNAMIC 1-BY-1 ADMIN AD CAROUSEL */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md relative group">
                
                {/* Background Shadow Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition duration-500" />

                {/* Main Editorial Card Container */}
                <div className="relative bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300 min-h-[440px]">
                  
                  {loadingAds ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                  ) : ads.length > 0 ? (
                    (() => {
                      const currentAd = ads[activeAdIndex];
                      const discount = currentAd.mrp && currentAd.mrp > currentAd.price
                        ? Math.round(((currentAd.mrp - currentAd.price) / currentAd.mrp) * 100)
                        : 0;

                      return (
                        <div key={currentAd._id} className="animate-in fade-in duration-500 flex flex-col justify-between h-full">
                          {/* Top Badge & Slide Indicator */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              {hasAdminSelectedAds 
                                ? `★ Featured Ad ${ads.length > 1 ? `(${activeAdIndex + 1}/${ads.length})` : ""}`
                                : "★ Top Selling Product"}
                            </span>

                            <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-400" /> {currentAd.averageRating || "4.9"} ({currentAd.reviewCount || 12}+ Reviews)
                            </span>
                          </div>

                          {/* Image Container with Fixed Bounds */}
                          <div className="w-full h-60 rounded-2xl overflow-hidden mb-4 relative bg-slate-100 dark:bg-zinc-950 flex items-center justify-center p-4">
                            <img
                              src={currentAd.images?.[0] || "/placeholder.png"}
                              alt={currentAd.title}
                              className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            {discount > 0 && (
                              <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                                {discount}% OFF
                              </span>
                            )}
                          </div>

                          {/* Editorial Copy */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                              {currentAd.brand || "IONYX Select"} • {currentAd.category}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">
                              {currentAd.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                              {currentAd.description}
                            </p>
                          </div>

                          {/* Bottom Price & Call To Action */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Special Offer</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹{currentAd.price.toLocaleString()}</span>
                                {currentAd.mrp && currentAd.mrp > currentAd.price && (
                                  <span className="text-xs text-slate-400 line-through">₹{currentAd.mrp.toLocaleString()}</span>
                                )}
                              </div>
                            </div>

                            <Link
                              href={`/products/${currentAd._id}`}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md hover:scale-105"
                            >
                              Shop Now <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>

                          {/* CAROUSEL PROGRESS DOTS */}
                          {ads.length > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-3 pt-1">
                              {ads.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setActiveAdIndex(i)}
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === activeAdIndex ? "w-6 bg-emerald-500" : "w-1.5 bg-slate-300 dark:bg-zinc-700"
                                  }`}
                                  aria-label={`Go to slide ${i + 1}`}
                                />
                              ))}
                            </div>
                          )}

                        </div>
                      );
                    })()
                  ) : null}

                </div>

              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ================= NIKE/H&M EDITORIAL DEPARTMENT CARDS ================= */}
      <section className="bg-slate-100 dark:bg-[#050714] py-16 px-4 sm:px-6 lg:px-12 border-b border-slate-200 dark:border-emerald-950/40 text-slate-900 dark:text-white relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" /> Curated Departments
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Our Store Collections
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              From athletic footwear and sportswear to next-generation gadgets and daily accessories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Category Card 1: Apparel & Footwear */}
            <Link
              href="/products?category=Footwear"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-6 flex flex-col justify-between h-72 hover:border-emerald-400/40 transition duration-500 hover:-translate-y-1 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                alt="Apparel & Footwear"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="relative z-20">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-white/20 text-white backdrop-blur-md">
                  Fashion & Footwear
                </span>
              </div>
              <div className="relative z-20 space-y-1">
                <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition">
                  Streetwear & Kicks
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                  Shop Apparel <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>

            {/* Category Card 2: Tech & Electronics */}
            <Link
              href="/products?category=Powerbank"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-6 flex flex-col justify-between h-72 hover:border-emerald-400/40 transition duration-500 hover:-translate-y-1 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                alt="Tech & Electronics"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="relative z-20">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-white/20 text-white backdrop-blur-md">
                  Tech & Innovation
                </span>
              </div>
              <div className="relative z-20 space-y-1">
                <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition">
                  Next-Gen Devices
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                  Shop Tech <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>

            {/* Category Card 3: Sports & Athletics */}
            <Link
              href="/products?category=Cricket"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-6 flex flex-col justify-between h-72 hover:border-amber-400/40 transition duration-500 hover:-translate-y-1 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80"
                alt="Sports & Equipment"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="relative z-20">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-white/20 text-white backdrop-blur-md">
                  Sports & Active
                </span>
              </div>
              <div className="relative z-20 space-y-1">
                <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition">
                  Pro Athletic Gear
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                  Shop Sports <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>

            {/* Category Card 4: Essentials & Accessories */}
            <Link
              href="/products?category=Fitness"
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-6 flex flex-col justify-between h-72 hover:border-teal-400/40 transition duration-500 hover:-translate-y-1 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                alt="Fitness & Accessories"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="relative z-20">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-white/20 text-white backdrop-blur-md">
                  Lifestyle & Fitness
                </span>
              </div>
              <div className="relative z-20 space-y-1">
                <h3 className="text-xl font-extrabold text-white group-hover:text-teal-300 transition">
                  Daily Essentials
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                  Shop Lifestyle <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ================= SERVICE & TRUST BLOCKS (LIGHT & DARK MODE READY) ================= */}
      <section className="bg-white dark:bg-[#07091b] py-12 px-4 sm:px-6 border-b border-slate-200 dark:border-emerald-950/60 text-slate-900 dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:border-emerald-400/40 transition duration-300 space-y-2 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Worldwide Express Shipping</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fast delivery right to your doorstep</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:border-emerald-400/40 transition duration-300 space-y-2 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Genuine Guarantee</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Authentic products directly from brands</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:border-amber-400/40 transition duration-300 space-y-2 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">7-Day Easy Returns</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hassle-free return & exchange policy</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:border-teal-400/40 transition duration-300 space-y-2 group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Secure Encrypted Checkout</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">256-bit SSL encrypted online payments</p>
          </div>

        </div>
      </section>
    </>
  );
}
