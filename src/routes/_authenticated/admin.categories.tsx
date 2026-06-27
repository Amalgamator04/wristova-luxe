import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: CategoriesAdmin,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(2000).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
});

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
  const [editing, setEditing] = useState<any | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "categories", "all"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catalog</p>
          <h1 className="mt-1 font-serif text-4xl">Categories</h1>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" />New category</button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c: any) => (
          <div key={c.id} className="rounded-2xl bg-card p-5 shadow-luxe">
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-serif text-xl">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.slug}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(c)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--section)]"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(c.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--section)]"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {c.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{c.description}</p>}
          </div>
        ))}
        {(!data || data.length === 0) && <div className="text-muted-foreground">No categories yet.</div>}
      </div>

      {editing && (
        <Dialog initial={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin", "categories", "all"] }); qc.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); }} />
      )}
    </div>
  );
}

function Dialog({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: initial.name ?? "", slug: initial.slug ?? "", description: initial.description ?? "", image_url: initial.image_url ?? "" });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) { toast.error(p.error.issues[0].message); return; }
    setBusy(true);
    const res = initial.id
      ? await supabase.from("categories").update(p.data).eq("id", initial.id)
      : await supabase.from("categories").insert(p.data);
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
      <form onSubmit={save} className="w-full max-w-lg rounded-3xl bg-background shadow-luxe">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <h2 className="font-serif text-2xl">{initial.id ? "Edit category" : "New category"}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--section)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <L label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="inp" /></L>
          <L label="Slug"><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="inp" /></L>
          <L label="Image URL"><input value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} className="inp" /></L>
          <L label="Description"><textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="inp" /></L>
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
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
