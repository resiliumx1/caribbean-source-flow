## Goal
1. Let customers paste a tracking number (or order number) into the concierge chatbot and get back live status + an ETA window from our own `orders` table.
2. Generate that ETA from dispatch date + destination country using a shared table of regional delivery windows.
3. Add a structured System→Product map (data, not just prose in the prompt) the bot uses for reliable symptom matching.

## Architecture

### A. New edge function: `order-tracking-lookup`
`supabase/functions/order-tracking-lookup/index.ts`

- **Input** (POST JSON): `{ query: string }` where `query` is a tracking number OR order number (`MK-YYYYMMDD-XXXX`).
- **Auth**: public function (no JWT). Tracking numbers and `MK-…` order numbers are unguessable enough; we additionally rate-limit by IP/sessionId (same in-memory pattern as `concierge-chat`, 20 lookups / hr).
- **DB access**: uses `SUPABASE_SERVICE_ROLE_KEY` (already in secrets) so it can read `orders` past RLS. Query:
  ```ts
  .from("orders")
    .select("order_number, tracking_number, tracking_carrier, status, fulfillment_status, country, delivery_type, updated_at, created_at")
    .or(`tracking_number.eq.${q},order_number.eq.${q}`)
    .maybeSingle()
  ```
- **Output** (sanitized — never returns email/address/phone/totals):
  ```json
  {
    "found": true,
    "orderNumber": "MK-20260615-0420",
    "status": "shipped",
    "fulfillmentStatus": "in_transit",
    "trackingNumber": "1Z…",
    "carrier": "DHL",
    "carrierTrackingUrl": "https://www.dhl.com/…",
    "dispatchedAt": "2026-06-17T...",
    "destinationRegion": "USA",
    "etaWindow": { "earliest": "2026-06-20", "latest": "2026-06-24" },
    "message": "Your order shipped 3 days ago via DHL. Expected delivery: Jun 20–24."
  }
  ```
- If `not found` → `{ found: false, message: "…" }`.
- If found but not yet shipped → ETA window starts from `created_at + handling buffer`.

### B. Shared delivery-windows table
`supabase/functions/_shared/delivery-windows.ts`

Single source of truth used by both the tracking function and the concierge prompt (kept in sync):
```ts
export const HANDLING_DAYS = { min: 1, max: 3 };
export const DELIVERY_WINDOWS = {
  LC: { label: "Saint Lucia", min: 1, max: 2 },
  CARIBBEAN: { label: "Caribbean / CARICOM", min: 3, max: 7, countries: ["BB","TT","JM","GD","VC","DM","AG","KN","GY","SR","BS","BZ"] },
  USA: { label: "USA", min: 3, max: 7, countries: ["US"] },
  CANADA: { label: "Canada", min: 7, max: 14, countries: ["CA"] },
  UK_EU: { label: "UK / EU", min: 7, max: 14, countries: ["GB","IE","FR","DE","ES","IT","NL","BE","SE","NO","DK","FI","PT","AT","CH","PL"] },
  ROW: { label: "Rest of world", min: 10, max: 21 },
};
export function resolveRegion(country?: string | null) { /* map → key */ }
export function computeEta(dispatchDate: Date | null, region) { /* returns {earliest, latest} */ }
export function carrierTrackingUrl(carrier?: string, tracking?: string) { /* DHL, UPS, USPS, FedEx, DPD, Royal Mail — fallback to google */ }
```

### C. Concierge chatbot wiring
`supabase/functions/concierge-chat/index.ts`

- **Pre-LLM intercept**: before calling the model, scan the user's latest message for a tracking-number pattern (`/\b(MK-\d{8}-\d{4}|1Z[0-9A-Z]{16}|\d{12,22})\b/`) **or** the phrase "track", "tracking", "where is my order" combined with any alphanumeric token. If matched, call the same internal lookup logic and return a deterministic, formatted reply directly (no model hallucination risk). Fallback to the LLM if lookup says `not found`, with a hint to double-check the number.
- **Frontend hint**: also accept a structured client signal `body.intent === "track"` with `body.trackingQuery` so the chat UI can offer a "Track my order" quick-action.

### D. Frontend chat UI
`src/components/ai-assistant/` (existing chat widget — I'll locate the exact file when building)

- Add a "📦 Track my order" suggestion chip in the chat composer that pre-fills `Track order: ` and focuses the input.
- No new screens; just a chip + a small helper line ("Paste your tracking number or order ID like MK-20260615-0420").

### E. System → Product map (structured data)
New file: `src/lib/system-product-map.ts`

Typed map used by both the frontend (future Shop "Find by symptom" filter) and exported as a JSON block injected into the concierge system prompt so the bot reads from a single source of truth instead of prose-only.

```ts
export type BodySystem =
  | "immune" | "respiratory" | "digestive" | "colon"
  | "hormonal_female" | "male_reproductive" | "prostate"
  | "nervous_sleep" | "cardiovascular" | "blood_sugar"
  | "urinary" | "detox_liver" | "blood_anaemia" | "skin";

export interface SystemEntry {
  system: BodySystem;
  label: string;
  symptoms: string[];          // keywords for matching
  primaryProducts: string[];   // product names exactly as in catalogue
  bundles?: string[];
  notes?: string;
}

export const SYSTEM_PRODUCT_MAP: SystemEntry[] = [ /* one entry per system, mirroring current quick-map */ ];
export function findSystemsForSymptom(input: string): SystemEntry[] { /* keyword search */ }
```

`concierge-chat` will read this map (duplicated into the function dir as `_shared/system-product-map.ts` since edge functions can't import from `src/`) and inject a compact JSON version into the system prompt, replacing the hand-written quick-map block so prose and data can't drift apart.

## Privacy & safety
- Tracking lookup returns only: order number, status, carrier, tracking #, dispatch date, destination country (not address), ETA. **No email, phone, address, totals, line items.**
- Rate-limited (20 lookups / IP / hr) to deter scraping.
- All output is plain text formatted server-side — no LLM rephrasing of order data, so no chance of hallucinating a fake ETA.
- Input validation with Zod: `query` length 4–40, alphanumeric + `-` only.

## Files to be created / edited
- **NEW** `supabase/functions/order-tracking-lookup/index.ts`
- **NEW** `supabase/functions/_shared/delivery-windows.ts`
- **NEW** `supabase/functions/_shared/system-product-map.ts`
- **NEW** `src/lib/system-product-map.ts` (frontend mirror, same data)
- **EDIT** `supabase/functions/concierge-chat/index.ts` — pre-LLM tracking intercept, prompt now injects map from shared file
- **EDIT** chat UI widget — add "Track my order" quick chip + helper text

## Out of scope (flag for later)
- Calling carriers' real APIs (DHL/UPS/USPS) for live in-transit scans. We're returning **our** dispatch state + a calculated ETA window. Easy to layer on later via a carrier-specific function.
- Authenticated "my orders" lookup tied to a logged-in account (could be added so logged-in users see all their orders without typing a number).