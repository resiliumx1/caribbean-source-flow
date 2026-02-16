import { Video, FileText, HelpCircle, PenTool } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Lesson {
  title: string;
  type: "recording" | "quiz" | "assignment" | "notes";
}

interface Module {
  title: string;
  lessons: Lesson[];
}

const typeIcons = {
  recording: Video,
  quiz: HelpCircle,
  assignment: PenTool,
  notes: FileText,
};

const typeLabels = {
  recording: "Recording",
  quiz: "Quiz",
  assignment: "Assignment",
  notes: "Notes",
};

const part1Modules: Module[] = [
  {
    title: "Orientation",
    lessons: [
      { title: "Welcome to HSEK", type: "recording" },
      { title: "Course Overview & Expectations", type: "recording" },
      { title: "Learning Platform Guide", type: "notes" },
    ],
  },
  {
    title: "Academic English for the Herbal Physician",
    lessons: [
      { title: "Academic Writing Foundations", type: "recording" },
      { title: "Scientific Terminology", type: "recording" },
      { title: "English Proficiency Assessment", type: "quiz" },
    ],
  },
  {
    title: "Research Skills & Methodology",
    lessons: [
      { title: "Introduction to Research Methods", type: "recording" },
      { title: "Literature Review Techniques", type: "recording" },
      { title: "Research Proposal Assignment", type: "assignment" },
    ],
  },
  {
    title: "History of Herbal Medicine",
    lessons: [
      { title: "Ancient Healing Traditions", type: "recording" },
      { title: "African Diaspora & Caribbean Roots", type: "recording" },
      { title: "Modern Herbal Renaissance", type: "recording" },
      { title: "History Assessment", type: "quiz" },
    ],
  },
  {
    title: "Ethnobotany I & Pharmacognosy",
    lessons: [
      { title: "Introduction to Ethnobotany", type: "recording" },
      { title: "Plant Classification Systems", type: "recording" },
      { title: "Caribbean Medicinal Flora", type: "recording" },
      { title: "Pharmacognosy Fundamentals", type: "recording" },
      { title: "Field Identification Techniques", type: "recording" },
      { title: "Ethnobotany Assessment", type: "quiz" },
    ],
  },
  {
    title: "Philosophy & Principles of Herbal Medicine",
    lessons: [
      { title: "Holistic Healing Philosophy", type: "recording" },
      { title: "Principles of Herbal Practice", type: "recording" },
    ],
  },
  {
    title: "Histology",
    lessons: [
      { title: "Cell & Tissue Biology", type: "recording" },
      { title: "Histology Quiz", type: "quiz" },
    ],
  },
  {
    title: "Human Anatomy",
    lessons: [
      { title: "Structural Anatomy Systems", type: "recording" },
      { title: "Anatomy Assessment", type: "quiz" },
    ],
  },
  {
    title: "Embryology",
    lessons: [
      { title: "Human Development Stages", type: "recording" },
      { title: "Embryological Foundations", type: "recording" },
      { title: "Embryology Quiz", type: "quiz" },
    ],
  },
  {
    title: "Biochemistry & Nutrition",
    lessons: [
      { title: "Biochemical Processes in Healing", type: "recording" },
      { title: "Nutritional Science for Herbalists", type: "recording" },
    ],
  },
  {
    title: "Physiology",
    lessons: [
      { title: "Body Systems & Function", type: "recording" },
      { title: "Physiology Assessment", type: "quiz" },
    ],
  },
  {
    title: "Phytochemistry",
    lessons: [
      { title: "Plant Chemistry & Active Compounds", type: "recording" },
      { title: "Phytochemistry Quiz", type: "quiz" },
    ],
  },
  {
    title: "Pathophysiology",
    lessons: [
      { title: "Disease Mechanisms & Herbal Interventions", type: "recording" },
      { title: "Pathophysiology Quiz", type: "quiz" },
    ],
  },
  {
    title: "Pharmacology",
    lessons: [
      { title: "Drug-Herb Interactions", type: "recording" },
      { title: "Pharmacological Principles", type: "recording" },
    ],
  },
  {
    title: "Astronomy for the Herbal Physician",
    lessons: [
      { title: "Celestial Cycles & Plant Harvesting", type: "recording" },
      { title: "Lunar Phases in Traditional Medicine", type: "recording" },
      { title: "Planetary Influences on Health", type: "recording" },
      { title: "Seasonal Healing Calendars", type: "recording" },
      { title: "Astronomy Assessment", type: "quiz" },
    ],
  },
  {
    title: "Phytotherapy: The Elderly & Children",
    lessons: [
      { title: "Safe Herbal Practice for Vulnerable Groups", type: "recording" },
      { title: "Dosage Adjustments & Considerations", type: "recording" },
    ],
  },
  {
    title: "Toxicity, Contraindications & Safety",
    lessons: [
      { title: "Identifying Toxic Plants", type: "recording" },
      { title: "Safety Protocols in Herbal Practice", type: "recording" },
    ],
  },
  {
    title: "Herbal Actions & Materia Medica",
    lessons: [
      { title: "Classification of Herbal Actions", type: "recording" },
      { title: "Caribbean Materia Medica", type: "recording" },
    ],
  },
  {
    title: "Legal Framework",
    lessons: [
      { title: "Regulatory Environment for Herbal Practice", type: "recording" },
      { title: "Product Registration & Compliance", type: "recording" },
      { title: "Legal Framework Assessment", type: "quiz" },
    ],
  },
  {
    title: "Comprehensive Examination — Part 1",
    lessons: [
      { title: "Written Comprehensive Exam", type: "quiz" },
    ],
  },
];

