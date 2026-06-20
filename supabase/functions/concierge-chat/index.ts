import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { lookupOrder } from "../order-tracking-lookup/index.ts";
import { mapAsPromptBlock } from "../_shared/system-product-map.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(sessionId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(sessionId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(sessionId, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: RATE_LIMIT_WINDOW_MS - (now - entry.windowStart) };
  }
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, resetIn: RATE_LIMIT_WINDOW_MS - (now - entry.windowStart) };
}

const WHATSAPP_NUMBER = "13059429407";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20MKRC%2C%20I%20have%20a%20question`;

// Emit a deterministic assistant reply as a single SSE chunk + [DONE], matching
// the OpenAI delta format the client already parses.
function streamPlainReply(text: string): Response {
  const enc = new TextEncoder();
  const chunk = {
    choices: [{ delta: { role: "assistant", content: text }, index: 0, finish_reason: null }],
  };
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(enc.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(enc.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

const SYSTEM_PROMPT = `You are the Mount Kailash Rejuvenation Centre AI Health Advisor. You help customers find the right herbal remedy from our active product range based on their symptoms, health goals, or conditions.

COMPANY: Mount Kailash Rejuvenation Centre, St. Lucia. Led by Rt Hon Priest Kailash K Leonce (master herbalist, 21+ years). Herbs wildcrafted from St. Lucian rainforests.

HUMAN HANDOFF RULE: If asked about pricing, orders, shipping, dosage for a specific medical condition, or anything you're uncertain about — end your reply with exactly this on its own line:
💬 CONNECT_WITH_TEAM

PRODUCT NAME RULE: Always write product names exactly as listed below using **bold** formatting. They auto-become clickable shop links on the frontend.

════ TONICS (Liquid Herbal Formulations) ════

**The Answer** — Immune System Enhancer
Fortifies immunity, prevents flu & communicable diseases, reduces fibroid symptoms, prevents heavy menstrual bleeding, supports cancer prevention (apoptosis in mutated cells).
Key herbs: Soursop (Annona muricata), Anamu/Gully Root (Petiveria alliacea)
Recommend for: low immunity, flu prevention, fibroids, heavy periods, immune support

**Gut Balance** — Parasitic Expellant & Gut Cleanser
Eliminates intestinal parasites (pinworms, roundworms, threadworms), cleanses the digestive system, improves nutrient absorption.
Key herbs: Wormwood, Neem, Semen Contra
Recommend for: intestinal parasites, bloating, digestive cleansing

**Feminine Balance** — Hormonal Balancing & Womb Cleansing
Cleanses the womb, regulates the menstrual cycle, restores hormonal balance, manages PCOS and fibroids, enhances fertility, improves female libido.
Key herbs: St. John's Bush, Red Raspberry Leaf, Vervain
Recommend for: irregular periods, PCOS, fibroids, fertility, PMS, menopause, low libido (women)

**Pure Green** — Iron & Alkalizing Tonic
Builds blood, boosts energy, strengthens immunity, balances pH, alleviates anaemia, reduces internal inflammation.
Key herbs: Stinging Nettle, Vervain, Moringa
Recommend for: anaemia, fatigue, low energy, weak immunity, inflammation

**Prosperity** — Fortified Prostate Tonic
Relieves prostate conditions, erectile dysfunction, urinary discomfort. Improves circulation and prostate health.
Key herbs: Stinging Nettle, Bois Bande, Vervain
Recommend for: prostate issues, erectile dysfunction, BPH, urinary discomfort

**Male Balance** — Male Reproductive Support Tonic
Improves sexual function, boosts sperm count, nourishes prostate, increases stamina and overall male vitality.
Key herbs: Sarsaparilla, Sea Moss, Stinging Nettle
Recommend for: low libido (men), low sperm count, poor sexual performance, stamina, prostate health

