import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { resolveAsset } from "@/lib/assets";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: ProductsAdmin,
});

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "lowercase, numbers, dashes only"),
  description: z.string().trim().max(4000).optional().nullable(),
  price: z.number().nonnegative(),
  sale_price: z.number().nonnegative().nullable().optional(),
  sku: z.string().trim().max(60).optional().nullable(),
  stock: z.number().int().nonnegative(),
  category_id: z.string().uuid().nullable().optional(),
  materials: z.array(z.string()).default([]),
  featured: z.boolean(),
  best_seller: z.boolean(),
  new_arrival: z.boolean(),
  image_url: z.string().trim().max(500).optional().nullable(),
});

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name), images:product_images(url, sort_order)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name").order("name");
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<any | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catalog</p>
          <h1 className="mt-1 font-serif text-4xl">Products</h1>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" />New product</button>
      </div>

      <div className="mt-8 rounded-2xl bg-card p-2 shadow-luxe overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Flags</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {(products ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-[var(--section)]">
                      {p.images?.[0]?.url && <img src={resolveAsset(p.images[0].url)} className="h-full w-full object-cover" alt="" />}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.category?.name ?? "—"}</td>
                <td className="p-3">{formatINR(p.sale_price ?? p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">
                  {p.featured && <Tag>Featured</Tag>}
                  {p.best_seller && <Tag>Best</Tag>}
                  {p.new_arrival && <Tag>New</Tag>}
                </div></td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing({ ...p, image_url: p.images?.[0]?.url ?? "" })} className="mr-1 inline-grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--section)]"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(p.id)} className="inline-grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--section)]"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductDialog
          initial={editing}
          categories={categories ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["admin", "products"] }); qc.invalidateQueries({ queryKey: ["products"] }); setEditing(null); }}
        />
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[var(--section)] px-2 py-0.5 text-[10px] uppercase tracking-wider">{children}</span>;
}

function ProductDialog({ initial, categories, onClose, onSaved }: { initial: any; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    description: initial.description ?? "",
    price: initial.price ?? 0,
    sale_price: initial.sale_price ?? null,
    sku: initial.sku ?? "",
    stock: initial.stock ?? 0,
    category_id: initial.category_id ?? null,
    material: initial.material ?? "",
    featured: !!initial.featured,
    best_seller: !!initial.best_seller,
    new_arrival: !!initial.new_arrival,
    image_url: initial.image_url ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...f,
      price: Number(f.price),
      sale_price: f.sale_price === null || f.sale_price === "" ? null : Number(f.sale_price),
      stock: Number(f.stock),
      category_id: f.category_id || null,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { image_url, ...rest } = parsed.data;
    let id = initial.id;
    if (id) {
      const { error } = await supabase.from("products").update(rest).eq("id", id);
      if (error) { setBusy(false); toast.error(error.message); return; }
    } else {
      const { data, error } = await supabase.from("products").insert(rest).select("id").single();
      if (error) { setBusy(false); toast.error(error.message); return; }
      id = data.id;
    }
    if (image_url) {
      await supabase.from("product_images").delete().eq("product_id", id);
      await supabase.from("product_images").insert({ product_id: id, url: image_url, sort_order: 0 });
    }
    setBusy(false);
    toast.success("Saved");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
      <form onSubmit={save} className="w-full max-w-2xl rounded-3xl bg-background shadow-luxe max-h-[90svh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <h2 className="font-serif text-2xl">{initial.id ? "Edit product" : "New product"}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--section)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="inp" /></Field>
          <Field label="Slug"><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="inp" /></Field>
          <Field label="Price"><input type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value as any })} className="inp" /></Field>
          <Field label="Sale price"><input type="number" step="0.01" value={f.sale_price ?? ""} onChange={(e) => setF({ ...f, sale_price: (e.target.value || null) as any })} className="inp" /></Field>
          <Field label="SKU"><input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} className="inp" /></Field>
          <Field label="Stock"><input type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value as any })} className="inp" /></Field>
          <Field label="Category">
            <select value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value || null })} className="inp">
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Material"><input value={f.material} onChange={(e) => setF({ ...f, material: e.target.value })} className="inp" /></Field>
          <Field label="Image URL" full><input value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} placeholder="https:// or /src/assets/..." className="inp" /></Field>
          <Field label="Description" full><textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="inp" /></Field>
          <div className="sm:col-span-2 flex flex-wrap gap-5 text-sm pt-1">
            <Check label="Featured" checked={f.featured} onChange={(v) => setF({ ...f, featured: v })} />
            <Check label="Best seller" checked={f.best_seller} onChange={(v) => setF({ ...f, best_seller: v })} />
            <Check label="New arrival" checked={f.new_arrival} onChange={(v) => setF({ ...f, new_arrival: v })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-border/60">
          <button type="button" onClick={onClose} className="rounded-full border border-input px-5 py-2.5 text-sm hover:bg-card">Cancel</button>
          <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
        <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--card);padding:0.6rem 0.9rem;border-radius:0.75rem;outline:none;font-size:0.875rem}`}</style>
      </form>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block ${full ? "sm:col-span-2" : ""}`}><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}
