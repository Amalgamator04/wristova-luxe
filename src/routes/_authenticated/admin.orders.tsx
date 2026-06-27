import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { ChevronDown, ChevronUp } from "lucide-react";

const STATUSES = ["pending", "processing", "packed", "shipped", "delivered", "cancelled", "refunded"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: OrdersAdmin,
});

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  const filtered = (data ?? []).filter((o: any) => filter === "all" || o.status === filter);

  return (
    <div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Operations</p>
          <h1 className="mt-1 font-serif text-4xl">Orders</h1>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-full border border-input bg-card px-4 py-2 text-sm">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-8 space-y-3">
        {filtered.map((o: any) => {
          const isOpen = open === o.id;
          return (
            <div key={o.id} className="rounded-2xl bg-card shadow-luxe overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : o.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <div className="flex items-center gap-5 min-w-0">
                  <div>
                    <div className="font-medium">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <div className="text-sm truncate">{o.customer_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.customer_phone ?? ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline rounded-full bg-[var(--section)] px-3 py-1 text-xs uppercase tracking-wider">{o.status}</span>
                  <span className="font-medium">{formatINR(o.total)}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border/60 p-5 grid gap-6 lg:grid-cols-[1fr_280px]">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Items</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      {o.items?.map((it: any) => (
                        <div key={it.id} className="flex justify-between gap-3"><span>{it.product_name} × {it.qty}</span><span>{formatINR(it.line_total)}</span></div>
                      ))}
                    </div>
                    <div className="hairline-gold my-4" />
                    <div className="space-y-1 text-sm">
                      <Row label="Subtotal" value={formatINR(o.subtotal)} />
                      <Row label="Shipping" value={formatINR(o.shipping_fee ?? 0)} />
                      {Number(o.discount ?? 0) > 0 && <Row label="Discount" value={`- ${formatINR(o.discount)}`} />}
                      <Row label="Total" value={formatINR(o.total)} bold />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Update status</h3>
                      <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="mt-2 w-full rounded-full border border-input bg-background px-4 py-2 text-sm">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Shipping</h3>
                      <div className="mt-2 rounded-xl bg-[var(--section)] p-3 text-sm whitespace-pre-line">{o.shipping_address ? formatAddr(o.shipping_address) : "—"}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Payment: {o.payment_method?.toUpperCase()}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-luxe">No orders.</div>}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-medium" : "text-muted-foreground"}`}><span>{label}</span><span>{value}</span></div>;
}
function formatAddr(a: any) {
  if (typeof a === "string") return a;
  return [a.name, a.line1, a.line2, [a.city, a.state, a.pincode].filter(Boolean).join(", "), a.phone].filter(Boolean).join("\n");
}
