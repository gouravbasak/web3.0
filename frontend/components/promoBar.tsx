export default function PromoBar() {
  return (
    <div className="w-full bg-black text-white overflow-hidden whitespace-nowrap">
      <div className="animate-marquee py-2 flex gap-10">
        {/* Repeat the message 3–4 times for smooth infinite scroll */}
        <span>Free Shipping + 40% Off on Orders over 9999</span>
        <span>Free Shipping + 40% Off on Orders over 9999</span>
        <span>Free Shipping + 40% Off on Orders over 9999</span>
        <span>Free Shipping + 40% Off on Orders over 9999</span>
        <span>Free Shipping + 40% Off on Orders over 9999</span>
        <span>Free Shipping + 40% Off on Orders over 9999</span>
      </div>
    </div>
  );
}
