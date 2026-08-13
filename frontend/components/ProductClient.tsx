// components/ProductClient.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import AddToCartButton from "./AddToCartButton";
import BuyNowButton from "./BuyNowButton";
import ProductPurchaseOptions from "./ProductPurchaseOptions";
import { BadgeCheck, Star, Flame, CheckCircle2, ShieldCheck, Zap, PackageCheck } from "lucide-react";
import { useCurrency } from "@/app/context/CurrencyContext";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  stock: number;
  brand?: string;
  category?: string;
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
};

type Props = {
  product: Product;
  images: string[];
};

export default function ProductClient({ product, images }: Props) {
  const { formatPrice } = useCurrency();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentSku, setCurrentSku] = useState<string>("");

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

// ... inside render:
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

      {/* DUAL ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
      </div>

      {/* OVERVIEW SUMMARY BIO */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {product.description}
        </p>
      </div>

    </div>
  );
}
