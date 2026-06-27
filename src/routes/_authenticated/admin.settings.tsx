import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const KEYS = [
  ["site_title", "Site title", "text"],
  ["site_tagline", "Tagline", "text"],
  ["logo_url", "Logo URL", "text"],
  ["favicon_url", "Favicon URL", "text"],
  ["hero_headline", "Hero headline", "text"],
  ["hero_subhead", "Hero subhead", "textarea"],
  ["whatsapp_number", "WhatsApp number", "text"],
  ["contact_email", "Contact email", "text"],
  ["contact_address", "Contact address", "textarea"],
  ["instagram_url", "Instagram URL", "text"],
  ["facebook_url", "Facebook URL", "text"],
  ["twitter_url", "Twitter URL", "text"],
  ["seo_title", "SEO title", "text"],
  ["seo_description", "SEO description", "textarea"],
] as const;

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*")).data ?? [],
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const map: Record<string, string> = {};
    for (const row of data as any[]) {
      const v = row.value;
      map[row.key] = typeof v === "string" ? v : v?.value ?? JSON.stringify(v ?? "");
    }
    setValues(map);
  }, [data]);

  async function save() {
    setBusy(true);
    const rows = KEYS.map(([k]) => ({ key: k, value: values[k] ?? "" }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Configuration</p>
      <h1 className="mt-1 font-serif text-4xl">Site settings</h1>

      <div className="mt-8 rounded-2xl bg-card p-6 shadow-luxe grid gap-4 sm:grid-cols-2">
        {KEYS.map(([k, label, type]) => (
          <label key={k} className={type === "textarea" ? "sm:col-span-2 block" : "block"}>
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="mt-1">
              {type === "textarea" ? (
                <textarea rows={3} value={values[k] ?? ""} onChange={(e) => setValues({ ...values, [k]: e.target.value })} className="inp" />
              ) : (
                <input value={values[k] ?? ""} onChange={(e) => setValues({ ...values, [k]: e.target.value })} className="inp" />
              )}
            </div>
          </label>
        ))}
        <div className="sm:col-span-2 flex justify-end">
          <button onClick={save} disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">{busy ? "Saving…" : "Save settings"}</button>
        </div>
        <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--background);padding:0.6rem 0.9rem;border-radius:0.75rem;outline:none;font-size:0.875rem}`}</style>
      </div>
    </div>
  );
}