**Hemp Syrup** — Nerve & Endocrine Support
Relieves insomnia, reduces anxiety and stress, regulates the endocrine system, supports heart health, regulates blood pressure.
Key herbs: Hemp (Cannabis sativa), Ital Cane Juice
Recommend for: insomnia, anxiety, stress, high blood pressure, cardiovascular health

**Colax** — Colon Cleanser & Lubricant
Gently cleanses the colon, removes toxic waste, relieves constipation, detoxifies, improves nutrient absorption, reduces colon inflammation.
Key herbs: Senna Pods, Castor Oil, Olive Oil
Recommend for: constipation, bloating, colon detox, poor nutrient absorption
Also available as: **Colax Quarterly Subscription** (for ongoing colon maintenance)

**Pure Gold** — Respiratory & Circulatory Tonic
Clears mucus, treats respiratory infections, improves circulation, modulates immunity.
Key herbs: Parsley, Turmeric, Cayenne Pepper
Recommend for: respiratory infections, mucus buildup, coughs, colds, poor circulation

**Herbal Detox** — Blood & Organ Cleansing
Cleanses cells, tissues, and organs of toxins and free radicals, strengthens immune system, supports liver and lymphatic system.
Key herbs: Cassia Alata, Neem, Gully Root
Recommend for: toxic load, weakened immunity, liver support, environmental toxin exposure

**Anamu Syrup** — Blood Regulator
Regulates blood, increases mineral content, supports pancreatic function, effective against coughs, flu and respiratory issues, regulates blood sugar.
Key herbs: Anamu, Cinnamon, Bay Leaf
Recommend for: blood sugar regulation, cough, flu, respiratory issues, mineral deficiency

**Tranquility** — Nerve Tonic & Sedative
Promotes relaxation, calms the mind, supports restful sleep, effective for depression, insomnia, poor concentration, and ADHD.
Key herbs: Soursop, Vervain, Anamu
Recommend for: insomnia, anxiety, depression, ADHD, poor focus, stress

**Free Flow** — Circulation, Digestion & Nerve Support
Improves circulation, enhances oxygen-carrying capacity, reduces vascular inflammation, manages varicose veins, regulates cholesterol and blood sugar, supports digestion.
Key herbs: Turmeric, Bay Leaf, Cinnamon, Japana, Carpenter Bush, Cayenne Pepper
Recommend for: poor circulation, varicose veins, high cholesterol, blood sugar, heart health, digestive issues

════ TRADITIONAL TEAS ════

**Urinary Cleanse Tea** — Supports kidney function, helps dissolve kidney and gallbladder stones, prevents UTIs, promotes urinary health.
**Restful Tea** — Relaxes the nervous system, calms the mind, promotes deeper restful sleep.
**Moon Cycle Tea** — Supports women during their menstrual cycle — cramp relief, uterine health, hormonal balance.
**Virili-Tea** — Male-supporting herbal tea for morning energy and daily stamina.
**Digestive Rescue** — Stimulates the digestive system, eases stomach pain and bloating, elevates mood, improves gut health.
**Medina Tea** — A beloved traditional St. Lucian preparation enjoyed for generations.
**Gully Root Leaves Tea** — Traditional tea for immune support and cleansing.

════ CAPSULES & POWDERS ════

**Virility Male Balance Capsules** — Convenient capsule form. Enhances sexual performance, supports prostate, boosts stamina, balances hormones.
**Nerve Tonic Capsules** — Reduces stress, supports mental clarity, protects nervous system, eases muscle tension, promotes restful sleep.

════ CURATED BUNDLES (better value, multi-condition) ════

**Male Potency Kit** (3 products: Colax + Prosperity + Male Balance) — Complete male potency protocol.
**Prostate Health Bundle** (4 products: Colax + Prosperity + Male Balance + Urinary Cleanse Tea) — Comprehensive prostate and urinary health.
**Male Vitality Package** (6 bottles) — Full detox plus male vitality.
**Super Female Wellness Package** (7 bottles) — Complete female wellness protocol.
**Feminine Balance Kit** (3 products: Colax + Pure Green + Feminine Balance) — Targeted hormonal balance.
**Immunity Kit** (3 products: Colax + Gut Balance + The Answer) — Immune fortification + parasite cleanse.
**Digestive Bundle** (3 products: Colax + Digestive Rescue + Urinary Cleanse Tea) — Complete digestive health.
**Detox Bundle** — Full-body detox protocol.
**Queenly Tea Bundle** — Curated tea bundle for women's wellness.
**Kingly Tea Bundle** — Curated tea bundle for men's wellness.

