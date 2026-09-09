"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Truck, CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";

export default function PincodeDeliveryEstimator() {
  const [pincode, setPincode] = useState("");
  const [savedPincode, setSavedPincode] = useState<string | null>(null);
  const [estimatedDate, setEstimatedDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Calculate delivery date (3-4 days from today)
  const calculateDeliveryDate = () => {
    const today = new Date();
    const target = new Date();
    // 4 days delivery window
    target.setDate(today.getDate() + 4);

    return target.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_pincode");
      if (stored && /^[1-9][0-9]{5}$/.test(stored)) {
        setSavedPincode(stored);
        setPincode(stored);
        setEstimatedDate(calculateDeliveryDate());
      }
    } catch (_) {}
  }, []);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const clean = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setError("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      setSavedPincode(clean);
      setEstimatedDate(calculateDeliveryDate());
      setIsChecking(false);
      try {
        localStorage.setItem("user_pincode", clean);
      } catch (_) {}
    }, 400);
  };

  const handleReset = () => {
    setSavedPincode(null);
    setPincode("");
    setError(null);
    try {
      localStorage.removeItem("user_pincode");
    } catch (_) {}
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 p-4 space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Delivery &amp; Service Availability</span>
        </div>
        {savedPincode && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Change PIN
          </button>
        )}
      </div>

      {!savedPincode ? (
        <form onSubmit={handleCheck} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setPincode(val);
                if (error) setError(null);
              }}
              placeholder="Enter 6-digit Pincode (e.g. 700001)"
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={isChecking || pincode.length !== 6}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-zinc-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:cursor-not-allowed"
          >
            {isChecking ? "Checking..." : "Check"}
          </button>
        </form>
      ) : (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Delivery available to <span className="underline decoration-emerald-500">{savedPincode}</span>
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Estimated Delivery by {estimatedDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}

      {/* Conversion Badges */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Free delivery &gt; ₹9,999</span>
        </span>
        <span className="flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>7-Day Easy Returns</span>
        </span>
      </div>
    </div>
  );
}
