"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, X } from "lucide-react";

import { getApiBaseUrl } from "@/lib/apiBase";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const API = getApiBaseUrl();

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error("Please agree to the terms & policy");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Welcome! Account created successfully!");
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-change"));
        }
        router.push("/");
      } else {
        toast.error(data.message || "Sign up failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Terms Modal Content
  const TermsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
          <button
            onClick={() => setShowTermsModal(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-gray-600 dark:text-gray-400 text-sm">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h3>
            <p>By creating an account and using IONYX services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. Account Registration</h3>
            <p>You must provide accurate and complete information when creating your account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. Orders and Payments</h3>
            <p>All orders are subject to acceptance and availability. Prices are subject to change without notice. We accept various payment methods including UPI, credit/debit cards, and net banking.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. Shipping and Delivery</h3>
            <p>Estimated delivery times are provided as guidelines and not guaranteed. We strive to deliver within 7-14 business days. Free shipping applies to orders above ₹10,000.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. Returns and Refunds</h3>
            <p>Returns accepted within 7 days of delivery. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after inspection.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">6. Cancellation Policy</h3>
            <p>Orders can be cancelled within 24 hours of placing. Once shipped, cancellations are not possible. Cancelled orders will be refunded within 3-5 business days.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">7. Intellectual Property</h3>
            <p>All content on this website, including logos, images, and text, is the property of IONYX and protected by copyright laws.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">8. Limitation of Liability</h3>
            <p>IONYX shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">9. Modifications</h3>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">10. Contact Information</h3>
            <p>For any questions regarding these terms, please contact us at support@ionyx.com or call +91 8637866948.</p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowTermsModal(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );

  // Privacy Policy Modal Content
  const PrivacyModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
          <button
            onClick={() => setShowPrivacyModal(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-gray-600 dark:text-gray-400 text-sm">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. Information We Collect</h3>
            <p>We collect personal information including your name, email address, phone number, and shipping address when you create an account or place an order. We also collect payment information through secure third-party processors.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. How We Use Your Information</h3>
            <p>We use your information to process orders, communicate with you about your purchases, send promotional offers (with your consent), improve our services, and ensure security.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. Data Protection</h3>
            <p>We implement industry-standard security measures to protect your personal information. All transactions are encrypted using SSL technology.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. Cookies</h3>
            <p>We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can disable cookies in your browser settings.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. Third-Party Sharing</h3>
            <p>We do not sell your personal information. We share data only with trusted partners necessary for order fulfillment (delivery services, payment processors) and as required by law.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">6. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal information. You can update your profile anytime or contact us for assistance.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">7. Data Retention</h3>
            <p>We retain your information for as long as your account is active or as needed to provide services. You may request account deletion at any time.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">8. Children's Privacy</h3>
            <p>Our services are not intended for children under 13. We do not knowingly collect information from children.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">9. Changes to Privacy Policy</h3>
            <p>We may update this policy periodically. We will notify you of any material changes via email or website notice.</p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">10. Contact Us</h3>
            <p>For privacy-related questions, email privacy@ionyx.com or call +91 8637866948.</p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowPrivacyModal(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Modals */}
      {showTermsModal && <TermsModal />}
      {showPrivacyModal && <PrivacyModal />}

      <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-800">
          
          {/* LEFT SIDE - Visual */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600/5 to-blue-600/5 dark:from-blue-950/30 dark:to-blue-950/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/login.png')] bg-cover bg-center opacity-20 dark:opacity-10" />
            <div className="relative z-10 flex flex-col justify-center px-12 py-16">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Join the <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">IONYX</span> Community
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Create your account to access exclusive deals, track orders, and enjoy a seamless shopping experience.
                </p>
              </div>
              
              {/* Features List */}
              <div className="space-y-4">
                {[
                  "🎁 Get ₹500 welcome bonus",
                  "🚚 Free shipping on orders above ₹10,000",
                  "⭐ Early access to sales",
                  "📦 Real-time order tracking"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form */}
          <div className="w-full md:w-1/2 px-8 md:px-12 py-12 md:py-16 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Join us and start your shopping journey
              </p>
            </div>

            <GoogleSignInButton />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:text-white pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Terms Checkbox with Modal Buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or sign up with
                </span>
              </div>
            </div> */}

            {/* Social Buttons - COMMENTED OUT */}
            {/*
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-14h-2v8h2V6zm0 10h-2v2h2v-2z"/>
                </svg>
                <span className="text-sm">Apple</span>
              </button>
            </div>
            */}

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}