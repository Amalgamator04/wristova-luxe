import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }] }),
  component: CouponsAdmin,
});

const schema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/i, "Letters, numbers, _ or -"),
  discount_type: z.enum(["percent", "fixed"]),
  value: z.number().nonnegative(),
  min_subtotal: z.number().nonnegative(),
  active: z.boolean(),
});

function CouponsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [adding, setAdding] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }
  async function toggle(c: any) {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Marketing</p>
          <h1 className="mt-1 font-serif text-4xl">Coupons</h1>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" />New coupon</button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c: any) => (
          <div key={c.id} className="rounded-2xl bg-card p-5 shadow-luxe">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-lg tracking-widest">{c.code}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {c.discount_type === "percent" ? `${c.amount}% off` : `₹${c.amount} off`}
                  {c.min_subtotal ? ` · min ₹${c.min_subtotal}` : ""}
                </div>
              </div>
              <button onClick={() => remove(c.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--section)]"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <label className="mt-4 inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={c.active} onChange={() => toggle(c)} /> Active
            </label>
          </div>
        ))}
        {(!data || data.length === 0) && <div className="text-muted-foreground">No coupons yet.</div>}
      </div>

      {adding && <Dialog onClose={() => setAdding(false)} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); setAdding(false); }} />}
    </div>
  );
}

function Dialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ code: "", discount_type: "percent" as "percent" | "fixed", amount: 10, min_subtotal: null as number | null, active: true });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse({ ...f, amount: Number(f.amount), min_subtotal: f.min_subtotal === null ? null : Number(f.min_subtotal) });
    if (!p.success) { toast.error(p.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.from("coupons").insert({ ...p.data, code: p.data.code.toUpperCase() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Created"); onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
      <form onSubmit={save} className="w-full max-w-md rounded-3xl bg-background shadow-luxe">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <h2 className="font-serif text-2xl">New coupon</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--section)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <L label="Code"><input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} className="inp font-mono tracking-widest" /></L>
          <L label="Type">
            <select value={f.discount_type} onChange={(e) => setF({ ...f, discount_type: e.target.value as any })} className="inp">
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </L>
          <L label="Amount"><input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value as any })} className="inp" /></L>
          <L label="Minimum subtotal (₹)"><input type="number" value={f.min_subtotal ?? ""} onChange={(e) => setF({ ...f, min_subtotal: (e.target.value || null) as any })} className="inp" /></L>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-border/60">
          <button type="button" onClick={onClose} className="rounded-full border border-input px-5 py-2.5 text-sm hover:bg-card">Cancel</button>
          <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">{busy ? "Saving…" : "Create"}</button>
        </div>
        <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--card);padding:0.6rem 0.9rem;border-radius:0.75rem;outline:none;font-size:0.875rem}`}</style>
      </form>
    </div>
  );
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
