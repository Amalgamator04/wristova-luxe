import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { heroImage, craftImage, lifestyleImage, resolveAsset } from "@/lib/assets";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Award, Truck, Package, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WRISTOVA — Handcrafted Men's Bracelets" },
      { name: "description", content: "Premium leather, beaded, chain and gold-accent bracelets. Handcrafted, made to last." },
      { property: "og:title", content: "WRISTOVA — Handcrafted Men's Bracelets" },
      { property: "og:description", content: "Premium leather, beaded, chain and gold-accent bracelets. Handcrafted, made to last." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <Collections />
      <BestSellers />
      <NewArrivals />
      <Why />
      <Reviews />
      <Gallery />
      <Newsletter />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[600px] -mt-16 overflow-hidden">
      <img src={heroImage} alt="WRISTOVA bracelet" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background" />
      <div className="relative h-full flex items-end pb-24">
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">New · Spring Collection</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-3 font-serif text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight max-w-3xl">
              Quietly considered.<br/>
              <span className="italic text-foreground/90">Made for the wrist.</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Handcrafted bracelets in full-grain leather, natural stone and surgical-grade steel. Built one wrist at a time.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center rounded-full border border-foreground/30 px-7 py-3.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Collections() {
  const { data } = useQuery(categoriesQuery());
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
      <div className="flex items-end justify-between mb-12">
        <Reveal>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Collections</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Find your wrist.</h2>
          </div>
        </Reveal>
        <Link to="/shop" className="hidden sm:inline-flex items-center text-sm gap-1 hover:gap-2 transition-all">View all <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((c, i) => (
          <Reveal key={c.id} delay={i * 100}>
            <Link to="/shop" search={{ category: c.slug } as any} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-luxe">
                <img src={resolveAsset(c.image_url)} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                  <div className="font-serif text-2xl">{c.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] opacity-80 flex items-center gap-1.5">Explore <ArrowRight className="h-3 w-3" /></div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function BestSellers() {
  const { data } = useQuery(productsQuery({ bestSeller: true, limit: 4 }));
  return (
    <section className="bg-[var(--section)]/60 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Best Sellers</p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Worn most. Loved most.</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(data ?? []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function NewArrivals() {
  const { data } = useQuery(productsQuery({ newArrival: true, limit: 4 }));
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">New Arrivals</p>
        <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Just landed.</h2>
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

function Why() {
  const items = [
    { i: Award, t: "Handcrafted", d: "Made one piece at a time by hand in our small workshop." },
    { i: Sparkles, t: "Premium materials", d: "Full-grain leather, natural stones, surgical-grade steel." },
    { i: Truck, t: "Free shipping over ₹2,000", d: "Tracked, insured delivery across India." },
    { i: Package, t: "Easy returns", d: "Not for you? 14 days, no questions asked." },
  ];
  return (
    <section className="relative wavy-bg py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-16 lg:grid-cols-2 items-center">
        <Reveal>
          <img src={craftImage} alt="Craftsmanship" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-luxe" />
        </Reveal>
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Why Wristova</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">A craft, not a catalogue.</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {items.map((it, i) => (
              <Reveal key={it.t} delay={i * 80}>
                <div className="rounded-2xl bg-card p-6 shadow-luxe">
                  <it.i className="h-5 w-5 text-[var(--gold)]" />
                  <div className="mt-3 font-serif text-xl">{it.t}</div>
                  <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{it.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const data = [
    { q: "Sharp, understated and built like a tank. Wear it every day.", a: "Arjun S." },
    { q: "Better in person. The leather has aged beautifully in 6 months.", a: "Karthik R." },
    { q: "Easily the best bracelet I own. Worth every rupee.", a: "Rahul M." },
  ];
  return (
    <section className="bg-foreground text-background py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] opacity-60">Worn around the world</p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Reviews from the wrist.</h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {data.map((r, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="px-2">
                <div className="text-[var(--gold)] tracking-[0.4em] text-sm">★★★★★</div>
                <p className="mt-4 font-serif text-xl italic leading-relaxed">"{r.q}"</p>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] opacity-70">— {r.a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const imgs = [lifestyleImage, heroImage, craftImage, lifestyleImage, heroImage, craftImage];
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">@wristova</p>
        <h2 className="mt-2 font-serif text-4xl sm:text-5xl">From the field.</h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {imgs.map((src, i) => (
          <Reveal key={i} delay={i * 60}>
            <a href="https://instagram.com" className="block aspect-square overflow-hidden rounded-xl">
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Please enter a valid email."); return; }
    setBusy(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) { toast.error(error.message); return; }
    setEmail("");
    toast.success("You're on the list.");
  }
  return (
    <section className="bg-[var(--section)] py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="font-serif text-4xl">Subscribe. Save 10%.</h2>
          <p className="mt-3 text-muted-foreground">New drops, restocks, and the occasional letter on craft.</p>
          <form onSubmit={subscribe} className="mt-8 flex max-w-md mx-auto rounded-full border border-foreground/20 bg-card overflow-hidden">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-transparent px-5 py-3 text-sm outline-none"
            />
            <button disabled={busy} className="px-6 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
              {busy ? "…" : "Subscribe"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
