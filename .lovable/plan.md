
# WRISTOVA — Full Build Plan

A premium men's bracelet brand site with storefront, WhatsApp + COD checkout, customer accounts, and a hidden admin dashboard. Backend on Lovable Cloud.

## Brand system (locked)
- Palette: bg `#F7F2EC`, card `#FFF9F3`, section `#E8DDD2`, text `#2C1F18` / `#5A4335`, leather `#4A2F24`, chocolate `#6B4A38`, gold `#C5A46D`.
- Type: Cormorant Garamond (display serif), Inter (body), Inter SemiBold (buttons).
- Language: warm minimalism, generous whitespace, rounded corners (xl/2xl), soft shadows, subtle organic wavy SVG backgrounds, gold hairlines.
- Motion: smooth scroll, fade-up / slide-up reveals, staggered product cards, hover image zoom, transparent → blurred navbar, scroll progress bar, back-to-top, skeleton loaders. Built with framer-motion + IntersectionObserver, reduced-motion respected.

## Tech approach
- TanStack Start (existing template), Tailwind v4 design tokens in `src/styles.css`, shadcn components themed to the palette.
- Lovable Cloud (Supabase) for DB, auth, storage, server functions.
- AI-generated bracelet imagery (leather, beaded, chain, gold-accent) saved to `src/assets/` for seed catalog; admin can later replace via Media Library (storage bucket).
- WhatsApp deep links to `https://wa.me/917303025805?text=...` built from product + selection.

## Database schema (Lovable Cloud)
Tables (all with GRANTs + RLS):
- `profiles` (id→auth.users, full_name, phone, addresses jsonb)
- `user_roles` (user_id, role enum: admin|customer) + `has_role()` security-definer fn
- `categories` (slug, name, description, image_url, sort_order)
- `products` (slug, name, description, price, sale_price, sku, stock, category_id, tags[], featured, best_seller, new_arrival, materials, seo_title, seo_description)
- `product_images` (product_id, url, alt, sort_order)
- `reviews` (product_id, user_id, rating, title, body, approved)
- `wishlist` (user_id, product_id)
- `recently_viewed` (user_id, product_id, viewed_at)
- `cart_items` (user_id, product_id, qty, variant)
- `orders` (user_id, status enum, subtotal, shipping, total, payment_method enum: cod|whatsapp, address jsonb, notes)
- `order_items` (order_id, product_id snapshot fields, qty, price)
- `coupons` (code, type, value, active, expires_at, usage_limit)
- `newsletter_subscribers` (email)
- `contact_messages` (name, email, subject, body)
- `site_settings` (singleton: logo_url, favicon_url, hero banners jsonb, social links, contact info, SEO defaults)

RLS: customers read/write only their own rows; admins (via `has_role`) full access; products/categories/reviews(approved) public read.

Seed migration: admin role for username `Prabhav` after first signup with that email; seed ~12 bracelets across 4 categories (Leather, Beaded, Chain, Gold-Accent) and site_settings defaults.

## Auth
- Email/password (auto-confirm on) + Google OAuth via Lovable broker.
- Admin seeding: on first run, create auth user `prabhav@wristova.local` with password `7303025805@Pps` (hashed by Supabase Auth), assign `admin` role. Admin can change password in profile. (Username "Prabhav" stored on profile.)
- `_authenticated/` layout for account pages; `_authenticated/_admin/` layout gated by `has_role('admin')` for dashboard.

## Routes
Public: `/`, `/shop`, `/shop/$category`, `/product/$slug`, `/cart`, `/checkout`, `/contact`, `/about`, `/faq`, `/privacy`, `/shipping`, `/returns`, `/terms`, `/auth` (login+signup).

Authenticated: `/account`, `/account/orders`, `/account/orders/$id`, `/account/wishlist`, `/account/addresses`.

