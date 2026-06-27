import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type Category = {
  id: string; slug: string; name: string; description: string | null;
  image_url: string | null; sort_order: number;
};

export type Product = {
  id: string; slug: string; name: string; description: string | null;
  price: number; sale_price: number | null; sku: string | null; stock: number;
  category_id: string | null; tags: string[]; materials: string[];
  featured: boolean; best_seller: boolean; new_arrival: boolean; active: boolean;
  seo_title: string | null; seo_description: string | null;
  images?: { url: string; alt: string | null; sort_order: number }[];
  category?: Category | null;
};

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

export const productsQuery = (filters?: {
  categorySlug?: string; featured?: boolean; bestSeller?: boolean; newArrival?: boolean; limit?: number;
}) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase
        .from("products")
        .select("*, images:product_images(url,alt,sort_order), category:categories(*)")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (filters?.featured) q = q.eq("featured", true);
      if (filters?.bestSeller) q = q.eq("best_seller", true);
      if (filters?.newArrival) q = q.eq("new_arrival", true);
      if (filters?.limit) q = q.limit(filters.limit);
      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as Product[];
      if (filters?.categorySlug) rows = rows.filter((r) => r.category?.slug === filters.categorySlug);
      rows.forEach((r) => r.images?.sort((a, b) => a.sort_order - b.sort_order));
      return rows;
    },
  });

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(url,alt,sort_order), category:categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      const p = data as unknown as Product | null;
      p?.images?.sort((a, b) => a.sort_order - b.sort_order);
      return p;
    },
  });

export const cartQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(*, images:product_images(url,sort_order))")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });

export const wishlistQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*, product:products(*, images:product_images(url,sort_order))")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });

export const ordersQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const allOrdersQuery = () =>
  queryOptions({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const siteSettingsQuery = () =>
  queryOptions({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
