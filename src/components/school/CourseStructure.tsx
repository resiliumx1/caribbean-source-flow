import { motion } from "framer-motion";
import { Calendar, Clock, Video, DollarSign, MapPin, Home, Users, Plane } from "lucide-react";

const parts = [
  {
    title: "Part 1: Online Sessions",
    subtitle: "Theory & Foundations",
    startDate: "March 1, 2026",
    price: "$3,900",
    details: [
      { icon: Calendar, label: "Start Date", value: "March 1, 2026" },
      { icon: Clock, label: "Session Length", value: "90 minutes each" },
      { icon: Video, label: "Schedule", value: "Wednesdays + Sunday presentations" },
      { icon: Users, label: "Format", value: "Live online with recordings" },
    ],
    accent: "primary",
  },
  {
    title: "Part 2: In-Person Practical",
    subtitle: "Hands-On Training in Saint Lucia",
    startDate: "October 1, 2026",
    price: "$4,400",
    details: [
      { icon: Calendar, label: "Start Date", value: "October 1, 2026" },
      { icon: MapPin, label: "Location", value: "Mount Kailash, Marc, Castries, St. Lucia" },
      { icon: Plane, label: "Duration", value: "10 days immersive" },
      { icon: Home, label: "Includes", value: "Accommodation on-site" },
    ],
    accent: "accent",
  },
];

export function CourseStructure() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Course Structure
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Two complementary parts—master the theory online, then apply it hands-on at 
            our Saint Lucia campus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10">
          {parts.map((part, i) => (
            <motion.div
              key={part.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-card rounded-xl border border-border p-6 md:p-8 hover:shadow-card transition-shadow duration-300"
            >
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  part.accent === "primary" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-accent/10 text-accent"
                }`}>
                  {part.subtitle}
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                  {part.title}
                </h3>
              </div>

              <ul className="space-y-4 mb-6">
                {part.details.map((detail) => (
                  <li key={detail.label} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      part.accent === "primary" ? "bg-primary/10" : "bg-accent/10"
                    }`}>
                      <detail.icon className={`w-4 h-4 ${
                        part.accent === "primary" ? "text-primary" : "text-accent"
                      }`} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{detail.label}</div>
                      <div className="text-sm font-medium text-foreground">{detail.value}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{part.price}</span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Combined total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-primary/5 rounded-xl border border-primary/20 p-6"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Full Program Investment</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-foreground">
            $8,300 <span className="text-lg font-normal text-muted-foreground">USD</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Part 1 ($3,900) + Part 2 ($4,400)</p>
        </motion.div>
      </div>
    </section>
  );
}
