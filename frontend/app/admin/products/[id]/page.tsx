// app/admin/products/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Upload, X, Save } from "lucide-react";
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

export default function EditProductPage({ params }: any) {
  const router = useRouter();

  const [productId, setProductId] = useState<string | null>(null);

  // 🔹 FORM
  const [form, setForm] = useState<any>(null);

  // 🔹 IMAGES
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // 🔹 VARIANTS
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantPricing, setVariantPricing] = useState<VariantPricing[]>([]);

  // 🔹 DRAG STATE
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // 🔹 ACTIVE TAB
  const [activeTab, setActiveTab] = useState("general");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate discount percentage
  const discountPercentage = form?.mrp && form?.price
    ? Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)
    : 0;

  // ---------------------------------------------------------
  // Unwrap params
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      const p = await params;
      setProductId(p.id);
    })();
  }, [params]);

  // ---------------------------------------------------------
  // Load product
  // ---------------------------------------------------------
  useEffect(() => {
    if (!productId) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/admin/products/${productId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || "Failed to load product");
        }

        const data = await res.json();

        setForm({
          title: data.title,
          description: data.description,
          price: data.price,
          actualCost: data.actualCost ?? "",
          mrp: data.mrp ?? "",
          brand: data.brand,
          category: data.category,
          stock: data.stock,
          status: data.status || "available",
        });

        setExistingImages(data.images || []);
        setVariants(data.variants || []);
        setVariantPricing(data.variantPricing || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  // Handle new image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle variant pricing changes
  const handleVariantPricingChange = useCallback((newPricing: VariantPricing[]) => {
    console.log("Variant pricing updated:", newPricing);
    setVariantPricing(newPricing);
  }, []);

  // Handle variants changes
  const handleVariantsChange = useCallback((newVariants: Variant[]) => {
    console.log("Variants updated:", newVariants);
    setVariants(newVariants);
  }, []);

  // ---------------------------------------------------------
  // SAVE PRODUCT
  // ---------------------------------------------------------
  const save = async () => {
    if (!productId) return;

    try {
      toast.loading("Updating product...");

      // Upload NEW images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      // FINAL IMAGE ORDER
      const finalImages = [...existingImages, ...uploadedUrls];

      // Prepare the payload
      const payload = {
        ...form,
        images: finalImages,
        price: Number(form.price),
        actualCost: form.actualCost !== "" ? Number(form.actualCost) : undefined,
        mrp: form.mrp !== "" ? Number(form.mrp) : undefined,
        stock: Number(form.stock),
        variants: variants,
        variantPricing: variantPricing,
      };

      console.log("Saving payload:", payload);

      const res = await fetch(`${API}/api/admin/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Update failed");
      }

      const response = await res.json();
      console.log("Save response:", response);

      toast.dismiss();
      toast.success("Product updated!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.dismiss();
      console.error(err);
      toast.error(err.message || "Update failed");
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!form) return <p>No product data</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">Update product details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Grid - Compact */}
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
                  placeholder="e.g. Natural Glow Face Moisturizer"
                  className="w-full h-9"
                />
              </Card>

              {/* Status & Brand Row - Compact */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-muted-foreground">Available for sale</p>
                    </div>
                    <Switch
                      checked={form.status === "available"}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, status: checked ? "available" : "unavailable" })
                      }
                    />
                  </div>
                </Card>

                <Card className="p-4">
                  <label className="text-sm font-medium block mb-1">Brand</label>
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
                <label className="text-sm font-medium block mb-1">Category</label>
                <Input
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="e.g. Electronics > Headphones"
                  className="h-8"
                />
              </Card>

              {/* Price Section - Compact Grid with Actual Cost */}
              <Card className="p-4">
                <p className="text-sm font-medium mb-2">Pricing</p>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">Price</label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="29.99"
                      className="h-8 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">Actual Cost</label>
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
                    <label className="text-xs text-muted-foreground">Stock</label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => update("stock", e.target.value)}
                      placeholder="100"
                      className="h-8 mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-muted-foreground">Discount</label>
                    <div className="h-8 mt-1 px-2 rounded-md border bg-muted flex items-center">
                      {discountPercentage > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                          {discountPercentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Auto</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Show profit margin if actualCost is entered */}
                {form.actualCost && form.price && Number(form.price) > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Profit per unit: ₹{(Number(form.price) - Number(form.actualCost)).toFixed(2)} 
                    ({Math.round(((Number(form.price) - Number(form.actualCost)) / Number(form.price)) * 100)}% margin)
                  </div>
                )}
              </Card>

              {/* Description - Compact */}
              <Card className="p-4">
                <label className="text-sm font-medium block mb-1">Description</label>
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
                <VariantsManager variants={variants} onChange={handleVariantsChange} />
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card className="p-4">
                <VariantPricingManager
                  key={`pricing-${variants.length}`} // Force remount when variants change
                  variants={variants}
                  basePrice={Number(form.price) || 0}
                  initialPricing={variantPricing}
                  onChange={handleVariantPricingChange}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Images (Compact) */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Product Images</h3>
            
            {/* EXISTING IMAGES */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {existingImages.map((img, index) => (
                  <div
                    key={img}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex === null) return;
                      const reordered = [...existingImages];
                      const dragged = reordered[dragIndex];
                      reordered.splice(dragIndex, 1);
                      reordered.splice(index, 0, dragged);
                      setExistingImages(reordered);
                      setDragIndex(null);
                    }}
                    className="relative group cursor-move aspect-square"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover rounded border"
                    />

                    {index === 0 && (
                      <Badge className="absolute bottom-0.5 left-0.5 bg-blue-600 text-[8px] px-1 py-0">
                        PRIMARY
                      </Badge>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExistingImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* NEW IMAGE PREVIEWS */}
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
                      onClick={() => removeNewImage(index)}
                      className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
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

            <p className="text-[10px] text-muted-foreground mt-2">
              {existingImages.length + newImages.length} image(s). First image is primary
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}