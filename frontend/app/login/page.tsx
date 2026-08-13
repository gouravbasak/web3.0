"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowRight, Shield, Zap, Sparkles, RefreshCw } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

export default function LoginPage() {
  const router = useRouter();

  // Mode: "password" | "otp"
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  // Common State
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Login State
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login State
  const [otpStep, setOtpStep] = useState<"send" | "verify">("send");
  const [otp, setOtp] = useState("");

  const handleLoginSuccess = (data: any) => {
    toast.success("Welcome back!");
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
    router.push("/");
  };

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        handleLoginSuccess(data);
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP Handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("6-digit OTP passcode sent to your email!");
        setOtpStep("verify");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      toast.error("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/verify-login-otp`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        handleLoginSuccess(data);
      } else {
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      toast.error("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE - Hero Section */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl" />
              <div className="relative space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Secure Login</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Welcome Back to{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    IONYX
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Access your account to track orders, manage subscriptions, and discover exclusive deals tailored just for you.
                </p>

                {/* Feature Cards */}
                <div className="grid gap-4 pt-4">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">Lightning Fast Checkout</p>
                      <p className="text-sm text-muted-foreground">Complete your purchase in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/30">
                      <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-medium">Secure & Encrypted</p>
                      <p className="text-sm text-muted-foreground">Your data is protected with bank-grade security</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border-2 border-white dark:border-slate-800" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">10,000+</span> active users
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Login Form */}
          <div className="w-full max-w-md mx-auto lg:max-w-full">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose your preferred login method</p>
              </div>

              {/* TAB SWITCHER */}
              <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("password");
                    setOtpStep("send");
                  }}
                  className={`py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
                    loginMethod === "password"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Password Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("otp");
                  }}
                  className={`py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
                    loginMethod === "otp"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Email OTP Login
                </button>
              </div>

              {/* METHOD 1: PASSWORD LOGIN */}
              {loginMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="hello@ionyx.com"
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:bg-slate-800 dark:text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod("otp");
                          setOtpStep("send");
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition"
                      >
                        Don't know password? Use OTP →
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:bg-slate-800 dark:text-white pr-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                </form>
              )}

              {/* METHOD 2: EMAIL OTP LOGIN */}
              {loginMethod === "otp" && (
                <div className="space-y-5">
                  {otpStep === "send" ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="hello@ionyx.com"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:bg-slate-800 dark:text-white"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          We will send a 6-digit passcode to your registered email address.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending OTP...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            Send OTP Passcode
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <span>Passcode sent to <strong>{email}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtpStep("send")}
                          className="text-emerald-600 dark:text-emerald-400 underline font-medium hover:text-emerald-700"
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <KeyRound className="h-4 w-4" />
                          6-Digit Passcode
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          className="w-full text-center tracking-[10px] text-lg font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:bg-slate-800 dark:text-white"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          required
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            Verify & Sign In
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleSendOtp}
                          className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 inline-flex items-center gap-1 font-medium transition"
                        >
                          <RefreshCw className="h-3 w-3" /> Resend OTP Passcode
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    New to IONYX?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                href="/signup"
                className="block w-full text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-sm font-medium transition-all duration-300"
              >
                Create an account
              </Link>

              {/* Terms & Privacy */}
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-emerald-600 hover:underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}