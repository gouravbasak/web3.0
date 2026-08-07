"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import {
  Search,
  Grid3X3,
  LayoutGrid,
  List,
  Sparkles,
  X,
  RotateCcw,
  ShoppingBag,
  ArrowUpDown,
  Filter,
  Star,
  Heart,
  BadgeCheck,
  Zap,
  ShieldCheck,
  Truck,
  Scale,
  ArrowRight,
  SlidersHorizontal,
  Check
} from "lucide-react";

type Variant = {
  name: string;
  values: string[];
};

type VariantPricing = {
  combination: string[];
  price: number;
  stock: number;
  sku: string;
};

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  actualCost?: number;
  brand: string;
  category: string;
  images?: string[];
  stock?: number;
  soldCount?: number;
  averageRating?: number;
  reviewCount?: number;
  variants?: Variant[];
  variantPricing?: VariantPricing[];
  createdAt?: string;
};

/* ================= CATEGORY METADATA ================= */
const CATEGORY_ICONS: Record<string, string> = {
  All: "⚡",
  Powerbank: "🔋",
  Cricket: "🏏",
  Football: "⚽",
  Badminton: "🏸",
  Footwear: "👟",
  Fitness: "🏋️",
  Tennis: "🎾",
};

function EnterpriseProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("q") || searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "featured";
  const categoryParam = searchParams.get("category") || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Layout States
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortBy, setSortBy] = useState(sortParam);
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid4" | "grid3" | "list">("grid4");

  // Enterprise Interactive States
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [compareItems, setCompareItems] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [hoveredProductImage, setHoveredProductImage] = useState<Record<string, number>>({});

  const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const params = new URLSearchParams();
      if (queryParam) params.append("search", queryParam);
      if (sortParam) params.append("sort", sortParam);

      const url = `${API}/api/products${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [queryParam, sortParam, API]);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  /* ---------------- DYNAMIC BRANDS & CATEGORIES ---------------- */
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  /* ---------------- DYNAMIC FILTERING & SORTING ---------------- */
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // 2. Category
    if (selectedCategory && selectedCategory !== "All") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Brand
    if (selectedBrand && selectedBrand !== "All") {
      list = list.filter(
        (p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // 4. In Stock Filter
    if (inStockOnly) {
      list = list.filter((p) => typeof p.stock === "number" && p.stock > 0);
    }

    // 5. Price Preset
    if (pricePreset === "under2000") {
      list = list.filter((p) => p.price < 2000);
    } else if (pricePreset === "2000-4000") {
      list = list.filter((p) => p.price >= 2000 && p.price <= 4000);
    } else if (pricePreset === "above4000") {
      list = list.filter((p) => p.price > 4000);
    }

    // 6. Sorting
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedBrand, pricePreset, inStockOnly, sortBy]);

  // Wishlist Toggle
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compare Toggle
  const toggleCompare = (product: Product) => {
    if (compareItems.some((item) => item._id === product._id)) {
      setCompareItems((prev) => prev.filter((item) => item._id !== product._id));
    } else {
      if (compareItems.length >= 3) {
        alert("You can compare up to 3 products at a time.");
        return;
      }
      setCompareItems((prev) => [...prev, product]);
    }
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setSortBy("featured");
    setPricePreset("all");
    setInStockOnly(false);
    router.push("/products");
  };

  // Featured Spotlight Product (Top rating or most sold)
  const spotlightProduct = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))[0];
  }, [products]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors pb-24">
      {/* ================= APPLE/SAMSUNG ENTERPRISE HERO ================= */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white pt-12 pb-16 px-4 sm:px-6 lg:px-12 border-b border-slate-200/80 dark:border-emerald-950/40 transition-colors duration-300">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* HERO LEFT TEXT & SEARCH */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-widest shadow-sm backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Enterprise Store Showcase
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Engineered for <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-slate-900 dark:from-emerald-400 dark:via-teal-300 dark:to-white bg-clip-text text-transparent">
                  Next Generation
                </span>
              </h1>

              <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base max-w-lg leading-relaxed">
                Explore pro-grade equipment, solid-state powerbanks, and authentic gear designed for uncompromised performance.
              </p>

              {/* SEARCH BAR */}
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, models..."
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-xl transition shadow-sm dark:shadow-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/20 text-slate-400 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* HERO RIGHT FEATURED SPOTLIGHT CARD */}
            {spotlightProduct && (
              <div className="lg:col-span-5">
                <div className="relative group p-6 rounded-3xl bg-white dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 shadow-xl dark:shadow-2xl hover:border-emerald-500/40 transition duration-500">
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Featured Flagship
                  </div>

                  <div className="w-full h-52 rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-zinc-900/60">
                    <img
                      src={spotlightProduct.images?.[0] || "/placeholder.png"}
                      alt={spotlightProduct.title}
                      className="w-full h-full object-cover transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-300 font-semibold mb-1">
                    <span>{spotlightProduct.brand}</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {spotlightProduct.averageRating || 4.8}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {spotlightProduct.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {spotlightProduct.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
                    <div>
                      <span className="text-xs text-slate-400 block">Starting at</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{spotlightProduct.price?.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Link
                      href={`/products/${spotlightProduct._id}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 dark:bg-white text-white dark:text-zinc-950 hover:bg-emerald-700 dark:hover:bg-emerald-50 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md"
                    >
                      Explore Specs <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= APPLE-STYLE STORE CATEGORY BAR ================= */}
      <section className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-zinc-800/80 shadow-sm transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-x-auto py-3.5 scrollbar-none">
            {categories.map((cat) => {
              const icon = CATEGORY_ICONS[cat] || "🏷️";
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md shadow-zinc-900/10 scale-105"
                      : "bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200/60 dark:border-zinc-800"
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= MAIN STORE & FILTER SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* TOP FILTER CONTROLS BAR */}
        <div className="bg-white dark:bg-zinc-900/90 border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* LEFT FILTER DROPDOWNS */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              
              {/* BRAND FILTER */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700">
                <span className="text-gray-500 dark:text-zinc-400">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {brands.map((b) => (
                    <option key={b} value={b} className="dark:bg-zinc-900">{b}</option>
                  ))}
                </select>
              </div>

              {/* PRICE FILTER */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700">
                <span className="text-gray-500 dark:text-zinc-400">Price:</span>
                <select
                  value={pricePreset}
                  onChange={(e) => setPricePreset(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="dark:bg-zinc-900">All Prices</option>
                  <option value="under2000" className="dark:bg-zinc-900">Under ₹2,000</option>
                  <option value="2000-4000" className="dark:bg-zinc-900">₹2,000 - ₹4,000</option>
                  <option value="above4000" className="dark:bg-zinc-900">Above ₹4,000</option>
                </select>
              </div>

              {/* IN STOCK TOGGLE */}
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                  inStockOnly
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${inStockOnly ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-400"}`}>
                  {inStockOnly && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                In Stock Only
              </button>
            </div>

            {/* RIGHT SORT & VIEW CONTROLS */}
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
              
              {/* SORT DROPDOWN */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700">
                <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="dark:bg-zinc-900">Featured</option>
                  <option value="price_asc" className="dark:bg-zinc-900">Price: Low to High</option>
                  <option value="price_desc" className="dark:bg-zinc-900">Price: High to Low</option>
                  <option value="popular" className="dark:bg-zinc-900">Most Popular 🔥</option>
                  <option value="rating" className="dark:bg-zinc-900">Top Rated ⭐</option>
                  <option value="newest" className="dark:bg-zinc-900">Newest Arrivals ⚡</option>
                </select>
              </div>

              {/* VIEW SWITCHER */}
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
                <button
                  onClick={() => setViewMode("grid4")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid4"
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="4 Column Grid"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid3")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid3"
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="3 Column Grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Compact List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

          {/* ACTIVE FILTER PILLS */}
          {(searchQuery || selectedCategory !== "All" || selectedBrand !== "All" || pricePreset !== "all" || inStockOnly) && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
              <span className="text-gray-500 font-semibold">Active Filters ({filteredProducts.length} items):</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                  &quot;{searchQuery}&quot; <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                  {selectedCategory} <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("All")} />
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                  Brand: {selectedBrand} <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrand("All")} />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="ml-auto text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* ================= PRODUCT DISPLAY GRID ================= */}
        {loading ? (
          /* SKELETON LOADERS */
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-4 space-y-4 animate-pulse">
                <div className="w-full h-56 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* EMPTY STATE */
          <div className="border border-gray-200 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 p-12 text-center max-w-lg mx-auto shadow-xl my-12">
            <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Products Found</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
              We couldn&apos;t find any items matching your selected filters or search terms. Try clearing active filters to see all available products.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:scale-105"
            >
              <RotateCcw className="h-4 w-4" /> Reset All Filters
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* COMPACT LIST VIEW */
          <div className="space-y-4">
            {filteredProducts.map((p) => {
              const outOfStock = typeof p.stock === "number" && p.stock <= 0;
              const isComparing = compareItems.some((item) => item._id === p._id);
              return (
                <div
                  key={p._id}
                  className="group bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-xl transition duration-300"
                >
                  <Link href={`/products/${p._id}`} className="w-full sm:w-48 h-44 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800/50">
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </Link>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {p.brand} • {p.category}
                      </span>
                      {Boolean(p.averageRating && p.averageRating > 0) && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span>{p.averageRating?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/products/${p._id}`}>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                        {p.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2">
                      {p.description}
                    </p>

                    {/* VARIANTS BADGES */}
                    {p.variants && p.variants.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Options:</span>
                        {p.variants[0].values.slice(0, 4).map((val) => (
                          <span key={val} className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 rounded font-mono">
                            {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-48 shrink-0 flex flex-col items-end gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800">
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        ₹{p.price?.toLocaleString("en-IN")}
                      </div>
                      {p.mrp && p.mrp > p.price && (
                        <div className="text-xs text-gray-400 line-through">
                          ₹{p.mrp.toLocaleString("en-IN")} (Save ₹{(p.mrp - p.price).toLocaleString("en-IN")})
                        </div>
                      )}
                    </div>

                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={() => toggleCompare(p)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                          isComparing
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
                        }`}
                        title="Compare product"
                      >
                        <Scale className="h-4 w-4" />
                      </button>

                      <AddToCartButton
                        productId={p._id}
                        title={p.title}
                        price={p.price}
                        image={p.images?.[0]}
                        stock={p.stock}
                        quantity={1}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW (3 or 4 COLUMNS) */
          <div
            className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${
              viewMode === "grid4"
                ? "md:grid-cols-3 lg:grid-cols-4"
                : "md:grid-cols-3"
            }`}
          >
            {filteredProducts.map((p) => {
              const isWishlisted = !!wishlist[p._id];
              const isComparing = compareItems.some((item) => item._id === p._id);
              const discountPercent =
                p.mrp && p.mrp > p.price
                  ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                  : null;

              return (
                <div
                  key={p._id}
                  className="group relative bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  <div>
                    {/* IMAGE CONTAINER WITH HOVER ANIMATION */}
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800/40 mb-3">
                      <Link href={`/products/${p._id}`}>
                        <img
                          src={p.images?.[0] || "/placeholder.png"}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </Link>

                      {/* BADGES OVERLAY */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {discountPercent && (
                          <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-lg bg-red-600 text-white shadow-md">
                            {discountPercent}% OFF
                          </span>
                        )}
                        {p.soldCount && p.soldCount > 10 && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-lg bg-amber-500/90 text-white flex items-center gap-1 backdrop-blur-md shadow-md">
                            <BadgeCheck className="h-3 w-3" /> Best Seller
                          </span>
                        )}
                      </div>

                      {/* QUICK ACTION BUTTONS */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                        {/* WISHLIST BUTTON */}
                        <button
                          onClick={() => toggleWishlist(p._id)}
                          className="p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 text-gray-700 dark:text-zinc-300 hover:text-red-500 transition shadow-md"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isWishlisted ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>

                        {/* COMPARE BUTTON */}
                        <button
                          onClick={() => toggleCompare(p)}
                          className={`p-2 rounded-full backdrop-blur-md border text-xs font-semibold transition shadow-md ${
                            isComparing
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white/80 dark:bg-zinc-900/80 border-gray-200/50 dark:border-zinc-700/50 text-gray-700 dark:text-zinc-300 hover:text-indigo-600"
                          }`}
                          title="Add to comparison"
                        >
                          <Scale className="h-4 w-4" />
                        </button>
                      </div>

                      {/* OUT OF STOCK OVERLAY */}
                      {p.stock !== undefined && p.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                          <span className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-xl">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* BRAND & CATEGORY */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-1">
                      <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {p.brand || "Brand"}
                      </span>
                      <span className="capitalize">{p.category || "Gear"}</span>
                    </div>

                    {/* TITLE */}
                    <Link href={`/products/${p._id}`}>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
                        {p.title}
                      </h3>
                    </Link>

                    {/* RATING */}
                    {p.averageRating && p.averageRating > 0 ? (
                      <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-amber-500">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="ml-1 text-gray-900 dark:text-zinc-200">
                            {p.averageRating.toFixed(1)}
                          </span>
                        </div>
                        {p.reviewCount && (
                          <span className="text-gray-400 font-normal">
                            ({p.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* DESCRIPTION */}
                    <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2 mb-3 min-h-[2rem]">
                      {p.description}
                    </p>
                  </div>

                  {/* BOTTOM PRICE & BUY ACTION */}
                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        ₹{p.price?.toLocaleString("en-IN")}
                      </span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{p.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <AddToCartButton
                      productId={p._id}
                      title={p.title}
                      price={p.price}
                      image={p.images?.[0]}
                      stock={p.stock}
                      quantity={1}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= APPLE/SAMSUNG DYNAMIC FLOATING COMPARE DOCK ================= */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-2xl text-white dark:text-zinc-950 px-6 py-3.5 rounded-full shadow-2xl border border-white/20 dark:border-zinc-800 flex items-center gap-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-400 dark:text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Comparing ({compareItems.length}/3)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {compareItems.map((item) => (
              <div key={item._id} className="relative w-8 h-8 rounded-full overflow-hidden border border-white/30">
                <img src={item.images?.[0] || "/placeholder.png"} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleCompare(item)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCompareModal(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold px-4 py-2 rounded-full transition shadow-md"
          >
            Compare Now
          </button>

          <button
            onClick={() => setCompareItems([])}
            className="text-xs text-gray-400 hover:text-white dark:hover:text-zinc-950 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* ================= PRODUCT COMPARISON MODAL ================= */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Scale className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Product Comparison
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-zinc-800">
              {compareItems.map((item) => (
                <div key={item._id} className="pt-4 sm:pt-0 sm:px-4 space-y-4">
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
                    <img src={item.images?.[0] || "/placeholder.png"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">{item.brand}</span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  <div className="text-xl font-black text-gray-900 dark:text-white">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-500">Rating:</span>
                      <span className="font-semibold text-amber-500">⭐ {item.averageRating || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-500">Stock Status:</span>
                      <span className="font-semibold text-emerald-600">{item.stock && item.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                    </div>
                  </div>
                  <AddToCartButton
                    productId={item._id}
                    title={item.title}
                    price={item.price}
                    image={item.images?.[0]}
                    stock={item.stock}
                    quantity={1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= APPLE/SAMSUNG TRUST FOOTER BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 rounded-3xl bg-white dark:bg-zinc-900/90 border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Free Express Shipping</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">On all orders over ₹4,999</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">100% Genuine Guarantee</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Directly from official brands</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">7-Day Replacement</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Instant hassle-free exchanges</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Secure Encrypted Checkout</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Razorpay 256-bit SSL Security</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default function EnterpriseProductList() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-12 text-center text-sm text-gray-500">Loading catalog...</div>}>
      <EnterpriseProductListContent />
    </Suspense>
  );
}
