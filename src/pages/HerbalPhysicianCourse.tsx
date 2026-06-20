import { SEOHead } from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import { RelatedLinks } from "@/components/RelatedLinks";
import { getBreadcrumbs } from "@/lib/internal-links";
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
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Herbal Physician Training",
    description:
      "Clinical bush medicine training program — become a certified herbal physician under Rt Hon Priest Kailash K Leonce in Saint Lucia.",
    provider: {
      "@type": "Organization",
      name: "Mount Kailash Rejuvenation Centre — School of Bush Medicine",
      sameAs: "https://mountkailashslu.com/",
    },
  };
  return (
    <>
      <SEOHead
        title="Herbal Physician Training | Mount Kailash"
        description="Become a certified herbal physician. Clinical bush medicine training from Saint Lucia. 500+ graduates worldwide. Led by Rt Hon Priest Kailash K Leonce."
        path="/school/herbal-physician"
        breadcrumbs={getBreadcrumbs("school")}
        schema={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Herbal Physician Certification Course",
          description:
            "Clinical bush medicine certification program training the next generation of herbal physicians.",
          url: "https://mountkailashslu.com/school/herbal-physician",
          provider: {
            "@type": "Organization",
            name: "Mount Kailash School of Bush Medicine",
            sameAs: "https://mountkailashslu.com",
          },
          educationalCredentialAwarded: "Certified Herbal Physician",
        }}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(courseSchema)}</script>
      </Helmet>
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
