import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-zinc-800">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-2xl">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when creating an account, making a purchase, or signing in via Google (such as your Name, Email address, and Profile Picture).</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. How We Use Your Data</h2>
            <p>Your data is used strictly to process orders, fulfill shipments, manage your user profile, and deliver personalized shopping experiences.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Data Security & Storage</h2>
            <p>We store data securely in encrypted MongoDB Atlas databases and utilize Google OAuth 2.0 standards for secure authentication.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Third-Party Services</h2>
            <p>We do not sell your personal data. We integrate only with trusted providers such as Razorpay (payments) and ImageKit (CDN).</p>
          </section>
        </div>
      </div>
    </div>
  );
}
