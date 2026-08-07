import Landing from "@/components/Landing";
import RecentlyAdded from "@/components/RecentlyAdded";
import BestSellers from "../components/bestSellers";

export default function HomePage() {
  return (
    <main className="w-full bg-background text-foreground">
      {/* HERO SECTION */}
      <Landing />
      {/* OTHER SECTIONS */}
      <RecentlyAdded />
      <BestSellers />
    </main>
  );
}
