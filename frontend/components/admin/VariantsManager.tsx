// components/admin/VariantsManager.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";

type Variant = {
  name: string;
  values: string[];
};

type Props = {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
};

export default function VariantsManager({ variants, onChange }: Props) {
  const [newVariantName, setNewVariantName] = useState("");

  const addVariant = () => {
    if (!newVariantName.trim()) return;
    
    const newVariant: Variant = {
      name: newVariantName.trim(),
      values: [],
    };
    
    onChange([...variants, newVariant]);
    setNewVariantName("");
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addValue = (variantIndex: number, value: string) => {
    if (!value.trim()) return;
    
    const updated = [...variants];
    if (!updated[variantIndex].values.includes(value.trim())) {
      updated[variantIndex].values.push(value.trim());
      onChange(updated);
    }
  };

  const removeValue = (variantIndex: number, valueIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].values = updated[variantIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Product Variants (Optional)</h3>
        <p className="text-xs text-muted-foreground">
          Add options like Color, Size, RAM, etc.
        </p>
      </div>

      {/* Add new variant */}
      <div className="flex gap-2">
        <Input
          placeholder="e.g., Color, Size, RAM"
          value={newVariantName}
          onChange={(e) => setNewVariantName(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addVariant();
            }
          }}
        />
        <Button onClick={addVariant} type="button" variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Variant
        </Button>
      </div>

      {/* Variants list */}
      {variants.length > 0 && (
        <div className="space-y-3 mt-4">
          {variants.map((variant, variantIndex) => (
            <div
              key={variantIndex}
              className="border rounded-lg p-4 bg-muted/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <span className="font-medium">{variant.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(variantIndex)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Values */}
              <div className="flex flex-wrap gap-2 mb-3">
                {variant.values.map((value, valueIndex) => (
                  <div
                    key={valueIndex}
                    className="flex items-center gap-1 bg-background border rounded-full px-3 py-1 text-sm"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => removeValue(variantIndex, valueIndex)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add value input */}
              <div className="flex gap-2">
                <Input
                  placeholder={`Add ${variant.name} value`}
                  className="flex-1 h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      addValue(variantIndex, e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      addValue(variantIndex, input.value);
                      input.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}