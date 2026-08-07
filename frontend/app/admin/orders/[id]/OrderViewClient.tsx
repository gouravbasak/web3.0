"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { getApiBaseUrl } from "@/lib/apiBase";

const API_BASE = getApiBaseUrl();

function getOrderApiId(order: any): string | null {
  if (!order) return null;

  if (typeof order._id === "string") return order._id;

  if (
    order._id &&
    typeof order._id === "object" &&
    (order._id.$oid || order._id.$id)
  ) {
    return order._id.$oid || order._id.$id;
  }

  if (typeof order.orderId === "string") return order.orderId;

  return null;
}

export default function OrderViewClient({ order }: { order: any }) {
  if (!order) {
    return (
      <p className="text-red-600 font-semibold">
        Failed to load order details.
      </p>
    );
  }

  const apiId = getOrderApiId(order);
  const initialStatus = (order.status as string) || "Pending";

  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (nextStatus?: string) => {
    const finalStatus = nextStatus ?? status;

    if (!apiId) {
      toast.error("Order ID missing — cannot update");
      return;
    }

    setSaving(true);
    try {
      // FIXED: Removed localhost → replaced with API_BASE
      const res = await fetch(
        `${API_BASE}/api/orders/${encodeURIComponent(apiId)}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // required for admin cookie auth
          body: JSON.stringify({ status: finalStatus }),
        },
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to update status");
        setSaving(false);
        return;
      }

      setStatus(result?.status ?? finalStatus);
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

return (
  <div className="space-y-6">
    {/* ORDER TITLE */}
    <h1 className="text-2xl font-bold">
      Order {order.orderId || order._id?.$oid || order._id}
    </h1>

    {/* ===== TOP INFO CARDS (MAX 2 PER ROW) ===== */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CUSTOMER */}
      <div className="rounded-xl border bg-card p-5">
        <div className="text-xs text-muted-foreground mb-1">
          Customer Details
        </div>
        <div className="font-semibold">
          {order.billing?.fullName || "—"}
        </div>
        <div className="text-sm text-muted-foreground">
          {order.billing?.email || "—"}
        </div>
        <div className="text-sm text-muted-foreground">
          {order.billing?.phone || "—"}
        </div>
      </div>

      {/* SHIPPING */}
      <div className="rounded-xl border bg-card p-5">
        <div className="text-xs text-muted-foreground mb-1">
          Shipping Address
        </div>
        <div className="text-sm">
          {order.billing?.city || ""} {order.billing?.state || ""}{" "}
          {order.billing?.zip || ""}
        </div>
        <div className="text-sm">
          {order.billing?.country || ""}
        </div>
      </div>

      {/* PAYMENT */}
      <div className="rounded-xl border bg-card p-5">
        <div className="text-xs text-muted-foreground mb-1">
          Payment Mode
        </div>
        <div className="font-semibold">
          {order.payment?.method === "cod" && "Cash on Delivery"}
          {order.payment?.method === "razorpay" && "UPI / Card / NetBanking"}
          {!order.payment?.method && "—"}
        </div>

        {order.payment?.razorpayPaymentId && (
          <div className="text-xs text-muted-foreground mt-1">
            Payment ID: {order.payment.razorpayPaymentId}
          </div>
        )}
      </div>

      {/* ORDER SUMMARY (UI ONLY, SAFE) */}
      <div className="rounded-xl border bg-card p-5">
        <div className="text-xs text-muted-foreground mb-1">
          Order Summary
        </div>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>₹{order.shipping}</span>
        </div>
        <div className="flex justify-between font-semibold mt-2 border-t pt-2">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>
    </div>

    {/* ===== ITEMS ===== */}
    <div className="rounded-xl border bg-card p-5">
      <div className="text-sm font-semibold mb-3">Items</div>

      <div className="space-y-3">
        {(order.items || []).map((it: any) => (
          <div
            key={`${it.productId}-${it.size}-${it._id}`}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={it.image || "/placeholder.png"}
                className="w-14 h-14 rounded-lg object-cover border"
              />
              <div>
                <div className="font-medium text-sm">{it.title}</div>
                <div className="text-xs text-muted-foreground">
                  {it.size && (
                    <span>
                      Size: <span className="font-medium">{it.size}</span> ·{" "}
                    </span>
                  )}
                  {it.qty} × ₹{it.price}
                </div>
              </div>
            </div>
            <div className="font-semibold">
              ₹{it.qty * it.price}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ===== STATUS ACTION BAR ===== */}
    <div className="flex items-center justify-end gap-3 pt-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm bg-background"
      >
        <option>Pending</option>
        <option>Processing</option>
        <option>Shipped</option>
        <option>Delivered</option>
        <option>Cancelled</option>
      </select>

      <button
        onClick={() => updateStatus(status)}
        disabled={saving}
        className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  </div>
);

}
