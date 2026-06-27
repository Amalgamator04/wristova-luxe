import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return <Outlet />;
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</div>
          <nav className="mt-4 flex flex-col gap-1 text-sm">
            <NavLink to="/account">Profile</NavLink>
            <NavLink to="/account/orders">Orders</NavLink>
            <NavLink to="/account/wishlist">Wishlist</NavLink>
          </nav>
        </aside>
        <section><Outlet /></section>
      </div>
    </SiteShell>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to as any} activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground py-1.5">{children}</Link>;
}
