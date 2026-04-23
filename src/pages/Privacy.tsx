import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Mount Kailash Rejuvenation Centre"
        description="How Mount Kailash Rejuvenation Centre collects, uses, and protects your personal information."
        path="/privacy"
      />
      <main className="min-h-screen pt-28 pb-20 px-6 bg-background text-foreground">
        <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-serif mb-4">Privacy Policy</h1>
          <p className="text-sm opacity-70 mb-8">Last updated: {new Date().getFullYear()}</p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide when you place an order, create an account,
            book a retreat, or contact us — including your name, email, phone number, billing
            and shipping address, and order details.
          </p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To process orders and bookings</li>
            <li>To communicate about your order, retreat, or inquiry</li>
            <li>To provide customer support</li>
            <li>To improve our products and services</li>
          </ul>

          <h2>Sharing</h2>
          <p>
            We do not sell your personal information. We share data only with service providers
            necessary to fulfill orders (payment processors, shipping carriers) and as required
            by law.
          </p>

          <h2>Cookies</h2>
          <p>
            We use essential cookies to operate the site (cart, login session) and may use
            analytics cookies to understand site usage.
          </p>

          <h2>Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at
            any time by contacting us at{" "}
            <a href="mailto:goddessitopia@mountkailashslu.com">goddessitopia@mountkailashslu.com</a>.
          </p>

          <h2>Contact</h2>
          <p>
            Mount Kailash Rejuvenation Centre, Soufrière, Saint Lucia.
            Email: <a href="mailto:goddessitopia@mountkailashslu.com">goddessitopia@mountkailashslu.com</a>
          </p>

          <p className="mt-12">
            <Link to="/" className="underline">← Back to home</Link>
          </p>
        </article>
      </main>
    </>
  );
}