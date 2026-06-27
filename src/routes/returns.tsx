import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/lib/policy-pages";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Return Policy — WRISTOVA" }] }),
  component: () => <PolicyPage cfg={{
    title: "Return Policy",
    intro: "Not for you? Send it back within 14 days.",
    sections: [
      ["14-day returns", "Unworn, in original packaging. Initiate from your order page or email us."],
      ["Refunds", "Processed within 5–7 days of receipt. Original payment method."],
      ["Exchanges", "Yes — for size or a different style of equal value. We cover return shipping on size exchanges."],
    ],
  }} />,
});
