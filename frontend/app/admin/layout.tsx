// app/admin/layout.tsx - With dark mode & auth protection guard
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Skip auth check for login page itself
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      setIsAuthenticated(true);
      return;
    }

    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken") || "";
        const res = await fetch(`${API}/api/admin/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.admin) {
            setAdminName(data.admin.name || data.admin.email || "Admin");
            setIsAuthenticated(true);
            setCheckingAuth(false);
            return;
          }
        }
      } catch (err) {
        console.error("Admin auth check failed:", err);
      }

      // Not authenticated -> redirect to admin login
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setIsAuthenticated(false);
      setCheckingAuth(false);
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    };

    verifyAdmin();
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg animate-pulse">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          Verifying Admin Authorization...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.replace("/admin/login");
  };

  const linkClass = (path: string) =>
    `flex items-center gap-3 p-2 rounded transition ${
      pathname === path
        ? "bg-gray-800 dark:bg-gray-700 text-white"
        : "text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black dark:bg-gray-900 text-white dark:text-gray-200 hidden md:flex flex-col pb-6 border-r border-gray-800 dark:border-gray-800">
        <div className="p-5 border-b border-gray-800 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link href="/admin" className={linkClass("/admin")}>
            <img src="/dashboard.png" alt="" className="w-4 h-4 invert dark:invert-0" />
            Dashboard
          </Link>

          <Link href="/admin/products" className={linkClass("/admin/products")}>
            <img src="/products.png" alt="" className="w-4 h-4 invert dark:invert-0" />
            Products
          </Link>

          <Link href="/admin/orders" className={linkClass("/admin/orders")}>
            <img src="/orders.png" alt="" className="w-4 h-4 invert dark:invert-0" />
            Orders
          </Link>

          <Link href="/admin/inventory" className={linkClass("/admin/inventory")}>
            <img src="/inventory.png" alt="" className="w-4 h-4 invert dark:invert-0" />
            Inventory
          </Link>
        </nav>

        <div className="border-t border-gray-800 p-4">
          <div className="text-xs text-gray-400 mb-1">Logged in as</div>
          <div className="text-sm font-medium mb-3 truncate">{adminName}</div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-bold"
          >
            <img src="/logout.png" alt="" className="w-4 h-4 invert dark:invert-0" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">{children}</main>
    </div>
  );
}