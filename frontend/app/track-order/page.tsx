// app/track-order/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import OrderProgressBar from "@/components/OrderProgressBar";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

type OrderItem = {
  productId: string;
  qty: number;
  size?: string;
  title: string;
  price: number;
  image: string;
};

type TrackedOrder = {
  _id: string;
  orderId: string;
  status: string;
  createdAt: string;
  total: number;
  payableAmount?: number;
  items: OrderItem[];
  statusHistory?: Array<{
    status: string;
    at?: string;
    by?: string;
  }>;
  billing: {
    name?: string;
    city?: string;
    pincode?: string;
    paymentMethod?: string;
  };
};

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [inputOrderId, setInputOrderId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackOrder = async (queryId: string) => {
    if (!queryId || !queryId.trim()) return;

    setLoading(true);
    setError(null);

    const baseUrl = API;

    try {
      const res = await fetch(`${baseUrl}/api/orders/track/${encodeURIComponent(queryId.trim())}`, {
        headers: { "Accept": "application/json" },
      });
      
      const data = await res.json().catch(() => null);

      if (!res || !res.ok) {
        setError(data?.message || "No shipment found matching this Order ID");
        setOrder(null);
        return;
      }

      setOrder(data.order);
    } catch (err) {
      console.error("Track order error:", err);
      setError("Unable to connect to order tracking server — please ensure backend is running.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTrackOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOrderId.trim()) {
      toast.error("Please enter a valid Order ID");
      return;
    }
    router.push(`/track-order?id=${encodeURIComponent(inputOrderId.trim())}`);
    fetchTrackOrder(inputOrderId);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white transition-colors duration-300 pb-24 pt-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER HERO BANNER */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <Truck className="h-7 w-7" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300 block">
            Express Order Tracking
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Track Your Package Live
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No login required! Enter your Order ID below to track real-time delivery status and shipment progress.
          </p>
        </div>

        {/* SEARCH FORM BAR */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={inputOrderId}
              onChange={(e) => setInputOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-1723456789 or 6989ef5f...)"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Tracking...
                </>
              ) : (
                <>
                  Track <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* ERROR STATE */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TRACKED ORDER RESULT CARD */}
        {order && (
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
            
            {/* ORDER META HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Order Reference
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  #{order.orderId}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === "Delivered"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                    : order.status === "Cancelled"
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800"
                }`}>
                  {order.status === "Cancelled" ? (
                    order.statusHistory?.find((h) => h.status === "Cancelled")?.by === "user"
                      ? "Cancelled by You"
                      : order.statusHistory?.find((h) => h.status === "Cancelled")?.by === "admin"
                      ? "Cancelled by Brand"
                      : "Cancelled"
                  ) : (
                    order.status
                  )}
                </span>
                <span className="font-black text-lg text-slate-900 dark:text-white">
                  ₹{(order.payableAmount || order.total)?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* LIVE STEP PROGRESS BAR */}
            <div className="py-2">
              <OrderProgressBar currentStatus={order.status} statusHistory={order.statusHistory} />
            </div>

            {/* DELIVERY DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Placed On</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {order.billing?.city ? `${order.billing.city} ${order.billing.pincode ? `(${order.billing.pincode})` : ""}` : "Express Delivery"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Method</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">
                    {order.billing?.paymentMethod || "Prepaid"}
                  </span>
                </div>
              </div>
            </div>

            {/* ITEMS LIST PREVIEW */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Package Contents ({order.items?.length || 0} items)
              </h4>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/60">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-contain p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.title}</h5>
                      <p className="text-[10px] text-slate-400">Qty: {item.qty} {item.size ? `• Size: ${item.size}` : ""}</p>
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUPPORT ASSISTANCE FOOTER */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-emerald-500" /> Need assistance with your delivery?
              </span>
              <a href="mailto:support@ionyx.com" className="font-bold text-emerald-600 dark:text-emerald-300 hover:underline">
                Contact Support →
              </a>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Order Tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
