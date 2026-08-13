import Landing from "@/components/Landing";
import RecentlyAdded from "@/components/RecentlyAdded";
import BestSellers from "../components/bestSellers";
import { getApiBaseUrl } from "@/lib/apiBase";

const API = getApiBaseUrl();

async function getAds() {
  try {
    let res = await fetch(`${API}/api/products/featured`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`${API}/api/products?isFeatured=true`, { cache: 'no-store' });
    }
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const featuredList = data.filter((p: any) => p.isFeatured);
        if (featuredList.length > 0) return { ads: featuredList, hasAdminSelected: true };
      }
    }
    
    const topSellingRes = await fetch(`${API}/api/products/best-sellers`, { cache: 'no-store' });
    if (topSellingRes.ok) {
      const bestSellers = await topSellingRes.json();
      if (Array.isArray(bestSellers) && bestSellers.length > 0) return { ads: [bestSellers[0]], hasAdminSelected: false };
    }

    const fallbackRes = await fetch(`${API}/api/products`, { cache: 'no-store' });
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (Array.isArray(fallbackData) && fallbackData.length > 0) return { ads: [fallbackData[0]], hasAdminSelected: false };
    }
  } catch (err) {
    console.error("SSR fetch ads failed", err);
  }
  return { ads: [], hasAdminSelected: false };
}

export default async function HomePage() {
  const { ads, hasAdminSelected } = await getAds();

  return (
    <main className="w-full bg-background text-foreground">
      {/* HERO SECTION */}
      <Landing initialAds={ads} initialHasAdminSelected={hasAdminSelected} />
      {/* OTHER SECTIONS */}
      <RecentlyAdded />
      <BestSellers />
    </main>
  );
}
