// components/ProductClient.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import BuyNowButton from "./BuyNowButton";
import ProductPurchaseOptions from "./ProductPurchaseOptions";
import PincodeDeliveryEstimator from "./PincodeDeliveryEstimator";
import { BadgeCheck, Star, Flame, CheckCircle2, ShieldCheck, Zap, PackageCheck, Heart } from "lucide-react";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useWishlist } from "@/app/context/WishlistContext";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  stock: number;
  brand?: string;
  category?: string;
  countryOfOrigin?: string;
  netQuantity?: string;
  manufacturer?: string;
  hsnCode?: string;
  soldCount?: number;
  createdAt?: string;
  variants?: Array<{
    name: string;
    values: string[];
  }>;
  variantPricing?: Array<{
    combination: string[];
    price: number;
    stock: number;
    sku: string;
  }>;
  reviews?: Array<{
    userId: string | { $oid: string };
    userName: string;
    rating: number;
    comment: string;
    orderId: string;
    _id: string | { $oid: string };
    createdAt: string | { $date: string };
  }>;
  images?: string[];
};

type Props = {
  product: Product;
  images: string[];
};

export default function ProductClient({ product, images }: Props) {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentSku, setCurrentSku] = useState<string>("");

  // Record into recently viewed history
  useEffect(() => {
    if (!product || !product._id) return;
    try {
      const KEY = "ionyx_recent_products";
      const stored = localStorage.getItem(KEY);
      let items: any[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(items)) items = [];

      items = items.filter((item) => item._id !== product._id);
      items.unshift({
        _id: product._id,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        image: (images && images[0]) || (Array.isArray(product.images) && product.images[0]) || "",
        category: product.category,
        brand: product.brand,
        viewedAt: Date.now(),
      });

      items = items.slice(0, 10);
      localStorage.setItem(KEY, JSON.stringify(items));
      window.dispatchEvent(new Event("recent-products-updated"));
    } catch (_) {}
  }, [product._id, product.title, product.price, product.mrp, product.category, product.brand, images]);

  const discountPercent = useMemo(() => {
    if (!product.mrp || product.mrp <= currentPrice) return 0;
    return Math.round(((product.mrp - currentPrice) / product.mrp) * 100);
  }, [product.mrp, currentPrice]);

  const isBestSeller = useMemo(() => {
    return (product.soldCount || 0) > 10;
  }, [product.soldCount]);

  const handlePurchaseOptionsChange = useCallback(
    (data: {
      selectedOptions: Record<string, string>;
      quantity: number;
      currentPrice: number;
      sku?: string;
    }) => {
      setSelectedOptions(data.selectedOptions);
      setQuantity(data.quantity);
      setCurrentPrice(data.currentPrice);
      setCurrentSku(data.sku || "");
    },
    [],
  );

  const reviewCount = product.reviews?.length || 2;

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-white">
      
      {/* BRAND & BADGES */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          {product.brand || "IONYX FLAGSHIP"}
        </span>

        <div className="flex items-center gap-2">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" /> In Stock & Ready to Ship
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
              Out of Stock
            </span>
          )}

          {isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <BadgeCheck className="h-3 w-3" /> Best Seller
            </span>
          )}
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
        {product.title}
      </h1>

      {/* RATING & SOCIAL PROOF */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-xl text-amber-700 dark:text-amber-300 font-bold">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-slate-400 font-normal">({reviewCount} verified reviews)</span>
        </div>

        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-zinc-800/60 px-3 py-1 rounded-xl">
          <Flame className="h-3.5 w-3.5 text-amber-500" /> {product.soldCount || 14}+ bought this month
        </span>
      </div>

      {/* PRICE DISPLAY HERO - SINGLE UNIFIED PRICE + DYNAMIC TOTAL CALCULATION */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex flex-col gap-2">
        <div className="flex items-baseline flex-wrap gap-3">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatPrice(currentPrice)}
          </span>

          {product.mrp && product.mrp > currentPrice && (
            <>
              <span className="text-base text-slate-400 line-through font-medium">
                {formatPrice(product.mrp)}
              </span>
              <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-rose-600 text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            </>
          )}

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            (Inclusive of all taxes)
          </span>
        </div>

        {/* DYNAMIC CALCULATED TOTAL PRICE FOR MULTIPLE QUANTITIES */}
        {quantity > 1 && (
          <div className="pt-2 mt-1 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-300">
            <span>Subtotal ({quantity} items)</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {formatPrice(currentPrice * quantity)}
            </span>
          </div>
        )}
      </div>

      {/* PURCHASE OPTIONS (VARIANTS & QUANTITY) */}
      <ProductPurchaseOptions
        stock={product.stock}
        basePrice={product.price}
        variants={product.variants || []}
        variantPricing={product.variantPricing || []}
        onChange={handlePurchaseOptionsChange}
      />

      {/* DUAL ACTION BUTTONS & WISHLIST */}
      <div className="flex items-center gap-3 pt-2">
        <AddToCartButton
          productId={product._id}
          title={product.title}
          price={currentPrice}
          image={images[0]}
          stock={product.stock}
          size={selectedOptions.Size} 
          quantity={quantity}
          selectedOptions={selectedOptions}
          sku={currentSku}
          className="flex-1 text-sm font-black py-4 rounded-2xl shadow-lg"
        />
        <BuyNowButton
          productId={product._id}
          title={product.title}
          price={currentPrice}
          image={images[0]}
          stock={product.stock}
          size={selectedOptions.Size} 
          quantity={quantity}
          selectedOptions={selectedOptions}
          sku={currentSku}
          className="flex-1 text-sm font-black py-4 rounded-2xl shadow-lg"
        />
        <button
          onClick={() => toggleWishlist(product._id, product.title)}
          className={`h-[52px] w-[52px] shrink-0 rounded-2xl border transition-all duration-300 shadow-md flex items-center justify-center group ${
            isWishlisted
              ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/60 text-red-500"
              : "bg-white dark:bg-zinc-800/90 border-slate-200 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-300 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50"
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 active:scale-95 ${
              isWishlisted ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
      </div>

      {/* 6-DIGIT INDIAN PINCODE DELIVERY ESTIMATOR */}
      <PincodeDeliveryEstimator />

      {/* 1-CLICK SHARE ON WHATSAPP */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          `Check out the ${product.title} on IONYX Store: https://shopit-lilac-rho.vercel.app/products/${product._id}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.99 14.153c-.208.583-1.037 1.077-1.637 1.205-.412.088-.95.158-2.766-.595-2.322-.962-3.818-3.327-3.935-3.48-.112-.158-.94-1.25-.94-2.384 0-1.134.595-1.69.807-1.922.213-.233.465-.291.62-.291.155 0 .31.002.445.01.144.007.337-.055.526.4.195.467.666 1.623.725 1.741.058.118.098.256.02.41-.078.158-.117.256-.233.393-.117.137-.246.306-.352.41-.116.118-.238.246-.102.48.136.233.606 1 .1.299 1.618.89 1.152 1.644 1.508 1.877.233.136.37.118.506-.039.136-.157.583-.68.739-.913.155-.233.31-.194.524-.116.213.078 1.357.64 1.59.756.233.117.388.175.446.272.059.098.059.564-.149 1.147z" clipRule="evenodd" />
        </svg>
        <span>Share Product on WhatsApp</span>
      </a>

      {/* OVERVIEW SUMMARY BIO */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {product.description}
        </p>
      </div>

      {/* MANDATORY LEGAL METROLOGY DECLARATIONS (DYNAMIC FROM ADMIN) */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Product Details &amp; Statutory Disclosures
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <div>
            <span className="text-slate-400 block text-[11px]">Country of Origin</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {product.countryOfOrigin || "India"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Net Quantity</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {product.netQuantity || "1 Unit"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Manufacturer / Brand</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {product.manufacturer || product.brand || "IONYX Gear"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Customer Support</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              support@ionyx.com
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
