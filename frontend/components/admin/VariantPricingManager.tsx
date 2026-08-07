// components/admin/VariantPricingManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

type Props = {
  variants: Variant[];
  basePrice: number;
  initialPricing?: VariantPricing[];
  onChange: (pricing: VariantPricing[]) => void;
};

export default function VariantPricingManager({ variants, basePrice, initialPricing = [], onChange }: Props) {
  const [pricing, setPricing] = useState<VariantPricing[]>([]);

  // Generate all possible combinations
  const generateCombinations = (variants: Variant[]): string[][] => {
    if (variants.length === 0) return [];
    
    // Start with the values of the first variant
    let combinations: string[][] = variants[0].values.map(v => [v]);
    
    // For each subsequent variant, combine with existing combinations
    for (let i = 1; i < variants.length; i++) {
      const newCombinations: string[][] = [];
      for (const combo of combinations) {
        for (const value of variants[i].values) {
          newCombinations.push([...combo, value]);
        }
      }
      combinations = newCombinations;
    }
    
    return combinations;
  };

  // Initialize or update pricing when variants change
  useEffect(() => {
    if (variants.length === 0) {
      setPricing([]);
      onChange([]);
      return;
    }

    // If we have initial pricing and variants match, use it
    if (initialPricing.length > 0) {
      // Check if the number of combinations matches
      const expectedCount = variants.reduce((acc, v) => acc * v.values.length, 1);
      
      if (initialPricing.length === expectedCount) {
        setPricing(initialPricing);
        return;
      }
    }

    // Generate new combinations
    const combinations = generateCombinations(variants);
    const newPricing = combinations.map(combo => {
      // Try to find matching initial pricing by combination
      const existing = initialPricing.find(p => 
        JSON.stringify(p.combination) === JSON.stringify(combo)
      );
      
      return {
        combination: combo,
        price: existing?.price ?? basePrice,
        stock: existing?.stock ?? 0,
        sku: existing?.sku ?? combo.join('-'),
      };
    });

    setPricing(newPricing);
    onChange(newPricing);
  }, [variants, basePrice]);

  const updatePricing = (index: number, field: keyof VariantPricing, value: any) => {
    const updated = [...pricing];
    updated[index] = { ...updated[index], [field]: value };
    setPricing(updated);
    onChange(updated);
  };

  if (variants.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">No variants added yet</p>
        <p className="text-xs mt-1">Add variants in General tab to configure pricing</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Variant Combinations</h3>
        <Badge variant="outline">{pricing.length} combinations</Badge>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {variants.map(v => (
                <TableHead key={v.name} className="text-xs whitespace-nowrap">{v.name}</TableHead>
              ))}
              <TableHead className="text-xs whitespace-nowrap">Price (₹)</TableHead>
              <TableHead className="text-xs whitespace-nowrap">Stock</TableHead>
              <TableHead className="text-xs whitespace-nowrap">SKU</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.map((item, index) => (
              <TableRow key={index}>
                {item.combination.map((value, i) => (
                  <TableCell key={i} className="text-sm whitespace-nowrap">{value}</TableCell>
                ))}
                <TableCell>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updatePricing(index, 'price', Number(e.target.value))}
                    className="h-8 w-24 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.stock}
                    onChange={(e) => updatePricing(index, 'stock', Number(e.target.value))}
                    className="h-8 w-20 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.sku}
                    onChange={(e) => updatePricing(index, 'sku', e.target.value)}
                    className="h-8 w-28 text-sm"
                    placeholder="SKU"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}