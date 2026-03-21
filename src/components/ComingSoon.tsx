import { Mail, MessageCircle } from "lucide-react";
import logo from "@/assets/mt-kailash-logo.webp";

const ComingSoon = () => {
  const whatsappNumber = "17676121219";
  const whatsappMessage = encodeURIComponent("Hi! I'm interested in learning more about Mount Kailash Wellness.");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0B1510] via-[#1F3A2E] to-[#0B1510]">
      <div className="text-center px-6 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <img
            src={logo}
            alt="Mount Kailash Wellness"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto shadow-2xl border-2 border-[#B28735]/30"
          />
        </div>

        {/* Brand Name */}
        <h2 className="text-[#F7F3EE]/80 text-lg md:text-xl font-medium tracking-widest uppercase mb-4">
          Mount Kailash
        </h2>

        {/* Coming Soon Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#F7F3EE] mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Coming Soon
        </h1>

        {/* Teaser Message */}
        <p className="text-[#F7F3EE]/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg mx-auto">
          Caribbean wellness, rooted in tradition. Herbal remedies, healing retreats, and nature's finest sea moss — launching soon.
        </p>

        {/* Decorative Accent Line */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#B28735] to-transparent mx-auto mb-10" />

        {/* Contact Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#20BD5A] transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Contact on WhatsApp
          </a>
          
          <a
            href="mailto:info@mtkailash.com"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#F7F3EE]/30 text-[#F7F3EE] rounded-full font-semibold hover:bg-[#F7F3EE]/10 hover:border-[#F7F3EE]/50 transition-all duration-300"
          >
            <Mail className="w-5 h-5" />
            Email Us
          </a>
        </div>

        {/* Footer Text */}
        <p className="mt-12 text-[#F7F3EE]/40 text-sm">
          © {new Date().getFullYear()} Mount Kailash Wellness. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
