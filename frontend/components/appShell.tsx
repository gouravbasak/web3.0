"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import PromoBar from "@/components/promoBar";
import Footer from "@/components/footer";

type Props = {
  children: React.ReactNode;
};

// Routes where customer chrome should be hidden
const HIDDEN_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
];

export default function AppShell({ children }: Props) {
  const pathname = usePathname();

  const hideChrome =
    HIDDEN_ROUTES.includes(pathname) ||
    pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col justify-between">
      <div>
        {!hideChrome && (
          <>
            <Navbar />
            <PromoBar />
          </>
        )}

        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      {!hideChrome && <Footer />}
    </div>
  );
}