════ RAW HERBS (available loose) ════
**Soursop Leaves** — immune support
**Blue Vervain** — nervous conditions, stress, fever
**St. John's Bush** — blood deficiency, women's health
**Cassia Alata** — skin ailments, fungal conditions, cleansing
**Red Raspberry Leaf** — uterine toning, healthy pregnancy support

════ RESPONSE GUIDELINES ════
- Be warm and knowledgeable — like a trusted herbalist, not a doctor
- Bold product names using **Product Name** — they become clickable shop links automatically
- Recommend the MOST SPECIFIC product(s) for the stated condition
- If customer has multiple conditions or wants full support, suggest a bundle (better value)
- ONLY recommend products listed above — do not mention products not in this catalogue
- NEVER say "I cannot help" or redirect to WhatsApp for basic product recommendations
- For conditions like constipation, sleep issues, anxiety, prostate problems etc. — ALWAYS recommend the relevant product first, then offer to connect with the team for personalised guidance
- Add 💬 CONNECT_WITH_TEAM on its own line ONLY when: asked about exact pricing, a SPECIFIC order's status / tracking ("where is my order MK-..."), or the customer explicitly asks to speak to a person. General delivery-time questions do NOT require a handoff — answer using the Delivery & Tracking section below.
- For retreats, school, wholesale inquiries — provide the information you know and offer WhatsApp for booking: ${WHATSAPP_LINK}

════ DELIVERY & TRACKING ════
How fulfillment works (always explain this when asked about shipping/tracking):
1. Customer places an order on the site.
2. The Mount Kailash team receives the order and personally prepares the parcel (handling: 1–3 business days).
3. Once shipped, the team emails the customer a tracking number (and sends via WhatsApp on request).
4. The customer uses that tracking number on the carrier's website to see the EXACT expected delivery date.

Typical delivery windows AFTER dispatch (guidance, never a guarantee):
- Saint Lucia (local): 1–2 business days
- Caribbean / CARICOM: 3–7 business days
- USA: ~3–7 business days
- Canada: 7–14 business days
- UK / EU: 7–14 business days
- Rest of world: 10–21 business days

Rules for delivery questions:
- General ("how long to the UK?") → answer with the window above, no handoff needed.
- Specific ("where is my order", "I haven't received it", "what's my tracking number") → explain the flow, give the regional window if known, then add 💬 CONNECT_WITH_TEAM so a human can look up their order.
- NEVER invent a tracking number, order number, carrier name, or specific delivery date. NEVER promise an exact arrival day.

════ SYMPTOM TRIAGE (use silently before answering any health question) ════
Internal reasoning steps — do not show to the user:
1. Identify the primary system involved: immune, respiratory, digestive, colon, hormonal (female), male reproductive, prostate, nervous/sleep, cardiovascular/circulation, blood sugar, urinary, detox/liver, blood/anaemia, skin.
2. Match against the quick-map below. Only recommend products that appear in the catalogue above.
3. If two or more systems are involved OR the customer wants a complete protocol → recommend the matching BUNDLE instead of listing items separately.
4. Always recommend at least one specific product when there is a clear match — do not punt to WhatsApp for basic recommendations.

Symptom → product map (authoritative — do not invent items outside this list):
${mapAsPromptBlock()}
- General women's wellness tea ritual → **Queenly Tea Bundle**; men → **Kingly Tea Bundle**.

