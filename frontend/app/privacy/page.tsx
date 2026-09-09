import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Mail, AlertCircle, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | IONYX Store",
  description: "Learn how IONYX Store collects, processes, and protects your personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Indian IT Rules.",
};

export default function PrivacyPage() {
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
          <div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-2xl">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last Updated: September 2026 • Compliant with DPDP Act, 2023 &amp; IT Rules, 2021
            </p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              1. Overview &amp; Consent Notice (DPDP Act, 2023)
            </h2>
            <p>
              IONYX Store (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) values your trust and is committed to protecting your personal data. This Privacy Policy serves as a notice under Section 5 of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. By creating an account, making a purchase, or using our services, you provide your free, specific, informed, unconditional, and unambiguous consent to the collection and processing of your personal data for the specified purposes outlined herein.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              2. Personal Data We Collect
            </h2>
            <p className="mb-2">We collect only necessary personal data required to fulfill our e-commerce obligations:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Account Information:</strong> Name, email address, password hash, and profile image (when signing in with Google).</li>
              <li><strong>Contact &amp; Delivery Details:</strong> Phone number, shipping address, city, state, and postal code.</li>
              <li><strong>Order &amp; Transaction Details:</strong> Order history, invoice details, and transaction IDs (payment details like card numbers/UPI credentials are encrypted and processed securely by RBI-authorized payment gateways like Razorpay; we never store your raw banking credentials).</li>
              <li><strong>Technical Data:</strong> IP address, device information, and browser details for security and fraud prevention.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              3. Purpose of Data Processing
            </h2>
            <p className="mb-2">Your data is processed strictly for the following legitimate purposes:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Processing, verifying, and fulfilling your product orders and deliveries.</li>
              <li>Sending transactional updates, OTP verification codes, order confirmations, and invoices.</li>
              <li>Providing customer support and processing returns, replacements, or refunds.</li>
              <li>Preventing fraudulent transactions and ensuring account security.</li>
              <li>Complying with statutory tax, invoicing, and legal obligations under Indian law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              4. Age Requirements &amp; Protection of Children&apos;s Data
            </h2>
            <p>
              In strict adherence to Section 9 of the DPDP Act 2023 and the Indian Contract Act 1872, our services are intended solely for individuals who are <strong>18 years of age or older</strong>. We do not knowingly collect personal data from or track the online behavior of minors. If you are under 18, you may use our platform only under the direct supervision and with the verifiable consent of a parent or legal guardian.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              5. Your Rights as a Data Principal (DPDP Act, 2023)
            </h2>
            <p className="mb-2">Under Indian data protection law, you possess the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Right to Access:</strong> You can view and review the personal data you have provided to us from your profile page.</li>
              <li><strong>Right to Correction &amp; Erasure:</strong> You may request updating inaccurate information or requesting account deletion and data erasure.</li>
              <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for future data processing at any time by contacting our Grievance Officer.</li>
              <li><strong>Right to Nominate:</strong> You have the right to nominate another individual to exercise your rights in the event of death or incapacity.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              6. Data Security &amp; Third-Party Services
            </h2>
            <p>
              We implement reasonable security practices under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Data is transmitted via SSL/TLS encryption and stored in secure MongoDB Atlas clusters. We do not sell or rent your personal data. We share information only with authorized service partners (e.g., Razorpay for payments, logistics partners for deliveries, and ImageKit for image CDN) solely to fulfill your purchases.
            </p>
          </section>

          {/* Section 7 - MANDATORY GRIEVANCE REDRESSAL */}
          <section className="bg-slate-100 dark:bg-zinc-800/60 p-6 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              7. Grievance Redressal &amp; Grievance Officer (India)
            </div>
            <p className="mb-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              In accordance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, the details of our designated Grievance Officer are published below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Grievance Officer:</p>
                <p className="text-slate-600 dark:text-slate-400">Gourav Basak / Legal &amp; Compliance</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Designation:</p>
                <p className="text-slate-600 dark:text-slate-400">Nodal &amp; Grievance Redressal Officer</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Email Address:</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">support@ionyx.com</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Helpline:</p>
                <p className="text-slate-600 dark:text-slate-400">+91 7583998120 (Mon–Sat, 10 AM – 6 PM)</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              • <strong>Acknowledgment:</strong> Grievances are acknowledged within 48 hours.<br />
              • <strong>Resolution:</strong> All complaints are addressed and resolved within 15 to 30 days of receipt.<br />
              • If your complaint is not resolved, you have the right to lodge a complaint with the Data Protection Board of India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
