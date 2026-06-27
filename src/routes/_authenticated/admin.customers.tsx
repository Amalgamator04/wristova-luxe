import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const { data } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">People</p>
      <h1 className="mt-1 font-serif text-4xl">Customers</h1>
      <div className="mt-8 rounded-2xl bg-card p-2 shadow-luxe overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3">{p.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{p.email ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{p.phone ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {(!data || data.length === 0) && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
