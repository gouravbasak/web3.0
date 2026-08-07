// app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { uploadImage } from "@/lib/uploadImage";
import VariantsManager from "@/components/admin/VariantsManager";
import VariantPricingManager from "@/components/admin/VariantPricingManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Save, Eye } from "lucide-react";
import { getApiBaseUrl, getAdminAuthHeaders } from "@/lib/apiBase";

const API = getApiBaseUrl();

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

export default function AdminNewProductPage() {
  const router = useRouter();

  // 🔹 IMAGE FILES
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // 🔹 PRODUCT FORM
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    actualCost: "",
    mrp: "",
    brand: "",
    category: "",
    stock: "",
    status: "available" as "available" | "unavailable",
  });

  // 🔹 VARIANTS
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantPricing, setVariantPricing] = useState<VariantPricing[]>([]);

  // 🔹 ACTIVE TAB
  const [activeTab, setActiveTab] = useState("general");

  // Calculate discount percentage
  const discountPercentage =
    form.mrp && form.price
      ? Math.round(
          ((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100,
        )
      : 0;

  const update = (key: string, val: string) => setForm({ ...form, [key]: val });

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const saveProduct = async () => {
    try {
      if (!form.title.trim()) {
        toast.error("Product name is required");
        return;
      }

      if (images.length === 0) {
        toast.error("Please select at least one image");
        return;
      }

      toast.loading("Uploading images...");

      const imageUrls: string[] = [];
      for (const file of images) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }

      toast.dismiss();
      toast.loading("Saving product...");

      const res = await fetch(`${API}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          images: imageUrls,
          price: Number(form.price),
          actualCost: Number(form.actualCost),
          mrp: Number(form.mrp),
          stock: Number(form.stock),
          variants: variants,
          variantPricing: variantPricing,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to save product");
      }

      toast.dismiss();
      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.dismiss();
      console.error(err);
      toast.error(err.message || "Upload failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={saveProduct}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Grid - More Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              {/* Product Name - Compact */}
              <Card className="p-4">
                <label className="text-sm font-medium block mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Product name"
                  className="w-full h-9"
                />
              </Card>

              {/* Status & Brand Row - Compact */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-muted-foreground">
                        Available for sale
                      </p>
                    </div>
                    <Switch
                      checked={form.status === "available"}
                      onCheckedChange={(checked) =>
                        setForm({
                          ...form,
                          status: checked ? "available" : "unavailable",
                        })
                      }
                    />
                  </div>
                </Card>

                <Card className="p-4">
                  <label className="text-sm font-medium block mb-1">
                    Brand
                  </label>
                  <Input
                    value={form.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="Brand name"
                    className="h-8"
                  />
                </Card>
              </div>

              {/* Category - Compact */}
              <Card className="p-4">
                <label className="text-sm font-medium block mb-1">
                  Category
                </label>
                <Input
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="e.g. Electronics > Headphones"
                  className="h-8"
                />
              </Card>

              {/* Price Section - Compact Grid */}
              <Card className="p-4">
                <p className="text-sm font-medium mb-2">Pricing</p>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">
                      Price
                    </label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="29.99"
                      className="h-8 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">
                      Actual Cost
                    </label>
                    <Input
                      type="number"
                      value={form.actualCost}
                      onChange={(e) => update("actualCost", e.target.value)}
                      placeholder="15.00"
                      className="h-8 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">MRP</label>
                    <Input
                      type="number"
                      value={form.mrp}
                      onChange={(e) => update("mrp", e.target.value)}
                      placeholder="49.99"
                      className="h-8 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">
                      Stock
                    </label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => update("stock", e.target.value)}
                      placeholder="100"
                      className="h-8 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">
                      Discount
                    </label>
                    <div className="h-8 mt-1 px-2 rounded-md border bg-muted flex items-center">
                      {discountPercentage > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 text-xs"
                        >
                          {discountPercentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description - Compact */}
              <Card className="p-4">
                <label className="text-sm font-medium block mb-1">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Short description highlighting key features"
                  rows={3}
                  className="resize-none"
                />
              </Card>

              {/* Variants Section - Compact */}
              <Card className="p-4">
                <VariantsManager variants={variants} onChange={setVariants} />
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
             <Card className="p-4">
    <VariantPricingManager
      variants={variants}
      basePrice={Number(form.price) || 0}
      onChange={setVariantPricing}
    />
  </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Images (Compact) */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Images</h3>

            {/* Image Grid - Smaller */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-0.5 left-0.5 bg-blue-600 text-[8px] px-1 py-0">
                        PRIMARY
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area - Compact */}
            <label
              htmlFor="product-images"
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50"
            >
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">Upload images</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Click to browse
              </span>
            </label>

            <input
              id="product-images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {imagePreviewUrls.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">
                {imagePreviewUrls.length} image(s). First is primary
              </p>
            )}
          </Card>

          {/* Preview Card - Minimal */}
          <Card className="p-4 bg-muted/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
