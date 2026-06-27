import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Package, FolderTree, ShoppingBag, Users, Ticket, Settings, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = (context as any).user;
    if (!user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = !!roles?.some((r) => r.role === "admin");
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-svh bg-[var(--section)]">
      <div className="grid lg:grid-cols-[260px_1fr] min-h-svh">
        <aside className="bg-card border-r border-border/60 px-6 py-8 sticky top-0 h-svh hidden lg:flex flex-col">
          <Link to="/" className="font-serif text-2xl tracking-tight">WRISTOVA<span className="text-[var(--gold)]">.</span></Link>
          <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Admin</div>
          <nav className="mt-10 flex flex-col gap-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to as any} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-[var(--section)] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-[var(--section)]/60"}`}>
                  <n.icon className="h-4 w-4" />{n.label}
                </Link>
              );
            })}
          </nav>
          <Link to="/" className="mt-auto flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />Back to store</Link>
        </aside>
        <main className="px-6 lg:px-10 py-8 lg:py-12 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
