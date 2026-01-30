import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg font-serif">K</span>
            </div>
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
              <a 
                href="tel:+13059429407" 
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" />
                +1 (305) 942-9407
              </a>
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
