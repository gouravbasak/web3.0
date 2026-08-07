// components/VoucherCard.tsx
"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, Tag, Sparkles, Copy, Check } from "lucide-react";

type VoucherProps = {
  voucher: {
    code: string;
    title?: string;
    description?: string;
    amount: number;
    discountPercent?: number;
    maxDiscount?: number;
    type: string;
    generatedFrom?: {
      orderId?: string;
      reason?: string;
      orderDate?: string;
    };
    expiresAt: string;
  };
};

export default function VoucherCard({ voucher }: VoucherProps) {
  const [copied, setCopied] = useState(false);

  const expiryDate = new Date(voucher.expiresAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Coupon code ${voucher.code} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDiscountType = voucher.type === "discount" || (voucher.discountPercent && voucher.discountPercent > 0);

  return (
    <Card className="p-5 bg-gradient-to-br from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all rounded-3xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl p-3 text-emerald-600 dark:text-emerald-300">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 dark:text-white">
                {isDiscountType ? `${voucher.discountPercent || 15}% OFF` : `₹${voucher.amount}`}
              </span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" /> Active
              </Badge>
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {voucher.title || (isDiscountType ? "15% OFF VIP Coupon" : "₹300 Gift Voucher")}
            </h4>
          </div>
        </div>
      </div>

      {voucher.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          {voucher.description}
        </p>
      )}

      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
        {voucher.generatedFrom?.orderId && (
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-emerald-500" />
            <span>Earned from order #{voucher.generatedFrom.orderId.slice(-8)}</span>
          </div>
        )}
        {voucher.generatedFrom?.reason === "cumulative_12000" && (
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-emerald-500" />
            <span>Milestone reward for &gt; ₹12,000 total purchases</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Expires on {expiryDate}</span>
        </div>
      </div>

      {/* COPY CODE BOX */}
      <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-2 shadow-inner">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Coupon Code</span>
          <span className="text-xs font-black font-mono tracking-wider text-emerald-600 dark:text-emerald-300">
            {voucher.code}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl transition"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy Code
            </>
          )}
        </button>
      </div>
    </Card>
  );
}