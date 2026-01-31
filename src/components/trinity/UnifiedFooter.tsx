import { Link } from "react-router-dom";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

const whatsappNumber = "+17582855195";
const whatsappMessage = encodeURIComponent(
  "Hello, I'd like to learn more about Mount Kailash products and services."
);

export function UnifiedFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-serif font-bold text-lg">
                  M
                </span>
              </div>
              <div>
                <div className="font-serif font-bold">Mount Kailash</div>
                <div className="text-xs text-secondary-foreground/70">
                  Rejuvenation Centre
                </div>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Traditional St. Lucian bush medicine for cellular wellness. 21+
              years of clinical practice.
            </p>
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-semibold hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="font-semibold mb-4 text-secondary-foreground">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/shop"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/category/liquid-tinctures"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Liquid Tinctures
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/category/capsules-powders"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Capsules & Powders
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/category/traditional-teas"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Traditional Teas
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/category/raw-herbs"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Raw Herbs
                </Link>
              </li>
            </ul>
          </div>

          {/* Practitioners Column */}
          <div>
            <h3 className="font-semibold mb-4 text-secondary-foreground">
              Practitioners
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/wholesale"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Wholesale Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/wholesale"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Volume Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/wholesale"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  COA Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/wholesale"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Private Labeling
                </Link>
              </li>
            </ul>
          </div>

          {/* Visit Column */}
          <div>
            <h3 className="font-semibold mb-4 text-secondary-foreground">
              Visit
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/retreats"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Retreat Programs
                </Link>
              </li>
              <li>
                <Link
                  to="/retreats"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Group Immersions
                </Link>
              </li>
              <li>
                <Link
                  to="/retreats"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Solo Detox Retreats
                </Link>
              </li>
              <li>
                <Link
                  to="/retreats"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  Book Consultation
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-secondary-foreground/80">
                <MapPin className="w-4 h-4" />
                Soufrière, St. Lucia
              </div>
              <div className="flex items-center gap-2 text-secondary-foreground/80">
                <Phone className="w-4 h-4" />
                +1 (758) 285-5195
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-foreground/60">
            <p>
              © {new Date().getFullYear()} Mount Kailash Rejuvenation Centre.
              All rights reserved.
            </p>
            <p className="text-center md:text-right max-w-xl">
              <strong>FDA Disclaimer:</strong> These statements have not been
              evaluated by the FDA. Products are not intended to diagnose,
              treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
