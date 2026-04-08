import { Mail, MapPin, FileText, Package, Truck } from "lucide-react";
import { FooterVine } from "@/components/decorative/BotanicalVine";
import { ContactNumbers } from "@/components/ContactNumbers";

export const Footer = () => {
  return (
    <footer className="py-16" style={{ background: "var(--site-footer-bg)", borderTop: "1px solid rgba(201,168,76,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
      <FooterVine />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "20px", color: "var(--site-footer-text)", marginBottom: "16px" }}>
              Mount Kailash
            </h3>
            <p style={{ color: "var(--site-footer-muted)", fontSize: "14px", fontWeight: 300, marginBottom: "16px", lineHeight: 1.7 }}>
              Nature's Answers for Optimum Health and Wellbeing. Direct-trade Caribbean botanicals since 2003.
            </p>
            <p style={{ fontSize: "13px", color: "var(--site-footer-muted)" }}>
              Founded by Hon. Priest Kailash
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 500, fontSize: "15px", color: "var(--site-footer-text)", marginBottom: "16px" }}>Contact Us</h4>
            <div className="mb-4">
              <ContactNumbers
                linkClassName="hover:text-[#c9a84c]"
                className="text-sm"
              />
            </div>
            <ul className="space-y-3">
              <li>
                <a href="mailto:Goddessitopia@mountkailashslu.com" className="flex items-center gap-2 transition-colors hover:text-[#c9a84c]" style={{ color: "var(--site-footer-muted)", fontSize: "14px" }}>
                  <Mail className="w-4 h-4" style={{ color: "#c9a84c" }} /> Goddessitopia@mountkailashslu.com
                </a>
              </li>
              <li className="flex items-start gap-2" style={{ color: "var(--site-footer-muted)", fontSize: "14px" }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#c9a84c" }} />
                <span>Miami, FL (Fulfillment Center)<br />St. Lucia, West Indies (Farm & Processing)</span>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 500, fontSize: "15px", color: "var(--site-footer-text)", marginBottom: "16px" }}>Resources</h4>
            <ul className="space-y-3">
              {[
                { icon: FileText, label: "Compliance Docs" },
                { icon: Package, label: "Sample Request" },
                { icon: Truck, label: "Shipping Info" },
              ].map((item) => (
                <li key={item.label}>
                  <span className="flex items-center gap-2 cursor-default" style={{ color: "var(--site-footer-muted)", fontSize: "14px" }}>
                    <item.icon className="w-4 h-4" style={{ color: "#c9a84c" }} /> {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Hours */}
          <div>
            <h4 style={{ fontWeight: 500, fontSize: "15px", color: "var(--site-footer-text)", marginBottom: "16px" }}>Business Hours</h4>
            <p style={{ fontSize: "14px", color: "var(--site-footer-muted)", marginBottom: "4px" }}>Miami Office (EST)</p>
            <p style={{ fontSize: "14px", color: "var(--site-footer-muted)", marginBottom: "16px" }}>Mon - Fri: 9:00 AM - 5:00 PM</p>
            <p style={{ fontSize: "14px", color: "#c9a84c", fontWeight: 500 }}>WhatsApp available 24/7</p>
          </div>
        </div>
        
        {/* Disclaimers */}
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: "32px" }}>
          <div className="space-y-2" style={{ fontSize: "12px", color: "var(--site-footer-muted)" }}>
            <p>For manufacturing and formulation use only. Not for retail consumer resale without proper labeling.</p>
            <p>Custom pricing subject to availability and certification verification.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-8" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
            <p style={{ fontSize: "14px", color: "var(--site-footer-muted)" }}>
              © {new Date().getFullYear()} Mount Kailash Rejuvenation Centre. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="cursor-default" style={{ fontSize: "14px", color: "var(--site-footer-muted)" }}>Privacy Policy</span>
              <span className="cursor-default" style={{ fontSize: "14px", color: "var(--site-footer-muted)" }}>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