const part2Modules: Module[] = [
  {
    title: "In-Person Practical Training",
    lessons: [
      { title: "Laboratory Equipment & Techniques", type: "recording" },
      { title: "Patient Examination Methods", type: "recording" },
      { title: "Wild Herb Identification Field Trip", type: "recording" },
      { title: "Herbal Product Formulation Workshop", type: "recording" },
      { title: "Manufacturing & Labelling Practical", type: "recording" },
      { title: "Clinical Case Studies", type: "recording" },
      { title: "Bush Medicine Walk with Priest Kailash", type: "recording" },
    ],
  },
  {
    title: "Research Proposal",
    lessons: [
      { title: "Research Proposal Submission", type: "assignment" },
      { title: "Proposal Defence", type: "assignment" },
    ],
  },
  {
    title: "Comprehensive Examination — Part 2",
    lessons: [
      { title: "Practical Comprehensive Exam", type: "quiz" },
    ],
  },
];

function ModuleList({ modules, label }: { modules: Module[]; label: string }) {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif font-bold text-foreground">{label}</h3>
        <span className="text-sm text-muted-foreground">
          {modules.length} modules · {totalLessons} items
        </span>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {modules.map((module, i) => (
          <AccordionItem
            key={i}
            value={`${label}-${i}`}
            className="bg-card rounded-xl border border-border px-5"
          >
            <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span>{module.title}</span>
                <span className="ml-auto text-xs text-muted-foreground font-normal mr-3">
                  {module.lessons.length} items
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ul className="space-y-2 pl-10">
                {module.lessons.map((lesson, j) => {
                  const TypeIcon = typeIcons[lesson.type];
                  return (
                    <li key={j} className="flex items-center gap-3 text-sm text-foreground/80">
                      <TypeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{lesson.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{typeLabels[lesson.type]}</span>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function CurriculumAccordion() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8">
          Full Curriculum
        </h2>
        <ModuleList modules={part1Modules} label="Part 1 — Online Theory" />
        <ModuleList modules={part2Modules} label="Part 2 — In-Person Practical" />
      </div>
    </section>
  );
}
