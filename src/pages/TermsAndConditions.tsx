import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function TermsAndConditions() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="Terms & Conditions | Mount Kailash Rejuvenation Centre"
        description="Terms and Conditions governing your use of the Mount Kailash Rejuvenation Centre website, products, retreats, programs, and services."
        path="/terms-and-conditions"
      />
      <main className="min-h-screen pt-28 pb-20 px-6 bg-background text-foreground font-sans">
        <article className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl mb-2 text-foreground">
            Terms and Conditions
          </h1>
          <p className="text-base text-muted-foreground mb-2">
            For Mount Kailash Rejuvenation Centre / Mount Kailash
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            <strong>Effective Date:</strong> May 19, 2026
          </p>

          <p className="mb-4 leading-relaxed">
            Welcome to mountkailashslu.com (“Website”), operated by Mount Kailash
            Rejuvenation Centre (“MKRC/Mount Kailash,” “we,” “our,” or “us”).
          </p>
          <p className="mb-10 leading-relaxed">
            By accessing or using this Website, purchasing products, booking services, or
            participating in any program offered through the Website, you agree to these
            Terms and Conditions. If you do not agree, please do not use the Website.
          </p>

          <Section n="1" title="Company Information">
            <p className="mb-3 leading-relaxed">
              <strong>Mount Kailash Rejuvenation Centre (MKRC) / Mount Kailash</strong>
              <br />
              Marc, Bexon, Castries, Saint Lucia
              <br />
              Phone: +1 (758) 285-5195
              <br />
              Email: info@mountkailashslu.com
              <br />
              Website: mountkailashslu.com
            </p>
            <p className="mb-3 leading-relaxed">
              Some products may also be distributed through:
              <br />
              <strong>Mount Kailash LLC</strong>
              <br />
              Lake Worth, Florida, USA
              <br />
              1 (305) 942-9407
            </p>
          </Section>

          <Section n="2" title="Services and Products">
            <p className="mb-3 leading-relaxed">
              Mount Kailash/MKRC provides wellness-related services and products, including
              but not limited to:
            </p>
            <Bullets
              items={[
                "Herbal products and supplements",
                "Wellness retreats and healing experiences",
                "Educational courses and certifications",
                "Wellness consultations",
                "Plant-based culinary experiences",
                "White-label and manufacturing services",
                "Workshops, events, and wellness programs",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              All offerings are subject to availability and may be modified or discontinued
              without notice.
            </p>
          </Section>

          <Section n="3" title="Medical Disclaimer">
            <p className="mb-3 leading-relaxed">
              The information provided on this Website is for educational and informational
              purposes only and is not intended to diagnose, treat, cure, or prevent any
              disease.
            </p>
            <p className="mb-3 leading-relaxed">
              Our herbal products, wellness programs, consultations, and educational
              materials are not substitutes for professional medical advice, diagnosis, or
              treatment.
            </p>
            <p className="mb-3 leading-relaxed">
              Always consult a qualified healthcare provider before beginning any herbal,
              dietary, detox, or wellness program, especially if you are pregnant, nursing,
              taking medication, or have a medical condition.
            </p>
            <p className="leading-relaxed">
              Statements regarding dietary supplements have not been evaluated by the U.S.
              Food and Drug Administration (FDA).
            </p>
          </Section>

          <Section n="4" title="Eligibility">
            <p className="mb-3 leading-relaxed">By using this Website, you confirm that:</p>
            <Bullets
              items={[
                "You are at least 18 years old or have parental/guardian consent;",
                "You are legally capable of entering binding agreements;",
                "You will use the Website only for lawful purposes.",
              ]}
            />
          </Section>

          <Section n="5" title="Orders and Payments">
            <p className="mb-3 leading-relaxed">
              All prices are listed in the applicable currency displayed on the Website.
            </p>
            <p className="mb-3 leading-relaxed">
              Mount Kailash/MKRC reserves the right to:
            </p>
            <Bullets
              items={[
                "Refuse or cancel orders;",
                "Limit quantities purchased;",
                "Correct pricing errors;",
                "Modify pricing at any time.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Payments must be completed before products or services are delivered unless
              otherwise agreed in writing.
            </p>
          </Section>

          <Section n="6" title="Shipping and Delivery">
            <p className="mb-3 leading-relaxed">
              Shipping times are estimates only and may vary due to customs, weather,
              carrier delays, or international regulations.
            </p>
            <p className="mb-3 leading-relaxed">Customers are responsible for:</p>
            <Bullets
              items={[
                "Providing accurate shipping information;",
                "Any customs duties, import taxes, or fees applicable in their country.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Mount Kailash/MKRC is not responsible for delays caused by third-party
              carriers or customs authorities.
            </p>
          </Section>

          <Section n="7" title="Returns and Refunds">
            <p className="mb-3 leading-relaxed">
              Due to the nature of herbal and wellness products, opened consumable products
              are generally non-refundable unless defective or damaged upon arrival.
            </p>
            <p className="mb-3 leading-relaxed">For retreats, programs, or events:</p>
            <Bullets
              items={[
                "Deposits may be non-refundable;",
                "Refund eligibility depends on the cancellation policy provided at booking.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Requests must be submitted in writing to{" "}
              <a
                href="mailto:info@mountkailashslu.com"
                className="underline hover:opacity-80"
              >
                info@mountkailashslu.com
              </a>{" "}
              within 7 days of receiving the product or service issue.
            </p>
          </Section>

          <Section n="8" title="Retreats and Wellness Programs">
            <p className="mb-3 leading-relaxed">
              Participation in retreats, detox programs, workshops, or wellness experiences
              is voluntary and undertaken at your own risk.
            </p>
            <p className="mb-3 leading-relaxed">By participating, you acknowledge that:</p>
            <Bullets
              items={[
                "Wellness activities may involve physical, emotional, or dietary changes;",
                "Results vary by individual;",
                "Mount Kailash/MKRC is not liable for personal injuries, allergic reactions, or outcomes arising from participation except where prohibited by law.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Participants are responsible for disclosing relevant medical conditions,
              allergies, dietary restrictions, or physical limitations before participation.
            </p>
          </Section>

          <Section n="9" title="Intellectual Property">
            <p className="mb-3 leading-relaxed">All Website content, including:</p>
            <Bullets
              items={[
                "Logos",
                "Text",
                "Graphics",
                "Images",
                "Videos",
                "Educational materials",
                "Product names",
                "Course content",
              ]}
            />
            <p className="mt-3 mb-3 leading-relaxed">
              are the property of Mount Kailash/MKRC unless otherwise stated and are
              protected by intellectual property laws.
            </p>
            <p className="leading-relaxed">
              You may not reproduce, distribute, modify, or commercially exploit any
              content without prior written permission.
            </p>
          </Section>

          <Section n="10" title="User Conduct">
            <p className="mb-3 leading-relaxed">You agree not to:</p>
            <Bullets
              items={[
                "Use the Website unlawfully;",
                "Attempt unauthorized access to systems or data;",
                "Upload harmful code or malicious software;",
                "Misrepresent your identity;",
                "Interfere with Website functionality.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Mount Kailash/MKRC reserves the right to restrict or terminate access for
              violations.
            </p>
          </Section>

          <Section n="11" title="Third-Party Links">
            <p className="leading-relaxed">
              The Website may contain links to third-party websites or services. Mount
              Kailash/MKRC is not responsible for the content, privacy practices, or
              policies of third-party sites.
            </p>
          </Section>

          <Section n="12" title="Limitation of Liability">
            <p className="mb-3 leading-relaxed">
              To the fullest extent permitted by law, Mount Kailash/MKRC shall not be
              liable for:
            </p>
            <Bullets
              items={[
                "Indirect or consequential damages;",
                "Loss of profits or business opportunities;",
                "Delays or interruptions;",
                "Allergic reactions or individual sensitivities;",
                "Decisions made based on Website content.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Use of the Website and products/services is at your own risk.
            </p>
          </Section>

          <Section n="13" title="Indemnification">
            <p className="leading-relaxed">
              You agree to indemnify and hold harmless Mount Kailash/MKRC, its affiliates,
              officers, staff, facilitators, and partners from claims, damages,
              liabilities, or expenses arising from your use of the Website or violation of
              these Terms.
            </p>
          </Section>

          <Section n="14" title="Privacy">
            <p className="leading-relaxed">
              Your use of the Website is also governed by our{" "}
              <Link to="/privacy-policy" className="underline hover:opacity-80">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>

          <Section n="15" title="Governing Law">
            <p className="mb-3 leading-relaxed">
              These Terms and Conditions shall be governed and interpreted in accordance
              with the laws of Saint Lucia and, where applicable to payment processing,
              consumer transactions, or U.S.-based operations, the laws of the State of
              Florida, United States of America.
            </p>
            <p className="leading-relaxed">
              Any disputes arising from the use of this Website, products, services, or
              transactions shall be subject to the jurisdiction of the courts of Saint
              Lucia and/or the State of Florida, depending on the nature and location of
              the transaction or legal matter.
            </p>
          </Section>

          <Section n="16" title="Changes to Terms">
            <p className="leading-relaxed">
              Mount Kailash/MKRC reserves the right to update or modify these Terms at any
              time. Continued use of the Website after changes are posted constitutes
              acceptance of the updated Terms.
            </p>
          </Section>

          <hr className="my-12 border-border" />
          <p>
            <Link to="/" className="underline hover:opacity-80">
              ← Back to home
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-2xl md:text-3xl mb-4 text-foreground">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 leading-relaxed">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}