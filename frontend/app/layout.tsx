import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import AppShell from "@/components/appShell";
import { CartProvider } from "../app/context/CartContext";
import { CurrencyProvider } from "../app/context/CurrencyContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IONYX | Certified Fast Chargers, Power Banks & Pro Audio",
    template: "%s | IONYX Store",
  },
  description:
    "Shop certified high-speed MagSafe power banks, 240W USB-C fast charging cables, noise-canceling pro audio gear, and authentic electronics with express delivery and official warranty.",
  keywords: [
    "power bank",
    "fast charger",
    "magsafe power bank",
    "240w usb c cable",
    "wireless earphones",
    "noise canceling headphones",
    "ionyx electronics",
    "buy electronics online",
  ],
  authors: [{ name: "IONYX Electronics" }],
  metadataBase: new URL("https://shopit-lilac-rho.vercel.app"),
  openGraph: {
    title: "IONYX | Certified Fast Chargers, Power Banks & Pro Audio",
    description:
      "Shop certified high-speed MagSafe power banks, fast charging cables, and pro audio gear with express delivery and official warranty.",
    url: "https://shopit-lilac-rho.vercel.app",
    siteName: "IONYX Store",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IONYX | Certified Electronics & Fast Power Tech",
    description:
      "High-speed power banks, fast chargers, and pro-grade audio gear.",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-background text-foreground"
    >
      <head>
        {/* ✅ PREVENT WHITE FLASH (CRITICAL) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const theme = localStorage.getItem("theme");
                  if (
                    theme === "dark" ||
                    (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
                  ) {
                    document.documentElement.classList.add("dark");
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>

      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* ✅ Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

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

        <CartProvider>
          <CurrencyProvider>
            <AppShell>{children}</AppShell>
            <Analytics />
            <SpeedInsights />
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
