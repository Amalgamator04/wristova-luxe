import { SiteShell } from "@/components/site/SiteShell";

export type PageConfig = { title: string; intro: string; sections: [string, string][] };

export function PolicyPage({ cfg }: { cfg: PageConfig }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-serif text-5xl">{cfg.title}</h1>
        <p className="mt-4 text-muted-foreground">{cfg.intro}</p>
        <div className="mt-10 space-y-8">
          {cfg.sections.map(([h, b]) => (
            <section key={h}>
              <h2 className="font-serif text-2xl">{h}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{b}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-muted-foreground">Last updated: June 2026</p>
      </div>
    </SiteShell>
  );
}
