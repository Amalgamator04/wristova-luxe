import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/lib/queries";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({ meta: [{ title: "My Orders — WRISTOVA" }] }),
  component: Orders,
});

function Orders() {
  const { user } = useAuth();
  const { data } = useQuery(ordersQuery(user?.id ?? null));
  const orders = (data ?? []) as any[];
  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-muted-foreground">You haven't placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card p-5 shadow-luxe">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <span className="rounded-full bg-[var(--section)] px-3 py-1 text-xs uppercase tracking-wider">{o.status}</span>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {o.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.product_name} × {it.qty}</span>
                    <span>{formatINR(it.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="hairline-gold my-3" />
              <div className="flex justify-between text-sm"><span>Total</span><span className="font-medium">{formatINR(o.total)}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
