import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({ meta: [{ title: "My Account — WRISTOVA" }] }),
  component: Profile,
});

function Profile() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
    })();
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ id: user!.id, full_name: name, phone });
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
      <form onSubmit={save} className="mt-8 max-w-md space-y-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm" />
        </label>
        <div className="flex gap-3 pt-2">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90">Save</button>
          <button type="button" onClick={async () => { await signOut(); nav({ to: "/" }); }} className="rounded-full border border-input px-6 py-2.5 text-sm hover:bg-card">Sign out</button>
        </div>
      </form>
    </div>
  );
}
