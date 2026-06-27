import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { MessageCircle, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — WRISTOVA" }] }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(5).max(4000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(r.data);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Message sent. We'll be in touch.");
    setForm({ name: "", email: "", subject: "", body: "" });
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-20 grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contact</p>
          <h1 className="mt-2 font-serif text-5xl">Say hello.</h1>
          <p className="mt-4 text-muted-foreground">We respond to every message — usually within a day.</p>
          <div className="mt-10 space-y-5 text-sm">
            <div className="flex items-start gap-3"><MessageCircle className="h-5 w-5 text-[var(--gold)] mt-0.5" /><div><div className="font-medium">WhatsApp</div><a href="https://wa.me/917303025805" className="text-muted-foreground hover:text-foreground">+91 73030 25805</a></div></div>
            <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-[var(--gold)] mt-0.5" /><div><div className="font-medium">Email</div><a href="mailto:hello@wristova.com" className="text-muted-foreground hover:text-foreground">hello@wristova.com</a></div></div>
            <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-[var(--gold)] mt-0.5" /><div><div className="font-medium">Workshop</div><div className="text-muted-foreground">Handcrafted in India</div></div></div>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-card p-7 shadow-luxe space-y-4">
          <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="inp" /></Field>
          <Field label="Subject"><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="inp" /></Field>
          <Field label="Message"><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} className="inp" /></Field>
          <button disabled={busy} className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {busy ? "Sending…" : "Send message"}
          </button>
          <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--background);padding:0.65rem 1rem;border-radius:0.85rem;outline:none;font-size:0.9rem}`}</style>
        </form>
      </div>
    </SiteShell>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>);
}
