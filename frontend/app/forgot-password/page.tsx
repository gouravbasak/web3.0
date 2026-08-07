"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleForgot = (e: FormEvent) => {
    e.preventDefault();
    console.log("Password reset email sent to:", email);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-8 flex flex-col">
        <h1 className="text-3xl font-semibold mb-3 text-center">
          Forgot Password?
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
          Enter your email address and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleForgot} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 transition cursor-pointer"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-4">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
