"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

export default function ProductImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* 🔁 AUTO SLIDESHOW */
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="h-full flex flex-col justify-between gap-4">
      
      {/* MAIN IMAGE CONTAINER - SEAMLESS BLENDED EDGE DISPLAY */}
      <div className="relative flex-1 min-h-[440px] w-full rounded-3xl overflow-hidden group transition-all duration-500 flex items-center justify-center p-6 sm:p-8">
        
        {/* BACKGROUND AMBIENT GLOW WITH FEATHERED BLEND */}
        <div 
          className="absolute inset-0 bg-center bg-cover filter blur-3xl opacity-50 group-hover:opacity-75 scale-110 transition-all duration-700 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]"
          style={{ backgroundImage: `url(${images[activeIndex]})` }}
        />

        {/* SOFT EDGE MASKING VIGNETTE (DISSOLVES EDGES SEAMLESSLY INTO BACKGROUND) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#060814_90%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,#060814_90%)] pointer-events-none z-10 opacity-95" />

        {/* FOREGROUND CRISP FIT PRODUCT IMAGE WITH FLOATING DROP SHADOW */}
        <img
          src={images[activeIndex]}
          alt={title}
          className="relative z-20 w-full h-full object-contain transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
        />

        {/* FULLSCREEN BUTTON OVERLAY */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 z-30 p-3 rounded-full bg-slate-900/60 dark:bg-zinc-900/60 backdrop-blur-xl text-white border border-white/10 hover:border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-2xl"
          aria-label="View Fullscreen Image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* THUMBNAILS CAROUSEL STRIP WITH SEAMLESS BLENDED TILE BACKGROUND */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          {images.slice(0, 5).map((img, i) => {
            const isActive = activeIndex === i;

            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`
                  relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden transition-all duration-300 p-2 backdrop-blur-md bg-slate-900/40 dark:bg-zinc-900/40
                  ${
                    isActive
                      ? "ring-2 ring-emerald-500 dark:ring-emerald-400 scale-105 shadow-lg"
                      : "opacity-40 hover:opacity-100 hover:scale-105"
                  }
                `}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN MODAL OVERLAY */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
        >
          <img
            src={images[activeIndex]}
            alt={title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
