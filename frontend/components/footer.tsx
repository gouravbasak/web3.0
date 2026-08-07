"use client";

import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 dark:bg-[#03040a] text-slate-300 border-t border-slate-800/80 dark:border-zinc-800/80 transition-colors duration-300">
      
      {/* ================= MAIN ESSENTIAL FOOTER CONTENT ================= */}
      <div className="py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* COLUMN 1: BRAND LOGO & BIO */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-widest text-white">
                IONYX
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Universal e-commerce store offering premium fashion, cutting-edge technology, pro athletic equipment, and lifestyle essentials.
            </p>
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% Genuine
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* COLUMN 2: STORE DEPARTMENTS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Store Departments</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/products" className="hover:text-white transition">All Products Catalog</Link>
              </li>
              <li>
                <Link href="/products?category=Footwear" className="hover:text-white transition">Fashion & Footwear</Link>
              </li>
              <li>
                <Link href="/products?category=Powerbank" className="hover:text-white transition">Tech & Innovation</Link>
              </li>
              <li>
                <Link href="/products?category=Cricket" className="hover:text-white transition">Sports & Athletic Equipment</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: QUICK HELP & ACCOUNT */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/track-order" className="hover:text-white transition">Track Order (Guest & Customer)</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition">Customer Account</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">Shopping Cart</Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition">Admin Portal</Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM COPYRIGHT BAR ================= */}
      <div className="border-t border-slate-900 dark:border-zinc-900 py-6 px-4 sm:px-6 lg:px-12 bg-black/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-white">IONYX Store</span>. All rights reserved.
          </div>

          <div className="flex items-center gap-4 opacity-80">
            <img src="/visa.svg" alt="Visa" className="h-5" />
            <img src="/mastercard.svg" alt="Mastercard" className="h-5" />
            <img src="/americanexpress.svg" alt="American Express" className="h-5" />
            <img src="/paypal.svg" alt="PayPal" className="h-5" />
          </div>

        </div>
      </div>

    </footer>
  );
}
