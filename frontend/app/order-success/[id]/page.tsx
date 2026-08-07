// app/order/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
  Printer,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import jsPDF from "jspdf";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

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

type Order = {
  _id: string;
  orderId: string;
  items: OrderItem[];
  originalSubtotal?: number;
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  status: string;
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
  createdAt: string;
  deliveredAt?: string;
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

function getStatusColor(status: string) {
  switch(status) {
    case "Delivered": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    case "Cancelled": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    case "Pending": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    case "Shipped": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    default: return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
}

const getItemKey = (item: OrderItem) => {
  if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
    return `${item.productId}-${JSON.stringify(item.selectedOptions)}`;
  }
  return `${item.productId}-${item.size || 'default'}`;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view order details");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API}/api/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message);
        toast.error("Could not load order details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id, router]);

  const handleCancelOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`${API}/api/orders/${params.id}/cancel`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      if (!res.ok) {
        throw new Error("Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      
      // Refresh order data
      const updatedRes = await fetch(`${API}/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setOrder(updatedData);
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast.error(err.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F");

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(120, 30, 20);
    pdf.text("INVOICE", pageWidth / 2, 18, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Invoice No: ${order.orderId}`, pageWidth / 2, 24, { align: "center" });
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, pageWidth / 2, 30, { align: "center" });

    // Payment Info
    const paymentBoxX = pageWidth - 65;
    pdf.setFontSize(11);
    pdf.text("PAYMENT INFO", paymentBoxX, 40);
    pdf.setFontSize(10);
    pdf.text(`Method: ${getPaymentLabel(order.payment)}`, paymentBoxX, 46);
    pdf.text(`Status: Paid`, paymentBoxX, 52);

    // Billing Info
    const customerName = order.billing?.fullName || order.billing?.name || "Customer";
    pdf.setFontSize(11);
    pdf.text("BILL TO", 15, 40);
    pdf.setFontSize(10);
    pdf.text(customerName, 15, 46);
    if (order.billing?.street) pdf.text(order.billing.street, 15, 51);
    
    const addressLine = `${order.billing?.city || ""} ${order.billing?.state || ""} ${order.billing?.zip || ""}`.trim();
    if (addressLine) pdf.text(addressLine, 15, 56);
    if (order.billing?.country) pdf.text(order.billing.country, 15, 61);
    if (order.billing?.email) pdf.text(order.billing.email, 15, 66);
    if (order.billing?.phone) pdf.text(order.billing.phone, 15, 71);

    pdf.save(`invoice_${order.orderId}.pdf`);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
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

  if (error || !order) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-semibold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "We couldn't find this order"}</p>
          <Button onClick={() => router.push("/profile?tab=current")} size="lg">
            Back to Profile
          </Button>
        </Card>
      </main>
    );
  }

  const estimatedDelivery = getEstimatedDelivery(order.createdAt);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline" className="px-3 py-1">
          Order #{order.orderId}
        </Badge>
      </div>

      {/* Status Banner */}
      <Card className={`p-4 mb-6 ${order.status === "Delivered" ? "bg-green-50 dark:bg-green-950/20" : 
        order.status === "Cancelled" ? "bg-red-50 dark:bg-red-950/20" : 
        "bg-blue-50 dark:bg-blue-950/20"}`}>
        <div className="flex items-center gap-3">
          {order.status === "Delivered" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : order.status === "Cancelled" ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <Package className="h-5 w-5 text-blue-600" />
          )}
          <div>
            <p className="font-medium">Order Status: <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span></p>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
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
                        
                        {item.sku && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            SKU: {item.sku}
                          </p>
                        )}

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

          {/* Delivery Address */}
          {order.billing && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>

              <div className="space-y-2">
                <p className="font-medium">{order.billing.fullName || order.billing.name}</p>
                {order.billing.street && <p className="text-sm text-muted-foreground">{order.billing.street}</p>}
                <p className="text-sm text-muted-foreground">
                  {order.billing.city}{order.billing.city && order.billing.state ? ', ' : ''}{order.billing.state} {order.billing.zip}
                </p>
                <p className="text-sm text-muted-foreground">{order.billing.country}</p>
                
                <Separator className="my-3" />
                
                <div className="space-y-2">
                  {order.billing.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.billing.phone}</span>
                    </div>
                  )}
                  {order.billing.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.billing.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary & Actions */}
        <div className="space-y-4">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                {order.shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  <span>{formatCurrency(order.shipping || 0)}</span>
                )}
              </div>

              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-blue-400">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>

            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
                {getPaymentIcon(order.payment?.method || '')}
              </div>
              <div>
                <p className="font-medium">{getPaymentLabel(order.payment)}</p>
                {order.payment?.razorpayPaymentId && (
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    ID: {order.payment.razorpayPaymentId.slice(-8)}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Estimate */}
            {/* Delivery Info - Shows actual delivery date if delivered, otherwise estimate */}
<div className="mt-4 p-3 rounded-lg ${order.status === 'Delivered' ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}">
  <div className="flex items-center gap-2 text-sm">
    {order.status === 'Delivered' ? (
      <>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-green-700 dark:text-green-300">
          Delivered on {new Date(order.deliveredAt || order.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </span>
      </>
    ) : order.status === 'Cancelled' ? (
      <>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-red-700 dark:text-red-300">
          Order cancelled
        </span>
      </>
    ) : (
      <>
        <Truck className="h-4 w-4 text-amber-600" />
        <span className="text-amber-700 dark:text-amber-300">
          Estimated delivery: {estimatedDelivery}
        </span>
      </>
    )}
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

          {/* Cancel Order Button - Only for pending orders */}
          {order.status === "Pending" && (
            <Button 
              onClick={handleCancelOrder}
              disabled={cancelling}
              variant="destructive" 
              size="lg" 
              className="w-full gap-2"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}

          <Button 
            onClick={() => router.push("/profile?tab=current")} 
            variant="outline"
            size="lg" 
            className="w-full gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Back to Profile
          </Button>
        </div>
      </div>
    </main>
  );
}