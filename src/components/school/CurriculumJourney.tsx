import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { BookOpen, FlaskConical, Leaf, Stethoscope, GraduationCap, Flower2, Sparkles, ChevronDown } from "lucide-react";

const phases = [
  {
    icon: BookOpen,
    title: "Foundation",
    description: "Build the academic bedrock of a herbal physician.",
    color: "#4A9D6B",
    glowColor: "rgba(74, 157, 107, 0.4)",
    courses: ["History of Herbal Medicine", "Academic English for the Herbal Physician", "Research Skills & Methodology"],
  },
  {
    icon: FlaskConical,
    title: "Science",
    description: "Master the biology and chemistry of the human body.",
    color: "#2E8B57",
    glowColor: "rgba(46, 139, 87, 0.4)",
    courses: ["Human Anatomy", "Embryology", "Histology", "Biochemistry & Nutrition", "Physiology"],
  },
  {
    icon: Leaf,
    title: "Herbal Mastery",
    description: "Deep knowledge of plants, their chemistry, and therapeutic actions.",
    color: "#6B8E23",
    glowColor: "rgba(107, 142, 35, 0.4)",
    courses: ["Phytochemistry", "Pharmacology", "Ethnobotany I & Pharmacognosy", "Herbal Actions & Materia Medica"],
  },
  {
    icon: Stethoscope,
    title: "Clinical Practice",
    description: "Apply your knowledge in real-world assessment and treatment.",
    color: "#8B4A6B",
    glowColor: "rgba(139, 74, 107, 0.4)",
    courses: ["Phytotherapy & Treatment Approaches", "Toxicity, Contraindications & Safety", "Pathophysiology", "Phytotherapy for the Elderly & Children"],
  },
  {
    icon: GraduationCap,
    title: "Professional",
    description: "Manufacturing, law, and the final comprehensive examination.",
    color: "#5D7A4A",
    glowColor: "rgba(93, 122, 74, 0.4)",
    courses: ["Manufacturing & Labelling", "Legal Framework", "Astronomy for the Herbal Physician", "Comprehensive Exam Part 1 & 2"],
  },
];

export function CurriculumJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 60%"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="py-20 md:py-28 bg-muted/30 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Your Learning Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Five phases that transform you from student to certified herbal physician—each building on the last.
          </p>
        </div>

        <div className="relative">
          {/* Desktop vine */}
          <svg
            className="hidden md:block absolute top-[60px] left-0 w-full h-32 z-0"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <motion.path
              d="M0,60 C100,30 150,90 240,60 C330,30 380,90 480,60 C570,30 620,90 720,60 C810,30 860,90 960,60 C1050,30 1100,90 1200,60"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.6}
            />
            <motion.path
              d="M0,60 C80,45 170,75 240,60 C310,45 400,75 480,60 C550,45 640,75 720,60 C790,45 880,75 960,60 C1030,45 1120,75 1200,60"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.3}
            />
            {[120, 360, 600, 840, 1080].map((x, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
              >
                <path
                  d={`M${x},55 Q${x + 8},45 ${x + 4},38 Q${x - 4},42 ${x},55`}
                  fill="hsl(var(--primary))"
                  opacity={0.4}
                />
              </motion.g>
            ))}
          </svg>

          {/* Mobile vine */}
          <svg
            className="md:hidden absolute left-8 top-0 w-8 h-full z-0"
            viewBox="0 0 32 800"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <motion.path
              d="M16,0 C8,50 24,100 16,150 C8,200 24,250 16,300 C8,350 24,400 16,450 C8,500 24,550 16,600 C8,650 24,700 16,750 C8,800 24,850 16,900"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.5}
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-4 relative z-10 pt-8">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = activeStep === index;
              const isExpanded = expandedStep === index;
              return (
                <motion.div
                  key={phase.title}
                  className="relative flex flex-col items-center md:items-center text-center group pl-16 md:pl-0 cursor-pointer"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                >
                  <motion.div
                    className="absolute -top-6 md:-top-8 left-4 md:left-1/2 md:-translate-x-1/2"
                    initial={{ opacity: 0, scale: 0, rotate: -45 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.5, type: "spring" }}
                  >
                    <motion.div
                      animate={isActive ? { scale: 1.3, rotate: 15 } : { scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Flower2 className="w-6 h-6 drop-shadow-lg" style={{ color: phase.color }} />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 relative shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? phase.color : 'hsl(var(--background))',
                      border: `3px solid ${phase.color}`,
                      boxShadow: isActive ? `0 0 30px ${phase.glowColor}, 0 0 60px ${phase.glowColor}` : `0 4px 20px rgba(0,0,0,0.1)`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    )}
                    <Icon
                      className="w-9 h-9 md:w-11 md:h-11 relative z-10 transition-colors duration-300"
                      style={{ color: isActive ? 'white' : phase.color }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${phase.color}` }}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={isActive ? { scale: 1.4, opacity: [0, 0.6, 0] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="mt-4">
                    <h3
                      className="text-xl md:text-2xl font-bold mb-2 transition-colors duration-300"
                      style={{ color: phase.color }}
                    >
                      {phase.title}
                    </h3>
                    <p className="text-[15px] text-foreground font-medium leading-relaxed max-w-[220px] mb-2">
                      {phase.description}
                    </p>
                    <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <span>{isExpanded ? "Hide courses" : "View courses"}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Expandable courses */}
                  {isExpanded && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 space-y-1.5 text-left w-full max-w-[220px]"
                    >
                      {phase.courses.map((course, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: phase.color }} />
                          {course}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
