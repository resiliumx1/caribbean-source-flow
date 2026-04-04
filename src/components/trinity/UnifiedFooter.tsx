import { Link } from "react-router-dom";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";
import { FooterVine } from "@/components/decorative/BotanicalVine";

const whatsappNumber = "+17582855195";
const whatsappMessage = encodeURIComponent(
  "Hello, I'd like to learn more about Mount Kailash products and services."
);

export function UnifiedFooter() {
  return (
    <footer style={{ background: 'var(--site-footer-bg)', color: 'var(--site-footer-text)' }}>
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={mtKailashLogo} alt="Mount Kailash Rejuvenation Centre" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: 'var(--site-footer-text)' }}>Mount Kailash</div>
                <div style={{ fontSize: '12px', color: 'var(--site-footer-muted)' }}>Rejuvenation Centre</div>
              </div>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-footer-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              Traditional St. Lucian bush medicine for cellular wellness. 21+ years of clinical practice.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ background: '#c9a84c', color: '#090909' }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Shop Column */}
          <div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: 'var(--site-footer-text)', marginBottom: '16px' }}>Shop</h2>
            <ul className="space-y-1 text-sm">
              {[
                { label: "All Products", href: "/shop" },
                { label: "Liquid Tinctures", href: "/shop" },
                { label: "Capsules & Powders", href: "/shop" },
                { label: "Traditional Teas", href: "/shop" },
                { label: "Raw Herbs", href: "/shop" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} style={{ color: 'var(--site-footer-muted)', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }} className="hover:text-[#c9a84c] transition-colors inline-block py-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Practitioners Column */}
          <div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: 'var(--site-footer-text)', marginBottom: '16px' }}>Practitioners</h2>
            <ul className="space-y-1 text-sm">
              {["Wholesale Portal", "Volume Pricing", "COA Documentation", "Private Labeling"].map((item) => (
                <li key={item}>
                  <Link to="/wholesale" style={{ color: 'var(--site-footer-muted)', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }} className="hover:text-[#c9a84c] transition-colors inline-block py-2">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Column */}
          <div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: 'var(--site-footer-text)', marginBottom: '16px' }}>Visit</h2>
            <ul className="space-y-1 text-sm">
              {["Retreat Programs", "Group Immersions", "Solo Detox Retreats", "Book Consultation"].map((item) => (
                <li key={item}>
                  <Link to="/retreats" style={{ color: 'var(--site-footer-muted)', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }} className="hover:text-[#c9a84c] transition-colors inline-block py-2">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2" style={{ color: 'var(--site-footer-muted)' }}>
                <MapPin className="w-4 h-4" /> Marc, Castries, St. Lucia
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--site-footer-muted)' }}>
                <Phone className="w-4 h-4" /> +1 (758) 285-5195
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ fontSize: '12px', color: '#a89e90' }}>
            <p>© {new Date().getFullYear()} Mount Kailash Rejuvenation Centre. All rights reserved.</p>
            <p className="text-center md:text-right max-w-xl">Traditional use based on St. Lucian bush medicine practices.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
