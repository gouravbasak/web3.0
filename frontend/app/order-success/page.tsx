"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Download,
  ShoppingBag,
  Calendar,
  Clock,
  Award,
  Sparkles,
  Mail,
  Phone,
  Printer
} from "lucide-react";

/* ================= TYPES ================= */

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  size?: string;
  selectedOptions?: Record<string, string>;
  sku?: string;
  image?: string | null;
};

type SavedOrder = {
  orderId: string;
  items: OrderItem[];
  originalSubtotal?: number;
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  billing?: {
    fullName?: string;
    name?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    email?: string;
    phone?: string;
    street?: string;
  };
  payment?: {
    method?: string;
    razorpayPaymentId?: string;
  };
  createdAt?: string;
};

/* ================= HELPERS ================= */

function formatCurrency(n = 0) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function getPaymentLabel(payment: any) {
  if (!payment?.method) return "—";
  if (payment.method === "cod") return "Cash on Delivery";
  if (payment.method === "razorpay") return "Online Payment (UPI/Card/NetBanking)";
  return payment.method;
}

function getPaymentIcon(method: string) {
  if (method === "cod") return <Truck className="h-4 w-4" />;
  return <CreditCard className="h-4 w-4" />;
}

// Format date nicely
function formatOrderDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get estimated delivery (7-14 days from order)
function getEstimatedDelivery(dateString: string) {
  const orderDate = new Date(dateString);
  const startDate = new Date(orderDate);
  const endDate = new Date(orderDate);
  startDate.setDate(startDate.getDate() + 7);
  endDate.setDate(endDate.getDate() + 14);
  
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${startStr} - ${endStr}`;
}

// Get item key for unique identification
const getItemKey = (item: OrderItem) => {
  if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
    return `${item.productId}-${JSON.stringify(item.selectedOptions)}`;
  }
  return `${item.productId}-${item.size || 'default'}`;
};

/* ================= PAGE ================= */

export default function OrderSuccessPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<SavedOrder | null>(null);

  /* ✅ FIX HYDRATION */
  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem("lastOrder");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  /* Prevent hydration mismatch */
  if (!mounted) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-48 bg-muted rounded mx-auto"></div>
            <div className="h-4 w-64 bg-muted rounded mx-auto"></div>
            <div className="h-32 w-full bg-muted rounded"></div>
          </div>
        </Card>
      </main>
    );
  }

  /* No order */
  if (!order) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">No order found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find your order details</p>
          <Button onClick={() => router.push("/")} size="lg">
            Continue Shopping
          </Button>
        </Card>
      </main>
    );
  }

  const {
    items = [],
    billing = {},
    payment = {},
    originalSubtotal = null,
    subtotal,
    discount = 0,
    shipping = 0,
    total,
    createdAt = new Date().toISOString(),
    orderId,
  } = order;

  // Combine name fields
  const customerName = billing.fullName || billing.name || "Valued Customer";
  const estimatedDelivery = getEstimatedDelivery(createdAt);

  /* ================= PDF DOWNLOAD ================= */
  const handleDownloadReceipt = () => {
    if (!order) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    /* ================= PAGE BACKGROUND ================= */
    pdf.setFillColor(245, 245, 245);
    pdf.rect(
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight(),
      "F",
    );

    /* ================= HEADER ================= */
    pdf.setFontSize(20);
    pdf.setTextColor(120, 30, 20);
    pdf.text("INVOICE", pageWidth / 2, 18, { align: "center" });

    // Invoice no + date in ONE line
    // Invoice no + date - SPLIT INTO TWO LINES
pdf.setFontSize(10);
pdf.setTextColor(0, 0, 0);
pdf.text(`Invoice No: ${order.orderId}`, pageWidth / 2, 24, { align: "center" });
pdf.text(`Date: ${new Date(createdAt).toLocaleString()}`, pageWidth / 2, 30, { align: "center" });
    /* ================= PAYMENT INFO (TOP RIGHT) ================= */
    const paymentBoxX = pageWidth - 65;
    const paymentBoxY = 40;

    pdf.setFontSize(11);
    pdf.text("PAYMENT INFO", paymentBoxX, paymentBoxY);

    pdf.setFontSize(10);
    // Method text - TRUNCATE IF TOO LONG
const methodText = `Method: ${getPaymentLabel(payment)}`;
const maxWidth = 55;
const truncatedMethod = methodText.length > 30 ? methodText.substring(0, 27) + "..." : methodText;
pdf.text(truncatedMethod, paymentBoxX, paymentBoxY + 6);
    pdf.text("Status: Paid", paymentBoxX, paymentBoxY + 12);

    /* ================= CLIENT INFO ================= */
    pdf.setFontSize(11);
    pdf.text("BILL TO", 15, 40);

    pdf.setFontSize(10);
    pdf.text(customerName, 15, 46);
    if (billing.street) pdf.text(billing.street, 15, 51);
   // Address line - HANDLE LONG ADDRESSES
const addressLine = `${billing.city || ""} ${billing.state || ""} ${billing.zip || ""}`.trim();
if (addressLine) {
  // Split long address into two lines if needed
  if (addressLine.length > 40) {
    const midPoint = Math.floor(addressLine.length / 2);
    const spaceIndex = addressLine.indexOf(' ', midPoint);
    if (spaceIndex > 0) {
      pdf.text(addressLine.substring(0, spaceIndex), 15, 56);
      pdf.text(addressLine.substring(spaceIndex + 1), 15, 62);
    } else {
      pdf.text(addressLine, 15, 56);
    }
  } else {
    pdf.text(addressLine, 15, 56);
  }
}
    if (billing.country) pdf.text(billing.country, 15, 61);
    if (billing.email) pdf.text(billing.email, 15, 66);
    if (billing.phone) pdf.text(billing.phone, 15, 71);

    /* ================= TABLE HEADER ================= */
    const tableStartY = 85;
    const rowHeight = 8;

    const col = {
      sl: 15,
      item: 28,
      details: 75,
      price: 115,
      qty: 140,
      total: 170,
    };

    pdf.setFillColor(255, 160, 130);
    pdf.rect(10, tableStartY, pageWidth - 20, rowHeight, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text("SL.", col.sl, tableStartY + 5);
    pdf.text("ITEM DESCRIPTION", col.item, tableStartY + 5);
    pdf.text("DETAILS", col.details, tableStartY + 5);
    pdf.text("PRICE", col.price, tableStartY + 5);
    pdf.text("QTY.", col.qty, tableStartY + 5);
    pdf.text("TOTAL", col.total, tableStartY + 5, { align: "right" });

    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);

    // vertical grid lines
    pdf.line(25, tableStartY, 25, tableStartY + rowHeight + items.length * rowHeight);
    pdf.line(70, tableStartY, 70, tableStartY + rowHeight + items.length * rowHeight);
    pdf.line(110, tableStartY, 110, tableStartY + rowHeight + items.length * rowHeight);
    pdf.line(135, tableStartY, 135, tableStartY + rowHeight + items.length * rowHeight);
    pdf.line(155, tableStartY, 155, tableStartY + rowHeight + items.length * rowHeight);

    /* ================= TABLE ROWS ================= */
    let y = tableStartY + rowHeight + 5;

    items.forEach((it, index) => {
      pdf.text(String(index + 1), col.sl, y);
      pdf.text(it.title, col.item, y);
      
      // Format variant details
      let detailsText = "";
      if (it.selectedOptions && Object.keys(it.selectedOptions).length > 0) {
        detailsText = Object.entries(it.selectedOptions)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      } else if (it.size) {
        detailsText = `Size: ${it.size}`;
      } else {
        detailsText = "-";
      }
      pdf.text(detailsText, col.details, y);
      
      pdf.text(`Rs. ${it.price}`, col.price, y);
      pdf.text(String(it.qty), col.qty, y);
      pdf.text(`Rs. ${it.qty * it.price}`, col.total, y, { align: "right" });

      pdf.line(10, y + 3, pageWidth - 10, y + 3);
      y += rowHeight;
    });

    /* ================= TOTALS ================= */
    y += 8;
    const totalsXLabel = 120;
    const totalsXValue = 170;

    if (originalSubtotal) {
      pdf.text("MRP", totalsXLabel, y);
      pdf.text(`Rs. ${originalSubtotal}`, totalsXValue, y, { align: "right" });
      y += 6;
    }

    pdf.text("Subtotal", totalsXLabel, y);
    pdf.text(`Rs. ${subtotal}`, totalsXValue, y, { align: "right" });

    y += 6;
    pdf.text("Delivery", totalsXLabel, y);
    pdf.text(`Rs. ${shipping}`, totalsXValue, y, { align: "right" });

    y += 4;
    pdf.line(totalsXLabel - 5, y, pageWidth - 10, y);

    y += 8;
    pdf.setFontSize(14);
    pdf.text("TOTAL", totalsXLabel, y);
    pdf.text(`Rs. ${total}`, totalsXValue, y, { align: "right" });

    /* ================= TERMS ================= */
    pdf.setFontSize(9);
    pdf.text(
      "TERMS & CONDITIONS: All sales are final. Goods once shipped will not be cancelled. Returns are accepted only for defective or damaged items.",
      pageWidth / 2,
      255,
      { align: "center", maxWidth: pageWidth - 30 },
    );

    /* ================= SAVE ================= */
    pdf.save(`invoice_${order.orderId}.pdf`);
  };

  /* ================= UI ================= */

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-background text-foreground">
      {/* Success Celebration Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Thank You, {customerName.split(' ')[0]}! 🎉
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your order has been confirmed and will be shipped soon
        </p>
      </div>

      {/* Order Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Package className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-xs text-muted-foreground">Items</p>
        </Card>
        <Card className="p-4 text-center">
          <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-medium">{new Date(createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">Order Date</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-amber-600" />
          <p className="text-sm font-medium">{estimatedDelivery}</p>
          <p className="text-xs text-muted-foreground">Est. Delivery</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="h-5 w-5 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
      </div>

      {/* Order ID Badge */}
      <div className="flex justify-center mb-8">
        <Badge variant="outline" className="px-4 py-2 text-sm bg-muted/30">
          Order ID: <span className="font-mono font-bold">{orderId}</span>
        </Badge>
      </div>

      {/* Main Content Grid - REORGANIZED */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items (Full width in grid) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={getItemKey(item)} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.png"}
                      className="w-full h-full object-cover"
                      alt={item.title}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        
                        {/* SKU */}
                        {item.sku && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            SKU: {item.sku}
                          </p>
                        )}

                        {/* Variant Options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        ) : item.size ? (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Size: {item.size}
                          </Badge>
                        ) : null}

                        <p className="text-sm text-muted-foreground mt-2">
                          Qty: {item.qty} × {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(item.qty * item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Address Card - NOW BELOW ORDER ITEMS */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h2>

            <div className="space-y-2">
              <p className="font-medium">{customerName}</p>
              {billing.street && <p className="text-sm text-muted-foreground">{billing.street}</p>}
              <p className="text-sm text-muted-foreground">
                {billing.city}{billing.city && billing.state ? ', ' : ''}{billing.state} {billing.zip}
              </p>
              <p className="text-sm text-muted-foreground">{billing.country}</p>
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                {billing.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{billing.phone}</span>
                  </div>
                )}
                {billing.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{billing.email}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Payment Method & Order Summary (MOVED UP) */}
        <div className="space-y-4">
          {/* Payment Method Card - NOW AT THE TOP */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-2">
                {getPaymentIcon(payment.method || '')}
              </div>
              <div>
                <p className="font-medium">{getPaymentLabel(payment)}</p>
                {payment.razorpayPaymentId && (
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    ID: {payment.razorpayPaymentId.slice(-8)}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Success Badge */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-700 dark:text-green-300">Payment Successful</span>
            </div>

            {/* Delivery Estimate */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-amber-600" />
                <span className="text-amber-700 dark:text-amber-300">
                  Estimated delivery: {estimatedDelivery}
                </span>
              </div>
            </div>
          </Card>

          {/* Order Summary Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  <span>{formatCurrency(shipping)}</span>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-emerald-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleDownloadReceipt} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Receipt
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          <Button 
            onClick={() => router.push("/")} 
            size="lg" 
            className="w-full gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>

          {/* Trust Badge */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              We hope you enjoy your purchase!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}