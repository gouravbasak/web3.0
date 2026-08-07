// components/ProductPurchaseOptions.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type VariantOption = {
  name: string;
  values: string[];
};

type VariantPricing = {
  combination: string[];
  price: number;
  stock: number;
  sku: string;
};

type Props = {
  stock: number;
  basePrice: number;
  variants?: VariantOption[];
  variantPricing?: VariantPricing[];
  onChange: (data: {
    selectedOptions: Record<string, string>;
    quantity: number;
    currentPrice: number;
    sku?: string;
  }) => void;
};

export default function ProductPurchaseOptions({
  stock,
  basePrice,
  variants = [],
  variantPricing = [],
  onChange,
}: Props) {
  // Initialize default selected options with the first value of each variant
  const initialSelected = useMemo(() => {
    const initial: Record<string, string> = {};
    variants.forEach((v) => {
      if (v.values && v.values.length > 0) {
        initial[v.name] = v.values[0];
      }
    });
    return initial;
  }, [variants]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialSelected);
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update selectedOptions if initialSelected changes and selectedOptions is empty
  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0 && Object.keys(initialSelected).length > 0) {
      setSelectedOptions(initialSelected);
    }
  }, [initialSelected, selectedOptions]);

  const getRandomStockMessage = useCallback(() => {
    const messages = [
      "Only 3 left in stock",
      "Hurry! Only 2 left",
      "Almost gone! 1 left",
      "Low stock: 4 remaining",
      "Few left: 5 available",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const defaultViewersCount = 28;
  const defaultSoldToday = 15;
  const defaultScarcityProgress = 75;

  const [clientValues, setClientValues] = useState({
    viewersCount: defaultViewersCount,
    soldToday: defaultSoldToday,
    scarcityProgress: defaultScarcityProgress,
    stockMessage: "Only 3 left in stock",
  });

  useEffect(() => {
    setClientValues({
      viewersCount: Math.floor(Math.random() * (45 - 12 + 1)) + 12,
      soldToday: Math.floor(Math.random() * (30 - 8 + 1)) + 8,
      scarcityProgress: Math.floor(Math.random() * (95 - 60 + 1)) + 60,
      stockMessage: getRandomStockMessage(),
    });
  }, [getRandomStockMessage]);

  const viewersCount = isClient ? clientValues.viewersCount : defaultViewersCount;
  const soldToday = isClient ? clientValues.soldToday : defaultSoldToday;
  const scarcityProgress = isClient ? clientValues.scarcityProgress : defaultScarcityProgress;
  const stockMessage = isClient ? clientValues.stockMessage : "Only 3 left in stock";

  /* BULLETPROOF UNIVERSAL MULTI-VARIANT PRICE RESOLVER */
  const currentPricing = useMemo(() => {
    if (variants.length === 0 || variantPricing.length === 0) {
      return { price: basePrice, sku: "" };
    }

    const currentCombination = variants.map((v) =>
      (selectedOptions[v.name] || (v.values && v.values[0]) || "").toString().trim().toLowerCase()
    );

    // 1️⃣ Priority 1: Strict Exact or Alphanumeric Match across all variant dimensions
    let matchingPricing = variantPricing.find((p) => {
      if (!p.combination || p.combination.length === 0) return false;

      return p.combination.every((val, idx) => {
        const valClean = (val || "").toString().trim().toLowerCase();
        const curClean = currentCombination[idx] || "";
        return (
          valClean === curClean ||
          valClean.replace(/[^a-z0-9]/g, "") === curClean.replace(/[^a-z0-9]/g, "")
        );
      });
    });

    // 2️⃣ Priority 2: Universal N-Dimensional Cartesian Index Fallback
    if (!matchingPricing) {
      let cartesianIndex = 0;
      let multiplier = 1;
      let validIndices = true;

      for (let i = variants.length - 1; i >= 0; i--) {
        const v = variants[i];
        if (!v.values || v.values.length === 0) {
          validIndices = false;
          break;
        }
        const selVal = selectedOptions[v.name] || v.values[0];
        const idx = v.values.indexOf(selVal);
        if (idx !== -1) {
          cartesianIndex += idx * multiplier;
          multiplier *= v.values.length;
        } else {
          validIndices = false;
          break;
        }
      }

      if (validIndices && variantPricing[cartesianIndex]) {
        matchingPricing = variantPricing[cartesianIndex];
      }
    }

    if (matchingPricing && typeof matchingPricing.price === "number" && matchingPricing.price > 0) {
      return {
        price: matchingPricing.price,
        sku: matchingPricing.sku || "",
      };
    }

    return { price: basePrice, sku: "" };
  }, [selectedOptions, variants, variantPricing, basePrice]);

  /* EMIT PRICE & OPTION CHANGES TO PARENT */
  useEffect(() => {
    onChange({
      selectedOptions,
      quantity,
      currentPrice: currentPricing.price,
      sku: currentPricing.sku,
    });
  }, [currentPricing, quantity, selectedOptions, onChange]);

  const progressGradient = useMemo(() => {
    return scarcityProgress > 80
      ? "bg-gradient-to-r from-red-500 to-red-700"
      : scarcityProgress > 60
        ? "bg-gradient-to-r from-orange-400 to-red-500"
        : "bg-gradient-to-r from-yellow-400 to-orange-500";
  }, [scarcityProgress]);

  const handleOptionSelect = useCallback(
    (variantName: string, value: string) => {
      setSelectedOptions((prev) => ({
        ...prev,
        [variantName]: value,
      }));
    },
    [],
  );

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      setQuantity(newQuantity);
    },
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Urgency Stock Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>{stockMessage}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{viewersCount} people</span> viewing now
        </div>
      </div>

      {/* Dynamic Variants & Quantity Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Dynamic Variants Section */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {variants.map((variant) => (
              <div key={variant.name} className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select {variant.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variant.values.map((value) => {
                    const isSelected =
                      (selectedOptions[variant.name] || variant.values[0]) === value;

                    return (
                      <Button
                        key={value}
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleOptionSelect(variant.name, value)}
                        className={`min-w-[56px] text-xs font-bold rounded-xl ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                            : ""
                        }`}
                      >
                        {value}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Section */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quantity</p>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-slate-700 dark:text-slate-200"
              disabled={quantity <= 1}
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              −
            </Button>
            <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white">{quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-slate-700 dark:text-slate-200"
              disabled={quantity >= stock}
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Scarcity Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Selling fast!</span>
          <span className="font-bold text-orange-600 dark:text-orange-400">
            {scarcityProgress}% claimed
          </span>
        </div>
        <Progress
          value={scarcityProgress}
          className="h-1.5 rounded-full"
          indicatorClassName={`${progressGradient} transition-all duration-300`}
        />
        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          🔥 {soldToday} sold in the last 24 hours
        </div>
      </div>

    </div>
  );
}