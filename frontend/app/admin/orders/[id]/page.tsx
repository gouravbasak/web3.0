import OrderViewClient from "./OrderViewClient";
import { getApiBaseUrl } from "@/lib/apiBase";

export default async function ViewOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; // IMPORTANT

  let order = null;

  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/orders/${id}`, {
      cache: "no-store",
    });

    if (res.ok) {
      order = await res.json();
    }
  } catch (err) {
    console.error("Order fetch error:", err);
  }

  return <OrderViewClient order={order} />;
}
