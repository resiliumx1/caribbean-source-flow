import { ArrowRight } from "lucide-react";
import schoolFaculty from "@/assets/school-faculty-ceremony.webp";

const courses = [
  {
    title: "Foundations",
    mode: "Online",
    duration: "6 weeks",
    price: "$450",
    description: "History, identification, and basic formulation",
    cta: "View Curriculum",
    image: schoolFaculty,
  },
  {
    title: "Advanced Formulation",
    mode: "Hybrid",
    duration: "2 weeks in St. Lucia",
    price: "$2,200",
    description: "Clinical applications and patient management",
    cta: "View Syllabus",
    image: schoolFaculty,
  },
  {
    title: "Practitioner Certification",
    mode: "Intensive",
    duration: "6 months",
    price: "$4,500",
    description: "Full clinical training with case study requirements",
    cta: "Apply Now",
    image: schoolFaculty,
  },
];

export function SchoolSection() {
  return (
    <section style={{ background: "var(--site-bg-secondary)" }} className="py-24 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <span
            className="inline-block mb-3"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 500,
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--site-gold)",
            }}
          >
            EDUCATION
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 44px)",
              color: "var(--site-text-primary)",
              marginBottom: "16px",
            }}
          >
            School of Bush Medicine
          </h2>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "16px",
              color: "var(--site-text-secondary)",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            Clinical herbal training from foundational to practitioner certification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.title}
              className="group rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--site-bg-card)",
                border: "1px solid var(--site-border)",
                boxShadow: "var(--site-shadow-card)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderTopColor = "var(--site-gold)";
                (e.currentTarget as HTMLElement).style.borderTopWidth = "4px";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderTopColor = "var(--site-border)";
                (e.currentTarget as HTMLElement).style.borderTopWidth = "1px";
              }}
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={400}
                  height={225}
                />
              </div>
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: "rgba(188,138,95,0.1)",
                      color: "var(--site-gold)",
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    {course.mode}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: "22px",
                    color: "var(--site-text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  {course.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--site-text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {course.duration} · {course.price}
                </p>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "var(--site-text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: "16px",
                  }}
                >
                  {course.description}
                </p>
                <a
                  href="https://mount-kailash-school-temp.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: "var(--site-gold)", fontFamily: "'Jost', sans-serif" }}
                >
                  {course.cta} <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
