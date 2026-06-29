import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard, WishlistButton } from "@/components/site/ProductCard";
import { productBySlugQuery, productsQuery, wishlistQuery } from "@/lib/queries";
import { resolveAsset } from "@/lib/assets";
import { effectivePrice, formatINR } from "@/lib/format";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(productBySlugQuery(params.slug)),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.seo_title || `${loaderData?.name ?? "Product"} — WRISTOVA` },
      { name: "description", content: loaderData?.seo_description || loaderData?.description?.slice(0, 160) || "Handcrafted bracelet by WRISTOVA." },
      { property: "og:title", content: loaderData?.name ?? "WRISTOVA" },
      { property: "og:description", content: loaderData?.description?.slice(0, 160) ?? "" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useQuery(productBySlugQuery(slug));
  const { data: related } = useQuery(productsQuery({ limit: 8 }));
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: wish } = useQuery(wishlistQuery(user?.id ?? null));
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);

  if (!p) {
    return <SiteShell><div className="mx-auto max-w-7xl px-6 py-24 text-center text-muted-foreground">Product not found.</div></SiteShell>;
  }

  const images = (p.images && p.images.length > 0) ? p.images : [{ url: "", alt: p.name, sort_order: 0 }];
  const price = effectivePrice(p);
  const onSale = p.sale_price && Number(p.sale_price) < Number(p.price);
  const isWishlisted = !!wish?.some((w: any) => w.product_id === p.id);

  async function addToCart(redirect = false) {
    if (!user) { navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any }); return; }
    const { error } = await supabase.from("cart_items").upsert({ user_id: user.id, product_id: p!.id, qty, variant: null }, { onConflict: "user_id,product_id,variant" });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["cart"] });
    toast.success("Added to cart");
    if (redirect) navigate({ to: "/cart" });
  }

  async function toggleWishlist() {
    if (!user) { navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any }); return; }
    if (isWishlisted) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", p!.id);
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: p!.id });
    }
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  }


  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" className="hover:text-foreground">Shop</Link> / <span>{p.name}</span>
        </nav>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Reveal>
              <div className="aspect-square overflow-hidden rounded-3xl bg-card shadow-luxe group">
                <img src={resolveAsset(images[activeIdx]?.url)} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </Reveal>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} className={`aspect-square overflow-hidden rounded-xl border-2 transition ${i === activeIdx ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={resolveAsset(img.url)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:pl-8">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{p.category?.name}</p>
              <h1 className="mt-2 font-serif text-5xl">{p.name}</h1>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-medium">{formatINR(price)}</span>
                {onSale && <span className="text-base text-muted-foreground line-through">{formatINR(p.price)}</span>}
                {onSale && <span className="text-xs uppercase tracking-wider text-[var(--leather)]">Save {Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100)}%</span>}
              </div>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed">{p.description}</p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-input">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center hover:bg-accent/30 rounded-l-full"><Minus className="h-4 w-4" /></button>
                  <div className="w-10 text-center text-sm">{qty}</div>
                  <button onClick={() => setQty((q) => Math.min(p.stock || 99, q + 1))} className="grid h-11 w-11 place-items-center hover:bg-accent/30 rounded-r-full"><Plus className="h-4 w-4" /></button>
                </div>
                <WishlistButton onToggle={toggleWishlist} active={isWishlisted} />
                <div className="text-xs text-muted-foreground">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</div>
              </div>
              <div className="mt-6 grid gap-3">
                <button disabled={p.stock <= 0} onClick={() => addToCart(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
                <button disabled={p.stock <= 0} onClick={() => addToCart(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/30 px-6 py-3.5 text-sm font-medium hover:bg-foreground hover:text-background transition disabled:opacity-50">
                  <Zap className="h-4 w-4" /> Buy now
                </button>
              </div>

              <Accordion type="single" collapsible defaultValue="materials" className="mt-10">
                <AccordionItem value="materials">
                  <AccordionTrigger>Materials</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {p.materials.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="features">
                  <AccordionTrigger>Features</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Hand-finished, water-resistant, hypoallergenic clasps. Designed to wear daily and patina with time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Free shipping on orders over ₹2,000. Tracked delivery across India in 3–5 business days. 14-day returns.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Reveal>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-serif text-3xl">You might also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related?.filter((r) => r.id !== p.id).slice(0, 4).map((r, i) => <ProductCard key={r.id} product={r} index={i} />)}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
