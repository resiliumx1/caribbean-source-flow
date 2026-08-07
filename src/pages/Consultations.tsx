import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Leaf, Clock, Video, MapPin, ShieldCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { DirectAnswer } from "@/components/DirectAnswer";
import { ConsultationWizard } from "@/components/consultation/ConsultationWizard";
import { useConsultationAvailability } from "@/hooks/use-consultations";
import { moneyUsd, durationLabel } from "@/lib/consultation-utils";
import priestPhoto from "@/assets/priest-kailash-host.webp";
import "@/styles/consultation.css";

const FAQS = [
  {
    q: "How long is a private consultation with Priest Kailash?",
    a: "Each private consultation runs for a full hour. That hour is yours alone: your history, your current condition, and the protocol built around it.",
  },
  {
    q: "How much does a consultation cost?",
    a: "A one-hour private consultation is USD 300, which is 810 XCD at our standard rate. Payment is taken at the time of booking, which is what reserves the hour in the calendar.",
  },
  {
    q: "Can I meet online instead of travelling to Saint Lucia?",
    a: "Yes. Consultations are held either online in a private video room or in person at the Mount Kailash Rejuvenation Centre in Saint Lucia. Online bookings receive their private video link by email immediately after payment.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes. Every confirmation email contains a private link where you can move your session to another open time or cancel it, subject to the notice period stated on that page.",
  },
  {
    q: "Is this medical treatment?",
    a: "No. A consultation is traditional herbal guidance rooted in decades of practice with Saint Lucia's mineral rich soil and its botanicals. It is not a substitute for diagnosis or treatment by a licensed medical practitioner.",
  },
  {
    q: "What should I prepare beforehand?",
    a: "Bring your history: what you are experiencing, how long it has been present, anything you have already tried, and any medication you are taking. The more Priest Kailash knows in advance, the more precise the protocol.",
  },
];

