"use client";

import { useState, useEffect, useRef } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ProductImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images.length]);

  // Handle desktop mouse movement for interactive zoom lens
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  return (
    <div className="w-full flex flex-col justify-between gap-4 select-none">
      {/* MAIN IMAGE CONTAINER WITH INTERACTIVE HOVER ZOOM */}
      <div
        ref={imageContainerRef}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative h-[380px] sm:h-[460px] lg:h-[500px] w-full rounded-3xl overflow-hidden group border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-sm flex items-center justify-center p-6 sm:p-8 cursor-crosshair"
      >
        {/* ULTRA-SUBTLE AMBIENT GLOW */}
        <div
          className="absolute inset-0 bg-center bg-cover filter blur-3xl opacity-15 dark:opacity-25 group-hover:opacity-30 scale-110 transition-all duration-700 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          style={{ backgroundImage: `url(${images[activeIndex]})` }}
        />

        {/* SOFT EDGE FADE VIGNETTE */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(255,255,255,0.9)_98%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_55%,#060814_98%)] pointer-events-none z-10" />

        {/* FOREGROUND PRODUCT IMAGE - INTERACTIVE LENS ZOOM */}
        <div className="relative z-20 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
          <img
            key={activeIndex}
            src={images[activeIndex]}
            alt={title}
            className="w-full h-full object-contain p-2 sm:p-4 filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_15px_28px_rgba(0,0,0,0.6)] transition-transform ease-out"
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: isZoomed ? "scale(2.2)" : "scale(1)",
              transitionDuration: isZoomed ? "100ms" : "300ms",
            }}
          />
        </div>

        {/* HOVER ZOOM HINT BADGE */}
        <div className="absolute bottom-4 left-4 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-md">
          <ZoomIn className="h-3.5 w-3.5 text-emerald-400" />
          <span>Hover to inspect fine detail</span>
        </div>

        {/* FULLSCREEN BUTTON OVERLAY */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          className="absolute top-4 right-4 z-30 p-3 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 hover:border-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
          aria-label="View Fullscreen Lightbox"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* THUMBNAILS CAROUSEL STRIP */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
          {images.map((img, i) => {
            const isActive = activeIndex === i;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`
                  relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden transition-all duration-300 p-2 border flex items-center justify-center cursor-pointer
                  ${
                    isActive
                      ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 bg-white dark:bg-zinc-900 scale-105 shadow-md"
                      : "border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 opacity-70 hover:opacity-100 hover:scale-105"
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

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-300"
        >
          {/* Top Bar with Title & Close Button */}
          <div className="flex items-center justify-between z-10 max-w-6xl w-full mx-auto">
            <span className="text-sm font-semibold text-white/80 line-clamp-1 max-w-md">
              {title} ({activeIndex + 1} of {images.length})
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Fullscreen Stage with Left & Right Arrows */}
          <div className="relative flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-auto overflow-hidden">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
                }
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition hover:scale-110 cursor-pointer"
                aria-label="Previous Image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <img
              key={activeIndex}
              src={images[activeIndex]}
              alt={title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition hover:scale-110 cursor-pointer"
                aria-label="Next Image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 z-10 max-w-xl mx-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-14 w-14 rounded-xl overflow-hidden p-1.5 border transition cursor-pointer shrink-0 ${
                    activeIndex === idx
                      ? "border-emerald-400 ring-2 ring-emerald-400/40 bg-white/10 scale-105"
                      : "border-white/10 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
