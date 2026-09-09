"use client";

import Link from "next/link";
import { ShieldCheck, Lock, MapPin, Mail, Phone, Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 dark:bg-[#03040a] text-slate-300 border-t border-slate-800/80 dark:border-zinc-800/80 transition-colors duration-300">
      
      {/* ================= MAIN ESSENTIAL FOOTER CONTENT ================= */}
      <div className="py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* COLUMN 1: BRAND & REGISTERED ENTITY */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-widest text-white">
                IONYX
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium consumer gear, electronics, and lifestyle apparel designed for supreme performance.
            </p>
            
            <div className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-900 dark:border-zinc-900">
              <p className="font-semibold text-white">IONYX Technologies &amp; Retail</p>
              <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-emerald-400 shrink-0" />
                <span>Registered Office: West Bengal, India</span>
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>support@ionyx.com</span>
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>+91 7583998120 (Mon–Sat, 10 AM–6 PM)</span>
              </p>
            </div>
          </div>

          {/* COLUMN 2: STORE DEPARTMENTS */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Store Catalog</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/products" className="hover:text-white transition">All Products Catalog</Link>
              </li>
              <li>
                <Link href="/products?category=Footwear" className="hover:text-white transition">Footwear &amp; Apparel</Link>
              </li>
              <li>
                <Link href="/products?category=Powerbank" className="hover:text-white transition">Power &amp; Electronics</Link>
              </li>
              <li>
                <Link href="/products?category=Mousepad" className="hover:text-white transition">Gaming &amp; Accessories</Link>
              </li>
              <li>
                <Link href="/products?category=Cricket" className="hover:text-white transition">Sports Equipment</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CUSTOMER SUPPORT */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Customer Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/track-order" className="hover:text-white transition">Track Your Order</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition">Customer Account</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">Shopping Cart &amp; Checkout</Link>
              </li>
              <li>
                <Link href="/terms#refund" className="hover:text-white transition">Return &amp; Refund Policy</Link>
              </li>
              <li>
                <Link href="/terms#shipping" className="hover:text-white transition">Shipping &amp; Delivery Terms</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: LEGAL, CONSUMER & GRIEVANCE */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Legal &amp; Policies</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">Privacy Policy (DPDP Act)</Link>
              </li>
              <li>
                <Link href="/privacy#grievance" className="hover:text-white transition flex items-center gap-1">
                  <Scale className="h-3 w-3 text-emerald-400" />
                  Grievance Officer (IT Rules)
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition text-slate-500">Staff &amp; Admin Portal</Link>
              </li>
            </ul>

            <div className="pt-3 space-y-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Genuine Products
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-400" /> RBI &amp; SSL Compliant Payments
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM COPYRIGHT BAR ================= */}
      <div className="border-t border-slate-900 dark:border-zinc-900 py-6 px-4 sm:px-6 lg:px-12 bg-black/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-white">IONYX Store</span>. All prices are in INR and inclusive of applicable taxes.
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
