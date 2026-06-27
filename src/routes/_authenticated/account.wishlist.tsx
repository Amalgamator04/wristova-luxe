import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { wishlistQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { resolveAsset } from "@/lib/assets";
import { effectivePrice, formatINR } from "@/lib/format";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — WRISTOVA" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { user } = useAuth();
  const { data } = useQuery(wishlistQuery(user?.id ?? null));
  const qc = useQueryClient();
  const items = (data ?? []) as any[];

  async function remove(id: string) {
    await supabase.from("wishlist").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No items in your wishlist.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <div key={w.id} className="group relative rounded-2xl bg-card p-4 shadow-luxe">
              <button onClick={() => remove(w.id)} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 hover:bg-background"><X className="h-3.5 w-3.5" /></button>
              <Link to="/product/$slug" params={{ slug: w.product.slug }}>
                <div className="aspect-square overflow-hidden rounded-xl">
                  <img src={resolveAsset(w.product.images?.[0]?.url)} alt={w.product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="mt-3 font-serif text-lg">{w.product.name}</div>
                <div className="text-sm">{formatINR(effectivePrice(w.product))}</div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
