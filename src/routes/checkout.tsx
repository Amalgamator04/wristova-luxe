import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";
import { cartQuery } from "@/lib/queries";
import { effectivePrice, formatINR } from "@/lib/format";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import { whatsappForOrder } from "@/lib/whatsapp";

const addressSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().min(4).max(12),
  notes: z.string().max(500).optional(),
});

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — WRISTOVA" }] }),
  component: Checkout,
});

function Checkout() {
  const { user } = useAuth();
  const { data: items } = useQuery(cartQuery(user?.id ?? null));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "whatsapp">("cod");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  if (!user) { navigate({ to: "/auth", search: { redirect: "/checkout" } as any }); return null; }
  const cart = (items ?? []) as any[];
  const subtotal = cart.reduce((acc, c) => acc + effectivePrice(c.product) * c.qty, 0);
  const shipping = subtotal > 0 && subtotal < 2000 ? 150 : 0;
  const total = subtotal + shipping;

  async function place(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    setBusy(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user!.id,
      payment_method: paymentMethod,
      subtotal,
      shipping,
      total,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
      notes: form.notes || null,
    }).select("*").single();
    if (error || !order) { setBusy(false); toast.error(error?.message ?? "Failed to create order"); return; }
    const orderItems = cart.map((c) => ({
      order_id: order.id, product_id: c.product.id, product_name: c.product.name,
      product_image: c.product.images?.[0]?.url ?? null, variant: c.variant,
      unit_price: effectivePrice(c.product), qty: c.qty,
      line_total: effectivePrice(c.product) * c.qty,
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user!.id);
    qc.invalidateQueries();
    setBusy(false);
    if (paymentMethod === "whatsapp") {
      const url = whatsappForOrder({
        orderNumber: order.order_number, customerName: form.name, total,
        items: cart.map((c) => ({ name: c.product.name, qty: c.qty, price: effectivePrice(c.product) })),
      });
      window.open(url, "_blank");
    }
    toast.success("Order placed.");
    navigate({ to: "/account/orders" });
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="font-serif text-5xl">Checkout</h1>
        <form onSubmit={place} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <Section title="Contact">
              <Input label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </Section>
            <Section title="Shipping address">
              <Input label="Address" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
              <div className="grid sm:grid-cols-3 gap-3">
                <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Input label="PIN" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
              </div>
              <Input label="Order notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
            </Section>
            <Section title="Payment">
              <label className={`flex gap-3 cursor-pointer rounded-2xl border p-5 ${paymentMethod === "cod" ? "border-foreground" : "border-input"}`}>
                <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-muted-foreground">Pay when your bracelet arrives.</div>
                </div>
              </label>
              <label className={`flex gap-3 cursor-pointer rounded-2xl border p-5 ${paymentMethod === "whatsapp" ? "border-foreground" : "border-input"}`}>
                <input type="radio" checked={paymentMethod === "whatsapp"} onChange={() => setPaymentMethod("whatsapp")} />
                <div>
                  <div className="font-medium">Order via WhatsApp</div>
                  <div className="text-sm text-muted-foreground">We'll confirm payment and delivery on chat.</div>
                </div>
              </label>
            </Section>
          </div>
          <aside className="rounded-2xl bg-card p-6 shadow-luxe h-fit lg:sticky lg:top-24">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your order</div>
            <div className="mt-5 space-y-3 max-h-64 overflow-auto pr-1">
              {cart.map((c) => (
                <div key={c.id} className="flex justify-between gap-3 text-sm">
                  <span className="truncate">{c.product.name} × {c.qty}</span>
                  <span>{formatINR(effectivePrice(c.product) * c.qty)}</span>
                </div>
              ))}
            </div>
            <div className="hairline-gold my-4" />
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
            <div className="hairline-gold my-3" />
            <Row label="Total" value={formatINR(total)} bold />
            <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
              {busy ? "Placing…" : `Place order — ${formatINR(total)}`}
            </button>
            <Link to="/cart" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">Back to cart</Link>
          </aside>
        </form>
      </div>
    </SiteShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-luxe">
      <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">{title}</div>
      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/50" />
    </label>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between text-sm ${bold ? "text-base font-medium" : ""}`}><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
