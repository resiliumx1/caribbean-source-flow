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
    a: "Sessions run 30 to 45 minutes, one to one with Rt. Hon. Priest Kailash. The full 45 minutes is reserved for you, and a session that finishes early simply ends early.",
  },
  {
    q: "How much does a consultation cost?",
    a: "A single private consultation is USD 300, which is 810 XCD at our standard rate. The five session package is USD 1,200, and a follow-on session inside an existing package takes no further payment. Payment is taken at the time of booking, which is what reserves the time in the calendar.",
  },
  {
    q: "Can I meet online instead of travelling to Saint Lucia?",
    a: "Yes. Consultations are held either online or in person at the Mount Kailash Rejuvenation Centre in Saint Lucia. Online bookings receive a private video link by email once the booking is confirmed; in person bookings receive directions to the centre.",
  },
  {
    q: "When are consultations held?",
    a: "Open times are published on this page as Priest Kailash releases them. Only times he has open appear in the calendar, so whatever you can select is genuinely available.",
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
    q: "What do I need to have ready?",
    a: "For an online session, a stable internet connection and somewhere quiet to sit. For an in person session at the centre, bring any medication you are taking. In both cases the booking form has space for anything you would like him to know beforehand.",
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
        title="Private Herbal Consultations | Mount Kailash"
        description="Book a private 30–45 minute consultation with Rt Hon Priest Kailash of Mount Kailash Rejuvenation Centre, Saint Lucia. Online, from USD 300."
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
            A session with Rt. Hon. Priest Kailash
          </h1>
          <p
            className="mt-5 mx-auto"
            style={{ maxWidth: "42rem", fontSize: "17px", lineHeight: 1.8, color: "var(--c-ink-soft)" }}
          >
            One-to-one sessions with Rt. Hon. Priest Kailash, held online. Choose a single
            consultation, a five session package, a follow-on session from an existing package, or
            a business consultation. Only open times appear below.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {[
              { icon: Clock, label: `${durationLabel(service?.duration_minutes, service?.duration_display_label)}, one to one` },
              { icon: Leaf, label: `From ${service ? moneyUsd(service.price_usd) : "300"} USD` },
              { icon: Video, label: "Online video room" },
              { icon: MapPin, label: "Saint Lucia practice" },
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
        answer="Choose one of the four consultations on this page, pick an open time, and pay the fee, which starts at USD 300. The time is reserved for you immediately and a confirmation with a calendar invitation and a private video link arrives by email. Sessions are one to one with Rt. Hon. Priest Kailash himself, and every confirmation includes a link to reschedule or cancel."
      />

      {/* Wizard */}
      <section id="book" className="px-4 pb-16">
        <div className="max-w-4xl xl:max-w-6xl mx-auto">
          <ConsultationWizard />
        </div>
      </section>

      {/* Practical details — logistics only */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="consult-eyebrow mb-3">Practical details</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "Online",
                body: "A private video link is emailed once your booking is confirmed. You will need a stable internet connection and somewhere quiet to sit.",
              },
              {
                title: "In person",
                body: "At the Mount Kailash Rejuvenation Centre in Saint Lucia. Directions arrive with your confirmation. Bring any medication you are taking.",
              },
              {
                title: "Times and changes",
                body: "All times are shown in your own timezone and confirmed in Saint Lucia time as well. Your confirmation carries a private link to move or cancel the session.",
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
