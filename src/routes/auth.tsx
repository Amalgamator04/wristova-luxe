import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in — WRISTOVA" }] }),
  component: AuthPage,
});

function AuthPage() {
  const sp = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parse = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse({ email, password });
    if (!parse.success) { toast.error("Enter a valid email and 6+ char password."); return; }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      if (error) { setBusy(false); toast.error(error.message); return; }
      toast.success("Account created.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setBusy(false); toast.error(error.message); return; }
    }
    setBusy(false);
    navigate({ to: (sp.redirect as any) || "/account" });
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-6 py-20">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</p>
            <h1 className="mt-2 font-serif text-4xl">{mode === "signin" ? "Welcome back." : "Create account."}</h1>
          </div>
          <form onSubmit={submit} className="mt-10 space-y-4">
            {mode === "signup" && (
              <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} className="inp" /></Field>
            )}
            <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="inp" required /></Field>
            <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="inp" required /></Field>
            <button disabled={busy} className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground underline-offset-4 hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </Reveal>
        <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--card);padding:0.65rem 1rem;border-radius:0.85rem;outline:none;font-size:0.9rem}`}</style>
      </div>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="text-xs text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>);
}