export default function Consultations() {
  const { data } = useConsultationAvailability();
  const service = data?.service;
  const practitioner = data?.practitioner;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceLd = service
    ? {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      serviceType: "Herbal consultation",
      description: service.description ?? undefined,
      provider: {
        "@type": "Person",
        name: practitioner?.name ?? "Rt. Hon. Priest Kailash",
        jobTitle: practitioner?.title ?? undefined,
        worksFor: {
          "@type": "Organization",
          name: "Mount Kailash Rejuvenation Centre",
          url: "https://mountkailashslu.com",
        },
      },
      areaServed: { "@type": "Place", name: "Worldwide" },
      url: "https://mountkailashslu.com/consultations",
      offers: {
        "@type": "Offer",
        price: service.price_usd.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://mountkailashslu.com/consultations",
      },
    }
    : null;

  return (
    <main className="consult min-h-screen" style={{ background: "var(--c-bg)" }}>
      <SEOHead
        title="Book a Private Consultation with Rt. Hon. Priest Kailash"
        description="Reserve a one-hour private herbal consultation with Rt. Hon. Priest Kailash of Mount Kailash Rejuvenation Centre, Saint Lucia. Online or in person, USD 300, confirmed instantly."
        path="/consultations"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        {serviceLd && <script type="application/ld+json">{JSON.stringify(serviceLd)}</script>}
      </Helmet>

      {/* Hero */}
      <section className="px-4 pt-28 pb-12 sm:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-7"
          >
            <img
              src={practitioner?.photo_url || priestPhoto}
              alt="Rt. Hon. Priest Kailash, herbal physician and founder of Mount Kailash Rejuvenation Centre"
              width={200}
              height={200}
              className="rounded-full object-cover"
              style={{
                width: 200, height: 200,
                border: "3px solid var(--c-gold)",
                boxShadow: "0 18px 40px -22px rgba(15,40,30,0.45)",
              }}
            />
          </motion.div>

          <p className="consult-eyebrow mb-3">Private practice · Saint Lucia</p>
          <h1
            className="consult-serif"
            style={{ fontSize: "clamp(2.1rem, 5.5vw, 3.4rem)", lineHeight: 1.08 }}
          >
            An hour with Rt. Hon. Priest Kailash
          </h1>
          <p
            className="mt-5 mx-auto"
            style={{ maxWidth: "42rem", fontSize: "17px", lineHeight: 1.8, color: "var(--c-ink-soft)" }}
          >
            One person, one hour, one protocol. Sessions are taken slowly and in small number,
            because each one is prepared before you ever arrive. Choose your time below and it is
            held the moment you confirm.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {[
              { icon: Clock, label: `${durationLabel(service?.duration_minutes)}, one to one` },
              { icon: Leaf, label: service ? `${moneyUsd(service.price_usd)} USD` : "USD 300" },
              { icon: Video, label: "Online video room" },
              { icon: MapPin, label: "Or in person in Saint Lucia" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2" style={{ fontSize: "15px" }}>
                <Icon className="w-4 h-4" style={{ color: "var(--c-gold-deep)" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <DirectAnswer
        question="How do I book a consultation with Priest Kailash?"
        answer="Choose an open time on this page, share a little of your history, and pay the USD 300 fee. The hour is reserved for you immediately and a confirmation with a calendar invitation — and a private video link for online sessions — arrives by email. Consultations run for one hour with Rt. Hon. Priest Kailash himself, either online or in person at the Mount Kailash Rejuvenation Centre in Saint Lucia, and every confirmation includes a link to reschedule or cancel."
      />

      {/* Wizard */}
      <section id="book" className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <ConsultationWizard />
        </div>
      </section>

      {/* What the hour holds */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="consult-eyebrow mb-3">What the hour holds</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "Your history, heard properly",
                body: "The first part of the hour is listening. What has happened, what has been tried, and what the body has been signalling all along.",
              },
              {
                title: "The pattern beneath it",
                body: "Priest Kailash works to the root pattern rather than the surface complaint, drawing on decades in Saint Lucia's mineral rich soil and its botanicals.",
              },
              {
                title: "A protocol you can follow",
                body: "You leave with a clear, sequenced protocol: what to take, in what order, for how long, and what to watch for as the body responds.",
              },
            ].map((c) => (
              <div key={c.title} className="consult-summary">
                <h3 className="consult-serif" style={{ fontSize: "20px" }}>{c.title}</h3>
                <p className="mt-2" style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--c-ink-soft)" }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practitioner note */}
      {practitioner?.bio && (
        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto consult-panel p-6 sm:p-8">
            <p className="consult-eyebrow mb-2">Your practitioner</p>
            <h2 className="consult-serif" style={{ fontSize: "clamp(1.5rem,3vw,2rem)" }}>
              {practitioner.name}
            </h2>
            {practitioner.title && (
              <p style={{ fontSize: "15px", color: "var(--c-gold-deep)", marginTop: 4 }}>
                {practitioner.title}
              </p>
            )}
            <p className="mt-4" style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--c-ink-soft)" }}>
              {practitioner.bio}
            </p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="consult-eyebrow mb-3">Questions</p>
          <h2 className="consult-serif mb-6" style={{ fontSize: "clamp(1.6rem,3.4vw,2.2rem)" }}>
            Before you book
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="consult-summary">
                <h3 style={{ fontSize: "17px", fontWeight: 500 }}>{f.q}</h3>
                <p className="mt-2" style={{ fontSize: "15px", lineHeight: 1.75, color: "var(--c-ink-soft)" }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>

          <p
            className="mt-8 flex items-start gap-2.5"
            style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--c-ink-soft)" }}
          >
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--c-gold-deep)" }} />
            Consultations are traditional herbal guidance and are not a substitute for diagnosis or
            treatment by a licensed medical practitioner. If you are pregnant, nursing, or taking
            prescribed medication, please say so during your session.
          </p>
        </div>
      </section>
    </main>
  );
}
