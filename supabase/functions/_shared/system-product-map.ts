// Structured System → Product map. Mirrors src/lib/system-product-map.ts.
// Source of truth for the concierge bot's symptom-to-product reasoning.

export type BodySystem =
  | "immune"
  | "respiratory"
  | "digestive"
  | "colon"
  | "hormonal_female"
  | "male_reproductive"
  | "prostate"
  | "nervous_sleep"
  | "cardiovascular"
  | "blood_sugar"
  | "urinary"
  | "detox_liver"
  | "blood_anaemia"
  | "skin";

export interface SystemEntry {
  system: BodySystem;
  label: string;
  symptoms: string[];
  primaryProducts: string[];
  bundles?: string[];
  notes?: string;
}

export const SYSTEM_PRODUCT_MAP: SystemEntry[] = [
  {
    system: "immune",
    label: "Immune system",
    symptoms: ["cold", "flu", "weak immunity", "low immunity", "frequent illness", "covid", "viral", "infection"],
    primaryProducts: ["The Answer"],
    bundles: ["Immunity Kit"],
    notes: "Add Pure Gold if respiratory symptoms are present.",
  },
  {
    system: "respiratory",
    label: "Respiratory system",
    symptoms: ["cough", "mucus", "phlegm", "chest congestion", "bronchitis", "asthma", "sinus"],
    primaryProducts: ["Pure Gold", "Anamu Syrup"],
  },
  {
    system: "digestive",
    label: "Digestion / gut",
    symptoms: ["indigestion", "bloating", "gas", "stomach pain", "heartburn", "ibs", "poor gut health", "parasites", "worms"],
    primaryProducts: ["Digestive Rescue", "Gut Balance"],
    bundles: ["Digestive Bundle"],
    notes: "Gut Balance for parasites specifically; Digestive Rescue for general gut discomfort.",
  },
  {
    system: "colon",
    label: "Colon / elimination",
    symptoms: ["constipation", "irregular bowel", "sluggish colon", "colon cleanse"],
    primaryProducts: ["Colax"],
    notes: "Colax Quarterly Subscription for ongoing maintenance.",
  },
  {
    system: "hormonal_female",
    label: "Women's hormonal health",
    symptoms: ["fibroids", "heavy periods", "irregular periods", "pcos", "fertility", "pms", "menopause", "low libido female", "womb", "menstrual"],
    primaryProducts: ["Feminine Balance", "Moon Cycle Tea"],
    bundles: ["Feminine Balance Kit", "Super Female Wellness Package"],
  },
  {
    system: "male_reproductive",
    label: "Male reproductive health",
    symptoms: ["erectile dysfunction", "ed", "low libido male", "low sperm count", "stamina", "sexual performance"],
    primaryProducts: ["Male Balance", "Virility Male Balance Capsules", "Virili-Tea"],
    bundles: ["Male Potency Kit", "Male Vitality Package"],
  },
  {
    system: "prostate",
    label: "Prostate health",
    symptoms: ["prostate", "bph", "urinary urgency", "weak urine flow", "enlarged prostate"],
    primaryProducts: ["Prosperity"],
    bundles: ["Prostate Health Bundle"],
  },
  {
    system: "nervous_sleep",
    label: "Nervous system / sleep",
    symptoms: ["insomnia", "anxiety", "stress", "depression", "adhd", "poor focus", "panic", "nervousness", "restless"],
    primaryProducts: ["Tranquility", "Hemp Syrup", "Nerve Tonic Capsules", "Restful Tea"],
  },
  {
    system: "cardiovascular",
    label: "Heart & circulation",
    symptoms: ["high blood pressure", "hypertension", "high cholesterol", "varicose veins", "poor circulation", "heart support"],
    primaryProducts: ["Hemp Syrup", "Free Flow"],
  },
  {
    system: "blood_sugar",
    label: "Blood sugar regulation",
    symptoms: ["diabetes", "high blood sugar", "insulin resistance", "pre-diabetic"],
    primaryProducts: ["Anamu Syrup", "Free Flow"],
  },
  {
    system: "urinary",
    label: "Urinary & kidney",
    symptoms: ["uti", "urinary tract infection", "kidney stones", "gallbladder stones", "frequent urination", "urinary discomfort"],
    primaryProducts: ["Urinary Cleanse Tea"],
  },
  {
    system: "detox_liver",
    label: "Detox & liver support",
    symptoms: ["toxic load", "detox", "liver support", "post-illness recovery", "environmental toxins"],
    primaryProducts: ["Herbal Detox"],
    bundles: ["Detox Bundle"],
  },
  {
    system: "blood_anaemia",
    label: "Blood / anaemia / energy",
    symptoms: ["anaemia", "anemia", "fatigue", "low energy", "iron deficiency", "weakness"],
    primaryProducts: ["Pure Green"],
  },
  {
    system: "skin",
    label: "Skin health",
    symptoms: ["eczema", "fungal", "ringworm", "rash", "skin irritation", "psoriasis"],
    primaryProducts: ["Cassia Alata"],
  },
];

export function findSystemsForSymptom(input: string): SystemEntry[] {
  const q = input.toLowerCase();
  return SYSTEM_PRODUCT_MAP.filter((entry) =>
    entry.symptoms.some((s) => q.includes(s.toLowerCase())),
  );
}

// Compact prompt-friendly representation
export function mapAsPromptBlock(): string {
  return SYSTEM_PRODUCT_MAP.map((e) => {
    const products = e.primaryProducts.map((p) => `**${p}**`).join(", ");
    const bundles = e.bundles?.length ? ` | bundles: ${e.bundles.map((b) => `**${b}**`).join(", ")}` : "";
    return `- ${e.label} — symptoms: ${e.symptoms.join(", ")} → ${products}${bundles}${e.notes ? ` (${e.notes})` : ""}`;
  }).join("\n");
}