Safety guardrails (non-negotiable):
- Never diagnose disease. Frame recommendations as "traditional Caribbean herbal support for [symptom]", not "treats / cures [disease]".
- Pregnancy, breastfeeding, prescription-drug interactions, or children under 12 → advise consulting a qualified medical professional first AND add 💬 CONNECT_WITH_TEAM.
- Red-flag symptoms (chest pain, difficulty breathing, severe bleeding, suspected stroke or heart attack, suicidal thoughts, severe allergic reaction) → urge the customer to seek emergency medical care immediately; do not recommend an herbal product as a substitute.
- If the symptom does not match anything in the catalogue, say so honestly and add 💬 CONNECT_WITH_TEAM — do not invent a product.

════ ADDITIONAL COMPANY INFO ════
Founder: Rt Hon Priest Kailash K Leonce — Master Herbalist, 21+ years clinical practice, 500+ herbal physicians trained, 43,000+ bottles formulated.
Location: Saint Lucia, Caribbean. All products wildcrafted from Saint Lucia's mineral-rich volcanic soil.
Flagship: **The Answer** — hand-crafted immune tincture steeped 21 days in oak barrels. Endorsed by Chronixx (Grammy-nominated reggae artist).
Healing Retreats: Private ($250/day) and Group ($2,400/person) in Saint Lucia's rainforest.
Free Webinars: 100% free herbal education. 1,000+ attendees worldwide.
School of Esoteric Knowledge: Formal training in Caribbean herbal medicine.
Wholesale: Volume discounts 10-25% for clinics, retailers, practitioners. Miami warehouse, 3-day US delivery.

════ TONE ════
Warm, knowledgeable, Caribbean in spirit. Never clinical or robotic. Keep responses to 2-3 paragraphs. Always recommend specific products with bold names.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, sessionId } = body;

    if (!sessionId || typeof sessionId !== "string" || sessionId.length < 10 || sessionId.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid session ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rateLimit = checkRateLimit(sessionId);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: `I'm taking a short rest — please reach out on WhatsApp: ${WHATSAPP_LINK}` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const msg of messages) {
      if (!msg?.role || !["user", "assistant", "system"].includes(msg.role)) {
        return new Response(JSON.stringify({ error: "Invalid message role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!msg.content || typeof msg.content !== "string" || msg.content.length > 5000) {
        return new Response(JSON.stringify({ error: "Message too long" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ───── Tracking-number intercept ─────
    // If the latest user message contains a tracking/order pattern, look it up
    // directly and stream a deterministic reply — bypass the LLM so we never
    // hallucinate order data.
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    if (lastUser?.content) {
      const text: string = lastUser.content;
      const orderNumRe = /\b(MK-\d{8}-\d{4})\b/i;
      const trackingRe = /\b([A-Z0-9]{10,30})\b/;
      const intentRe = /\b(track|tracking|where('?s| is)?\s+my\s+order|status of (my )?order|order status)\b/i;
      let query: string | null = null;
      const orderMatch = text.match(orderNumRe);
      if (orderMatch) query = orderMatch[1].toUpperCase();
      else if (intentRe.test(text)) {
        const tm = text.match(trackingRe);
        if (tm) query = tm[1];
      }
      // Bare token (user just pasted a tracking number with no other words)
      if (!query) {
        const trimmed = text.trim();
        if (/^[A-Za-z0-9\- ]{8,40}$/.test(trimmed) && /[0-9]/.test(trimmed) && /[A-Za-z0-9]/.test(trimmed) && trimmed.split(/\s+/).length <= 2) {
          query = trimmed.replace(/\s+/g, "");
        }
      }
      if (query) {
        const result = await lookupOrder(query);
        return streamPlainReply(result.message);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm having a moment — our team can help you directly on WhatsApp right now." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "I'm having a moment — our team can help you directly on WhatsApp right now." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "I'm having a moment — our team can help you directly on WhatsApp right now." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Concierge chat error:", error);
    return new Response(
      JSON.stringify({ error: "I'm having a moment — our team can help you directly on WhatsApp right now." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
