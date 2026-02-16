

# Mount Kailash School Pages -- Complete Overhaul

Two handcrafted, high-authority pages that feel like they were designed by a premium education brand, not generated. Every section uses real content pulled directly from the existing school sites, real instructor photos, and the brand's own voice.

---

## Page 1: School Landing Page (`/school`)

The institutional front door. Positions HSEK as a serious, credible school -- not a template.

### Sections (top to bottom)

**1. Hero -- Full-viewport, cinematic**
- Background: the existing herb-processing or hero-farm image with the deep forest green gradient overlay (same pattern as `TrinityHero` and `RetreatsHero`)
- Small badge: "Herbal School of Esoteric Knowledge -- Est. 1977"
- Headline (Playfair Display): "Train to Become a Certified Herbal Physician"
- Body (Inter): The real intro paragraph -- "The Level 1 Herbal Physician Course is a comprehensive program that blends the knowledge of traditional medicine, esoteric herbs, and astrology..."
- Two CTAs: "Apply Now -- Next Cohort March 1, 2026" (gold button) + "Download Brochure" (outline button linking to the real PDF)
- Trust strip beneath: "14 Students Enrolled | Certificate of Completion | Lifetime Access | In-Person Practical in Saint Lucia"

**2. "The Calling" -- Emotional anchor**
- Full-width dark section with a gold left-border blockquote
- The powerful quote directly from the site: "There is a calling for healers, the human being is suffering more than ever before with a diversity of Dis-Eases from all the cancers, diabetes, infertility, obesity and even the flu. The door is open, for the lack of knowledge the people shall suffer and perish, come learn to heal yourself that you can heal others."
- Subtle fade-in animation on scroll (Framer Motion, same pattern used elsewhere)

**3. Your Learning Journey -- 5-Phase Visual Timeline**
- Adapts the existing `ProtocolTimeline` component pattern (scroll-driven vine connector, animated icon nodes, hover glow)
- 5 phases mapping the real curriculum:
  - Phase 1 "Foundation": History, English, Research Skills
  - Phase 2 "Science": Anatomy, Embryology, Biochemistry, Nutrition
  - Phase 3 "Herbal Mastery": Phytochemistry, Pharmacology, Ethnobotany, Pharmacognosy
  - Phase 4 "Clinical Practice": Treatment Approaches, Toxicity & Safety, Phytotherapy, Pathology
  - Phase 5 "Professional": Manufacturing & Labelling, Legal Framework, Comprehensive Exam
- Each phase node expandable on click to show the individual courses within it

**4. Course Structure -- Two-Part Split**
- Two side-by-side cards (stack on mobile):
  - **Part 1: Online Sessions** -- March 1, 2026 | 90 min/session | Wednesdays + Sunday presentations | $3,900 USD
  - **Part 2: In-Person Practical** -- October 1, 2026 | Mount Kailash, Saint Lucia | 10 days | Accommodation included | $4,400 USD
- Combined total displayed prominently: **$8,300 -- Full Program**
- Each card uses Lucide icons (Calendar, Clock, MapPin, DollarSign, Video, Home) for the detail rows
- Clean card design using existing `bg-card`, `border-border`, `shadow-soft` tokens

**5. Faculty -- Instructor Grid**
- Section header: "Learn from World-Class Master Healers"
- 2-column grid on desktop, single column on mobile
- Each instructor card: real photo (loaded from their WordPress URLs), name, title, 2-3 line bio preview, "Read More" expand to show full bio
- All 10 instructors with their real data:
  1. Rt. Honourable Priest Kailash Kay Leonce -- Grand Master Herbal Physician (lead instructor, larger featured card)
  2. Goddess Ronda Itopia Archer -- Co-founder, Academic Coordinator
  3. Ing. Verne Edward Emmanuel -- Chemical Engineer, Director of St. Lucia Bureau of Standards
  4. Dylan Norbert-Inglis -- Attorney-at-Law
  5. Dr. Stephen King -- Pathologist, OBE, Fellow RCPC
  6. Ras Dr. Wayne A. Rose -- Ph.D., Johns Hopkins Fellow
  7. Dr. Marcel Archer-Thomas -- Ed.D., UWI Lecturer
  8. Honourable Priest T.O.N. Isaac -- Archaeoastronomer
  9. Karl M. Augustine -- Forest Engineer
  10. Dr. Bobby Price (Dr. Holistic) -- Doctor of Pharmacy
