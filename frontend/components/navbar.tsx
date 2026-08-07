"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../app/context/CartContext";
import { useDarkMode } from "@/lib/useDarkMode";

/* ================= NAVBAR ================= */

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const { isDark, toggle } = useDarkMode();

  const productCount = cart.reduce((sum, item) => sum + item.qty, 0);

  /* ---------- SCROLL EFFECT ---------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------- AUTH REAL-TIME SYNCHRONIZATION ---------- */
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUserName(user.name || null);
        } catch (e) {
          setIsLoggedIn(false);
          setUserName(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    };

    // Initial check
    syncAuth();

    // Listen for storage events (cross-tab) & custom auth-change events
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  /* ---------- SEARCH DEBOUNCE ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (pathname !== "/products") return;

    if (debouncedSearch === "") {
      router.push("/products");
      return;
    }

    router.push(`/products?q=${encodeURIComponent(debouncedSearch)}`);
  }, [debouncedSearch, pathname, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?q=${encodeURIComponent(search.trim())}`);
    setSearchOpen(false);
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-lg border-b border-border/50 shadow-lg" 
          : "bg-background border-b border-border"
      }`}
    >
      <nav className="mx-auto flex max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        
        {/* LEFT - Logo as Text + All Products */}
        <div className="flex items-center gap-6">
          {/* Text Logo - Bold & Attractive */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hover:from-foreground/80 hover:to-foreground transition-all duration-300">
              IONYX
            </span>
          </Link>

          {/* All Products Link */}
          <Link 
            href="/products" 
            className={`hidden md:flex items-center px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
              pathname === "/products" 
                ? "bg-foreground text-background shadow-md" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            All Products
          </Link>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* SEARCH - Desktop */}
          <div className="hidden md:block">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-64 pl-11 pr-4 py-2.5 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all duration-300 group-hover:border-foreground/30"
              />
              <div className="absolute left-3 top-2.5 w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity">
                <img src="/search.png" alt="search" className="w-full h-full object-contain" />
              </div>
            </form>
          </div>

          {/* SEARCH - Mobile Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden h-11 w-11 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Search"
          >
            <img src="/search.png" alt="search" className="w-4 h-4" />
          </button>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={toggle}
            className="h-11 w-11 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            <img 
              src={isDark ? "/moon.png" : "/sun.png"} 
              alt={isDark ? "Dark mode" : "Light mode"} 
              className="w-4 h-4" 
            />
          </button>

          {/* USER / LOGIN */}
          {isLoggedIn ? (
            <>
              <button
                onClick={() => router.push("/profile")}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <div className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <img src="/user.png" alt="profile" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {userName?.split(' ')[0] || "Profile"}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="h-11 w-11 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
                aria-label="Logout"
              >
                <img src="/logout.png" alt="logout" className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-sm font-medium hover:bg-accent/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Login
            </button>
          )}

          {/* CART */}
          <button
            onClick={() => router.push("/cart")}
            className="relative h-11 w-11 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
            aria-label="Cart"
          >
            <img src="/trolley.png" alt="cart" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            {productCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center px-1 animate-bounce">
                {productCount > 9 ? '9+' : productCount}
              </span>
            )}
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-11 w-11 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Menu"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <span className={`block w-4 h-0.5 bg-foreground rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
              <span className={`block w-4 h-0.5 bg-foreground rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-4 h-0.5 bg-foreground rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* MOBILE SEARCH */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-5 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
              autoFocus
            />
            <div className="absolute left-3 top-3.5 w-5 h-5 opacity-60">
              <img src="/search.png" alt="search" className="w-full h-full object-contain" />
            </div>
          </form>
        </div>
      )}

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-card/90 backdrop-blur-lg animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 space-y-2">
            <Link 
              href="/products" 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                pathname === "/products" 
                  ? "bg-foreground text-background font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-sm">All Products</span>
            </Link>
            
            {!isLoggedIn && (
              <Link 
                href="/login" 
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img src="/user.png" alt="login" className="w-4 h-4" />
                <span className="text-sm">Login</span>
              </Link>
            )}
            
            {isLoggedIn && (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img src="/user.png" alt="profile" className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-300"
                >
                  <img src="/logout.png" alt="logout" className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}