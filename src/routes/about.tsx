import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { craftImage, lifestyleImage } from "@/lib/assets";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — WRISTOVA" }, { name: "description", content: "Our story: small-batch, hand-finished bracelets made one wrist at a time." }] }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Our story</p>
          <h1 className="mt-2 font-serif text-5xl sm:text-6xl">A craft, not a catalogue.</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Wristova began with a single bracelet on a workbench in 2021. We were tired of cheap pieces that fell apart in a season,
            and bored with luxury that felt sterile. So we started making the bracelet we wanted to wear ourselves —
            full-grain leather, real stone, surgical-grade steel, finished by hand.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <img src={craftImage} alt="Workshop" loading="lazy" className="rounded-3xl shadow-luxe object-cover aspect-[4/3]" />
            <img src={lifestyleImage} alt="On the wrist" loading="lazy" className="rounded-3xl shadow-luxe object-cover aspect-[4/3]" />
          </div>
        </Reveal>
        <Reveal delay={280}>
          <p className="mt-12 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Today, every Wristova bracelet is still made in small batches by a tiny team. We don't release new collections every month.
            We don't sell anything we wouldn't wear. We're not for everyone — and that's okay.
          </p>
        </Reveal>
      </section>
    </SiteShell>
  );
}