- Hover effect: card lifts slightly, subtle border glow with the gold accent

**6. "Our Faculty Has Been Featured At" -- Authority Logos**
- Dark background section
- Horizontally scrolling logo strip (using existing Embla Carousel)
- Logos (loaded from WordPress URLs): Seal of the Prime Minister of Saint Lucia, Johns Hopkins University, University of the West Indies, Hackney Community College, and the unnamed institutional logo
- Grayscale by default, subtle opacity increase on hover
- No flashy animations -- just quiet institutional credibility

**7. Career Outcomes**
- 3x2 grid of cards, each with a Lucide icon + short description
- Real outcomes from the site:
  - Elite partnership with Mount Kailash
  - Start your own herbal product line
  - Wellness center consultant/practitioner
  - Teach herbal medicine courses
  - Collaborate in integrative medicine
  - Research and academic publications

**8. What You Will Need**
- Single card with a checklist
- Real requirements:
  - The New Herbal Manual (Rt. Hon. Priest Kailash Kay Leonce)
  - Medical Herbalism (David Hoffmann, FNIMH, AHG)
  - Lab Coat, Scrubs, PPE
  - "A willing heart" and "Love for Self, Creator and Creation" -- styled in italic with gold accent to honor the spiritual element

**9. Enrollment + Pricing CTA**
- Full-width section with forest-green background
- Price breakdown: Part 1 ($3,900) + Part 2 ($4,400) = $8,300
- Real payment options image from the site
- Two CTAs: "Register Now" and "Download Brochure"
- Urgency line: "Next Cohort: Part 1 begins March 1, 2026 -- Part 2 begins October 1, 2026"
- Fine print: Age 18+ requirement, no-refund policy (real text from the site)

**10. FAQ Accordion**
- Uses existing Radix Accordion pattern (same as `RetreatFAQ`)
- Questions: Who is this for? | What is the schedule? | Do I need prior experience? | Is accommodation included? | What certification do I receive? | What are the payment options?

---

## Page 2: Course Detail / Enrollment Page (`/school/herbal-physician-course`)

The deep-dive sales page. This is where someone who clicked "Learn More" goes to make a decision.

### Sections

**1. Course Header**
- Breadcrumb: School > Herbal Physician Course Level 1
- Course thumbnail image (real image from WordPress)
- Title: "Herbal Physician Course -- Level 1 (C5)"
- Stats row with icons: Intermediate | 14 Enrolled | Lifetime Access | Certificate of Completion
- Sticky sidebar on desktop (scrolls with page) containing:
  - Price: $8,300.00
  - "Enroll Now" button (gold)
  - "Speak to Admissions" (WhatsApp link)
  - Key facts list
  - Instructors: Priest Kailash + Anu Leonce
- On mobile: fixed bottom bar with price + "Enroll Now" button

**2. About This Course**
- The real description: "Learn how to effectively use laboratory equipment, examine patients, identify herbs in the wild, and formulate herbal products."
- Followed by the full intro paragraph

**3. What You Will Be Able to Do**
- Visual grid of 6 outcomes with animated check icons:
  - Use laboratory equipment effectively
  - Examine patients professionally
  - Identify herbs in the wild
  - Formulate herbal products
  - Diagnose using anatomical systems
  - Start your own herbal practice

