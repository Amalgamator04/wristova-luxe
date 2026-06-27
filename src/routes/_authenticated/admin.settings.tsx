import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsAdmin,
});

type SettingsForm = {
  logo_url: string;
  favicon_url: string;
  seo_title: string;
  seo_description: string;
  whatsapp_number: string;
  contact_email: string;
  contact_address: string;
  contact_phone: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
};

const empty: SettingsForm = {
  logo_url: "", favicon_url: "", seo_title: "", seo_description: "",
  whatsapp_number: "", contact_email: "", contact_address: "", contact_phone: "",
  instagram_url: "", facebook_url: "", twitter_url: "",
};

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").order("id").limit(1).maybeSingle();
      return data;
    },
  });
  const [f, setF] = useState<SettingsForm>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const ci = (data.contact_info as any) ?? {};
    const sl = (data.social_links as any) ?? {};
    setF({
      logo_url: data.logo_url ?? "",
      favicon_url: data.favicon_url ?? "",
      seo_title: data.seo_title ?? "",
      seo_description: data.seo_description ?? "",
      whatsapp_number: data.whatsapp_number ?? "",
      contact_email: ci.email ?? "",
      contact_address: ci.address ?? "",
      contact_phone: ci.phone ?? "",
      instagram_url: sl.instagram ?? "",
      facebook_url: sl.facebook ?? "",
      twitter_url: sl.twitter ?? "",
    });
  }, [data]);

  async function save() {
    setBusy(true);
    const payload = {
      id: data?.id ?? 1,
      logo_url: f.logo_url || null,
      favicon_url: f.favicon_url || null,
      seo_title: f.seo_title || null,
      seo_description: f.seo_description || null,
      whatsapp_number: f.whatsapp_number || "",
      contact_info: { email: f.contact_email, phone: f.contact_phone, address: f.contact_address },
      social_links: { instagram: f.instagram_url, facebook: f.facebook_url, twitter: f.twitter_url },
    };
    const { error } = await supabase.from("site_settings").upsert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["admin", "site_settings"] });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Configuration</p>
      <h1 className="mt-1 font-serif text-4xl">Site settings</h1>

      <Section title="Branding">
        <Field label="Logo URL"><input value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} className="inp" /></Field>
        <Field label="Favicon URL"><input value={f.favicon_url} onChange={(e) => setF({ ...f, favicon_url: e.target.value })} className="inp" /></Field>
      </Section>

      <Section title="SEO">
        <Field label="SEO title"><input value={f.seo_title} onChange={(e) => setF({ ...f, seo_title: e.target.value })} className="inp" /></Field>
        <Field label="SEO description" full><textarea rows={3} value={f.seo_description} onChange={(e) => setF({ ...f, seo_description: e.target.value })} className="inp" /></Field>
      </Section>

      <Section title="Contact">
        <Field label="WhatsApp number"><input value={f.whatsapp_number} onChange={(e) => setF({ ...f, whatsapp_number: e.target.value })} className="inp" /></Field>
        <Field label="Email"><input value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} className="inp" /></Field>
        <Field label="Phone"><input value={f.contact_phone} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} className="inp" /></Field>
        <Field label="Address" full><textarea rows={3} value={f.contact_address} onChange={(e) => setF({ ...f, contact_address: e.target.value })} className="inp" /></Field>
      </Section>

      <Section title="Social">
        <Field label="Instagram"><input value={f.instagram_url} onChange={(e) => setF({ ...f, instagram_url: e.target.value })} className="inp" /></Field>
        <Field label="Facebook"><input value={f.facebook_url} onChange={(e) => setF({ ...f, facebook_url: e.target.value })} className="inp" /></Field>
        <Field label="Twitter"><input value={f.twitter_url} onChange={(e) => setF({ ...f, twitter_url: e.target.value })} className="inp" /></Field>
      </Section>

      <div className="mt-8 flex justify-end">
        <button onClick={save} disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">{busy ? "Saving…" : "Save settings"}</button>
      </div>

      <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--background);padding:0.6rem 0.9rem;border-radius:0.75rem;outline:none;font-size:0.875rem}`}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl bg-card p-6 shadow-luxe">
      <h2 className="font-serif text-xl">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block ${full ? "sm:col-span-2" : ""}`}><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
