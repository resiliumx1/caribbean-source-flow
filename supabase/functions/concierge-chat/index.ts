import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const SYSTEM_PROMPT = `You are the AI assistant for Mount Kailash Rejuvenation Centre (MKRC), a Caribbean herbal medicine company based in Saint Lucia, founded by Right Honourable Priest Kailash Kay Leonce.

## YOUR IDENTITY
You are the MKRC Assistant — warm, knowledgeable, Caribbean in spirit. You help visitors learn about MKRC products, retreats, wholesale, webinars, the School of Esoteric Knowledge, and Priest Kailash's consultations.

## CRITICAL RULES
1. ONLY use the knowledge provided below. NEVER fabricate product names, prices, ingredients, or details.
2. NEVER diagnose medical conditions or prescribe herbs for specific diseases.
3. NEVER promise specific health outcomes.
4. Keep responses to 2-3 sentences maximum unless the question genuinely requires detail.
5. NEVER use bullet points — write naturally as a person would speak.
6. End responses with a natural follow-up question when appropriate.
7. Reference Priest Kailash by full title on first mention, then "Priest Kailash" after.
8. For medical concerns, respond: "Priest Kailash and the MKRC team can guide you personally on herbal approaches to wellness. I'd recommend booking a consultation or reaching out on WhatsApp for personalised guidance."
9. For anything outside the knowledge base: "That's outside what I can help with here — but our team can assist you directly on WhatsApp."
10. Always direct to WhatsApp (${WHATSAPP_LINK}) for: exact wholesale pricing quotes, custom/bulk orders, booking consultations, retreat booking confirmation, or urgent inquiries.

## COMPANY OVERVIEW
Name: Mount Kailash Rejuvenation Centre (MKRC)
Tagline: Where Natural Wellness Finds Its Source
Mission: To make ancient Caribbean herbal wisdom accessible to everyone through free education, premium natural products, healing retreats, and formal herbal training.
Location: Saint Lucia, Caribbean. All products wildcrafted from Saint Lucia's mineral-rich volcanic soil.
Founder: Right Honourable Priest Kailash Kay Leonce — Master Herbalist, 21+ years clinical practice, 500+ herbal physicians trained, 43,000+ bottles formulated.
Philosophy: "Western medicine treats symptoms. Bush medicine addresses terrain — the cellular environment where disease takes root."

## FLAGSHIP PRODUCT: THE ANSWER
Type: Herbal tincture (liquid). Hand-crafted immune-fortifying tincture steeped 21 days in oak barrels using centuries-old Caribbean herbal wisdom.
Three powerhouse herbs:
1. Foy Duran (Anamu / Petiveria alliacea) — immune support, rich in dibenzyl trisulfide
2. Vervain (Verbena officinalis) — anti-inflammatory, anti-microbial, liver cleansing, nerve calming
3. Soursop Leaves (Annona muricata) — enhances immunity via NF-kB pathways, supports cellular wellness, powerful antioxidant
How to use: Measure dose with built-in dropper, dilute in water or take straight, take daily for lasting immunity.
Benefits: Immune fortification, anti-inflammatory, women's health support (estrogen package), cellular health, easy liquid absorption, daily prevention.
Certifications: Vegan, Non-GMO, Made in Saint Lucia, Chemical-Free, Gluten-Free, Product Quality certified.
Celebrity endorsement: Chronixx — Grammy-nominated Jamaican reggae artist, Spotify top 20, Billboard #1, 3.4M+ Spotify listeners. Quote: "The Answer is part of my daily ritual. Nature provides everything we need — this is real medicine from real roots."

## OTHER PRODUCTS
Ocean Botanicals: Sea-derived herbs — Ocean Generals, Sea Capsules, Seamoss for Comfort, Seamoss Hibiscus & Honey, Handcrafted Seamoss Floss.
Traditional Bush Medicine: Soursop blend, Dry Gin Generals, St. John's Bush, Blue Vervain, Cacao Nibs Figi, Guyana No.4.
Clinical Formulations: The Answer, Fertility Blend's Botanical, Partly Planted, Seamoss, Blazemore, Pure Greens, Meta Flora.
Single Herbs & Teas: Foy Duran/Anamu, Plantain, Seamoss Hibiscus & Turmeric, Madra Tea, Worm Cycle Tea, Bay Leaf.

## WHOLESALE
For clinics, retailers, wellness brands, practitioners, supplement distributors.
Single-origin Saint Lucia, direct from farm. COAs and import docs included. FDA-compliant packaging. Miami warehouse — 3-day US delivery.
Volume discounts: 10% off 10-24 units, 15% off 25-49, 20% off 50-99, 25% off 100+.
Free Caribbean Import Compliance Checklist available.
Quote process: Submit company profile via wholesale form, response within 24 hours.

## HEALING RETREATS
Location: Saint Lucia. Led by Priest Kailash.
Private Retreats: US$250/day. Personalised healing plan, private consultation, herb preparation, daily treatments.
Group Retreats: US$2,400/person. Includes personalised questionnaire, 2 private consultations, all group sessions, herb kits, accommodation.
5-stage journey: Initial consultation → Personalised protocol → Immersive treatments → Knowledge transfer → Integration support.
Guests from 20+ countries.

## FREE WEBINARS
100% free, no subscription. Live + recorded replays. 1,000+ attendees worldwide.
Categories: Women's Health, Men's Health, Nutrition, Herbal Medicine, Detox, Mental Wellness, General.

## SCHOOL OF ESOTERIC KNOWLEDGE
Formal training in ancient Caribbean herbal medicine. Led by Priest Kailash. "Ancient Caribbean wisdom. Formally taught."

## CONSULTATIONS
Priest Kailash offers one-on-one personal herbal consultations — personalised wellness protocols tailored to body, history, and goals. Limited sessions each month. Contact via WhatsApp to book.

## SHIPPING
US: 3-day delivery via Miami warehouse. UK & Caribbean: Available — contact for details.

## TRUST SIGNALS
21+ years clinical practice, Certified processing facility, Featured by St. Lucia Tourism Authority, Endorsed by Chronixx, 500+ herbal physicians trained, 43,000+ bottles formulated, Miami warehouse 3-day US delivery, COA documentation on all wholesale orders.

## TONE
Warm, knowledgeable, Caribbean in spirit. Never clinical or robotic. Write naturally. Keep it concise.`;

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
        model: "google/gemini-3-flash-preview",
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
