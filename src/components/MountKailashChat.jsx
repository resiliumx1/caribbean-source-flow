import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Chat analytics helper ───
function trackChatEvent(eventType, sessionId, extra = {}) {
  supabase.from("chat_analytics_events").insert({
    event_type: eventType,
    session_id: sessionId,
    ...extra,
  }).then(() => {}).catch(() => {});
}
const SITE_BASE = "";

const PRODUCT_LINKS = {
  "The Answer": `${SITE_BASE}/shop/the-answer`,
  "Dewormer": `${SITE_BASE}/shop/dewormer`,
  "Fertility": `${SITE_BASE}/shop/fertility`,
  "Pure Green": `${SITE_BASE}/shop/pure-green`,
  "Prosperity": `${SITE_BASE}/shop/prosperity`,
  "Virility": `${SITE_BASE}/shop/virility-herbal-virility-supplement`,
  "Hemp Syrup": `${SITE_BASE}/shop/hemp-syrup`,
  "Colax": `${SITE_BASE}/shop/colax`,
  "Colax Quarterly Subscription": `${SITE_BASE}/shop/colax-quarterly-subscription`,
  "Pure Gold": `${SITE_BASE}/shop/pure-gold`,
  "Blood Detox": `${SITE_BASE}/shop/blood-detox`,
  "Fey Duvan Syrup": `${SITE_BASE}/shop/fey-duvan-syrup`,
  "Fey Duvan": `${SITE_BASE}/shop/fey-duvan-syrup`,
  "Tranquility": `${SITE_BASE}/shop/tranquility`,
  "Free Flow": `${SITE_BASE}/shop/free-flow`,
  "Urinary Cleanse Tea": `${SITE_BASE}/shop/urinary-cleanse-tea`,
  "Restful Tea": `${SITE_BASE}/shop/restful-tea`,
  "Moon Cycle Tea": `${SITE_BASE}/shop/moon-cycle-tea`,
  "Virili-Tea": `${SITE_BASE}/shop/virili-tea`,
  "Digestive Rescue": `${SITE_BASE}/shop/digestive-rescue`,
  "Medina Tea": `${SITE_BASE}/shop/medina-tea`,
  "Gully Root Leaves Tea": `${SITE_BASE}/shop/gully-root-leaves`,
  "Virility Male Balance Capsules": `${SITE_BASE}/shop/virility-male-balance-capsules`,
  "Nerve Tonic Capsules": `${SITE_BASE}/shop/nerve-tonic-capsules`,
  "Male Potency Kit": `${SITE_BASE}/shop/male-potency-kit`,
  "Super Female Wellness Package": `${SITE_BASE}/shop/super-female-wellness-package`,
  "Immunity Kit": `${SITE_BASE}/shop/immunity-kit-bundle`,
  "Prostate Health Bundle": `${SITE_BASE}/shop/prostate-health-bundle`,
  "Digestive Bundle": `${SITE_BASE}/shop/digestive-bundle`,
  "Male Vitality Package": `${SITE_BASE}/shop/male-vitality-package`,
  "Queenly Tea Bundle": `${SITE_BASE}/shop/queenly-tea-bundle`,
  "Kingly Tea Bundle": `${SITE_BASE}/shop/kingly-tea-bundle`,
  "Detox Bundle": `${SITE_BASE}/shop/detox-bundle`,
  "Feminine Balance Kit": `${SITE_BASE}/shop/feminine-balance-kit`,
  "Soursop Leaves": `${SITE_BASE}/shop/soursop-leaves`,
  "Blue Vervain": `${SITE_BASE}/shop/blue-vervain`,
  "St. John's Bush": `${SITE_BASE}/shop/st-johns-bush`,
  "Cassia Alata": `${SITE_BASE}/shop/cassia-alata`,
  "Red Raspberry Leaf": `${SITE_BASE}/shop/red-raspberry-leaf`,
  "The NEW Herbal Manual": `${SITE_BASE}/shop/the-new-herbal-manual-ebook`,
  "Seamoss Soaps": `${SITE_BASE}/shop/handcrafted-seamoss-soaps-3-pack`,
};

const SORTED_NAMES = Object.keys(PRODUCT_LINKS).sort((a, b) => b.length - a.length);

