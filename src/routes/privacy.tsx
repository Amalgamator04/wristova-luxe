import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/lib/policy-pages";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — WRISTOVA" }] }),
  component: () => <PolicyPage cfg={{
    title: "Privacy Policy",
    intro: "Your privacy matters. Here's how we handle your data at WRISTOVA.",
    sections: [
      ["Information we collect", "Account details, order history, and addresses you provide. We use cookies to keep you signed in and to remember your cart."],
      ["How we use it", "To process orders, deliver bracelets, send transactional emails, and improve the store. We never sell your data."],
      ["Sharing", "Only with shipping partners and payment processors required to fulfil your order."],
      ["Your rights", "Email hello@wristova.com any time to access, correct, or delete your data."],
    ],
  }} />,
});
