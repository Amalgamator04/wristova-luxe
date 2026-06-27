import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";
import { cartQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { effectivePrice, formatINR } from "@/lib/format";
import { resolveAsset } from "@/lib/assets";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — WRISTOVA" }] }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const { data: items } = useQuery(cartQuery(user?.id ?? null));
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (!user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-serif text-4xl">Your cart</h1>
          <p className="mt-3 text-muted-foreground">Sign in to view your cart.</p>
          <Link to="/auth" search={{ redirect: "/cart" } as any} className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Sign in</Link>
        </div>
      </SiteShell>
    );
  }

  const cart = (items ?? []) as any[];
  const subtotal = cart.reduce((acc, c) => acc + effectivePrice(c.product) * c.qty, 0);
  const shipping = subtotal > 0 && subtotal < 2000 ? 150 : 0;
  const total = subtotal + shipping;

  async function updateQty(id: string, qty: number) {
    if (qty <= 0) return remove(id);
    await supabase.from("cart_items").update({ qty }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  }
  async function remove(id: string) {
    await supabase.from("cart_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="font-serif text-5xl">Your cart</h1>
        {cart.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-16 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Browse the collection</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.map((c) => (
                <div key={c.id} className="flex gap-5 rounded-2xl bg-card p-4 shadow-luxe">
                  <Link to="/product/$slug" params={{ slug: c.product.slug }} className="block h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                    <img src={resolveAsset(c.product.images?.[0]?.url)} alt={c.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link to="/product/$slug" params={{ slug: c.product.slug }} className="font-serif text-xl hover:underline">{c.product.name}</Link>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">SKU {c.product.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatINR(effectivePrice(c.product) * c.qty)}</div>
                        <div className="text-xs text-muted-foreground">{formatINR(effectivePrice(c.product))} each</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center rounded-full border border-input">
                        <button onClick={() => updateQty(c.id, c.qty - 1)} className="grid h-9 w-9 place-items-center"><Minus className="h-3 w-3" /></button>
                        <div className="w-8 text-center text-sm">{c.qty}</div>
                        <button onClick={() => updateQty(c.id, c.qty + 1)} className="grid h-9 w-9 place-items-center"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(c.id)} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="rounded-2xl bg-card p-6 shadow-luxe h-fit">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Summary</div>
              <div className="mt-5 space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
                <div className="hairline-gold my-3" />
                <Row label="Total" value={formatINR(total)} bold />
              </div>
              <button onClick={() => navigate({ to: "/checkout" })} className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm text-primary-foreground hover:opacity-90 transition">Checkout</button>
              <Link to="/shop" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "text-base font-medium" : ""}`}><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
