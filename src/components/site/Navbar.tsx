import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { cartQuery, wishlistQuery } from "@/lib/queries";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: cart } = useQuery(cartQuery(user?.id ?? null));
  const { data: wish } = useQuery(wishlistQuery(user?.id ?? null));

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-[0_4px_24px_-12px_rgba(44,31,24,0.12)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-serif text-2xl tracking-[0.18em] uppercase">
          Wristova
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[var(--gold)] hover:after:w-full after:transition-[width]"
              activeProps={{ className: "text-foreground" }}
            >{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/shop" className="hidden sm:inline-grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30" aria-label="Search"><Search className="h-4 w-4" /></Link>
          {user ? (
            <Link to="/account" className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30" aria-label="Account"><User className="h-4 w-4" /></Link>
          ) : (
            <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30" aria-label="Sign in"><User className="h-4 w-4" /></Link>
          )}
          <Link to="/account/wishlist" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
            {wish && wish.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[var(--gold)] text-[10px] font-medium text-primary">{wish.length}</span>
            )}
          </Link>
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {cart && cart.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[var(--gold)] text-[10px] font-medium text-primary">{cart.length}</span>
            )}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hidden md:inline-flex ml-2 items-center rounded-full border border-foreground/30 px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">Admin</Link>
          )}
          <button onClick={() => setOpen((v) => !v)} className="md:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-accent/30" aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-base py-1">{l.label}</Link>
            ))}
            {isAdmin && <Link to="/admin" className="text-base py-1 text-[var(--gold)]">Admin Dashboard</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
