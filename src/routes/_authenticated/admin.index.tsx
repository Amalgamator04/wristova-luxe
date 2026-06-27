import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Package, ShoppingBag, Users, IndianRupee, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — WRISTOVA" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id,total,status,created_at,order_number,customer_name").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const all = orders.data ?? [];
      const revenue = all.filter((o: any) => o.status !== "cancelled" && o.status !== "refunded").reduce((s: number, o: any) => s + Number(o.total ?? 0), 0);
      return {
        products: products.count ?? 0,
        orders: all.length,
        customers: customers.count ?? 0,
        revenue,
        recent: all.slice(0, 8),
      };
    },
  });

  const cards = [
    { label: "Revenue", value: data ? formatINR(data.revenue) : "—", icon: IndianRupee },
    { label: "Orders", value: data?.orders ?? "—", icon: ShoppingBag },
    { label: "Products", value: data?.products ?? "—", icon: Package },
    { label: "Customers", value: data?.customers ?? "—", icon: Users },
  ];

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Overview</p>
          <h1 className="mt-1 font-serif text-4xl">Dashboard</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-4 w-4 text-[var(--gold)]" />Live data</div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-card p-5 shadow-luxe">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <c.icon className="h-4 w-4 text-[var(--gold)]" />
            </div>
            <div className="mt-3 font-serif text-3xl">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-card p-6 shadow-luxe">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">Recent orders</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2 pr-4">Order</th><th className="py-2 pr-4">Customer</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Date</th><th className="py-2 text-right">Total</th></tr>
            </thead>
            <tbody>
              {(data?.recent ?? []).map((o: any) => (
                <tr key={o.id} className="border-t border-border/40">
                  <td className="py-3 pr-4 font-medium">{o.order_number}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{o.customer_name ?? "—"}</td>
                  <td className="py-3 pr-4"><span className="rounded-full bg-[var(--section)] px-2.5 py-0.5 text-xs uppercase tracking-wider">{o.status}</span></td>
                  <td className="py-3 pr-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="py-3 text-right">{formatINR(o.total)}</td>
                </tr>
              ))}
              {(!data || data.recent.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
