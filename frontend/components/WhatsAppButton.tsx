"use client";

import React, { useState } from "react";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = "918637866948";
  const defaultMessage = encodeURIComponent(
    "Hi IONYX Store! I am browsing your website and have a question about placing an order."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip badge on desktop hover */}
      <div
        className={`hidden sm:block transition-all duration-300 origin-right ${
          showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-slate-900 dark:bg-zinc-800 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xl border border-slate-800 dark:border-zinc-700 whitespace-nowrap flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Need help? Chat with us on WhatsApp</span>
        </div>
      </div>

      {/* Main Floating WhatsApp Bubble */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Chat with IONYX Store on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl hover:shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] transform hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Subtle animated ambient ripple */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping -z-10 group-hover:opacity-0" />

        {/* Official WhatsApp SVG Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.99 14.153c-.208.583-1.037 1.077-1.637 1.205-.412.088-.95.158-2.766-.595-2.322-.962-3.818-3.327-3.935-3.48-.112-.158-.94-1.25-.94-2.384 0-1.134.595-1.69.807-1.922.213-.233.465-.291.62-.291.155 0 .31.002.445.01.144.007.337-.055.526.4.195.467.666 1.623.725 1.741.058.118.098.256.02.41-.078.158-.117.256-.233.393-.117.137-.246.306-.352.41-.116.118-.238.246-.102.48.136.233.606 1 .1.299 1.618.89 1.152 1.644 1.508 1.877.233.136.37.118.506-.039.136-.157.583-.68.739-.913.155-.233.31-.194.524-.116.213.078 1.357.64 1.59.756.233.117.388.175.446.272.059.098.059.564-.149 1.147z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </aside>
  );
}
