import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { useStore } from "@/lib/store-context";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";

export function StoreFooter() {
  const { storeEmail, storePhone, whatsappNumber } = useStore();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
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
              Non-GMO, vegan formulations. 21+ years of bush medicine tradition.
            </p>
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
              <li>
                <span className="cursor-default">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-default">
                  Terms of Service
                </span>
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
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold" />
                <a href={`tel:${storePhone}`} className="hover:text-gold transition-colors">
                  {storePhone}
                </a>
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
              Traditional use based on St. Lucian bush medicine practices under the guidance
              of Right Honourable Priest Kailash Kay Leonce.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
