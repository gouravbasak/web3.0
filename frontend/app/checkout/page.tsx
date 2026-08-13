// app/checkout/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Truck,
  CreditCard,
  Home,
  Package,
  Edit2,
  X,
  Shield,
  Lock,
  Award,
  Gift,
  Clock,
  CheckCircle2,
  Wallet,
  IndianRupee,
  ChevronRight,
  Sparkles
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  
  /* ================= VOUCHER STATE ================= */
  const [availableVoucher, setAvailableVoucher] = useState<any>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  /* ================= ADDRESS STATE ================= */
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    zip: "",
    street: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("checkoutAddress");
      localStorage.removeItem("lastOrder");
      setAddress({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        state: "",
        zip: "",
        street: "",
      });
      return;
    }

    const stored = localStorage.getItem("checkoutAddress");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const userStr = localStorage.getItem("user");
        const userObj = userStr ? JSON.parse(userStr) : {};

        setAddress({
          fullName: parsed.fullName || parsed.name || userObj.name || "",
          email: parsed.email || userObj.email || "",
          phone: parsed.phone || userObj.phone || "",
          street: parsed.street || parsed.address || "",
          city: parsed.city || "",
          state: parsed.state || parsed.stateName || "",
          country: parsed.country || "India",
          zip: parsed.zip || parsed.pincode || "",
        });
      } catch (_) {}
    }
  }, []);

  const billing = address;

  /* ================= PAYMENT ================= */
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  /* ================= FETCH VOUCHERS ================= */
  useEffect(() => {
    const fetchVouchers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoadingVoucher(true);
      try {
        const res = await fetch(`${API}/api/auth/vouchers`, { credentials: "include", 
          headers: { Authorization: `Bearer ${token}` }
         });
        
        if (res.ok) {
          const data = await res.json();
          // Auto-apply the first available voucher
          if (data.length > 0) {
            setAvailableVoucher(data[0]);
            setAppliedVoucher(data[0]); // Auto-apply
          }
        }
      } catch (err) {
        console.error("Failed to fetch vouchers:", err);
      } finally {
        setLoadingVoucher(false);
      }
    };
    
    fetchVouchers();
  }, []);

  /* ================= PRICE ================= */
  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart],
  );

  const FREE_SHIPPING_THRESHOLD = 9999;
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const totalBeforeVoucher = subtotal + shipping;
  
  // 5% prepaid discount
  const prepaidDiscount = totalBeforeVoucher * 0.05;
  
  // Voucher discount (₹1000)
  const voucherDiscount = appliedVoucher ? 1000 : 0;
  
  // Calculate final totals based on payment method and voucher
  const totalAfterVoucher = Math.max(0, totalBeforeVoucher - voucherDiscount);
  const rawDiscountedTotal = paymentMethod === "online" 
    ? totalAfterVoucher - (totalAfterVoucher * 0.05) 
    : totalAfterVoucher;
  const discountedTotal = Math.max(0, rawDiscountedTotal);
  
  // Amount for free shipping
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Estimated delivery date range (7-10 days from now)
  const deliveryDateRange = useMemo(() => {
    const startDate = new Date();
    const endDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    endDate.setDate(endDate.getDate() + 10);
    
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  }, []);

  // Helper function to get item key
  const getItemKey = (item: any) => {
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.productId}-${JSON.stringify(item.selectedOptions)}`;
    }
    return `${item.productId}-${item.size || 'default'}`;
  };

  /* ================= ORDER PAYLOAD ================= */
  const buildOrderPayload = (paymentDetails: any = {}) => ({
    orderId: `ORD-${uuidv4().split("-")[0].toUpperCase()}`,
    items: cart.map((i) => ({
      productId: i.productId,
      title: i.title,
      price: i.price,
      qty: i.qty,
      size: i.size,
      selectedOptions: i.selectedOptions,
      sku: i.sku,
      image: i.image || "/placeholder.png",
    })),
    subtotal,
    shipping,
    voucherApplied: appliedVoucher ? {
      code: appliedVoucher.code,
      amount: voucherDiscount
    } : null,
    total: discountedTotal,
    billing,
    payment: paymentDetails,
  });

  /* ================= SAVE ORDER ================= */
  const placeOrder = async (payload: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/orders`, { credentials: "include", 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : { }),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();

      if (err?.message === "Invalid or expired token") {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      throw new Error(err?.message || "Order failed");
    }

    localStorage.setItem("lastOrder", JSON.stringify(payload));
    clearCart();
    router.push("/order-success");
  };

  /* ================= SAVE ADDRESS FROM MODAL ================= */
  const saveAddressFromModal = () => {
    const { fullName, email, phone, country } = address;

    if (!fullName || !email || !phone || !country) {
      toast.error("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      localStorage.setItem("checkoutAddress", JSON.stringify(address));
    } else {
      localStorage.removeItem("checkoutAddress");
    }
    setShowAddressModal(false);
    toast.success("Address saved");
  };

  /* ================= CONFIRM PAYMENT ================= */
  const handleConfirmPayment = async () => {
    if (!billing.fullName || !billing.email || !billing.phone) {
      toast.error("Please add delivery address");
      setShowAddressModal(true);
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (paymentMethod === "cod") {
      const order = buildOrderPayload({ method: "cod" });
      await placeOrder(order);
      return;
    }

    if (paymentMethod === "online") {
      try {
        setLoading(true);

        const payableAmount = Math.max(1, Math.round(discountedTotal));

        // Create Razorpay order
        const res = await fetch(`${API}/api/payments/create-order`, { credentials: "include", 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: payableAmount  }),
        });

        const razorpayOrder = await res.json();
        if (!res.ok || !razorpayOrder?.id) {
          throw new Error(razorpayOrder?.message || "Failed to create payment order");
        }

        // Initialize Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: "INR",
          name: "IONYX",
          description: `Order payment for ${cart.length} item(s)`,
          order_id: razorpayOrder.id,
          prefill: {
            name: billing.fullName,
            email: billing.email,
            contact: billing.phone,
          },
          theme: { color: "#6366f1" },
          handler: async (response: any) => {
            const order = buildOrderPayload({
              method: "razorpay",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            await placeOrder(order);
          },
          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled");
              setLoading(false);
            }
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Payment error:", error);
        toast.error("Failed to initiate payment. Please try again.");
        setLoading(false);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16">
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to proceed to checkout</p>
          <Button onClick={() => router.push("/")} size="lg">
            Continue Shopping
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* ================= ADDRESS MODAL ================= */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h2>

            <div className="space-y-3">
              <Input
                placeholder="Full Name *"
                value={address.fullName || ""}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              />
              <Input
                placeholder="Email *"
                type="email"
                value={address.email || ""}
                onChange={(e) => setAddress({ ...address, email: e.target.value })}
              />
              <Input
                placeholder="Phone *"
                value={address.phone || ""}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
              <Input
                placeholder="Street Address"
                value={address.street || ""}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={address.city || ""}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={address.state || ""}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Country *"
                  value={address.country || ""}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                />
                <Input
                  placeholder="ZIP Code"
                  value={address.zip || ""}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                />
              </div>

              <Button onClick={saveAddressFromModal} className="w-full mt-4">
                Save Address
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Header with Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Complete Payment</h1>
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200">
            <Lock className="h-3 w-3 mr-1" /> Secure Checkout
          </Badge>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Cart</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</div>
            <span className="font-medium text-emerald-600">Checkout</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1 text-muted-foreground">
            <div className="h-4 w-4 rounded-full bg-muted text-xs flex items-center justify-center">3</div>
            <span>Payment</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Progress */}
      {subtotal < FREE_SHIPPING_THRESHOLD && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Add ₹{amountForFreeShipping.toFixed(2)} more to get FREE shipping!
              </p>
              <Progress value={progressToFreeShipping} className="h-1.5 mt-2" />
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Checkout Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddressModal(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                {billing.fullName ? "Change" : "Add"}
              </Button>
            </div>

            {billing.fullName ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{billing.fullName}</p>
                  <p className="text-sm text-muted-foreground">{billing.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {billing.city}{billing.city && billing.state ? ', ' : ''}{billing.state} {billing.zip}
                  </p>
                  <p className="text-sm text-muted-foreground">{billing.country}</p>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span>📞 {billing.phone}</span>
                    <span>✉️ {billing.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No delivery address added</p>
                <Button 
                  variant="link" 
                  onClick={() => setShowAddressModal(true)}
                  className="mt-2"
                >
                  Add Address
                </Button>
              </div>
            )}
          </Card>

          {/* Payment Methods Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Method
            </h2>

            <RadioGroup value={paymentMethod || ""} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-3">
              {/* Online Payment */}
              <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                paymentMethod === 'online' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                  : 'border-border hover:border-emerald-200'
              }`}>
                <RadioGroupItem value="online" id="online" className="float-right" />
                <Label htmlFor="online" className="cursor-pointer w-full">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Pay Online</p>
                      <p className="text-sm text-muted-foreground">UPI, Credit/Debit Card, NetBanking</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Save ₹{(totalBeforeVoucher * 0.05).toFixed(2)}
                        </Badge>
                        <span className="text-xs text-emerald-600">5% instant discount</span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              {/* Cash on Delivery */}
              <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                paymentMethod === 'cod' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                  : 'border-border hover:border-emerald-200'
              }`}>
                <RadioGroupItem value="cod" id="cod" className="float-right" />
                <Label htmlFor="cod" className="cursor-pointer w-full">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Savings Callout */}
            {paymentMethod === "online" && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300">
                ⚡ Paying online saves you 5% instantly on your entire order!
              </div>
            )}

            {/* Secure Payment Notice */}
            <div className="mt-4 p-3 bg-muted/20 rounded-lg flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">All online payments are securely processed by Razorpay</span>
            </div>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </h2>

            {/* Voucher Applied Banner */}
            {appliedVoucher && (
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    ₹1,000 Gift Voucher Applied! 🎉
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  From your previous order
                </p>
              </div>
            )}

            {/* Items Preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={getItemKey(item)} className="flex gap-3">
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image || "/placeholder.png"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                      </p>
                    ) : item.size ? (
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                    ) : null}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs">Qty: {item.qty}</span>
                      <span className="text-xs font-medium">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  <span>₹{shipping.toFixed(2)}</span>
                )}
              </div>
              
              {/* Voucher Discount */}
              {appliedVoucher && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Gift voucher</span>
                  <span>-₹{voucherDiscount.toFixed(2)}</span>
                </div>
              )}
              
              {paymentMethod === "online" && (
                <div className="flex justify-between text-sm text-purple-600">
                  <span>Prepaid discount (5%)</span>
                  <span>-₹{(totalAfterVoucher * 0.05).toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Total */}
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span className="text-purple-600">
                ₹{discountedTotal.toFixed(2)}
              </span>
            </div>

            {/* Original Price (if discounted) */}
            {(appliedVoucher || paymentMethod === "online") && (
              <div className="text-xs text-muted-foreground text-right mb-2">
                Original price: ₹{totalBeforeVoucher.toFixed(2)}
              </div>
            )}

            {/* Delivery Estimate */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg mb-4">
              <Clock className="h-3 w-3" />
              <span>Delivery by <span className="font-medium text-foreground">{deliveryDateRange}</span></span>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleConfirmPayment}
              disabled={loading || loadingVoucher}
              size="lg"
              className="w-full gap-2"
            >
              {loading ? (
                "Processing..."
              ) : loadingVoucher ? (
                "Checking vouchers..."
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay ₹{discountedTotal.toFixed(2)}
                </>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-green-500" />
                <span>100% secure payments</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" />
                <span>Free shipping above ₹{FREE_SHIPPING_THRESHOLD}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}