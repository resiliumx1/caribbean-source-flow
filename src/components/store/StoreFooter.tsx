import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Mail, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { ContactNumbers } from "@/components/ContactNumbers";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";
import { FooterVine } from "@/components/decorative/BotanicalVine";
import { LINK_NODES, type LinkNodeId } from "@/lib/internal-links";

export function StoreFooter() {
  const { storeEmail, storePhone, whatsappNumber } = useStore();
  const { pathname } = useLocation();

  // Build the "Explore" cross-link column from the central internal-links map.
  // Excludes the current page so we never link back to ourselves, and skips
  // 'home' (already reachable via the brand mark).
  const exploreIds: LinkNodeId[] = ["shop", "the-answer", "school", "retreats", "webinars", "wholesale"];
  const exploreLinks = exploreIds
    .map((id) => LINK_NODES[id])
    .filter((node) => node.path !== pathname);

  return (
    <footer className="bg-primary text-primary-foreground">
      <FooterVine />
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={mtKailashLogo}
                alt="Mount Kailash Rejuvenation Centre"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-serif font-bold leading-tight">Mount Kailash</h3>
                <p className="text-xs text-primary-foreground/70">Rejuvenation Centre</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              100% natural herbal remedies from the rainforests of St. Lucia. 
              Non-GMO, vegan formulations. 21+ years of wellness medicine tradition.
            </p>
          </div>

          {/* Current programme — crawlable link to the WCE 2026 event page */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Current Programme</h4>
            <a href="/wce-2026" className="text-sm font-medium text-gold hover:underline">
              Caribbean Wellness Experience 2026
            </a>
            <p className="text-xs text-primary-foreground/70 mt-1">October 11–17, 2026 · Saint Lucia</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  Liquid Tinctures
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  Capsules & Powders
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  Traditional Teas
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  Curated Bundles
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  Raw Herbs
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore — keyword-relevant cross-links driven by the internal-links map */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {exploreLinks.map((node) => (
                <li key={node.id}>
                  <Link
                    to={node.path}
                    className="hover:text-gold transition-colors"
                    title={node.blurb}
                  >
                    {node.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/wholesale" className="hover:text-gold transition-colors">
                  Wholesale Inquiries
                </Link>
              </li>
              <li>
                <span className="cursor-default">
                  Shipping & Delivery
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Returns Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-gold transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" />
                <a href={`mailto:${storeEmail}`} className="hover:text-gold transition-colors">
                  {storeEmail}
                </a>
              </li>
              <li>
                <ContactNumbers
                  linkClassName="text-primary-foreground/80 hover:text-gold"
                />
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gold" />
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold mt-0.5" />
                <span>
                  Mount Kailash Rejuvenation Centre
                  <br />
                  St. Lucia, West Indies
                </span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>
              © {new Date().getFullYear()} Mount Kailash Rejuvenation Centre. All rights reserved.
            </p>
            <p className="text-xs max-w-xl text-center md:text-right">
              Traditional use based on St. Lucian wellness medicine practices under the guidance
              of Rt Hon Priest Kailash K Leonce.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
