// app/ClientLayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/appShell";          // your public shell (navbar, promo, cart)
import AdminLayout from "../app/admin/layout";    // your admin layout (sidebar only)
import { CartProvider } from "@/app/context/CartContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <Toaster
        position="bottom-right"
        containerStyle={{ bottom: 32, right: 24 }}
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "14px",
            background: "#18181b",
            color: "#ffffff",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            fontSize: "13px",
            fontWeight: "600",
            padding: "12px 18px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />
      {isAdmin ? (
        // Admin routes: render admin layout only (no AppShell)
        <AdminLayout>{children}</AdminLayout>
      ) : (
        // Public site: preserve AppShell + CartProvider
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      )}
    </>
  );
}
