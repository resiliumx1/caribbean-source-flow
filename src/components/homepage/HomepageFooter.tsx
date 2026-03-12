import { Link } from "react-router-dom";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";

const whatsappNumber = "+17582855195";
const whatsappMessage = encodeURIComponent(
  "Hello, I'd like to learn more about Mount Kailash products and services."
);

export function HomepageFooter() {
  return (
    <footer style={{ background: "#0F281E", color: "#F5F1E8" }}>
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={mtKailashLogo}
                alt="Mount Kailash Rejuvenation Centre"
                className="w-10 h-10 rounded-full object-cover"
                width={40}
                height={40}
              />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#F5F1E8" }}>
                  Mount Kailash
                </div>
                <div style={{ fontSize: "12px", color: "#A8B5A0" }}>
                  Rejuvenation Centre
                </div>
              </div>
            </div>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "14px",
                color: "#A8B5A0",
                marginBottom: "16px",
                lineHeight: 1.6,
              }}
            >
              Traditional St. Lucian bush medicine for cellular wellness. 21+
              years of clinical practice.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ background: "#D4A373", color: "#0F281E" }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Shop */}
          <div>
            <h2 style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, color: "#F5F1E8", marginBottom: "16px" }}>
              Shop
            </h2>
            <ul className="space-y-1 text-sm">
              {[
                { label: "All Products", href: "/shop" },
                { label: "Liquid Tinctures", href: "/shop" },
                { label: "Capsules & Powders", href: "/shop" },
                { label: "Traditional Teas", href: "/shop" },
                { label: "Raw Herbs", href: "/shop" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    style={{ color: "#A8B5A0", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                    className="hover:text-[#D4A373] transition-colors inline-block py-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div>
            <h2 style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, color: "#F5F1E8", marginBottom: "16px" }}>
              Education
            </h2>
            <ul className="space-y-1 text-sm">
              {["Foundations Course", "Advanced Formulation", "Practitioner Certification", "Webinars"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/webinars"
                      style={{ color: "#A8B5A0", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                      className="hover:text-[#D4A373] transition-colors inline-block py-2"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Wholesale */}
          <div>
            <h2 style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, color: "#F5F1E8", marginBottom: "16px" }}>
              Wholesale
            </h2>
            <ul className="space-y-1 text-sm">
              {["Wholesale Portal", "Volume Pricing", "COA Documentation", "Private Labeling"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/wholesale"
                      style={{ color: "#A8B5A0", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
                      className="hover:text-[#D4A373] transition-colors inline-block py-2"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2" style={{ color: "#A8B5A0" }}>
                <MapPin className="w-4 h-4" /> Soufrière, St. Lucia
              </div>
              <div className="flex items-center gap-2" style={{ color: "#A8B5A0" }}>
                <Phone className="w-4 h-4" /> +1 (758) 285-5195
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #2D6A4F" }}>
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ fontSize: "12px", color: "#A8B5A0" }}
          >
            <p>© {new Date().getFullYear()} Mount Kailash Rejuvenation Centre. All rights reserved.</p>
            <p className="text-center md:text-right max-w-xl">
              Traditional use based on St. Lucian bush medicine practices.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
