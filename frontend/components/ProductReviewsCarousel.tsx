"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getApiBaseUrl } from "@/lib/apiBase";

type Review = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  productId: string;
};

interface ProductReviewsCarouselProps {
  productId: string;
  initialReviews?: Review[];
}

export default function ProductReviewsCarousel({ 
  productId,
  initialReviews = []
}: ProductReviewsCarouselProps) {
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews);
  const [loading, setLoading] = React.useState(false);
  const [hasReviews, setHasReviews] = React.useState(initialReviews.length > 0);

  React.useEffect(() => {
    if (initialReviews.length > 0) {
      setReviews(initialReviews);
      setHasReviews(true);
      setLoading(false);
    } else {
      fetchReviews();
    }
  }, [productId, initialReviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${getApiBaseUrl()}/api/products/${productId}/reviews`
      );
      
      if (response.ok) {
        const data = await response.json();
        const reviewsData = data.reviews || data || [];
        setReviews(reviewsData);
        setHasReviews(reviewsData.length > 0);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasReviews) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-3 h-3 ${
              index < rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 dark:fill-zinc-700 text-slate-200 dark:text-zinc-700"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    return nameStr
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || !hasReviews) {
    return null;
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-3">
      {/* REVIEWS COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Customer Reviews</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500">
            {reviews.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-extrabold text-slate-900 dark:text-white">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{averageRating}</span>
          </div>
          <span className="text-[11px] text-slate-400">/ 5.0</span>
        </div>
      </div>

      {/* REVIEWS TIGHT CAROUSEL */}
      <Carousel className="w-full">
        <CarouselContent className="-ml-2">
          {reviews.map((review) => (
            <CarouselItem
              key={review._id}
              className="pl-2 basis-full sm:basis-1/2"
            >
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold text-[10px]">
                        {getInitials(review.userId?.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[120px]">
                      {review.userId?.name || "Customer"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1">{formatDate(review.createdAt)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 italic">
                  "{review.comment}"
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {reviews.length > 2 && (
          <div className="flex justify-end gap-1 mt-2">
            <CarouselPrevious className="static h-6 w-6 rounded-md" />
            <CarouselNext className="static h-6 w-6 rounded-md" />
          </div>
        )}
      </Carousel>
    </div>
  );
}