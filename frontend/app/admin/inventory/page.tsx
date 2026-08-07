// app/admin/inventory/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type Product = {
  _id: string;
  title: string;
  price?: number;
  stock?: number;
  images?: string[];
  brand?: string;
  category?: string;
};
import { getApiBaseUrl, getAdminAuthHeaders } from "@/lib/apiBase";

const BACKEND = getApiBaseUrl();

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/products`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("Products fetch failed", res.status, body);
        throw new Error(body || `Failed to load products (${res.status})`);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error("Could not load products:", err);
      toast.error(err?.message || "Could not load products. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (id: string, delta: number) => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        body: JSON.stringify({ $incStock: delta }),
        credentials: "include", // send admin cookie if required
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Stock update failed", res.status, errBody);
        throw new Error(errBody?.message || `Update failed (${res.status})`);
      }
      toast.success("Stock updated");
      loadProducts();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not update stock");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(q.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(q.toLowerCase()),
  );

  const totalProducts = filtered.length;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const paginatedProducts = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Inventory{" "}
          <span className="text-sm font-normal text-gray-500">
            ({totalProducts} products)
          </span>
        </h1>

        <div className="flex gap-2">
          <input
  placeholder="Search products..."
  value={q}
  onChange={(e) => {
    setQ(e.target.value);
    setPage(1);
  }}
  className="border rounded px-3 py-2"
/>

          <button onClick={loadProducts} className="px-3 py-2 border rounded">
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-3">
          {paginatedProducts.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between border rounded p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={p.images?.[0] || "/placeholder.png"}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {p.brand} • {p.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm">
                  Stock: <span className="font-semibold">{p.stock ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustStock(p._id, -1)}
                    className="px-2 py-1 border rounded"
                  >
                    −
                  </button>
                  <button
                    onClick={() => adjustStock(p._id, +1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
                <Link
                  href={`/admin/products/${p._id}`}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-gray-500">No products found.</div>
          )}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
