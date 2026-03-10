import { SchoolStickyHeader } from "@/components/school/SchoolStickyHeader";
import { CourseDetailHero } from "@/components/school/CourseDetailHero";
import { TransformationPromise } from "@/components/school/TransformationPromise";
import { CurriculumAccordion } from "@/components/school/CurriculumAccordion";
import { StudentWorkSamples } from "@/components/school/StudentWorkSamples";
import { LeadInstructorFeature } from "@/components/school/LeadInstructorFeature";
import { CareerOutcomes } from "@/components/school/CareerOutcomes";
import { PaymentCalculator } from "@/components/school/PaymentCalculator";
import { SchoolVideoGallery } from "@/components/school/SchoolVideoGallery";
import { GraduationSection } from "@/components/school/GraduationSection";
import { SchoolFAQ } from "@/components/school/SchoolFAQ";
import { EnrollmentCTA } from "@/components/school/EnrollmentCTA";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function HerbalPhysicianCourse() {
  return (
    <>
      <SchoolStickyHeader />
      <main className="pb-20 lg:pb-0">
        <CourseDetailHero />
        <TransformationPromise />
        <CurriculumAccordion />
        <StudentWorkSamples />
        <LeadInstructorFeature />
        <CareerOutcomes />
        <PaymentCalculator />
        <SchoolVideoGallery />
        <GraduationSection />
        <SchoolFAQ />
        <EnrollmentCTA />
        <StoreFooter />
      </main>
    </>
  );
}