const SHOP_BASE = "/shop";

const HANDOFF_TRIGGERS = [
  "💬 CONNECT_WITH_TEAM",
  "contact our team", "speak with a human", "reach out to us",
  "contact us directly", "our sales team", "whatsapp us",
  "i'm not sure", "i cannot answer", "i don't have that information",
  "beyond my knowledge",
];

// ─── AI System Prompt ────────────────────────────────────────────────────────
const PRODUCT_KNOWLEDGE = `
You are the Mount Kailash Rejuvenation Centre AI Health Advisor. You help customers find the right herbal remedy from our active product range based on their symptoms, health goals, or conditions.

COMPANY: Mount Kailash Rejuvenation Centre, St. Lucia. Led by Priest Kailash Kay Leonce (master herbalist, 21+ years). Herbs wildcrafted from St. Lucian rainforests.

HUMAN HANDOFF RULE: If asked about pricing, orders, shipping, dosage for a specific medical condition, or anything you're uncertain about — end your reply with exactly this on its own line:
💬 CONNECT_WITH_TEAM

PRODUCT NAME RULE: Always write product names exactly as listed below wrapped in **bold**. They auto-become clickable shop links.

════ TONICS (Liquid Herbal Formulations) ════

THE ANSWER — Immune System Enhancer
Fortifies immunity, prevents flu & communicable diseases, reduces fibroid symptoms, prevents heavy menstrual bleeding, supports cancer prevention (apoptosis in mutated cells).
Key herbs: Soursop (Annona muricata), Anamu/Gully Root (Petiveria alliacea)
Recommend for: low immunity, flu prevention, fibroids, heavy periods, immune support

DEWORMER — Parasitic Expellant
Eliminates intestinal parasites (pinworms, roundworms, threadworms), cleanses the digestive system, improves nutrient absorption.
Key herbs: Wormwood, Neem, Semen Contra
Recommend for: intestinal parasites, bloating, digestive cleansing

FERTILITY — Hormonal Balancing & Womb Cleansing
Cleanses the womb, regulates the menstrual cycle, restores hormonal balance, manages PCOS and fibroids, enhances fertility, improves female libido.
Key herbs: St. John's Bush, Red Raspberry Leaf, Vervain
Recommend for: irregular periods, PCOS, fibroids, fertility, PMS, menopause, low libido (women)

PURE GREEN — Iron & Alkalizing Tonic
Builds blood, boosts energy, strengthens immunity, balances pH, alleviates anaemia, reduces internal inflammation.
Key herbs: Stinging Nettle, Vervain, Moringa
Recommend for: anaemia, fatigue, low energy, weak immunity, inflammation

PROSPERITY — Fortified Prostate Tonic
Relieves prostate conditions, erectile dysfunction, urinary discomfort. Improves circulation and prostate health.
Key herbs: Stinging Nettle, Bois Bande, Vervain
Recommend for: prostate issues, erectile dysfunction, BPH, urinary discomfort

VIRILITY — Male Reproductive Support Tonic
Improves sexual function, boosts sperm count, nourishes prostate, increases stamina and overall male vitality.
Key herbs: Sarsaparilla, Sea Moss, Stinging Nettle
Recommend for: low libido (men), low sperm count, poor sexual performance, stamina, prostate health

HEMP SYRUP — Nerve & Endocrine Support
Relieves insomnia, reduces anxiety and stress, regulates the endocrine system, supports heart health, regulates blood pressure.
Key herbs: Hemp (Cannabis sativa), Ital Cane Juice
Recommend for: insomnia, anxiety, stress, high blood pressure, cardiovascular health

COLAX — Colon Cleanser & Lubricant
Gently cleanses the colon, removes toxic waste, relieves constipation, detoxifies, improves nutrient absorption, reduces colon inflammation.
Key herbs: Senna Pods, Castor Oil, Olive Oil
Recommend for: constipation, bloating, colon detox, poor nutrient absorption
Also available as: Colax Quarterly Subscription (for ongoing colon maintenance)

PURE GOLD — Respiratory & Circulatory Tonic
Clears mucus, treats respiratory infections, improves circulation, modulates immunity.
Key herbs: Parsley, Turmeric, Cayenne Pepper
Recommend for: respiratory infections, mucus buildup, coughs, colds, poor circulation

BLOOD DETOX — Blood & Organ Cleansing
Cleanses cells, tissues, and organs of toxins and free radicals, strengthens immune system, supports liver and lymphatic system.
Key herbs: Cassia Alata, Neem, Gully Root
Recommend for: toxic load, weakened immunity, liver support, environmental toxin exposure

FEY DUVAN SYRUP — Blood Regulator
Regulates blood, increases mineral content, supports pancreatic function, effective against coughs, flu and respiratory issues, regulates blood sugar.
Key herbs: Anamu, Cinnamon, Bay Leaf
Recommend for: blood sugar regulation, cough, flu, respiratory issues, mineral deficiency

TRANQUILITY — Nerve Tonic & Sedative
Promotes relaxation, calms the mind, supports restful sleep, effective for depression, insomnia, poor concentration, and ADHD.
Key herbs: Soursop, Vervain, Anamu
Recommend for: insomnia, anxiety, depression, ADHD, poor focus, stress

FREE FLOW — Circulation, Digestion & Nerve Support
Improves circulation, enhances oxygen-carrying capacity, reduces vascular inflammation, manages varicose veins, regulates cholesterol and blood sugar, supports digestion.
Key herbs: Turmeric, Bay Leaf, Cinnamon, Japana, Carpenter Bush, Cayenne Pepper
Recommend for: poor circulation, varicose veins, high cholesterol, blood sugar, heart health, digestive issues

════ TRADITIONAL TEAS ════

URINARY CLEANSE TEA — kidney function, kidney/gallbladder stones, UTIs
RESTFUL TEA — relaxation, deep sleep, evening ritual
MOON CYCLE TEA — menstrual cramp relief, uterine health, hormonal balance
VIRILI-TEA — male morning energy, daily stamina
DIGESTIVE RESCUE — stomach pain, bloating, gut health
MEDINA TEA — general wellness, traditional Caribbean preparation
GULLY ROOT LEAVES TEA — immune support, traditional herbal cleansing

════ CAPSULES & POWDERS ════

VIRILITY MALE BALANCE CAPSULES — convenient capsule for male hormone balance, stamina, sexual performance
NERVE TONIC CAPSULES — stress, mental clarity, muscle tension, sleep

════ CURATED BUNDLES ════

MALE POTENCY KIT (Colax + Prosperity + Virility) — prostate + performance + fertility
PROSTATE HEALTH BUNDLE (Colax + Prosperity + Virility + Urinary Cleanse Tea) — comprehensive prostate/urinary
MALE VITALITY PACKAGE (6 bottles) — full detox + male vitality
SUPER FEMALE WELLNESS PACKAGE (7 bottles) — complete female wellness protocol
FEMININE BALANCE KIT (Colax + Pure Green + Fertility) — hormonal balance + energy
IMMUNITY KIT (Colax + Dewormer + The Answer) — immunity reset
DIGESTIVE BUNDLE (Colax + Digestive Rescue + Urinary Cleanse Tea)
DETOX BUNDLE — full-body detox
QUEENLY TEA BUNDLE — women's wellness teas
KINGLY TEA BUNDLE — men's wellness teas

════ RAW HERBS ════
SOURSOP LEAVES, BLUE VERVAIN, ST. JOHN'S BUSH, CASSIA ALATA, RED RASPBERRY LEAF

════ RESPONSE GUIDELINES ════
- Be warm and knowledgeable — like a trusted herbalist, not a doctor
- Bold product names using **Product Name** — they become clickable shop links automatically
- Recommend the MOST SPECIFIC product(s) for the stated condition
- If customer has multiple conditions, suggest a bundle (better value)
- ONLY recommend products listed above
- Add 💬 CONNECT_WITH_TEAM when: uncertain, asked about pricing/orders/shipping/dosage for medical conditions
`;