**4. Full Curriculum Accordion**
- Every single module from the real course, organized into expandable sections:
  - Orientation (3 items)
  - Academic English for the Herbal Physician (3 items)
  - Research Skills (3 items)
  - History of Herbal Medicine (4 items)
  - Ethnobotany I & Pharmacognosy (6 items)
  - Philosophy & Principles (2 items)
  - Histology (2 items)
  - Human Anatomy (2 items)
  - Embryology (3 items)
  - Biochemistry/Nutrition
  - Physiology
  - Phytochemistry (1 quiz)
  - Pathophysiology (1 quiz)
  - Pharmacology (2 items)
  - Astronomy for the Herbal Physician (5 items)
  - Phytotherapy and the Elderly & Children
  - Toxicity, Contraindications and Safety
  - Herbal Actions & Materia Medica
  - Legal Framework (3 items)
  - Comprehensive Exam Part 1
  - Part 2 practical modules (7 items)
  - Research Proposal (2 items)
  - Comprehensive Exam Part 2
- Each shows lesson type icons (video recording, quiz, assignment, notes)
- Module count and estimated hours where available

**5. Meet Your Lead Instructor**
- Featured card for Priest Kailash (reuses the credential-card pattern from `PriestKailashBio`)
- Real photo, full bio, credentials grid (25+ years, author, founder)
- Secondary card for Goddess Ronda Itopia Archer with her full bio

**6. Graduation & Certification**
- Requirements for graduation (real text from the site)
- Certificate name: "Level 1 Herbal Physician Certification"
- Credit requirements clearly listed

**7. Final Enrollment CTA**
- Dark section
- Headline: "Begin Your Journey as a Herbal Physician"
- Price + dates + two CTAs
- The calling quote repeated as emotional closer

---

## Technical Details

### New Files
```text
src/pages/School.tsx
src/pages/HerbalPhysicianCourse.tsx
src/components/school/SchoolHero.tsx
src/components/school/CallingSection.tsx
src/components/school/CurriculumJourney.tsx
src/components/school/CourseStructure.tsx
src/components/school/InstructorGrid.tsx
src/components/school/AuthorityLogos.tsx
src/components/school/CareerOutcomes.tsx
src/components/school/CourseRequirements.tsx
src/components/school/SchoolEnrollCTA.tsx
src/components/school/SchoolFAQ.tsx
src/components/school/CourseDetailHero.tsx
src/components/school/TransformationPromise.tsx
src/components/school/CurriculumAccordion.tsx
src/components/school/LeadInstructorFeature.tsx
src/components/school/EnrollmentCTA.tsx
src/components/school/GraduationSection.tsx
```

### Modifications to Existing Files
- **`src/App.tsx`**: Add two routes -- `/school` and `/school/herbal-physician-course`
- **`src/components/store/StoreHeader.tsx`**: Add "School" nav link between Retreats and Wholesale (both desktop and mobile menus)

### Design Approach -- Why It Will Not Look AI-Generated
- Every piece of text comes verbatim from the real school pages -- no invented copy
- All instructor photos are the real ones from the WordPress site
- The layout patterns are borrowed from the existing codebase (`ProtocolTimeline`, `PriestKailashBio`, `RetreatsHero`, `RetreatFAQ`) so the school pages feel native to the site
- Animations are the same subtle Framer Motion fade-ins and scroll-driven effects already used, not over-the-top
- The color palette stays within the existing brand tokens (Deep Green, Gold, Cream, card/background tokens)
- Typography uses the already-loaded Playfair Display for headings and Inter for body
- No placeholder content, no "Lorem ipsum", no stock descriptions

### Responsive Strategy
- Mobile-first layouts throughout
- Sticky sidebar becomes a fixed bottom enrollment bar on mobile
- Instructor grid collapses from 2 columns to 1
- Timeline switches from horizontal to vertical (existing pattern)
- Font sizes scale down gracefully using existing `text-4xl md:text-5xl lg:text-6xl` patterns

