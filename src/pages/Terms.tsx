import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms of Service | Mount Kailash Rejuvenation Centre"
        description="Terms governing your use of the Mount Kailash Rejuvenation Centre website, products, retreats, and services."
        path="/terms"
      />
      <main className="min-h-screen pt-28 pb-20 px-6 bg-background text-foreground">
        <article className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-serif mb-4">Terms of Service</h1>
          <p className="text-sm opacity-70 mb-8">Last updated: {new Date().getFullYear()}</p>

          <h2>Acceptance</h2>
          <p>
            By accessing or using mountkailashslu.com and related Mount Kailash Rejuvenation
            Centre services, you agree to these terms.
          </p>

          <h2>Products & Health Disclaimer</h2>
          <p>
            Our herbal products are traditional Caribbean botanical formulations and are not
            evaluated by the FDA. They are not intended to diagnose, treat, cure, or prevent
            any disease. Consult a qualified healthcare provider before using any herbal
            product, especially if pregnant, nursing, taking medication, or managing a medical
            condition.
          </p>

          <h2>Orders, Payment & Shipping</h2>
          <p>
            All orders are subject to acceptance and product availability. Prices are listed
            in USD and XCD. Shipping times and fees are calculated at checkout.
          </p>

          <h2>Returns</h2>
          <p>
            Due to the nature of consumable herbal products, all sales are final unless the
            product arrives damaged or defective. Contact us within 7 days of delivery.
          </p>

          <h2>Retreats & Bookings</h2>
          <p>
            Retreat deposits are non-refundable. Cancellation and rescheduling policies are
            communicated at the time of booking.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content, formulations, branding, and educational material on this site are
            the property of Mount Kailash Rejuvenation Centre.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Mount Kailash Rejuvenation Centre is not
            liable for indirect, incidental, or consequential damages arising from use of our
            products or services.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Email{" "}
            <a href="mailto:goddessitopia@mountkailashslu.com">goddessitopia@mountkailashslu.com</a>.
          </p>

          <p className="mt-12">
            <Link to="/" className="underline">← Back to home</Link>
          </p>
        </article>
      </main>
    </>
  );
}