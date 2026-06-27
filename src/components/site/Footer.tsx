import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[var(--section)]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-serif text-2xl tracking-[0.18em] uppercase">Wristova</div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Handcrafted bracelets for the modern gentleman. Quietly considered, built to last.
          </p>
          <div className="mt-6 flex gap-2">
            <a aria-label="Instagram" href="https://instagram.com" className="grid h-10 w-10 place-items-center rounded-full border border-border/80 hover:bg-foreground hover:text-background transition-colors"><Instagram className="h-4 w-4"/></a>
            <a aria-label="Facebook" href="https://facebook.com" className="grid h-10 w-10 place-items-center rounded-full border border-border/80 hover:bg-foreground hover:text-background transition-colors"><Facebook className="h-4 w-4"/></a>
            <a aria-label="Twitter" href="https://twitter.com" className="grid h-10 w-10 place-items-center rounded-full border border-border/80 hover:bg-foreground hover:text-background transition-colors"><Twitter className="h-4 w-4"/></a>
          </div>
        </div>
        <Col title="Shop" links={[["All Bracelets","/shop"],["Leather","/shop?category=leather"],["Beaded","/shop?category=beaded"],["Chain","/shop?category=chain"],["Gold Accent","/shop?category=gold-accent"]]} />
        <Col title="Account" links={[["Sign in","/auth"],["My account","/account"],["My orders","/account/orders"],["Wishlist","/account/wishlist"]]} />
        <Col title="Help" links={[["Contact","/contact"],["FAQ","/faq"],["Shipping","/shipping"],["Returns","/returns"],["Privacy","/privacy"],["Terms","/terms"]]} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} WRISTOVA. All rights reserved.</span>
          <span>Handcrafted in India · WhatsApp +91 73030 25805</span>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-foreground/70">{title}</div>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link to={href as any} className="text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
