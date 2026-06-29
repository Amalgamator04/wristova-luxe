import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SHEET_ID = "1FPsbTfsr5XzjPOWXUQU4VhxGlSWQKWskRBhYGlv9LbQ";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

type Item = { name: string; qty: number; price: number; variant?: string | null };
type Payload = {
  orderNumber: string | number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: { line1: string; city: string; state: string; pincode: string };
  paymentMethod: string;
  subtotal: number;
  total: number;
  items: Item[];
};

export const appendOrderToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Payload) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const connKey = process.env.GOOGLE_SHEETS_API_KEY;
    if (!apiKey || !connKey) {
      console.error("Missing Google Sheets gateway credentials");
      return { ok: false, error: "missing_credentials" };
    }

    const itemsStr = data.items
      .map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.qty} @${i.price}`)
      .join(" | ");
    const addr = `${data.address.line1}`;

    const row = [
      new Date().toISOString(),
      String(data.orderNumber),
      data.customerName,
      data.customerEmail,
      data.customerPhone,
      addr,
      data.address.city,
      data.address.state,
      data.address.pincode,
      data.paymentMethod.toUpperCase(),
      itemsStr,
      data.subtotal,
      data.total,
    ];

    const res = await fetch(
      `${GATEWAY}/spreadsheets/${SHEET_ID}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Connection-Api-Key": connKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("Sheets append failed", res.status, text);
      return { ok: false, error: `sheets_${res.status}` };
    }
    return { ok: true };
  });
