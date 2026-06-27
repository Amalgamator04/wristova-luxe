export const formatINR = (n: number | string | null | undefined) => {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
};

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export function effectivePrice(p: { price: number | string; sale_price?: number | string | null }) {
  const sale = p.sale_price ? Number(p.sale_price) : null;
  const price = Number(p.price);
  return sale && sale < price ? sale : price;
}