const PRODUCTS_FOR_CARDS = [
  { name: "The Answer",        slug: "the-answer",                           category: "Immune Support",     emoji: "🛡️", color: "#e8b84b" },
  { name: "Dewormer",          slug: "dewormer",                             category: "Digestive Health",   emoji: "🌿", color: "#7aa25b" },
  { name: "Fertility",         slug: "fertility",                            category: "Women's Health",     emoji: "🌸", color: "#d4707a" },
  { name: "Pure Green",        slug: "pure-green",                           category: "Energy & Iron",      emoji: "💚", color: "#5a8f5a" },
  { name: "Prosperity",        slug: "prosperity",                           category: "Prostate Health",    emoji: "⭐", color: "#c4973a" },
  { name: "Virility",          slug: "virility-herbal-virility-supplement",  category: "Male Vitality",      emoji: "🔥", color: "#c45a3a" },
  { name: "Hemp Syrup",        slug: "hemp-syrup",                           category: "Sleep & Calm",       emoji: "🌙", color: "#7a6b9e" },
  { name: "Colax",             slug: "colax",                                category: "Colon Cleanse",      emoji: "🔵", color: "#3a8ab5" },
  { name: "Pure Gold",         slug: "pure-gold",                            category: "Respiratory",        emoji: "✨", color: "#d4af37" },
  { name: "Blood Detox",       slug: "blood-detox",                          category: "Detoxification",     emoji: "❤️", color: "#c0392b" },
  { name: "Fey Duvan Syrup",   slug: "fey-duvan-syrup",                      category: "Blood Regulation",   emoji: "💧", color: "#8e44ad" },
  { name: "Tranquility",       slug: "tranquility",                          category: "Mental Wellness",    emoji: "🧘", color: "#5d6d7e" },
  { name: "Free Flow",         slug: "free-flow",                            category: "Circulation",        emoji: "🌊", color: "#e74c3c" },
  { name: "Virili-Tea",        slug: "virili-tea",                           category: "Men's Tea",          emoji: "☕", color: "#8b6914" },
  { name: "Moon Cycle Tea",    slug: "moon-cycle-tea",                       category: "Women's Tea",        emoji: "🌙", color: "#c06090" },
  { name: "Restful Tea",       slug: "restful-tea",                          category: "Sleep Tea",          emoji: "😴", color: "#6b7aa0" },
  { name: "Digestive Rescue",  slug: "digestive-rescue",                     category: "Digestive Tea",      emoji: "🫚", color: "#7aa25b" },
  { name: "Urinary Cleanse Tea", slug: "urinary-cleanse-tea",               category: "Kidney Support",     emoji: "🫧", color: "#3a9ab5" },
  { name: "Medina Tea",        slug: "medina-tea",                           category: "Traditional",        emoji: "🍵", color: "#a07040" },
  { name: "Virility Male Balance Capsules", slug: "virility-male-balance-capsules", category: "Capsules",  emoji: "💊", color: "#c45a3a" },
  { name: "Nerve Tonic Capsules", slug: "nerve-tonic-capsules",              category: "Capsules",           emoji: "💊", color: "#5d6d7e" },
  { name: "Male Potency Kit",  slug: "male-potency-kit",                     category: "Men's Bundle",       emoji: "📦", color: "#c4973a" },
  { name: "Prostate Health Bundle", slug: "prostate-health-bundle",         category: "Men's Bundle",        emoji: "📦", color: "#c45a3a" },
  { name: "Super Female Wellness Package", slug: "super-female-wellness-package", category: "Women's Bundle", emoji: "📦", color: "#d4707a" },
  { name: "Feminine Balance Kit", slug: "feminine-balance-kit",             category: "Women's Bundle",      emoji: "📦", color: "#c06090" },
  { name: "Immunity Kit",      slug: "immunity-kit-bundle",                  category: "Immunity Bundle",    emoji: "📦", color: "#e8b84b" },
  { name: "Digestive Bundle",  slug: "digestive-bundle",                     category: "Digestive Bundle",   emoji: "📦", color: "#7aa25b" },
  { name: "Detox Bundle",      slug: "detox-bundle",                         category: "Detox Bundle",       emoji: "📦", color: "#8e44ad" },
  { name: "Male Vitality Package", slug: "male-vitality-package",           category: "Men's Bundle",        emoji: "📦", color: "#c45a3a" },
  { name: "Queenly Tea Bundle", slug: "queenly-tea-bundle",                  category: "Women's Bundle",     emoji: "📦", color: "#d4707a" },
  { name: "Kingly Tea Bundle", slug: "kingly-tea-bundle",                    category: "Men's Bundle",       emoji: "📦", color: "#8b6914" },
];

