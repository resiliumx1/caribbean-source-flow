import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const whatsappNumber = "+17582855195";
const whatsappMessage = encodeURIComponent(
  "Hello, I'd like to learn more about Mount Kailash products and services."
);

export function UnifiedFooter() {
  return (
    <footer style={{ background: 'hsl(var(--mk-forest))', color: 'hsl(var(--mk-cream))' }}>
      <div className="container mx-auto max-w-[1400px] px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div>
            <h2 className="font-serif" style={{ fontSize: '20px', marginBottom: '8px', color: 'hsl(var(--mk-cream))' }}>
              Mount Kailash
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'hsl(var(--mk-cream) / 0.6)', marginBottom: '4px' }}>
              Rejuvenation Centre
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'hsl(var(--mk-cream) / 0.6)', marginBottom: '4px' }}>
              Soufrière, St. Lucia
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'hsl(var(--mk-cream) / 0.6)' }}>
              Established 2003
            </p>
          </div>

          {/* Col 2: Patient Resources */}
          <div>
            <h3 className="mk-label" style={{ color: 'hsl(var(--mk-gold))', marginBottom: '20px' }}>
              Patient Resources
            </h3>
            <ul className="space-y-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
              {[
                { label: "The Patient Protocol", to: "/retreats" },
                { label: "Book Consultation", to: "/retreats" },
                { label: "Patient Portal", to: "/shop" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:opacity-100"
                    style={{ color: 'hsl(var(--mk-cream) / 0.6)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Practitioners */}
          <div>
            <h3 className="mk-label" style={{ color: 'hsl(var(--mk-gold))', marginBottom: '20px' }}>
              Practitioners
            </h3>
            <ul className="space-y-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
              {[
                { label: "Clinical Supply", to: "/wholesale" },
                { label: "COA Documentation", to: "/wholesale" },
                { label: "Training Programs", to: "/wholesale" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:opacity-100"
                    style={{ color: 'hsl(var(--mk-cream) / 0.6)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
            <h3 className="mk-label" style={{ color: 'hsl(var(--mk-gold))', marginBottom: '20px' }}>
              Connect
            </h3>
            <ul className="space-y-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
              <li>
                <Link to="/retreats" className="transition-colors hover:opacity-100" style={{ color: 'hsl(var(--mk-cream) / 0.6)' }}>
                  The Ridge Retreat
                </Link>
              </li>
              <li>
                <Link to="/wholesale" className="transition-colors hover:opacity-100" style={{ color: 'hsl(var(--mk-cream) / 0.6)' }}>
                  Wholesale Inquiries
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:opacity-100"
                  style={{ color: 'hsl(var(--mk-cream) / 0.6)' }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid hsl(var(--mk-gold) / 0.15)' }}>
        <div className="container mx-auto max-w-[1400px] px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4" style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'hsl(var(--mk-cream) / 0.4)' }}>
            <p>© {new Date().getFullYear()} Mount Kailash Rejuvenation Centre. All rights reserved.</p>
            <p>Traditional use based on St. Lucian bush medicine practices.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
