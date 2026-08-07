"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Product = {
  _id: string;
  title: string;
  price: number;
  mrp?: number;
  actualCost?: number;
  category: string;
  brand: string;
  images?: string[];
  stock?: number;
  isFeatured?: boolean;
};
import { getApiBaseUrl, getAdminAuthHeaders } from "@/lib/apiBase";

const API = getApiBaseUrl();

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [sortProfit, setSortProfit] = useState<"asc" | "desc" | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products`, {
        credentials: "include",
        headers: {
          ...getAdminAuthHeaders(),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err?.message || `Status ${res.status}`);
      }

      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string) => {
    const targetProduct = products.find((p) => p._id === id);
    if (!targetProduct) return;

    const newFeaturedStatus = !targetProduct.isFeatured;

    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ isFeatured: newFeaturedStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update ad status");
        return;
      }

      const updated = await res.json();
      const updatedStatus = updated && typeof updated.isFeatured !== "undefined"
        ? Boolean(updated.isFeatured)
        : newFeaturedStatus;

      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFeatured: updatedStatus } : p))
      );
      toast.success(
        updatedStatus
          ? "Product added to Landing Page Ads!"
          : "Product removed from Landing Page Ads!"
      );
    } catch (err) {
      console.error("Toggle featured error:", err);
      toast.error("Network error");
    }
  };



  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const processedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortProfit) return 0;

    const profitA =
      typeof a.actualCost === "number" ? a.price - a.actualCost : 0;
    const profitB =
      typeof b.actualCost === "number" ? b.price - b.actualCost : 0;

    return sortProfit === "asc" ? profitA - profitB : profitB - profitA;
  });

  const totalPages = Math.ceil(processedProducts.length / PAGE_SIZE);

  const paginatedProducts = processedProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAdminAuthHeaders(),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to delete");
        return;
      }

      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full sm:w-[220px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-center transition"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No products found.</p>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-center">Image</TableHead>
                <TableHead className="text-center w-[150px]">Title</TableHead>
                <TableHead className="text-center">Brand</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">MRP</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Actual Cost</TableHead>
                <TableHead className="text-center">
                  <button
                    onClick={() =>
                      setSortProfit((p) =>
                        p === "asc" ? "desc" : p === "desc" ? null : "asc",
                      )
                    }
                    className="flex items-center justify-center gap-1 w-full hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Profit
                    {sortProfit === "asc" && <ArrowUp className="h-4 w-4" />}
                    {sortProfit === "desc" && <ArrowDown className="h-4 w-4" />}
                    {!sortProfit && (
                      <ArrowUpDown className="h-4 w-4 opacity-60" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Landing Ad</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedProducts.map((p) => {
                const profit =
                  typeof p.actualCost === "number"
                    ? p.price - p.actualCost
                    : null;

                return (
                  <TableRow
                    key={p._id}
                    className="text-sm text-center border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    {/* IMAGE */}
                    <TableCell>
                      <img
                        src={p.images?.[0] || "/placeholder.png"}
                        className="w-12 h-12 object-cover rounded mx-auto border border-gray-200 dark:border-gray-700"
                        alt={p.title}
                      />
                    </TableCell>

                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell className="capitalize">{p.category}</TableCell>

                    <TableCell className="text-gray-500 dark:text-gray-400">
                      {p.mrp ? `₹${p.mrp}` : "-"}
                    </TableCell>

                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      ₹{p.price}
                    </TableCell>

                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {p.actualCost ? `₹${p.actualCost}` : "-"}
                    </TableCell>

                    {/* PROFIT */}
                    <TableCell
                      className={`font-semibold ${
                        profit === null
                          ? "text-gray-400 dark:text-gray-500"
                          : profit >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {profit === null ? "-" : `₹${profit}`}
                    </TableCell>

                    {/* STOCK */}
                    <TableCell>
                      {typeof p.stock === "number" ? (
                        p.stock === 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            ● Out of Stock
                          </span>
                        ) : p.stock <= 5 ? (
                          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                            ● Low ({p.stock})
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            ● {p.stock}
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* LANDING AD TOGGLE */}
                    <TableCell>
                      <button
                        onClick={() => toggleFeatured(p._id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-1 mx-auto ${
                          p.isFeatured
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700 hover:scale-105 shadow-sm"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                      >
                        {p.isFeatured ? "★ Active Ad" : "+ Run Ad"}
                      </button>
                    </TableCell>


                    {/* ACTIONS */}
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Link href={`/admin/products/${p._id}`}>
                          <Button
                            size="sm"
                            variant="default"
                            className="w-16 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Edit
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-16"
                          onClick={() => deleteProduct(p._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center py-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="cursor-pointer"
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
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}