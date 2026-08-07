"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  images?: string[];
  brand?: string;
};

export default function RecentlyAddedCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  useEffect(() => {
    fetch(`${API}/api/products/recent`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setProducts([]));
  }, [API]);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-16 bg-slate-50 dark:bg-[#050714] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-emerald-950/60 relative overflow-hidden transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* HEADER */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-emerald-600 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Latest Arrivals
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Recently Added Products
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Fresh equipment, apparel & tech accessories added in the last 7 days
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-white transition group"
          >
            View All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* GRID — 4 PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const image = p.images?.[0] || "/placeholder.png";

            return (
              <Link key={p._id} href={`/products/${p._id}`} className="group">
                <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 p-4 transition-all duration-500 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between h-full">
                  <div>
                    {/* IMAGE */}
                    <div className="w-full h-56 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden mb-3 relative">
                      <img
                        src={image}
                        alt={p.title}
                        className="w-full h-full object-cover transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-600 text-white shadow-md">
                        New
                      </span>
                    </div>

                    {/* BRAND & TITLE */}
                    {p.brand && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        {p.brand}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
                      {p.title}
                    </h3>
                  </div>

                  {/* PRICE */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/10 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{p.price?.toLocaleString("en-IN")}
                    </span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{p.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
