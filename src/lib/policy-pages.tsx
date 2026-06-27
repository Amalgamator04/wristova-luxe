import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

type PageConfig = { slug: string; title: string; intro: string; sections: [string, string][] };

const pages: Record<string, PageConfig> = {
  privacy: {
    slug: "privacy", title: "Privacy Policy", intro: "Your privacy matters. Here's how we handle your data at WRISTOVA.",
    sections: [
      ["Information we collect", "Account details, order history, and addresses you provide. We use cookies to keep you signed in and to remember your cart."],
      ["How we use it", "To process orders, deliver bracelets, send transactional emails, and improve the store. We never sell your data."],
      ["Sharing", "Only with shipping partners and payment processors required to fulfil your order."],
      ["Your rights", "Email hello@wristova.com any time to access, correct, or delete your data."],
    ],
  },
  shipping: {
    slug: "shipping", title: "Shipping Policy", intro: "Tracked, insured delivery — handled with care.",
    sections: [
      ["Domestic shipping", "Free across India on orders over ₹2,000. Flat ₹150 below that. Dispatched within 24 hours, delivered in 3–5 business days."],
      ["International", "Not currently available — coming in 2026."],
      ["Tracking", "You'll receive a tracking link by email and SMS the moment your order ships."],
    ],
  },
  returns: {
    slug: "returns", title: "Return Policy", intro: "Not for you? Send it back within 14 days.",
    sections: [
      ["14-day returns", "Unworn, in original packaging. Initiate from your order page or email us."],
      ["Refunds", "Processed within 5–7 days of receipt. Original payment method."],
      ["Exchanges", "Yes — for size or a different style of equal value. We cover return shipping on size exchanges."],
    ],
  },
  terms: {
    slug: "terms", title: "Terms & Conditions", intro: "The fine print, kept short.",
    sections: [
      ["Use of site", "By using this site you agree to these terms. We may update them — material changes are emailed to account holders."],
      ["Orders", "We reserve the right to refuse or cancel an order at our discretion."],
      ["Liability", "Wristova is not liable for indirect or consequential damages."],
      ["Governing law", "These terms are governed by the laws of India."],
    ],
  },
};

function makePage(cfg: PageConfig) {
  return function Page() {
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
  };
}

export const PrivacyComp = makePage(pages.privacy);
export const ShippingComp = makePage(pages.shipping);
export const ReturnsComp = makePage(pages.returns);
export const TermsComp = makePage(pages.terms);

export const Route = createFileRoute("/_policies-placeholder").stub?.() as any;
