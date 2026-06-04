## Goal

Add an admin-only chatbot — gold launcher with a star icon, only visible inside `/admin/*`. Completely separate from the customer `ChatWidget` (no shared state, prompt, or storage). Backend goes through a new Supabase Edge Function that calls Anthropic Claude server-side, verifies the caller is an admin, and exposes read-only tools for looking up admin data.

## Part 1 — Edge Function `admin-assistant`

New file: `supabase/functions/admin-assistant/index.ts`. Configured with `verify_jwt = false` (Lovable default) — we validate the JWT in code with `supabase.auth.getClaims()` and check `profiles.is_admin` (or `admin_profiles` if that lands later). Non-admins get `403`.

Anthropic key: reuse the existing `VITE_ANTHROPIC_API_KEY` secret server-side (it's already in the project secrets). Function reads it from `Deno.env`; it is never exposed to the browser.

### Request shape

```ts
POST /functions/v1/admin-assistant
Authorization: Bearer <user JWT>
{ messages: [{ role: 'user' | 'assistant', content: string }] }
```

Returns a streamed text response (SSE-style, same pattern as `concierge-chat`) so the panel can stream tokens.

### System prompt (server-side only)

> You are the Mount Kailash Rejuvenation Centre admin assistant. You help staff navigate the admin section, understand what each tab does (Orders, Products, Retreats, Retreat Dates, Reviews, Webinars, Analytics, Notifications), look up orders and their status, and answer operational questions about the store. You only serve admins. You never talk to customers, never give medical or product advice, never modify data — you are read-only. Use the provided tools to look up information rather than guessing. When citing an order, include its order number and current status. When pointing staff at the UI, name the exact tab.

### Tools (Anthropic tool-calling, read-only)

Implemented as a server-side dispatcher backed by the **service-role** Supabase client (function already verified the caller is admin, so service-role is safe here):

| Tool | Input | Returns |
|---|---|---|
| `search_orders` | `{ query?: string, status?: string, limit?: number }` | Recent orders matching query against `order_number`, `customer_name`, `email`, `phone`. |
| `get_order` | `{ order_number: string }` | Order + items + latest status_history entry. |
| `count_orders_by_status` | `{ group_by?: 'status' \| 'payment_status' \| 'fulfillment_status' }` | Counts grouped by the chosen field. |
| `get_product` | `{ slug?: string, name?: string }` | Product row + variants + category. |
| `recent_notifications` | `{ limit?: number, unread_only?: boolean }` | Latest entries from `notifications`. |

Tool loop: standard Anthropic tool-use cycle — model returns `tool_use` blocks, server runs them, posts `tool_result` blocks back, loops until the model returns a final text response (capped at e.g. 6 tool rounds).

Model: `claude-3-5-sonnet-latest` (or whichever is current in the existing Anthropic usage — I'll match what's already used elsewhere if present, otherwise default to sonnet).

CORS: standard headers, including OPTIONS preflight.

## Part 2 — Admin chat widget (frontend)

New files, fully isolated from `ChatWidget` / `MountKailashChat`:

- `src/components/admin/AdminChatLauncher.tsx` — floating gold button, bottom-right, same shape and offsets as the customer launcher (so muscle memory matches), but:
  - Background: gold gradient (`#d4a017` → `#b8860b`), white star icon (`Star` from `lucide-react`).
  - `aria-label="Admin assistant"`.
  - Tooltip bubble: "Admin assistant" (no marketing copy, no auto-popup with sales).
- `src/components/admin/AdminChatPanel.tsx` — slide-up panel matching the existing customer panel dimensions and corner radius, but themed in admin tokens (cream/green surface, gold accent on the send button and header bar). Header reads "Mount Kailash Admin Assistant · read-only".
- Messages render with `react-markdown` (already a transitive dep via existing chat; if missing, add it). User messages right-aligned with green chip; assistant left-aligned plain.

### State & storage

Per the chat-agent contract: **one conversation, no persistence** (matches the user's request — they didn't ask for history or threads, and the bot is operational, not personal). Messages live in component state only; closing the panel keeps them for the session, refresh clears them. A small "Clear" button in the header resets the conversation.

Streaming: read the SSE response from the edge function and append tokens to the in-flight assistant message. Textarea auto-focuses on open and after each send.

### Transport

```ts
fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-assistant`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`, // user's JWT, not the publishable key
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  body: JSON.stringify({ messages }),
});
```

Session token is pulled from `supabase.auth.getSession()` on every send so it stays fresh.

## Part 3 — Mounting

`src/App.tsx`:
- The existing `!isAdminRoute && <ChatWidget />` guard stays exactly as is — customer widget remains hidden on admin routes, untouched.
- Add a sibling render: `{isAdminRoute && <AdminChat />}` where `AdminChat` is a tiny wrapper that lazy-loads `AdminChatLauncher` (which itself owns the panel state). It also short-circuits if `useAdmin().isAdmin === false`, so a non-admin who somehow lands on an admin path never sees the launcher.

No changes to any admin tab, `AdminLayout`, the customer `ChatWidget`, or `MountKailashChat`.

## Files touched

- New: `supabase/functions/admin-assistant/index.ts`
- New: `src/components/admin/AdminChatLauncher.tsx`, `src/components/admin/AdminChatPanel.tsx`, `src/components/admin/AdminChat.tsx` (mount wrapper)
- Edited: `src/App.tsx` (one extra conditional render)

## Security checklist

- JWT verified in the edge function via `getClaims`; admin check via `profiles.is_admin` (service-role query). Non-admin → `403`, no model call.
- Anthropic key only read from `Deno.env`, never returned to client.
- Tools use parameterized Supabase client calls; no raw SQL, no client-supplied SQL.
- Read-only: no INSERT/UPDATE/DELETE tools registered, so even prompt-injection can't make the bot mutate data.
- Customer chat code path is not imported, mounted, or referenced from the admin widget.

## Open question

Do you want a small "Suggested questions" row in the empty state (e.g. "Show me unpaid orders", "What does the Retreats tab do?", "Find order MK-20260604-1234")? Not strictly requested — happy to include or skip. Default: include three concise quick-start chips.