const QUICK_PROMPTS = [
  "I have constipation",
  "I can't sleep well",
  "I have low energy & fatigue",
  "I have prostate issues",
  "I need immune support",
  "I have irregular periods",
  "I have anxiety & stress",
  "I want to improve circulation",
  "I have respiratory issues",
  "I want a detox",
  "I have high blood sugar",
  "I need something for men's vitality",
];

function injectProductLinks(html) {
  let result = html;
  SORTED_NAMES.forEach(function(name) {
    var url = PRODUCT_LINKS[name];
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var regex = new RegExp("\\b" + escaped + "\\b", "g");
    var parts = [];
    var lastIndex = 0;
    var m;
    while ((m = regex.exec(result)) !== null) {
      var before = result.substring(0, m.index);
      var lastOpenA = before.lastIndexOf("<a ");
      var lastCloseA = before.lastIndexOf("</a>");
      if (lastOpenA > lastCloseA) continue;
      parts.push(result.substring(lastIndex, m.index));
      parts.push('<a href="' + url + '" onclick="window.__trackChatProductClick && window.__trackChatProductClick(\'' + name.replace(/'/g, "\\'") + '\')" style="color:#2e6e2e;font-weight:bold;text-decoration:underline;text-decoration-style:dotted;cursor:pointer;">' + name + '</a>');
      lastIndex = m.index + m[0].length;
    }
    if (parts.length > 0) {
      parts.push(result.substring(lastIndex));
      result = parts.join("");
    }
  });
  return result;
}

const DEFAULT_WELCOME = {
  role: "assistant",
  content: "Welcome to Mount Kailash Rejuvenation Centre 🌿\n\nI'm your personal herbal health advisor. Tell me what's troubling you — whether it's a symptom, condition, or health goal — and I'll recommend the perfect natural remedy from our wildcrafted herbal range.\n\nHow can I help you today?",
  showHandoff: false,
};

export default function MountKailashChat({ onNavigate, externalMessages, setExternalMessages }) {
  const [darkMode, setDarkMode] = useState(false);
  const [localMessages, setLocalMessages] = useState([DEFAULT_WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = externalMessages || localMessages;
  const setMessages = setExternalMessages || setLocalMessages;

  const dk = darkMode;
  const t = {
    bg:             dk ? "#0f1a12" : "#f5f0e8",
    surface:        dk ? "#1a2e1e" : "#ffffff",
    border:         dk ? "#2d4a32" : "#d8cdb8",
    text:           dk ? "#dff0df" : "#1a2a1a",
    textMuted:      dk ? "#7aaa7a" : "#6b7c6b",
    primary:        dk ? "#5aad5a" : "#2e6e2e",
    chipBg:         dk ? "#1e3d22" : "#e8f5e8",
    chipText:       dk ? "#a8e8a8" : "#1a4a1a",
    chipBorder:     dk ? "#3a6a3a" : "#a8cca8",
    aiBubble:       dk ? "#1a2e1e" : "#ffffff",
    aiText:         dk ? "#dff0df" : "#1a2a1a",
    inputBg:        dk ? "#162318" : "#ffffff",
    gold:           dk ? "#d4b04a" : "#8b6914",
    goldBg:         dk ? "#2a2410" : "#fff8e8",
    goldBorder:     dk ? "#4a3e18" : "#d4b04a",
    handoffBg:      dk ? "#1a301d" : "#f0faf0",
    handoffBorder:  dk ? "#3a7a3a" : "#7aaa7a",
    shadow:         dk ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.08)",
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Scroll to top of welcome message on initial mount
  useEffect(() => {
    setTimeout(() => { messagesTopRef.current?.scrollIntoView({ behavior: "auto" }); }, 100);
  }, []);

  const needsHandoff = (text) => HANDOFF_TRIGGERS.some(tr => text.toLowerCase().includes(tr.toLowerCase()));
  const cleanContent = (text) => text.replace(/💬 CONNECT_WITH_TEAM/g, "").trim();

  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`);
  const sessionTrackedRef = useRef(false);

  useEffect(() => {
    if (!sessionTrackedRef.current) {
      sessionTrackedRef.current = true;
      trackChatEvent("session_start", sessionIdRef.current);
    }
    window.__trackChatProductClick = (productName) => {
      trackChatEvent("product_click", sessionIdRef.current, { product_name: productName });
    };
    return () => { delete window.__trackChatProductClick; };
  }, []);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    trackChatEvent("symptom_query", sessionIdRef.current, { symptom: userText });
    setInput("");
    const newMsgs = [...messages, { role: "user", content: userText, showHandoff: false }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/concierge-chat`;
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              assistantContent += chunk;
              setMessages([...newMsgs, {
                role: "assistant",
                content: cleanContent(assistantContent),
                showHandoff: needsHandoff(assistantContent),
              }]);
            }
          } catch { /* partial JSON, skip */ }
        }
      }

      if (!assistantContent) {
        setMessages([...newMsgs, {
          role: "assistant",
          content: "I'm sorry, I couldn't process that. Please try again.",
          showHandoff: false,
        }]);
      }
    } catch {
      setMessages([...newMsgs, {
        role: "assistant",
        content: "I apologize — there was a connection issue. Our team is ready to help you directly.",
        showHandoff: true,
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const renderText = (text) => text.split("\n").map((line, i) => {
    let html = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = injectProductLinks(html);
    return <p key={i} style={{ margin: "3px 0", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />;
  });

  const handoffTrackedRef = useRef(false);
  const HandoffCard = () => {
    if (!handoffTrackedRef.current) {
      handoffTrackedRef.current = true;
      trackChatEvent("whatsapp_handoff", sessionIdRef.current);
    }
    return (
    <div style={{
      marginTop: 10, padding: "14px 16px",
      background: t.handoffBg, border: `1px solid ${t.handoffBorder}`,
      borderRadius: 12, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 17 }}>👋</span>
        <span style={{ fontWeight: "bold", color: t.primary, fontSize: 14 }}>Talk to a real person</span>
      </div>
      <p style={{ margin: 0, color: t.aiText, fontSize: 13, lineHeight: 1.5 }}>
        Our wellness team can help with pricing, orders, and personalised advice.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a href="https://wa.me/13059429407" target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "8px 15px", background: "#25d366", color: "#fff",
          borderRadius: 20, textDecoration: "none", fontSize: 13, fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(37,211,102,0.3)",
        }}>💬 WhatsApp Us</a>
        <a href="mailto:goddessitopia@mountkailashslu.com" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "8px 15px", background: t.goldBg, color: t.gold,
          border: `1px solid ${t.goldBorder}`,
          borderRadius: 20, textDecoration: "none", fontSize: 13, fontWeight: "bold",
        }}>✉️ Email Us</a>
        <a href={SHOP_BASE} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "8px 15px", background: t.chipBg, color: t.primary,
          border: `1px solid ${t.handoffBorder}`,
          borderRadius: 20, textDecoration: "none", fontSize: 13, fontWeight: "bold",
        }}>🛍️ Visit Shop</a>
      </div>
    </div>
  );};


  return (
    <div style={{
      height: "100%", minHeight: 0, background: t.bg,
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'DM Sans', sans-serif",
      transition: "background 0.3s",
      overflow: "hidden",
    }}>

      {/* ══ HEADER ══ */}
      <div style={{
        width: "100%",
        background: dk ? "rgba(15, 30, 15, 0.85)" : "rgba(28, 74, 28, 0.9)",
        backdropFilter: "blur(8px)",
        padding: "13px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(0,0,0,0.35)",
        position: "sticky", top: 0, zIndex: 100, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/star-seal-for-lovable.png" alt="Mount Kailash" style={{
            width: 38, height: 38, flexShrink: 0, borderRadius: "50%",
            filter: 'brightness(0) invert(1)', opacity: 0.9,
          }} />
          <div>
            <div style={{ color: "#e8c870", fontSize: 13, fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
              Mount Kailash
            </div>
            <div style={{ color: "#7aaa7a", fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>
              Nature's Answers for Optimum Health & Wellbeing
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: 3, gap: 2 }}>
            {["chat", "products"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "5px 12px", borderRadius: 16, border: "none", cursor: "pointer",
                fontSize: 11, fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
                background: activeTab === tab ? "#2e6e2e" : "transparent",
                color: activeTab === tab ? "#ffffff" : "#aaccaa",
                fontWeight: activeTab === tab ? "bold" : "normal",
                transition: "all 0.2s",
              }}>{tab}</button>
            ))}
          </div>
          <button onClick={() => setDarkMode(!dk)} style={{
            background: dk ? "#2d4a32" : "rgba(255,255,255,0.15)", border: "none",
            borderRadius: 20, padding: "5px 12px", cursor: "pointer",
            color: dk ? "#e8c870" : "#ffffff", fontSize: 12,
            display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {dk ? "☀️" : "🌙"} <span style={{ fontSize: 10 }}>{dk ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>

      {/* ══ PAGE BODY ══ */}
      <div style={{ width: "100%", maxWidth: 820, flex: 1, padding: "0 14px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

        {/* ── CHAT TAB ── */}
        {activeTab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 0 8px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0, WebkitOverflowScrolling: "touch" }}>
              <div ref={messagesTopRef} />
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-end", gap: 8,
                }}>
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, minWidth: 28,
                      background: "linear-gradient(135deg, #2e6e2e, #5aad5a)",
                      borderRadius: "50%", fontSize: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>🌿</div>
                  )}
                  <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column" }}>
                    <div style={{
                      padding: "11px 14px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: msg.role === "user" ? "linear-gradient(135deg, #2e6e2e, #1c4a1c)" : t.aiBubble,
                      color: msg.role === "user" ? "#ffffff" : t.aiText,
                      border: msg.role === "assistant" ? `1px solid ${t.border}` : "none",
                      boxShadow: t.shadow, fontSize: 14, lineHeight: 1.65,
                    }}>
                      {renderText(msg.content)}
                    </div>
                    {msg.role === "assistant" && msg.showHandoff && <HandoffCard />}
                  </div>
                  {msg.role === "user" && (
                    <div style={{
                      width: 28, height: 28, minWidth: 28,
                      background: "linear-gradient(135deg, #c8a84b, #e8c870)",
                      borderRadius: "50%", fontSize: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>👤</div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, background: "linear-gradient(135deg, #2e6e2e, #5aad5a)",
                    borderRadius: "50%", fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>🌿</div>
                  <div style={{
                    padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
                    background: t.aiBubble, border: `1px solid ${t.border}`,
                    boxShadow: t.shadow, display: "flex", gap: 5, alignItems: "center",
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%", background: t.primary,
                        animation: "bounce 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick-prompt chips */}
            <div style={{ padding: "8px 0 4px", overflowX: "auto", display: "flex", gap: 7, flexWrap: "nowrap", flexShrink: 0, WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} style={{
                  whiteSpace: "nowrap", padding: "9px 16px", borderRadius: 20,
                  border: `1px solid ${t.chipBorder}`,
                  background: t.chipBg, color: t.chipText,
                  cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  fontWeight: "600", flexShrink: 0, lineHeight: 1.3,
                  transition: "opacity 0.15s",
                }}>{p}</button>
              ))}
            </div>

            {/* Input row */}
            <div style={{ display: "flex", gap: 10, padding: "8px 0", alignItems: "flex-end" }}>
              <div style={{
                flex: 1, border: `2px solid ${loading ? t.primary : t.border}`,
                borderRadius: 24, background: t.inputBg,
                display: "flex", alignItems: "center",
                padding: "4px 8px 4px 16px", transition: "border-color 0.2s",
              }}>
                <textarea
                  ref={textareaRef}
                  value={input} onChange={e => { setInput(e.target.value); const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }} onKeyDown={handleKey}
                  placeholder="Describe your symptoms or health concern…" rows={2}
                  style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    resize: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: t.text,
                    padding: "10px 0", lineHeight: "1.5", maxHeight: 120, minHeight: 52, overflowY: "auto",
                  }}
                />
              </div>
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
                width: 48, height: 48, borderRadius: "50%", border: "none",
                background: loading || !input.trim() ? t.border : "linear-gradient(135deg, #2e6e2e, #1c4a1c)",
                color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: 16, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: loading || !input.trim() ? "none" : "0 3px 10px rgba(46,110,46,0.4)",
              }}>{loading ? "⏳" : "➤"}</button>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <div style={{ paddingTop: 18, flex: 1, overflowY: "auto", minHeight: 0 }}>
            <div style={{
              textAlign: "center", marginBottom: 18, padding: 18,
              background: t.surface, borderRadius: 16, border: `1px solid ${t.border}`,
            }}>
              <h2 style={{ margin: "0 0 5px", color: t.primary, fontSize: 19, fontFamily: "'DM Sans', sans-serif" }}>Product Catalogue</h2>
              <p style={{ margin: 0, color: t.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                Wildcrafted herbal formulations from the rainforests of St. Lucia
              </p>
            </div>

            {[
              { label: "Tonics", items: PRODUCTS_FOR_CARDS.filter(p => ["Immune Support","Digestive Health","Women's Health","Energy & Iron","Prostate Health","Male Vitality","Sleep & Calm","Colon Cleanse","Respiratory","Detoxification","Blood Regulation","Mental Wellness","Circulation"].includes(p.category)) },
              { label: "Traditional Teas", items: PRODUCTS_FOR_CARDS.filter(p => p.category.includes("Tea") || p.category === "Traditional" || p.category === "Digestive Tea" || p.category === "Sleep Tea" || p.category === "Kidney Support" || p.category === "Men's Tea" || p.category === "Women's Tea") },
              { label: "Capsules & Powders", items: PRODUCTS_FOR_CARDS.filter(p => p.category === "Capsules") },
              { label: "Curated Bundles", items: PRODUCTS_FOR_CARDS.filter(p => p.category.includes("Bundle") || p.category.includes("Kit") || p.category.includes("Package")) },
            ].map(section => (
              <div key={section.label} style={{ marginBottom: 24 }}>
                <h3 style={{ color: t.textMuted, fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 10px 4px", fontFamily: "'DM Sans', sans-serif" }}>
                  {section.label}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {section.items.map((p, i) => (
                    <a key={i}
                      href={`/shop/${p.slug}`}
                      style={{
                        textDecoration: "none", display: "block",
                        background: dk ? "#1a2e1e" : "#ffffff",
                        border: `1px solid ${t.border}`,
                        borderLeft: `4px solid ${p.color}`,
                        borderRadius: 12, padding: 13,
                        transition: "opacity 0.2s", cursor: "pointer",
                      }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{p.emoji}</div>
                      <div style={{ fontWeight: "bold", color: t.text, fontSize: 13, marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{p.category}</div>
                      <div style={{ marginTop: 7, fontSize: 10, color: t.primary, fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>View in shop →</div>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 8, padding: 18,
              background: t.goldBg, border: `1px solid ${t.goldBorder}`,
              borderRadius: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>📞</div>
              <div style={{ color: t.gold, fontWeight: "bold", marginBottom: 10, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Contact Our Team</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <a href="https://wa.me/17582855195" target="_blank" rel="noopener noreferrer" style={{
                  padding: "8px 15px", background: "#25d366", color: "#fff",
                  borderRadius: 20, textDecoration: "none", fontSize: 13, fontWeight: "bold",
                }}>💬 WhatsApp</a>
                <a href="mailto:goddessitopia@mountkailashslu.com" style={{
                  padding: "8px 15px", background: t.goldBg, color: t.gold,
                  border: `1px solid ${t.goldBorder}`,
                  borderRadius: 20, textDecoration: "none", fontSize: 12, fontWeight: "bold",
                }}>✉️ goddessitopia@mountkailashslu.com</a>
              </div>
              <div style={{ color: t.textMuted, fontSize: 12, fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>
                Honourable Goddess R Itopia Archer — Global Sales Manager
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0);opacity:0.5}
          40%{transform:translateY(-5px);opacity:1}
        }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#3a7a3a;border-radius:3px}
        
        textarea::placeholder{color:#8aaa8a!important}
        button:hover:not(:disabled){opacity:0.82}
        a:hover{opacity:0.8}
      `}</style>
    </div>
  );
}
