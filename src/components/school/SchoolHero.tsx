import { motion } from "framer-motion";
import { ArrowRight, Download, Users, Award, Infinity, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/herb-processing.jpg";

const trustItems = [
  { icon: Users, label: "14+ Students Enrolled" },
  { icon: Award, label: "Certificate of Completion" },
  { icon: Infinity, label: "Lifetime Access" },
  { icon: MapPin, label: "In-Person Practical in Saint Lucia" },
];

export function SchoolHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Herbal medicine preparation at Mount Kailash"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(150,30%,8%)]/95 via-[hsl(150,25%,12%)]/80 to-[hsl(150,20%,15%)]/60" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
              Herbal School of Esoteric Knowledge — Est. 1977
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="hero-title text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Train to Become a Certified Herbal Physician
          </motion.h1>

          {/* Body */}
          <motion.p
            className="hero-subtitle text-white/85 mb-8 max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The Level 1 Herbal Physician Course is a comprehensive program that blends 
            the knowledge of traditional medicine, esoteric herbs, and astrology with 
            modern scientific approaches to health and healing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/school/herbal-physician-course">
              <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                Apply Now — Next Cohort March 2026
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a
              href="https://schools.mountkailashslu.com/wp-content/uploads/2024/12/HSEK-Brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="heroSecondary" size="xl" className="w-full sm:w-auto gap-2">
                <Download className="w-5 h-5" />
                Download Brochure
              </Button>
            </a>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            className="flex flex-wrap gap-x-6 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-white/70 text-sm">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
