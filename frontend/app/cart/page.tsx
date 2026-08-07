// app/cart/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Truck,
  CreditCard,
  ArrowLeft,
  Package,
  Pencil,
  Gift,
  Award
} from "lucide-react";

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 9999;
const STANDARD_SHIPPING_COST = 9.90;

export default function CartPage() {
  const { cart, updateQty, removeItem, clearCart } = useCart();
  const router = useRouter();

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  
  // Calculate shipping cost based on subtotal
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const total = subtotal + shippingCost;
  
  // Calculate how much more for free shipping
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Calculate 5% discount for prepaid orders
  const prepaidDiscount = total * 0.05;
  const discountedTotal = total - prepaidDiscount;

  // Helper function to get unique key for cart item
  const getItemKey = (item: any) => {
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.productId}-${JSON.stringify(item.selectedOptions)}`;
    }
    return `${item.productId}-${item.size || 'default'}`;
  };

  // Helper function to find item by ID and options
  const findItem = (productId: string, size?: string, selectedOptions?: Record<string, string>) => {
    return cart.find((item) => {
      if (item.productId !== productId) return false;

      if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        return JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions);
      }

      return item.size === size;
    });
  };

  const inc = (productId: string, size?: string, selectedOptions?: Record<string, string>) => {
    const current = findItem(productId, size, selectedOptions)?.qty || 0;
    updateQty(productId, current + 1, size, selectedOptions);
  };

  const dec = (productId: string, size?: string, selectedOptions?: Record<string, string>) => {
    const current = findItem(productId, size, selectedOptions)?.qty || 0;

    if (current <= 1) {
      removeItem(productId, size, selectedOptions);
      toast.success("Removed item");
    } else {
      updateQty(productId, current - 1, size, selectedOptions);
    }
  };

  /* ================= ADDRESS ================= */
  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    zip: "",
    street: "45 Glenridge Ave. Brooklyn, NY 11220",
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  useEffect(() => {
    const stored = localStorage.getItem("checkoutAddress");
    if (stored) {
      const parsed = JSON.parse(stored);
      setAddress(parsed);
      setTempAddress(parsed);
    }
  }, []);

  const handleAddressChange = (field: string, value: string) => {
    setTempAddress(prev => ({ ...prev, [field]: value }));
  };

  const saveAddress = () => {
    // Validate required fields
    if (!tempAddress.fullName || !tempAddress.email || !tempAddress.phone || !tempAddress.country) {
      toast.error("Please fill all required fields");
      return;
    }

    setAddress(tempAddress);
    localStorage.setItem("checkoutAddress", JSON.stringify(tempAddress));
    setIsEditingAddress(false);
    toast.success("Address updated");
  };

  const cancelAddressEdit = () => {
    setTempAddress(address);
    setIsEditingAddress(false);
  };

  const saveAndCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to continue");
      router.push("/login?redirect=/checkout");
      return;
    }

    const { fullName, email, phone, country } = address;
    if (!fullName || !email || !phone || !country) {
      toast.error("Please fill required address fields");
      return;
    }

    localStorage.setItem("checkoutAddress", JSON.stringify(address));
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-muted/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet</p>
          <Button onClick={() => router.push("/")} size="lg">
            Continue Shopping
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">My Cart</h1>
          <Badge variant="outline" className="px-3 py-1">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      {/* Free Shipping Progress Bar */}
      {subtotal < FREE_SHIPPING_THRESHOLD && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Add ₹{amountForFreeShipping.toFixed(2)} more to get FREE shipping!
              </p>
              <div className="mt-2 h-2 w-full bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {progressToFreeShipping.toFixed(0)}% of free shipping goal reached
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Free Shipping Achieved Banner */}
      {subtotal >= FREE_SHIPPING_THRESHOLD && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Congratulations! You've qualified for FREE shipping on this order! 🎉
            </p>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Cart Items & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </h2>

            <div className="space-y-6">
              {cart.map((item) => (
                <div key={getItemKey(item)} className="flex gap-4 pb-6 border-b last:border-0 last:pb-0">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.png"}
                      className="w-full h-full object-cover"
                      alt={item.title}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>

                        {/* SKU / Product ID */}
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          #{item.sku || item.productId.slice(-8)}
                        </p>

                        {/* Variant Options */}
                    {/* Variant Options */}
{item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? (
  <div className="mt-2 space-y-1">
    {Object.entries(item.selectedOptions).map(([key, value]) => (
      <div key={key} className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{key}:</span>
        <span className="font-medium">{value}</span>
      </div>
    ))}
  </div>
) : item.size ? ( // Only show size if it exists
  <div className="mt-2 text-sm">
    <span className="text-muted-foreground">Size:</span>
    <span className="font-medium ml-2">{item.size}</span>
  </div>
) : null}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold">₹{item.price.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => dec(item.productId, item.size, item.selectedOptions)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => inc(item.productId, item.size, item.selectedOptions)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.productId, item.size, item.selectedOptions)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Address Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Address
              </h2>
              {!isEditingAddress && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingAddress(true)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Change
                </Button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name *"
                    value={tempAddress.fullName}
                    onChange={(e) => handleAddressChange("fullName", e.target.value)}
                  />
                  <Input
                    placeholder="Email *"
                    type="email"
                    value={tempAddress.email}
                    onChange={(e) => handleAddressChange("email", e.target.value)}
                  />
                  <Input
                    placeholder="Phone *"
                    value={tempAddress.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                  />
                  <Input
                    placeholder="Street Address"
                    value={tempAddress.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                  />
                  <Input
                    placeholder="City"
                    value={tempAddress.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={tempAddress.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                  />
                  <Input
                    placeholder="Country *"
                    value={tempAddress.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={tempAddress.zip}
                    onChange={(e) => handleAddressChange("zip", e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={saveAddress}>
                    Save Address
                  </Button>
                  <Button variant="outline" onClick={cancelAddressEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{address.fullName || "Full Name"}</p>
                  <p className="text-sm text-muted-foreground">{address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}{address.city && address.state ? ', ' : ''}{address.state} {address.zip}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                  {address.phone && (
                    <p className="text-sm text-muted-foreground mt-2">📞 {address.phone}</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Discount Card - Prepaid Offer */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-950/20 dark:to-pink-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Get 5% extra discount on prepaid orders! 🎉
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Pay via UPI, Card, or NetBanking and save ₹{prepaidDiscount.toFixed(2)}
                </p>
                <Badge 
                  variant="outline" 
                  className="mt-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px]"
                >
                  Apply at checkout
                </Badge>
              </div>
            </div>
          </Card>

          {/* Order Summary Card */}
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
                )}
              </div>

              {shippingCost > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-amber-600 pt-1">
                  Add ₹{amountForFreeShipping.toFixed(2)} more for free shipping
                </p>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between font-semibold text-lg pt-1">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Prepaid Discounted Total (Shown for comparison) */}
              <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400 pt-2">
                <span>With prepaid discount</span>
                <span className="font-medium">₹{discountedTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={saveAndCheckout} size="lg" className="w-full gap-2">
                <CreditCard className="h-4 w-4" />
                Checkout
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full gap-2" 
                onClick={() => {
                  clearCart();
                  toast.success("Cart cleared");
                }}
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Secure checkout powered by Razorpay
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}