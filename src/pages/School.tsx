import { SchoolHero } from "@/components/school/SchoolHero";
import { CallingSection } from "@/components/school/CallingSection";
import { CurriculumJourney } from "@/components/school/CurriculumJourney";
import { CourseStructure } from "@/components/school/CourseStructure";
import { InstructorGrid } from "@/components/school/InstructorGrid";
import { AuthorityLogos } from "@/components/school/AuthorityLogos";
import { CareerOutcomes } from "@/components/school/CareerOutcomes";
import { CourseRequirements } from "@/components/school/CourseRequirements";
import { SchoolEnrollCTA } from "@/components/school/SchoolEnrollCTA";
import { SchoolFAQ } from "@/components/school/SchoolFAQ";
import { SchoolVideoGallery } from "@/components/school/SchoolVideoGallery";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function School() {
  return (
    <main>
      <SchoolHero />
      <CallingSection />
      <CurriculumJourney />
      <CourseStructure />
      <InstructorGrid />
      <AuthorityLogos />
      <CareerOutcomes />
      <SchoolVideoGallery />
      <CourseRequirements />
      <SchoolEnrollCTA />
      <SchoolFAQ />
      <StoreFooter />
    </main>
  );
}
