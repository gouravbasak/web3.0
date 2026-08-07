import OrderViewClient from "./OrderViewClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default async function ViewOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; // IMPORTANT

  let order = null;

  try {
    const res = await fetch(`${API_BASE}/api/orders/${id}`, {
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
