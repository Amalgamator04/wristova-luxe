import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/lib/policy-pages";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — WRISTOVA" }] }),
  component: () => <PolicyPage cfg={{
    title: "Terms & Conditions",
    intro: "The fine print, kept short.",
    sections: [
      ["Use of site", "By using this site you agree to these terms. We may update them — material changes are emailed to account holders."],
      ["Orders", "We reserve the right to refuse or cancel an order at our discretion."],
      ["Liability", "Wristova is not liable for indirect or consequential damages."],
      ["Governing law", "These terms are governed by the laws of India."],
    ],
  }} />,
});
