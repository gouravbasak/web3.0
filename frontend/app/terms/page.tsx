import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | IONYX Store",
  description: "Terms and conditions of use for IONYX Store, compliant with Indian Consumer Protection (E-Commerce) Rules and Information Technology Act.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 dark:border-zinc-800">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last Updated: September 2026 • Governing Law: Republic of India
            </p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms &amp; Electronic Contract</h2>
            <p>
              This document is an electronic record generated in terms of the <strong>Information Technology Act, 2000</strong> and the rules thereunder. By accessing, browsing, registering on, or purchasing from IONYX Store, you enter into a legally binding agreement governed by these Terms of Service. If you do not agree to any part of these terms, please do not use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Eligibility &amp; User Capacity (18+ Requirement)</h2>
            <p>
              In accordance with the <strong>Indian Contract Act, 1872</strong>, services on this platform are available only to persons capable of entering into legally binding contracts. By creating an account or placing an order, you represent and warrant that you are <strong>at least 18 years of age</strong>. If you are under 18 years of age, you may browse our platform or purchase items only through a parent or legal guardian.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. User Accounts &amp; Security</h2>
            <p>
              When creating an account, you must provide accurate, current, and complete details. You are responsible for safeguarding your account credentials, passwords, and one-time passcodes (OTPs). Any activity conducted through your authenticated account or Google Sign-In session shall be considered your authorized activity.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Pricing, Taxes &amp; Payments</h2>
            <p>
              All prices listed on IONYX Store are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless specified otherwise. We reserve the right to correct typographical or system pricing errors prior to order dispatch. Payments are processed securely via RBI-regulated payment aggregators (e.g., Razorpay) supporting UPI, Credit/Debit Cards, and Net Banking.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">5. Shipping, Returns &amp; Cancellation Policy</h2>
            <p className="mb-2">
              As mandated by the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, our order fulfillment policies are detailed below:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Shipping:</strong> Standard domestic delivery is typically completed within 7–14 business days across India. Free delivery applies to eligible orders above ₹10,000.</li>
              <li><strong>Order Cancellation:</strong> You may cancel an order within 24 hours of placement or prior to dispatch directly from your account.</li>
              <li><strong>Returns:</strong> Returns are accepted within 7 days of delivery for defective, damaged, or incorrect items in their original packaging.</li>
              <li><strong>Refunds:</strong> Once the returned merchandise is received and verified, refunds are credited back to the original payment source within 5–7 banking days.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">6. Prohibited Activities</h2>
            <p>
              Users agree not to: (a) host, display, or upload any content that is defamatory, obscene, invasive of privacy, or unlawful under Indian law; (b) attempt unauthorized access to the database or servers; or (c) use automated bots or scraping tools without express written permission.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">7. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms shall be interpreted and governed in all respects in accordance with the laws of India. Any legal dispute, controversy, or claim arising out of or relating to your use of this platform shall be subject to the exclusive jurisdiction of the competent courts of India.
            </p>
          </section>

          {/* Section 8 - Grievance Officer */}
          <section className="bg-slate-100 dark:bg-zinc-800/60 p-6 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-base">
              <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              8. Customer Support &amp; Grievance Redressal
            </div>
            <p className="mb-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              For any customer complaints, service requests, or legal notices, contact our Grievance Officer:
            </p>
            <div className="text-xs sm:text-sm space-y-1">
              <p><strong>Nodal / Grievance Officer:</strong> Gourav Basak</p>
              <p><strong>Email:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-medium">support@ionyx.com</span></p>
              <p><strong>Contact Hotline:</strong> +91 8637866948</p>
              <p><strong>Timelines:</strong> Acknowledgment within 48 hours; resolution within 15–30 days.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
