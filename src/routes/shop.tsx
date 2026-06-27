import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["latest", "popular", "price-asc", "price-desc"]).optional().default("latest"),
  material: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Shop — WRISTOVA" }, { name: "description", content: "Shop handcrafted men's bracelets in leather, beaded, chain and gold accent." }] }),
  component: Shop,
});

function Shop() {
  const sp = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products, isLoading } = useQuery(productsQuery({ categorySlug: sp.category }));
  const { data: cats } = useQuery(categoriesQuery());

  const allMaterials = useMemo(() => {
    const s = new Set<string>();
    products?.forEach((p) => p.materials.forEach((m) => s.add(m)));
    return Array.from(s).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = (products ?? []).slice();
    if (sp.q) {
      const q = sp.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (sp.material) list = list.filter((p) => p.materials.includes(sp.material!));
    if (sp.inStock) list = list.filter((p) => p.stock > 0);
    if (sp.minPrice) list = list.filter((p) => Number(p.sale_price ?? p.price) >= sp.minPrice!);
    if (sp.maxPrice) list = list.filter((p) => Number(p.sale_price ?? p.price) <= sp.maxPrice!);
    if (sp.sort === "price-asc") list.sort((a, b) => Number(a.sale_price ?? a.price) - Number(b.sale_price ?? b.price));
    else if (sp.sort === "price-desc") list.sort((a, b) => Number(b.sale_price ?? b.price) - Number(a.sale_price ?? a.price));
    else if (sp.sort === "popular") list.sort((a, b) => Number(b.best_seller) - Number(a.best_seller));
    return list;
  }, [products, sp]);

  return (
    <SiteShell>
      <section className="border-b border-border bg-[var(--section)]/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <h1 className="mt-2 font-serif text-5xl sm:text-6xl">{sp.category ? cats?.find((c) => c.slug === sp.category)?.name ?? "Shop" : "All Bracelets"}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link to="/shop" search={{} as any} className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border ${!sp.category ? "bg-foreground text-background border-foreground" : "border-border hover:bg-card"}`}>All</Link>
            {cats?.map((c) => (
              <Link key={c.id} to="/shop" search={{ category: c.slug } as any} className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border ${sp.category === c.slug ? "bg-foreground text-background border-foreground" : "border-border hover:bg-card"}`}>{c.name}</Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-10 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="space-y-8">
          <Block title="Search">
            <input
              value={sp.q ?? ""}
              onChange={(e) => navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined }) })}
              placeholder="Search products"
              className="w-full rounded-full border border-input bg-card px-4 py-2 text-sm outline-none focus:border-foreground/50"
            />
          </Block>
          <Block title="Material">
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate({ search: (p) => ({ ...p, material: undefined }) })} className={`text-left text-sm ${!sp.material ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>All materials</button>
              {allMaterials.map((m) => (
                <button key={m} onClick={() => navigate({ search: (p) => ({ ...p, material: m }) })} className={`text-left text-sm ${sp.material === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{m}</button>
              ))}
            </div>
          </Block>
          <Block title="Price">
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={sp.minPrice ?? ""} onChange={(e) => navigate({ search: (p) => ({ ...p, minPrice: e.target.value ? Number(e.target.value) : undefined }) })} className="w-full rounded-full border border-input bg-card px-3 py-2 text-sm outline-none" />
              <input type="number" placeholder="Max" value={sp.maxPrice ?? ""} onChange={(e) => navigate({ search: (p) => ({ ...p, maxPrice: e.target.value ? Number(e.target.value) : undefined }) })} className="w-full rounded-full border border-input bg-card px-3 py-2 text-sm outline-none" />
            </div>
          </Block>
          <Block title="Availability">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!sp.inStock} onChange={(e) => navigate({ search: (p) => ({ ...p, inStock: e.target.checked || undefined }) })} />
              In stock only
            </label>
          </Block>
        </aside>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">{filtered.length} products</div>
            <select
              value={sp.sort}
              onChange={(e) => navigate({ search: (p) => ({ ...p, sort: e.target.value as any }) })}
              className="rounded-full border border-input bg-card px-4 py-2 text-sm"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popularity</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">No products match your filters.</div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-foreground/70 mb-3">{title}</div>
      {children}
    </div>
  );
}
