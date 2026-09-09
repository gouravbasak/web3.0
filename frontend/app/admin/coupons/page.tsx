"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl, getAdminAuthHeaders } from "@/lib/apiBase";
import toast from "react-hot-toast";
import {
  Tag,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sparkles,
  Calendar,
  IndianRupee,
  Percent,
  X,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const API = getApiBaseUrl();

type Coupon = {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  usageLimit?: number | null;
  usedCount: number;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "0",
    usageLimit: "",
    validUntil: "",
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/coupons/admin`, {
        headers: getAdminAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      } else {
        toast.error(data.message || "Failed to fetch coupons");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to coupons server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error("Please enter a valid discount value");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/coupons/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim(),
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          minOrderAmount: Number(formData.minOrderAmount || 0),
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Coupon created successfully!");
        setShowModal(false);
        setFormData({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: "",
          maxDiscountAmount: "",
          minOrderAmount: "0",
          usageLimit: "",
          validUntil: "",
          isActive: true,
        });
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error creating coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch(`${API}/api/coupons/admin/${coupon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        toast.success(`Coupon ${coupon.code} is now ${!coupon.isActive ? "Active" : "Inactive"}`);
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
        );
      } else {
        toast.error("Failed to toggle status");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API}/api/coupons/admin/${id}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`Coupon "${code}" deleted`);
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard!`, { icon: "📋" });
  };

  // Metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => {
    const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
    return c.isActive && !isExpired;
  }).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  // Filtered List
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

    const isExpired = c.validUntil && new Date(c.validUntil) < new Date();

    if (filter === "active") {
      return matchesSearch && c.isActive && !isExpired;
    }
    if (filter === "expired") {
      return matchesSearch && (isExpired || !c.isActive);
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" />
            Coupons & Promo Codes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create discount codes (e.g. DIWALI10, FIRST50, FLAT500) and track customer redemptions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Promo Codes
          </div>
          <div className="text-3xl font-black text-foreground">{totalCoupons}</div>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Now
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {activeCoupons}
          </div>
        </div>

        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Times Redeemed
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {totalRedemptions}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/40 p-1 rounded-xl border">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            All ({coupons.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === "active" ? "bg-card text-emerald-600 shadow-sm" : "text-muted-foreground"
            }`}
          >
            Active ({activeCoupons})
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === "expired" ? "bg-card text-rose-600 shadow-sm" : "text-muted-foreground"
            }`}
          >
            Expired / Inactive ({coupons.length - activeCoupons})
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Loading promo codes...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold">No promo codes found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "No codes matched your search filter." : "Create your first discount promo code to boost sales."}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow transition"
              >
                + Create Promo Code
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground font-semibold">
                  <th className="p-4 pl-6">Code & Info</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min. Order</th>
                  <th className="p-4">Redemptions</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCoupons.map((coupon) => {
                  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();

                  return (
                    <tr key={coupon._id} className="hover:bg-muted/30 transition">
                      {/* CODE & DESCRIPTION */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5"
                            title="Click to copy code"
                          >
                            <span>{coupon.code}</span>
                            <Copy className="w-3 h-3 opacity-60" />
                          </button>
                        </div>
                        {coupon.description && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      {/* DISCOUNT */}
                      <td className="p-4">
                        <div className="font-extrabold text-foreground">
                          {coupon.discountType === "percentage" ? (
                            <span>{coupon.discountValue}% OFF</span>
                          ) : (
                            <span>₹{coupon.discountValue.toLocaleString("en-IN")} FLAT OFF</span>
                          )}
                        </div>
                        {coupon.discountType === "percentage" && coupon.maxDiscountAmount ? (
                          <div className="text-[11px] text-muted-foreground">
                            Max ₹{coupon.maxDiscountAmount.toLocaleString("en-IN")}
                          </div>
                        ) : null}
                      </td>

                      {/* MIN ORDER */}
                      <td className="p-4 text-xs">
                        {coupon.minOrderAmount > 0 ? (
                          <span className="font-bold">₹{coupon.minOrderAmount.toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="text-muted-foreground">No minimum</span>
                        )}
                      </td>

                      {/* USAGE */}
                      <td className="p-4 text-xs font-medium">
                        <span>{coupon.usedCount || 0}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit : "∞"}
                        </span>
                      </td>

                      {/* EXPIRY */}
                      <td className="p-4 text-xs">
                        {coupon.validUntil ? (
                          <span className={isExpired ? "text-rose-500 font-bold" : "text-muted-foreground"}>
                            {new Date(coupon.validUntil).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                            isExpired
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : coupon.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                          }`}
                        >
                          {isExpired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground transition"
                            title={coupon.isActive ? "Deactivate coupon" : "Activate coupon"}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                            className="p-1.5 rounded-lg border hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Create Promo Code</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              {/* CODE */}
              <div>
                <label className="font-bold block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. DIWALI10, FIRST50, FLAT500"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold uppercase bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="font-bold block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 10% festive discount on all orders"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* TYPE & VALUE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm bg-background"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">
                    {formData.discountType === "percentage" ? "Percentage Value (%) *" : "Flat Discount (₹) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={formData.discountType === "percentage" ? "10" : "500"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* MAX DISCOUNT & MIN ORDER */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">
                    Max Discount Cap (₹)
                    <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Min. Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* USAGE LIMIT & EXPIRY */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">
                    Usage Limit
                    <span className="text-muted-foreground font-normal ml-1">(Total uses)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave blank for ∞"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Save Promo Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
