import { Phone, Mail, MapPin, FileText, Package, Truck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold font-serif mb-4">
              Mount Kailash
            </h3>
            <p className="text-secondary-foreground/80 text-sm mb-4">
              Nature's Answers for Optimum Health and Wellbeing. 
              Direct-trade Caribbean botanicals since 2003.
            </p>
            <p className="text-xs text-secondary-foreground/60">
              Founded by Hon. Priest Kailash
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="tel:+13059429407" 
                  className="flex items-center gap-2 text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +1 (305) 942-9407
                </a>
              </li>
              <li>
                <a 
                  href="mailto:Goddessitopia@mountkailashslu.com" 
                  className="flex items-center gap-2 text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Goddessitopia@mountkailashslu.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-secondary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Miami, FL (Fulfillment Center)<br />
                  St. Lucia, West Indies (Farm & Processing)
                </span>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="flex items-center gap-2 text-secondary-foreground/80 hover:text-accent transition-colors">
                  <FileText className="w-4 h-4" />
                  Compliance Docs
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-secondary-foreground/80 hover:text-accent transition-colors">
                  <Package className="w-4 h-4" />
                  Sample Request
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-secondary-foreground/80 hover:text-accent transition-colors">
                  <Truck className="w-4 h-4" />
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>
          
          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4">Business Hours</h4>
            <p className="text-sm text-secondary-foreground/80 mb-2">
              Miami Office (EST)
            </p>
            <p className="text-sm text-secondary-foreground/60 mb-4">
              Mon - Fri: 9:00 AM - 5:00 PM
            </p>
            <p className="text-sm text-accent font-medium">
              WhatsApp available 24/7
            </p>
          </div>
        </div>
        
        {/* Disclaimers */}
        <div className="border-t border-secondary-foreground/10 pt-8">
          <div className="text-xs text-secondary-foreground/50 space-y-2">
            <p>
              For manufacturing and formulation use only. Not for retail consumer resale without proper labeling.
            </p>
            <p>
              For manufacturing and formulation use only. Not for retail consumer resale without proper labeling.
            </p>
            <p>
              Custom pricing subject to availability and certification verification.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-secondary-foreground/10">
            <p className="text-sm text-secondary-foreground/60">
              © {new Date().getFullYear()} Mount Kailash Rejuvenation Centre. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
