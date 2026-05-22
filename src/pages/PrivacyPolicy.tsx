import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function PrivacyPolicy() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="Privacy Policy | Mount Kailash Rejuvenation Centre"
        description="How Mount Kailash Rejuvenation Centre collects, uses, stores, and protects your personal information."
        path="/privacy-policy"
      />
      <main className="min-h-screen pt-28 pb-20 px-6 bg-background text-foreground font-sans">
        <article className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl mb-2 text-foreground">
            Privacy Policy
          </h1>
          <p className="text-base text-muted-foreground mb-2">
            For Mount Kailash Rejuvenation Centre
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            <strong>Effective Date:</strong> May 19, 2026
          </p>

          <p className="mb-4 leading-relaxed">
            Mount Kailash Rejuvenation Centre (“Mount Kailash/MKRC,” “we,” “our,” or “us”)
            respects your privacy and is committed to protecting your personal information.
          </p>
          <p className="mb-10 leading-relaxed">
            This Privacy Policy explains how we collect, use, store, and protect your
            information when you use mountkailashslu.com.
          </p>

          <Section n="1" title="Information We Collect">
            <p className="mb-3 leading-relaxed">We may collect the following information:</p>
            <h3 className="font-serif text-xl mb-2 mt-4 text-foreground">
              Personal Information
            </h3>
            <Bullets
              items={[
                "Name",
                "Email address",
                "Phone number",
                "Billing and shipping address",
                "Payment information",
                "Emergency contact information",
                "Health or dietary information voluntarily provided for retreats or wellness services",
              ]}
            />
            <h3 className="font-serif text-xl mb-2 mt-6 text-foreground">
              Technical Information
            </h3>
            <Bullets
              items={[
                "IP address",
                "Browser type",
                "Device information",
                "Cookies and usage analytics",
              ]}
            />
            <h3 className="font-serif text-xl mb-2 mt-6 text-foreground">
              Transaction Information
            </h3>
            <Bullets
              items={[
                "Products purchased",
                "Retreat bookings",
                "Course enrollments",
                "Customer service communications",
              ]}
            />
          </Section>

          <Section n="2" title="How We Use Information">
            <p className="mb-3 leading-relaxed">We use your information to:</p>
            <Bullets
              items={[
                "Process orders and bookings;",
                "Deliver products and services;",
                "Respond to inquiries;",
                "Improve our Website and customer experience;",
                "Send updates, newsletters, or promotional content;",
                "Comply with legal obligations;",
                "Maintain safety during retreats and wellness activities.",
              ]}
            />
          </Section>

          <Section n="3" title="Health Information">
            <p className="mb-3 leading-relaxed">
              Any health, dietary, or wellness information voluntarily provided is used
              solely to:
            </p>
            <Bullets
              items={[
                "Personalize wellness experiences;",
                "Support retreat accommodations;",
                "Address safety concerns.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Mount Kailash/MKRC does not sell sensitive health information.
            </p>
          </Section>

          <Section n="4" title="Payment Processing">
            <p className="mb-3 leading-relaxed">
              Payments may be processed through secure third-party payment providers.
            </p>
            <p className="leading-relaxed">
              Mount Kailash/MKRC does not store full payment card details on our servers.
            </p>
          </Section>

          <Section n="5" title="Cookies and Analytics">
            <p className="mb-3 leading-relaxed">We may use cookies and analytics tools to:</p>
            <Bullets
              items={[
                "Improve Website functionality;",
                "Understand visitor behavior;",
                "Personalize content and advertisements.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              You may disable cookies through your browser settings, though some Website
              features may not function properly.
            </p>
          </Section>

          <Section n="6" title="Marketing Communications">
            <p className="mb-3 leading-relaxed">
              You may receive promotional emails or messages from Mount Kailash/MKRC.
            </p>
            <p className="mb-3 leading-relaxed">You can unsubscribe at any time by:</p>
            <Bullets
              items={[
                "Clicking the unsubscribe link in emails; or",
                "Contacting us directly.",
              ]}
            />
          </Section>

          <Section n="7" title="Sharing of Information">
            <p className="mb-3 leading-relaxed">We may share information with:</p>
            <Bullets
              items={[
                "Payment processors;",
                "Shipping providers;",
                "Booking or software platforms;",
                "Professional advisors;",
                "Regulatory authorities where legally required.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Mount Kailash/MKRC does not sell your personal information to third parties.
            </p>
          </Section>

          <Section n="8" title="International Users">
            <p className="mb-3 leading-relaxed">
              Because Mount Kailash/MKRC serves international clients and operates through
              entities in Saint Lucia and the United States, your information may be
              processed and stored in Saint Lucia, Florida (USA), or other jurisdictions
              where our service providers operate.
            </p>
            <p className="leading-relaxed">
              By using this Website, you consent to such transfers and processing where
              legally permitted.
            </p>
          </Section>

          <Section n="9" title="Data Security">
            <p className="mb-3 leading-relaxed">
              We implement reasonable administrative, technical, and physical safeguards to
              protect personal information.
            </p>
            <p className="leading-relaxed">
              However, no electronic transmission or storage system is completely secure.
            </p>
          </Section>

          <Section n="10" title="Data Retention">
            <p className="mb-3 leading-relaxed">
              We retain information only as long as reasonably necessary for:
            </p>
            <Bullets
              items={[
                "Business operations;",
                "Legal compliance;",
                "Recordkeeping;",
                "Safety and wellness administration.",
              ]}
            />
          </Section>

          <Section n="11" title="Your Rights">
            <p className="mb-3 leading-relaxed">
              Depending on your jurisdiction, you may have rights to:
            </p>
            <Bullets
              items={[
                "Access your data;",
                "Correct inaccurate information;",
                "Request deletion;",
                "Withdraw consent for marketing communications.",
              ]}
            />
            <p className="mt-3 leading-relaxed">
              Requests may be submitted to{" "}
              <a
                href="mailto:info@mountkailashslu.com"
                className="underline hover:opacity-80"
              >
                info@mountkailashslu.com
              </a>
              .
            </p>
          </Section>

          <Section n="12" title="Children’s Privacy">
            <p className="mb-3 leading-relaxed">
              Our Website is not intended for children under 13 without parental
              supervision.
            </p>
            <p className="leading-relaxed">
              We do not knowingly collect personal information from children without
              appropriate consent.
            </p>
          </Section>

          <Section n="13" title="Third-Party Services">
            <p className="leading-relaxed">
              The Website may contain embedded tools or links operated by third parties.
              Their privacy practices are governed by their own policies.
            </p>
          </Section>

          <Section n="14" title="Changes to This Policy">
            <p className="leading-relaxed">
              Mount Kailash/MKRC may update this Privacy Policy periodically. Updated
              versions will be posted on this page with a revised effective date.
            </p>
          </Section>

          <Section n="15" title="Contact Information">
            <p className="mb-3 leading-relaxed">
              For privacy-related questions, contact:
            </p>
            <p className="leading-relaxed">
              <strong>Mount Kailash Rejuvenation Centre / Mount Kailash (MKRC)</strong>
              <br />
              Marc, Bexon, Castries, Saint Lucia
              <br />
              Email:{" "}
              <a
                href="mailto:info@mountkailashslu.com"
                className="underline hover:opacity-80"
              >
                info@mountkailashslu.com
              </a>
              <br />
              Website: mountkailashslu.com
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