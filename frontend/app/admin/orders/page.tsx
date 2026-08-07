"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl, getAdminAuthHeaders } from "@/lib/apiBase";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* ================= TYPES ================= */

type OrderItem = {
  productId: string;
  qty: number;
  title: string;
  price: number;
};

type AdminOrder = {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status?: string;
  billing?: {
    fullName?: string;
    name?: string;
    email?: string;
  };
  userId?: {
    name?: string;
  };
};

/* ================= PAGE ================= */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  /* Search and filters */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastWeekOnly, setLastWeekOnly] = useState(false);
  const [highAmountOnly, setHighAmountOnly] = useState(false);

  /* 📄 Pagination */
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);

  const loadOrders = async () => {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/orders`,
        { credentials: "include", headers: getAdminAuthHeaders() },
      );

      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= DERIVED DATA ================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      /* 🔍 Order ID search */
      if (
        search.trim() &&
        !order.orderId.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      /* 📦 Status filter */
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      /* 📅 Last 7 days filter */
      if (lastWeekOnly) {
        const orderDate = new Date(order.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (orderDate < sevenDaysAgo) return false;
      }

      /* 💰 Amount > 10,000 filter */
      if (highAmountOnly && order.total <= 10000) {
        return false;
      }

      return true;
    });
  }, [orders, search, statusFilter, lastWeekOnly, highAmountOnly]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const filteredCount = filteredOrders.length;

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center gap-4">
        {/* 🔍 SEARCH */}
        <Input
          placeholder="Search by Order ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />

        {/* STATUS FILTER */}
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* LAST 7 DAYS */}
        <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 h-9 bg-white dark:bg-gray-800">
          <Checkbox
            id="last7days"
            checked={lastWeekOnly}
            onCheckedChange={(checked) => {
              setLastWeekOnly(Boolean(checked));
              setPage(1);
            }}
          />
          <Label htmlFor="last7days" className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">
            Last 7 days
          </Label>
        </div>

        {/* AMOUNT > 10K */}
        <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 h-9 bg-white dark:bg-gray-800">
          <Checkbox
            id="highAmount"
            checked={highAmountOnly}
            onCheckedChange={(checked) => {
              setHighAmountOnly(Boolean(checked));
              setPage(1);
            }}
          />
          <Label htmlFor="highAmount" className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">
            Amount &gt; ₹10,000
          </Label>
        </div>

        {/* RIGHT: COUNT */}
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredCount}
          </span>{" "}
          orders
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted-foreground">No orders found.</p>
      ) : (
        <>
          {/* ================= TABLE ================= */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-700 dark:text-gray-300">Order ID</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Items</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Total</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow 
                    key={order._id} 
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <TableCell className="font-mono text-gray-900 dark:text-gray-100">
                      {order.orderId}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {order.billing?.fullName ||
                          order.billing?.name ||
                          order.userId?.name ||
                          "Guest"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.billing?.email || "No email"}
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {order.items.length} items
                    </TableCell>

                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      ₹{order.total}
                    </TableCell>

                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "success"
                            : order.status === "Cancelled"
                              ? "destructive"
                              : order.status === "Shipped"
                                ? "default"
                                : "secondary"
                        }
                        className="w-20 h-8 inline-flex items-center justify-center"
                      >
                        {order.status || "Pending"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="w-20 h-8 inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === pageNum}
                          onClick={() => setPage(pageNum)}
                          className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}