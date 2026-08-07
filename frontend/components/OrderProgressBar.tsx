"use client";

import { AlertCircle, XCircle } from "lucide-react";

type StatusHistoryItem = {
  status: string;
  at?: string;
  by?: string;
};

type Props = {
  currentStatus: string;
  statusHistory?: StatusHistoryItem[];
};

const STEPS = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function OrderProgressBar({ currentStatus, statusHistory = [] }: Props) {
  // Check if order is cancelled
  if (currentStatus === "Cancelled") {
    const cancelEntry = statusHistory.find((h) => h.status === "Cancelled");
    const cancelledBy = cancelEntry?.by;

    let cancelMessage = "Order Cancelled";
    if (cancelledBy === "user") {
      cancelMessage = "Cancelled by You";
    } else if (cancelledBy === "admin") {
      cancelMessage = "Cancelled by IONYX Brand";
    }

    return (
      <div className="w-full mt-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-between text-xs font-bold shadow-sm">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span>{cancelMessage}</span>
        </div>
        {cancelEntry?.at && (
          <span className="text-[10px] opacity-80 font-semibold">
            {new Date(cancelEntry.at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 dark:bg-zinc-800 rounded" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded transition-all duration-500"
          style={{
            width:
              currentIndex >= 0
                ? `${(currentIndex / (STEPS.length - 1)) * 100}%`
                : "0%",
          }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-md scale-110"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"
                  }
                `}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <span className="mt-2 text-[10px] font-bold text-center text-slate-700 dark:text-slate-300">
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
