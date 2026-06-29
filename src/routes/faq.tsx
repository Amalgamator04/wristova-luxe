import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — WRISTOVA" }] }),
  component: FAQ,
});

const items = [
  ["Are your bracelets adjustable?", "Most pieces come in S/M/L sizing. Beaded styles are on elastic; leather and chain styles use a sized clasp."],
  ["What materials do you use?", "Full-grain leather, natural stones, 316L stainless steel, and 18k gold-plated brass."],
  ["How long does shipping take?", "3–5 business days across India. Free on orders over ₹2,000."],
  ["What's your return policy?", "14 days from delivery. Unworn, in original packaging. We pay return shipping on faulty items."],
  ["Do you ship internationally?", "Not yet. International shipping is coming in 2026."],
  ["How do I place an order?", "Add items to your cart and check out with Cash on Delivery — pay when your bracelet arrives."],
];

function FAQ() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">FAQ</p>
        <h1 className="mt-2 font-serif text-5xl">Questions, answered.</h1>
        <Accordion type="single" collapsible className="mt-10">
          {items.map(([q, a], i) => (
            <AccordionItem key={i} value={`i${i}`}>
              <AccordionTrigger className="text-lg font-serif">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteShell>
  );
}
