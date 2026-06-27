import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/queries";
import { effectivePrice, formatINR } from "@/lib/format";
import { resolveAsset } from "@/lib/assets";
import { Reveal } from "./Reveal";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const img = resolveAsset(product.images?.[0]?.url);
  const hover = resolveAsset(product.images?.[1]?.url ?? product.images?.[0]?.url);
  const price = effectivePrice(product);
  const onSale = product.sale_price && Number(product.sale_price) < Number(product.price);
  return (
    <Reveal delay={(index % 4) * 80}>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-card shadow-luxe">
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={hover}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
          {product.new_arrival && (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]">New</span>
          )}
          {onSale && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--leather)] px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-background">Sale</span>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-foreground truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{product.category?.name}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-medium">{formatINR(price)}</div>
            {onSale && <div className="text-xs text-muted-foreground line-through">{formatINR(product.price)}</div>}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function WishlistButton({ onToggle, active }: { onToggle: () => void; active: boolean }) {
  return (
    <button onClick={onToggle} aria-label="Wishlist" className={`grid h-11 w-11 place-items-center rounded-full border border-input transition-colors ${active ? "bg-[var(--leather)] text-background border-transparent" : "hover:bg-accent/40"}`}>
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
