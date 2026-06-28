import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const TO_EMAIL = "prabhavs2004@gmail.com";

function b64url(s: string) {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

type Item = { name: string; qty: number; price: number; variant?: string | null };
type Payload = {
  orderNumber: string | number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: { line1: string; city: string; state: string; pincode: string };
  notes?: string | null;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: Item[];
};

export const sendOrderEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Payload) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const connKey = process.env.GOOGLE_MAIL_API_KEY;
    if (!apiKey || !connKey) {
      console.error("Missing Gmail gateway credentials");
      return { ok: false, error: "missing_credentials" };
    }

    const itemsHtml = data.items.map(i =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}${i.variant ? ` <small>(${i.variant})</small>` : ""}</td>` +
      `<td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>` +
      `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmtINR(i.price)}</td>` +
      `<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmtINR(i.price * i.qty)}</td></tr>`
    ).join("");

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#F7F2EC;color:#2C1F18;padding:24px">
<div style="max-width:640px;margin:auto;background:#fff;padding:28px;border-radius:12px">
  <h2 style="margin:0 0 4px">New WRISTOVA Order</h2>
  <p style="margin:0 0 16px;color:#6b6b6b">Order #${data.orderNumber}</p>
  <h3 style="margin:18px 0 6px">Customer</h3>
  <p style="margin:2px 0">${data.customerName}</p>
  <p style="margin:2px 0">${data.customerEmail} · ${data.customerPhone}</p>
  <h3 style="margin:18px 0 6px">Shipping</h3>
  <p style="margin:2px 0">${data.address.line1}</p>
  <p style="margin:2px 0">${data.address.city}, ${data.address.state} ${data.address.pincode}</p>
  ${data.notes ? `<p style="margin:8px 0;font-style:italic">Notes: ${data.notes}</p>` : ""}
  <h3 style="margin:18px 0 6px">Items</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr style="background:#F7F2EC"><th style="text-align:left;padding:8px">Product</th><th style="padding:8px">Qty</th><th style="text-align:right;padding:8px">Price</th><th style="text-align:right;padding:8px">Total</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <table style="width:100%;margin-top:14px;font-size:14px">
    <tr><td>Subtotal</td><td style="text-align:right">${fmtINR(data.subtotal)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right">${fmtINR(data.shipping)}</td></tr>
    <tr><td style="font-weight:bold;padding-top:6px">Total</td><td style="text-align:right;font-weight:bold;padding-top:6px">${fmtINR(data.total)}</td></tr>
    <tr><td style="padding-top:6px">Payment</td><td style="text-align:right;padding-top:6px">${data.paymentMethod.toUpperCase()}</td></tr>
  </table>
</div></body></html>`;

    const subject = `New Order #${data.orderNumber} — ${data.customerName} — ${fmtINR(data.total)}`;
    const rfc = [
      `To: ${TO_EMAIL}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      ``,
      html,
    ].join("\r\n");

    const res = await fetch(`${GATEWAY}/users/me/messages/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Connection-Api-Key": connKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: b64url(rfc) }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Gmail send failed", res.status, text);
      return { ok: false, error: `gmail_${res.status}` };
    }
    return { ok: true };
  });
