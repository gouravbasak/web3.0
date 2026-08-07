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
    <div className="w-full flex flex-col justify-between gap-4">
      
      {/* MAIN IMAGE CONTAINER - OPTION C ULTRA-SUBTLE SOFT ACCENT GLOW */}
      <div className="relative h-[380px] sm:h-[460px] lg:h-[500px] w-full rounded-3xl overflow-hidden group border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-sm flex items-center justify-center p-6 sm:p-8">
        
        {/* ULTRA-SUBTLE AMBIENT GLOW (15% OPACITY FOR ELEGANT 3D DEPTH) */}
        <div 
          className="absolute inset-0 bg-center bg-cover filter blur-3xl opacity-15 dark:opacity-25 group-hover:opacity-35 scale-110 transition-all duration-700 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          style={{ backgroundImage: `url(${images[activeIndex]})` }}
        />

        {/* SOFT EDGE FADE VIGNETTE */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(255,255,255,0.9)_98%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_50%,#060814_98%)] pointer-events-none z-10" />

        {/* FOREGROUND CRISP FIT PRODUCT IMAGE - FULLY EXPANDS TO FILL FRAME */}
        <img
          key={activeIndex}
          src={images[activeIndex]}
          alt={title}
          className="relative z-20 w-full h-full object-contain p-2 sm:p-4 transition-all duration-500 ease-out group-hover:scale-105 filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_15px_28px_rgba(0,0,0,0.6)] animate-in fade-in"
        />

        {/* FULLSCREEN BUTTON OVERLAY */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 z-30 p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 hover:border-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
          aria-label="View Fullscreen Image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* THUMBNAILS CAROUSEL STRIP */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
          {images.slice(0, 6).map((img, i) => {
            const isActive = activeIndex === i;

            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`
                  relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden transition-all duration-300 p-2 border flex items-center justify-center
                  ${
                    isActive
                      ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 bg-white dark:bg-zinc-900 scale-105 shadow-md"
                      : "border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 opacity-60 hover:opacity-100 hover:scale-105"
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

