// app/products/[id]/page.tsx
import Link from "next/link";
import ProductImageGallery from "../../../components/ProductImageGallery";
import ProductClient from "@/components/ProductClient";
import ProductCard from "@/components/productCard"; 
import ProductReviewsCarousel from "@/components/ProductReviewsCarousel";
import { Truck, RotateCcw, Headset, Award, ChevronRight, Home } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  brand: string;
  category: string;
  stock: number;
  images?: string[];
  reviews?: Array<{
    userId: any;
    userName: string;
    rating: number;
    comment: string;
    orderId: string;
    _id: any;
    createdAt: any;
  }>;
};

async function getProduct(id: string): Promise<Product | null> {
  try {
    const api = getApiBaseUrl();
    const res = await fetch(
      `${api}/api/products/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelatedProducts(category: string, currentId: string): Promise<Product[]> {
  try {
    const api = getApiBaseUrl();
    const res = await fetch(
      `${api}/api/products?category=${encodeURIComponent(category)}&limit=5`,
      { cache: "no-store" }
    );
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.filter((p: Product) => p._id !== currentId).slice(0, 4);
  } catch (err) {
    console.error("Failed to fetch related products:", err);
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="min-h-screen py-24 px-6 bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h1 className="text-3xl font-black">Product Not Found</h1>
          <p className="text-sm text-slate-500">The requested item could not be located in our catalog.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg"
          >
            Back to Catalog
          </Link>
        </div>
      </main>
    );
  }

  const relatedProducts = await getRelatedProducts(product.category, product._id);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder.png"];

  const formattedReviews = product.reviews?.map((review: any) => ({
    _id: typeof review._id === "string" ? review._id : review._id?.$oid || String(review._id),
    userId: {
      _id: typeof review.userId === "string" ? review.userId : review.userId?.$oid || String(review.userId),
      name: review.userName || "Verified Customer",
    },
    rating: review.rating || 5,
    comment: review.comment || "",
    createdAt: typeof review.createdAt === "string" ? review.createdAt : review.createdAt?.$date || new Date().toISOString(),
    productId: product._id,
  })) || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#060814] text-slate-900 dark:text-white transition-colors duration-300 pb-24 pt-6 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* BREADCRUMB NAVIGATION */}
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto pb-2">
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-1">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <Link href="/products" className="hover:text-emerald-600 dark:hover:text-emerald-300">
              Products
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-600 dark:hover:text-emerald-300">
              {product.category}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{product.title}</span>
          </nav>

          {/* HERO PRODUCT GRID - TWO EQUAL HEIGHT COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mt-6">
            
            {/* LEFT COLUMN — IMAGE GALLERY SHOWCASE */}
            <div className="lg:col-span-7 flex flex-col">
              <ProductImageGallery images={images} title={product.title} />
            </div>

            {/* RIGHT COLUMN — FUTURISTIC PRODUCT ACTION CARD */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl">
              <ProductClient product={product} images={images} />
            </div>

          </div>
        </div>

        {/* SLEEK & MINIMAL TRUST STRIP (REPLACES BULKY CARDS) */}
        <div className="py-4 px-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-500" /> Free Express Shipping
          </span>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-emerald-500" /> 7-Day Easy Returns
          </span>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <Headset className="h-4 w-4 text-emerald-500" /> 24/7 Expert Support
          </span>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-500" /> 100% Genuine Guarantee
          </span>
        </div>

        {/* COMPACT & CLEAN CUSTOMER REVIEWS */}
        {formattedReviews && formattedReviews.length > 0 && (
          <section className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <ProductReviewsCarousel
              productId={product._id}
              initialReviews={formattedReviews}
            />
          </section>
        )}

        {/* FAQ ACCORDION */}
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <span className="text-xs text-slate-400">Shipping, returns & policies</span>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem 
              value="shipping" 
              className="border border-slate-200 dark:border-zinc-800 rounded-xl px-5 bg-slate-50 dark:bg-zinc-800/40 shadow-sm"
            >
              <AccordionTrigger className="py-3 text-xs font-bold text-slate-900 dark:text-white hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <Truck className="h-3.5 w-3.5 text-emerald-500" />
                  What are your delivery timelines?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Standard delivery takes 3 to 5 business days across metro cities. Express priority dispatch is available at checkout for next-day delivery.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="returns" 
              className="border border-slate-200 dark:border-zinc-800 rounded-xl px-5 bg-slate-50 dark:bg-zinc-800/40 shadow-sm"
            >
              <AccordionTrigger className="py-3 text-xs font-bold text-slate-900 dark:text-white hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-500" />
                  How do returns and exchanges work?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                You can request a hassle-free return or exchange within 7 days of delivery directly from your account profile. Pickup is scheduled from your delivery address.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="support" 
              className="border border-slate-200 dark:border-zinc-800 rounded-xl px-5 bg-slate-50 dark:bg-zinc-800/40 shadow-sm"
            >
              <AccordionTrigger className="py-3 text-xs font-bold text-slate-900 dark:text-white hover:no-underline">
                <span className="flex items-center gap-2.5">
                  <Headset className="h-3.5 w-3.5 text-emerald-500" />
                  How can I get assistance with my order?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Our support team is available 24/7 via live chat or email at support@ionyx.com.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                You Might Also Like
              </h2>
              <Link href="/products" className="text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}