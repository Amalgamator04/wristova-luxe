import { formatINR } from "./format";

const NUMBER = "917303025805";

export function whatsappForProduct(opts: {
  productName: string;
  price: number;
  variant?: string | null;
  qty: number;
  productUrl: string;
  productImage?: string | null;
  customerName?: string | null;
}) {
  const lines = [
    "Hello Wristova,",
    "",
    "I would like to order this bracelet.",
    "",
    `Product:\n${opts.productName}`,
    "",
    `Price:\n${formatINR(opts.price)}`,
    "",
    opts.variant ? `Variant:\n${opts.variant}` : null,
    `Quantity:\n${opts.qty}`,
    "",
    `Product Link:\n${opts.productUrl}`,
    opts.productImage ? `\nProduct Image:\n${opts.productImage}` : null,
    "",
    opts.customerName ? `Customer Name:\n${opts.customerName}\n` : null,
    "Please let me know the next steps for payment and delivery.",
  ].filter(Boolean) as string[];
  const msg = encodeURIComponent(lines.join("\n"));
  return `https://api.whatsapp.com/send?phone=${NUMBER}&text=${msg}`;
}

export function whatsappForOrder(opts: {
  orderNumber: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  customerName: string;
}) {
  const lines = [
    "Hello Wristova,",
    "",
    `New order: ${opts.orderNumber}`,
    `Customer: ${opts.customerName}`,
    "",
    "Items:",
    ...opts.items.map((i) => `• ${i.name} × ${i.qty} — ${formatINR(i.price * i.qty)}`),
    "",
    `Total: ${formatINR(opts.total)}`,
    "",
    "Please confirm payment and delivery.",
  ];
  const msg = encodeURIComponent(lines.join("\n"));
  return `https://api.whatsapp.com/send?phone=${NUMBER}&text=${msg}`;
}
