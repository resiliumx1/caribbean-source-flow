import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Award, Infinity, BarChart3, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const stats = [
  { icon: BarChart3, label: "Intermediate Level" },
  { icon: Users, label: "14+ Enrolled" },
  { icon: Infinity, label: "Lifetime Access" },
  { icon: Award, label: "Certificate of Completion" },
];

const sidebarFacts = [
  "Live online sessions with recordings",
  "10-day in-person practical in St. Lucia",
  "Accommodation included in Part 2",
  "All course materials provided digitally",
  "Comprehensive final examination",
  "Level 1 Herbal Physician certification",
];

const whatsappNumber = "+17582855195";

export function CourseDetailHero() {
  const whatsappMessage = encodeURIComponent(
    "Hello, I'm interested in enrolling in the Herbal Physician Course Level 1. Could I speak with admissions?"
  );

  return (
    <section className="pt-8 pb-16 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/school">School</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Herbal Physician Course Level 1</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Course image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-video rounded-xl overflow-hidden bg-muted mb-8"
            >
              <img
                src="https://schools.mountkailashslu.com/wp-content/uploads/2024/09/herbal-physician-course-thumbnail.jpg"
                alt="Herbal Physician Course Level 1"
                className="w-full h-full object-cover"
                width={800}
                height={450}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  Level 1 (C5)
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Next Cohort: March 2026
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                Herbal Physician Course
              </h1>
            </motion.div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <stat.icon className="w-4 h-4" />
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About This Course</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Learn how to effectively use laboratory equipment, examine patients, identify herbs 
                in the wild, and formulate herbal products. This comprehensive program covers all 
                aspects of herbal medicine from traditional wisdom to modern scientific practice.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                The Level 1 Herbal Physician Course is a comprehensive program that blends the 
                knowledge of traditional medicine, esoteric herbs, and astrology with modern 
                scientific approaches to health and healing. Delivered in two parts—online theory 
                followed by an immersive in-person practical in Saint Lucia—this program prepares 
                you for a career as a certified herbal physician.
              </p>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-1">Full Program</div>
                  <div className="text-3xl font-bold text-foreground">$8,300.00</div>
                  <div className="text-sm text-muted-foreground">USD</div>
                </div>

                <a
                  href="https://schools.mountkailashslu.com/hsek-application/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-3"
                >
                  <Button variant="hero" size="lg" className="w-full">
                    Enroll Now
                  </Button>
                </a>

                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-6"
                >
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Speak to Admissions
                  </Button>
                </a>

                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">This course includes:</h4>
                  <ul className="space-y-2">
                    {sidebarFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Instructors</h4>
                  <p className="text-sm text-muted-foreground">Priest Kailash Kay Leonce</p>
                  <p className="text-sm text-muted-foreground">Goddess Ronda Itopia Archer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-foreground">$8,300</div>
            <div className="text-xs text-muted-foreground">Full Program</div>
          </div>
          <a
            href="https://schools.mountkailashslu.com/hsek-application/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="hero" size="lg">Enroll Now</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
