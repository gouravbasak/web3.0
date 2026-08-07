"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ArrowRight, Star } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  images?: string[];
  brand?: string;
  soldCount?: number;
  averageRating?: number;
};

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  useEffect(() => {
    fetch(`${API}/api/products/best-sellers`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setProducts([]));
  }, [API]);

  if (products.length === 0) {
    return (
      <section className="w-full py-16 bg-white dark:bg-[#03040c] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-emerald-950/60 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Best Seller Products
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Top performing equipment & flagship gear will shine here as orders roll in.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-white dark:bg-[#03040c] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-emerald-950/60 relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-400/30 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm backdrop-blur-md">
              <BadgeCheck className="h-3.5 w-3.5" />
              Highest Demand & Community Choice
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Best Seller Flagships
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Top choices loved by thousands of verified store customers
            </p>
          </div>

          <Link
            href="/products?sort=popular"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-white transition group"
          >
            Explore All Best Sellers <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const image = p.images?.[0] || "/placeholder.png";

            return (
              <Link key={p._id} href={`/products/${p._id}`} className="group">
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 p-4 transition-all duration-500 hover:border-amber-400/40 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between h-full">
                  <div>
                    {/* IMAGE */}
                    <div className="w-full h-56 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden mb-3 relative">
                      <img
                        src={image}
                        alt={p.title}
                        className="w-full h-full object-cover transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500 text-zinc-950 shadow-md flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" /> Best Seller
                      </span>
                    </div>

                    {/* BRAND & TITLE */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                      <span className="text-amber-600 dark:text-amber-400">{p.brand || "IONYX"}</span>
                      {p.averageRating && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400" /> {p.averageRating}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                      {p.title}
                    </h3>
                  </div>

                  {/* PRICE */}
                  <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-baseline justify-between">
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
