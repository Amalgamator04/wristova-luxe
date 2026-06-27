import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/lib/policy-pages";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping Policy — WRISTOVA" }] }),
  component: () => <PolicyPage cfg={{
    title: "Shipping Policy",
    intro: "Tracked, insured delivery — handled with care.",
    sections: [
      ["Domestic shipping", "Free across India on orders over ₹2,000. Flat ₹150 below that. Dispatched within 24 hours, delivered in 3–5 business days."],
      ["International", "Not currently available — coming in 2026."],
      ["Tracking", "You'll receive a tracking link by email and SMS the moment your order ships."],
    ],
  }} />,
});
