import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import mtKailashLogo from "@/assets/mt-kailash-logo.webp";

interface HeaderProps {
  onScrollToForm: () => void;
}

export const Header = ({ onScrollToForm }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={mtKailashLogo}
              alt="Mount Kailash"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="font-semibold text-foreground font-serif">Mount Kailash</span>
              <span className="hidden md:inline text-xs text-muted-foreground ml-2">
                Wholesale
              </span>
            </div>
          </div>
          
          {/* Contact & CTA */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span className="inline-flex items-center gap-2">
                  <a href="tel:+13059429407" className="hover:text-foreground transition-colors">🇺🇸 305-942-9407</a>
                  <span className="opacity-40">·</span>
                  <a href="tel:+17582855195" className="hover:text-foreground transition-colors">🇱🇨 (758) 285-5195</a>
                  <span className="opacity-40">·</span>
                  <a href="tel:+17587223660" className="hover:text-foreground transition-colors">🇱🇨 (758) 722-3660</a>
                </span>
              </span>
              <a 
                href="mailto:Goddessitopia@mountkailashslu.com" 
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={onScrollToForm}
            >
              Get Quote
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
