"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Lock } from "lucide-react";
import toast from "react-hot-toast";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  /* ================= STEP 1: REQUEST OTP TO EMAIL ================= */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.trim()) {
      setError("Please enter your admin email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({ message: "Unexpected response" }));

      if (!res.ok) {
        setError(data.message || "Failed to send access code");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || `Access code sent to ${email}`);
      toast.success(`Verification code sent to ${email}!`);
      setStep("otp");
    } catch (err) {
      console.error("Request OTP error:", err);
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: VERIFY OTP CODE ================= */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => ({ message: "Unexpected response" }));

      if (!res.ok) {
        setError(data.message || "Verification failed");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
      }
      if (data.admin) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
      }

      toast.success("Identity verified! Welcome to Admin Dashboard.");
      window.location.href = redirectTo;
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  /* ================= PASSWORD FALLBACK LOGIN ================= */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({ message: "Unexpected response" }));

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
      }
      if (data.admin) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
      }

      toast.success("Welcome back Admin!");
      window.location.href = redirectTo;
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error — try again");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
      
      {/* HEADER AMBIENT GLOW */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER TITLE */}
      <div className="space-y-2 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-inner">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Admin Portal Authentication
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {step === "email" && "Enter your admin email address to receive an access code."}
          {step === "otp" && `Enter the 6-digit access code sent to ${email}`}
          {step === "password" && "Enter your secret master admin password."}
        </p>
      </div>

      {/* ALERT ERROR */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ALERT SUCCESS */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* STEP 1: REQUEST EMAIL OTP */}
      {step === "email" && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Sending Code...
              </>
            ) : (
              <>
                Send Verification Access Code <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setStep("password")}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition"
            >
              Sign in with password instead →
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: VERIFY EMAIL OTP CODE */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>6-Digit Verification Code</span>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 hover:underline"
              >
                Change Email
              </button>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-center text-lg font-mono font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                maxLength={6}
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Code...
              </>
            ) : (
              <>
                Verify Code & Access Dashboard <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={loading}
              className="font-bold text-emerald-600 dark:text-emerald-300 hover:underline"
            >
              Resend Code
            </button>
            <button
              type="button"
              onClick={() => setStep("password")}
              className="font-bold text-slate-500 dark:text-slate-400 hover:underline"
            >
              Use Password
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PASSWORD FALLBACK */}
      {step === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Master Admin Password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In with Password"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs font-bold text-indigo-600 dark:text-cyan-300 hover:underline"
            >
              ← Back to Email Verification Code Login
            </button>
          </div>
        </form>
      )}

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white p-4 transition-colors duration-300">
      <Suspense fallback={<div className="text-xs text-slate-500 font-bold">Loading Admin Portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
