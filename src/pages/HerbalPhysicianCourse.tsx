import { SEOHead } from "@/components/SEOHead";
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
    name: "Clinical Herbal Physician Certification",
    description:
      "A cohort-based certification program training students as clinical herbal physicians in Caribbean bush medicine, led by Rt. Hon. Priest Kailash K. Leonce. Over 500 herbal physicians trained.",
    url: "https://mountkailashslu.com/school/herbal-physician",
    provider: {
      "@type": "Organization",
      name: "Mount Kailash School of Bush Medicine",
      sameAs: "https://mountkailashslu.com/school/herbal-physician",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "{{online | onsite | blended}}",
      courseWorkload: "{{e.g. PT12W for a 12-week part-time course}}",
      location: {
        "@type": "Place",
        name: "Mount Kailash Rejuvenation Centre",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Soufrière",
          addressRegion: "Saint Lucia",
          addressCountry: "LC",
        },
      },
    },
    offers: {
      "@type": "Offer",
      price: "{{TUITION_PRICE}}",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://mountkailashslu.com/school/herbal-physician",
    },
  };
  return (
    <>
      <SEOHead
        title="Clinical Herbal Physician Certification | Mount Kailash School of Bush Medicine"
        description="Train as a clinical herbal physician with Priest Kailash. 500+ graduates. Cohort-based certification in Caribbean clinical bush medicine."
        path="/school/herbal-physician"
        breadcrumbs={getBreadcrumbs("school")}
        schema={courseSchema}
      />
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
        <RelatedLinks nodeId="school" />
        <StoreFooter />
      </main>
    </>
  );
}
