import { CourseDetailHero } from "@/components/school/CourseDetailHero";
import { TransformationPromise } from "@/components/school/TransformationPromise";
import { CurriculumAccordion } from "@/components/school/CurriculumAccordion";
import { LeadInstructorFeature } from "@/components/school/LeadInstructorFeature";
import { GraduationSection } from "@/components/school/GraduationSection";
import { EnrollmentCTA } from "@/components/school/EnrollmentCTA";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function HerbalPhysicianCourse() {
  return (
    <main className="pb-20 lg:pb-0">
      <CourseDetailHero />
      <TransformationPromise />
      <CurriculumAccordion />
      <LeadInstructorFeature />
      <GraduationSection />
      <EnrollmentCTA />
      <StoreFooter />
    </main>
  );
}
