## Goal
Improve the concierge AI bot (`supabase/functions/concierge-chat/index.ts`) in two areas:
1. Teach it how delivery, fulfillment, and tracking actually work so customers get accurate ETAs.
2. Make it more reliable at mapping medical questions / symptoms to specific products.

No UI changes; this is a single edit to the `SYSTEM_PROMPT` plus a small handoff-rule tweak.

## Changes

### 1. New "Delivery & Tracking" section in the system prompt
Add a clearly labeled block the model can quote from. Content:

- **How fulfillment works**
  - After an order is placed, the MKRC team receives it and personally prepares the parcel.
  - Once shipped, the team sends the customer a tracking number by email (and WhatsApp if requested).
  - The customer can use that tracking number on the carrier's site to see the exact expected delivery date.
- **Typical timelines** (use as guidance, not guarantees)
  - Saint Lucia local delivery: 1–2 business days after dispatch.
  - Caribbean (CARICOM): 3–7 business days after dispatch.
  - USA / Canada (from Miami warehouse for wholesale; international post for retail): ~3–7 business days USA, 7–14 days Canada.
  - UK / EU: 7–14 business days.
  - Rest of world: 10–21 business days.
  - Order handling/processing before dispatch: 1–3 business days.
- **What the AI should say**
  - If asked "where is my order" / "when will it arrive" / "do you have tracking":
    - Explain the flow above (team ships → tracking number emailed → use it on carrier site for exact ETA).
    - Give the relevant typical window if the customer's region is known.
    - Then add `💬 CONNECT_WITH_TEAM` so a human can look up their specific order.
  - Never invent a tracking number, never invent an order status, never promise a specific delivery date.

### 2. Tighten the handoff rule
Currently the prompt says "redirect for order status / shipping tracking" but also tells it to answer first. Clarify:
- For *general* delivery questions ("how long does shipping take to the UK?") → answer using the timelines above, no handoff required.
- For *specific* order questions ("where is order MK-...", "I haven't received my package") → give the flow explanation, then `💬 CONNECT_WITH_TEAM`.

### 3. Strengthen symptom → product reliability
Add a "Symptom Triage" section the model must consult before answering health questions:

- **Mandatory reasoning steps** (internal, not shown to user):
  1. Identify the primary symptom / system (immune, digestive, hormonal, nervous, respiratory, circulatory, urinary, male repro, female repro, detox, sleep, blood sugar, skin).
  2. List candidate products from the catalogue whose "Recommend for" line matches.
  3. Pick the single most specific product. If 2+ systems are involved, suggest the matching **bundle** instead of listing items separately.
  4. Only recommend products that appear in the catalogue above.

- **Symptom → product quick-map** (add as an explicit lookup so the model doesn't drift):
  - Cold / flu / low immunity → **The Answer**; add **Pure Gold** if respiratory; bundle: **Immunity Kit**.
  - Cough, mucus, chest congestion → **Pure Gold**; **Anamu Syrup** if also flu-like.
  - Parasites, bloating, "worms" → **Gut Balance**.
  - Constipation, sluggish colon → **Colax**; ongoing → **Colax Quarterly Subscription**.
  - Indigestion, stomach pain, gas → **Digestive Rescue**; bundle: **Digestive Bundle**.
  - Anaemia, fatigue, low energy → **Pure Green**.
  - Insomnia, anxiety, stress, ADHD, depression → **Tranquility** or **Hemp Syrup**; capsule form: **Nerve Tonic Capsules**; tea: **Restful Tea**.
  - High blood pressure, heart support → **Hemp Syrup**, **Free Flow**.
  - High cholesterol, varicose veins, poor circulation → **Free Flow**.
  - Diabetes / blood sugar regulation → **Anamu Syrup**, **Free Flow**.
  - Kidney stones, UTI, urinary issues → **Urinary Cleanse Tea**.
  - Prostate, BPH, urinary urgency in men → **Prosperity**; bundle: **Prostate Health Bundle**.
  - Erectile dysfunction, low libido (men), low sperm count, stamina → **Male Balance** or **Prosperity**; capsule: **Virility Male Balance Capsules**; tea: **Virili-Tea**; bundles: **Male Potency Kit**, **Male Vitality Package**.
  - Fibroids, heavy/irregular periods, PCOS, fertility, PMS, menopause, low libido (women) → **Feminine Balance**; tea: **Moon Cycle Tea**; bundles: **Feminine Balance Kit**, **Super Female Wellness Package**.
  - Toxic load, post-illness recovery, liver support → **Herbal Detox**; bundle: **Detox Bundle**.
  - Skin issues, fungal, eczema → **Cassia Alata** (raw herb).
  - General women's wellness tea → **Queenly Tea Bundle**; men → **Kingly Tea Bundle**.

- **Safety guardrails** (reinforced):
  - Never diagnose. Frame as "traditional Caribbean herbal support for [symptom]", not "treats [disease]".
  - For pregnancy, nursing, prescription-drug interactions, children under 12, or red-flag symptoms (chest pain, severe bleeding, suspected stroke/heart attack, suicidal thoughts) → recommend seeing a qualified medical professional and add `💬 CONNECT_WITH_TEAM`.
  - If symptom doesn't match anything in the catalogue, say so honestly and offer the team handoff instead of inventing a product.
  - Always recommend at least one specific product when the symptom does match — don't punt to WhatsApp for basic recommendations.

## Technical notes
- Single-file change: `supabase/functions/concierge-chat/index.ts` (prompt only).
- No schema, no client, no new env vars. Function auto-deploys on save.
- Token impact: prompt grows by ~60 lines; still well within Gemini's context budget.
- No change to streaming, rate limit, or the existing `💬 CONNECT_WITH_TEAM` UI trigger token.

## Out of scope (flagging for later if you want)
- Actually wiring the bot into the `orders` table to look up a real tracking number for an authenticated customer. Right now it can only *explain* the process; it can't fetch a specific order. Say the word and I can add that as a follow-up.