import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-zinc-800">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using IONYX Store, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Use of License</h2>
            <p>Permission is granted to temporarily view and purchase items for personal, non-commercial use only.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Orders & Pricing</h2>
            <p>All prices listed on the site are subject to availability and dynamic currency conversion. We reserve the right to modify pricing or refuse orders at any time.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. User Accounts & Security</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials (including Google Sign-In sessions and passwords).</p>
          </section>
        </div>
      </div>
    </div>
  );
}
