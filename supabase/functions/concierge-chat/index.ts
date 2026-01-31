import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Escalation keywords that trigger immediate handoff
const ESCALATION_KEYWORDS = [
  "refund",
  "complaint",
  "angry",
  "lawsuit",
  "side effect",
  "hospital",
  "emergency",
  "speak to priest",
  "talk to kailash",
  "severe",
  "pregnant",
  "chronic medication",
  "blood thinner",
  "prescription",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client to fetch product knowledge
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch products for knowledge base
    const { data: products } = await supabase
      .from("products")
      .select("name, slug, description, traditional_use, dosage_instructions, contraindications, price_usd")
      .eq("is_active", true)
      .limit(50);

    // Fetch retreat info
    const { data: retreatTypes } = await supabase
      .from("retreat_types")
      .select("name, type, base_price_usd, description, min_nights, max_nights")
      .eq("is_active", true);

    // Build product knowledge summary
    const productKnowledge = products?.map(p => 
      `- ${p.name}: ${p.traditional_use || p.description || 'Traditional bush medicine formulation'}${p.contraindications ? ` (Caution: ${p.contraindications})` : ''}`
    ).join("\n") || "Product catalog available upon request.";

    const retreatKnowledge = retreatTypes?.map(r =>
      `- ${r.name} (${r.type}): ${r.min_nights}-${r.max_nights} nights, from $${r.base_price_usd} USD${r.type === 'group' ? ' per person' : ' per night'}`
    ).join("\n") || "Group and Solo retreats available.";

    // Check for escalation keywords in the latest user message
    const latestMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const shouldEscalate = ESCALATION_KEYWORDS.some(keyword => 
      latestMessage.includes(keyword)
    );

    const systemPrompt = `You are the Dispensary Guide for Mount Kailash Rejuvenation Centre, located in Soufrière, St. Lucia.

## YOUR ROLE
You provide helpful, authoritative information about traditional St. Lucian bush medicine, our product formulations, and retreat programs. You speak with warmth but professional confidence, reflecting 21+ years of clinical practice.

## CRITICAL RULES
1. NEVER diagnose medical conditions
2. NEVER prescribe specific treatments for medical conditions
3. NEVER guarantee cures or specific health outcomes
4. When health questions arise, always add: "This information is about traditional use. Please consult your healthcare provider for medical advice."
5. For serious inquiries (medical conditions, medications, complaints), offer to connect with our team via WhatsApp: +1(758)285-5195

## PRODUCT KNOWLEDGE
${productKnowledge}

## RETREAT PROGRAMS
${retreatKnowledge}

## WHOLESALE INFORMATION
- Volume discounts: 10% off 10-24 units, 15% off 25-49 units, 20% off 50-99 units, 25% off 100+ units
- COA documentation included with all bulk orders
- Miami warehouse enables 3-day US delivery
- Contact our wholesale team for practitioner pricing

## RESPONSE STYLE
- Be concise but thorough
- Use markdown formatting for clarity
- Suggest relevant products when appropriate
- Always provide the WhatsApp contact (+1 758 285-5195) for complex inquiries
- Sign off warmly as "The Dispensary Guide"

${shouldEscalate ? `
## ESCALATION REQUIRED
The customer has mentioned something that requires human attention. Acknowledge their concern and provide the WhatsApp contact for immediate human support: +1(758)285-5195. Ask them to message Goddess Itopia who can assist directly.
` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Our guide is taking a short break. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please use WhatsApp: +1(758)285-5195" }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try WhatsApp: +1(758)285-5195" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store conversation if we have a session
    if (sessionId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      // Fire and forget - don't block the response
      try {
        await supabase
          .from("concierge_conversations")
          .upsert({
            session_id: sessionId,
            messages: [...messages],
            escalated: shouldEscalate,
            escalation_reason: shouldEscalate ? latestMessage.substring(0, 100) : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'session_id' });
      } catch (e) {
        console.error("Failed to store conversation:", e);
      }
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Concierge chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
