import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Instructor {
  name: string;
  title: string;
  credentials: string;
  bio: string;
  photoUrl: string;
  initials: string;
  featured?: boolean;
}

const instructors: Instructor[] = [
  {
    name: "Rt Hon Priest Kailash K Leonce",
    title: "Grand Master Herbal Physician",
    credentials: "Lead Instructor & Founder, HSEK",
    bio: "A 21+ year master herbalist and founder of Mount Kailash Rejuvenation Centre and the Herbal School of Esoteric Knowledge. Author of 'The New Herbal Manual,' Priest Kailash has trained over 500 herbalists and is recognized by the St. Lucia Tourism Authority as an Official Cultural Heritage Partner. His approach blends traditional Caribbean bush medicine with modern scientific methodology.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/priest-kailash-instructor.jpg",
    initials: "PK",
    featured: true,
  },
  {
    name: "Goddess Ronda Itopia Archer",
    title: "Co-founder & Academic Coordinator",
    credentials: "Herbal School of Esoteric Knowledge",
    bio: "Co-founder of the Herbal School of Esoteric Knowledge and an instrumental force behind the school's curriculum development and academic coordination. She ensures the highest standards of education and student support throughout the program.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/goddess-ronda-instructor.jpg",
    initials: "RA",
  },
  {
    name: "Ing. Verne Edward Emmanuel",
    title: "Chemical Engineer",
    credentials: "Director of the St. Lucia Bureau of Standards",
    bio: "A chemical engineer serving as Director of the St. Lucia Bureau of Standards. He brings rigorous scientific standards and quality assurance expertise to the program's manufacturing and labelling modules.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/verne-emmanuel-instructor.jpg",
    initials: "VE",
  },
  {
    name: "Dylan Norbert-Inglis",
    title: "Attorney-at-Law",
    credentials: "Legal Framework Instructor",
    bio: "An attorney-at-law who instructs the Legal Framework module, providing students with essential knowledge of the regulatory landscape governing herbal medicine practice, product registration, and professional liability.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/dylan-norbert-instructor.jpg",
    initials: "DN",
  },
  {
    name: "Dr. Stephen King",
    title: "Pathologist, OBE",
    credentials: "Fellow of the Royal College of Physicians of Canada",
    bio: "An esteemed pathologist who has been awarded the Order of the British Empire (OBE) and is a Fellow of the Royal College of Physicians of Canada. He brings decades of clinical and diagnostic expertise to the pathophysiology curriculum.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/dr-stephen-king-instructor.jpg",
    initials: "SK",
  },
  {
    name: "Ras Dr. Wayne A. Rose",
    title: "Ph.D., African Diaspora History",
    credentials: "Johns Hopkins University Fellow",
    bio: "Holds a Ph.D. in African Diaspora History and has been a fellow at Johns Hopkins University. He provides deep historical and cultural context to the History of Herbal Medicine module, connecting Caribbean healing traditions to their African roots.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/dr-wayne-rose-instructor.jpg",
    initials: "WR",
  },
  {
    name: "Dr. Marcel Archer-Thomas",
    title: "Ed.D., Lecturer",
    credentials: "University of the West Indies",
    bio: "Holds a Doctor of Education degree and serves as a lecturer at the University of the West Indies. He brings academic rigor and pedagogical expertise to the school's teaching methodology and curriculum design.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/dr-marcel-archer-instructor.jpg",
    initials: "MA",
  },
  {
    name: "Honourable Priest T.O.N. Isaac",
    title: "Archaeoastronomer",
    credentials: "Astronomy for the Herbal Physician",
    bio: "An archaeoastronomer who instructs the unique 'Astronomy for the Herbal Physician' module, exploring the esoteric connections between celestial cycles, plant harvesting, and traditional healing protocols.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/priest-ton-isaac-instructor.jpg",
    initials: "TI",
  },
  {
    name: "Karl M. Augustine",
    title: "Forest Engineer",
    credentials: "Sustainable Land Management",
    bio: "A forest engineer with expertise in sustainable land management. He instructs ethnobotany modules, teaching students to identify and sustainably harvest medicinal plants in their natural Caribbean habitats.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/karl-augustine-instructor.jpg",
    initials: "KA",
  },
  {
    name: "Dr. Bobby Price",
    title: "Doctor of Pharmacy",
    credentials: "Plant-Based Nutritionist (Dr. Holistic)",
    bio: "Known as 'Dr. Holistic,' he is a Doctor of Pharmacy and plant-based nutritionist who bridges the gap between conventional pharmaceutical knowledge and holistic herbal approaches to health and wellness.",
    photoUrl: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/dr-bobby-price-instructor.jpg",
    initials: "BP",
  },
];

function InstructorCard({ instructor }: { instructor: Instructor }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className={`bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-card hover:border-accent/30 hover:-translate-y-1 ${
        instructor.featured ? "md:col-span-2" : ""
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className={`flex ${instructor.featured ? "flex-col md:flex-row" : "flex-col"}`}>
        {/* Photo */}
        <div className={`relative overflow-hidden bg-muted ${
          instructor.featured ? "md:w-1/3 aspect-[4/5] md:aspect-auto" : "aspect-[4/3]"
        }`}>
          {!imgError ? (
            <img
              src={instructor.photoUrl}
              alt={instructor.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-4xl font-serif font-bold text-primary">{instructor.initials}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-5 md:p-6 ${instructor.featured ? "md:flex-1" : ""}`}>
          <h3 className="text-lg font-serif font-bold text-foreground mb-1">
            {instructor.name}
          </h3>
          <p className="text-sm font-semibold text-accent mb-1">{instructor.title}</p>
          <p className="text-xs text-muted-foreground mb-3">{instructor.credentials}</p>

          <p className={`text-sm text-foreground leading-relaxed ${!expanded && !instructor.featured ? "line-clamp-3" : ""}`}>
            {instructor.bio}
          </p>

          {!instructor.featured && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function InstructorGrid() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Learn from World-Class Master Healers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our faculty includes physicians, scientists, engineers, and traditional healers—each 
            bringing decades of real-world expertise to your education.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.name} instructor={instructor} />
          ))}
        </div>
      </div>
    </section>
  );
}