Admin (`/_authenticated/_admin/`): `/admin` (dashboard with revenue/sales charts via Recharts), `/admin/products`, `/admin/products/$id`, `/admin/categories`, `/admin/orders`, `/admin/customers`, `/admin/inventory`, `/admin/coupons`, `/admin/media`, `/admin/settings` (banners, logo, favicon, SEO, contact, socials).

## Homepage sections
Hero (full-bleed bracelet hero, parallax) → Featured Collections (4 category cards) → Best Sellers (carousel/grid) → New Arrivals → Why Wristova (4 icons: craftsmanship, materials, warranty, shipping) → Reviews (testimonial slider) → Instagram Gallery (6-tile grid) → Newsletter → Footer (4 columns + policies + socials).

## Product page
Sticky gallery with zoom (hover + lightbox), title, price/sale, rating, short description, materials list, quantity, Add to Cart, Buy Now, Buy on WhatsApp, Wishlist heart, accordion tabs (Description, Materials, Features, Shipping), Frequently Bought Together (3 picks), Related Products (4), Reviews with form for logged-in buyers.

## Shop
Sidebar filters: search, category, material, price range slider, in-stock toggle. Sort dropdown (Latest, Popularity, Price asc/desc). Responsive grid with staggered reveal + skeleton loaders. URL-synced filters via search params.

## Checkout
Address form (validated with zod), order summary, payment method radio: COD or WhatsApp. COD creates order with status `pending`. WhatsApp builds the message and opens `wa.me` while also recording a `whatsapp` order. Empty-cart guard + success page.

## WhatsApp integration
Shared helper builds the exact message template you specified (Product, Price, Variant, Quantity, Product Link, Image URL, Customer Name) and opens `https://wa.me/917303025805?text=<encoded>`. Used on PDP "Buy on WhatsApp" and the WhatsApp checkout method.

## Admin dashboard
- KPI cards (revenue, orders, AOV, customers) + Recharts line/bar (last 30/90 days).
- CRUD tables with shadcn DataTable (sort, search, pagination).
- Product editor: multi-image upload to storage `product-images`, fields per spec, slug auto-generated, SEO fields, flags (featured/best_seller/new_arrival).
- Order detail: status dropdown (Pending → Processing → Packed → Shipped → Delivered → Cancelled → Refunded), customer info, items, totals.
- Media Library: grid of storage objects with upload/delete.
- Settings: logo/favicon upload, hero banner editor (image + headline + CTA), SEO defaults, social links, contact info.

## Server functions (createServerFn)
Public reads via server publishable client: list products/categories, get product by slug. Authenticated: cart ops, wishlist, place order, submit review, newsletter signup, contact form. Admin-gated: all CRUD, order status updates, settings updates, media management. Storage buckets: `product-images` (public), `category-images` (public), `site-assets` (public), `media-library` (public).

## Build order (single pass, sequenced)
1. Enable Cloud, create schema + RLS + grants + seed (admin user + categories + sample products + settings).
2. Design tokens, fonts, base layout (navbar, footer, wavy bg, scroll progress, back-to-top).
3. Generate ~20 AI bracelet images (hero, category covers, product shots, lifestyle).
4. Public pages: Home, Shop, Product, static policy pages, Contact, About, FAQ.
5. Auth pages + account area (profile, orders, wishlist, addresses).
6. Cart + Checkout (COD + WhatsApp) + order confirmation.
7. Admin shell + dashboard + all CRUD + media + settings.
8. Animations pass (framer-motion reveals, hover, navbar blur, skeletons).
9. SEO pass: per-route `head()`, sitemap-ready titles/descriptions, OG images on leaf routes.
10. Polish + responsive QA.

## Notes / caveats
- Scope is large — expect follow-up iterations for fine polish on admin charts, advanced filtering, and email notifications.
- Online card payments are not included (deferred per your choice). Razorpay/Stripe can be added later.
- The shared admin password lives in chat history; you can rotate it from the admin profile after first login. Strongly recommended.
