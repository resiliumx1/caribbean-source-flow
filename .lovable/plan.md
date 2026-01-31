
# Mount Kailash: Trinity Homepage, Retreats Hub & AI Concierge

## Overview

This plan implements a comprehensive site architecture overhaul with three integrated systems:
1. **Trinity Homepage** - Immediate above-fold audience segmentation (B2B, B2C, Retreats)
2. **Retreats Page** - Full booking hub with calendar, pricing, and consultation flows
3. **AI Concierge** - Knowledge-based assistant with WhatsApp escalation

The current site has a B2B wholesale landing page (`/`) and a B2C shop (`/shop`). This plan transforms the homepage into a gateway serving all three audiences while preserving and enhancing existing functionality.

---

## Phase 1: Database Schema for Retreats

### New Tables Required

**`retreat_types`** - Group vs Solo retreat configurations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text | URL slug (group-immersion, solo-detox) |
| name | text | Display name |
| type | text | 'group' or 'solo' |
| min_nights | int | Minimum stay (7 for group, 3 for solo) |
| max_nights | int | Maximum stay |
| base_price_usd | numeric | Starting price |
| price_type | text | 'per_person' or 'per_night' |
| max_capacity | int | 10 for group, 3 for solo |
| description | text | Marketing copy |
| includes | jsonb | Array of inclusions |
| is_active | boolean | Availability flag |

**`retreat_dates`** - Available retreat periods
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| retreat_type_id | uuid | FK to retreat_types |
| start_date | date | Check-in date |
| end_date | date | Check-out date |
| spots_total | int | Total capacity |
| spots_booked | int | Current bookings |
| price_override_usd | numeric | Optional price override |
| is_published | boolean | Visibility flag |

**`retreat_bookings`** - Customer reservations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| retreat_type_id | uuid | FK to retreat_types |
| retreat_date_id | uuid | FK to retreat_dates (nullable for solo) |
| user_id | uuid | FK to profiles (nullable for guest) |
| guest_count | int | Number of guests |
| start_date | date | Actual start (for solo flex dates) |
| end_date | date | Actual end |
| total_usd | numeric | Calculated total |
| deposit_usd | numeric | 50% deposit amount |
| status | text | pending, confirmed, cancelled |
| payment_status | text | pending, deposit_paid, full_paid |
| contact_name | text | Guest name |
| contact_email | text | Guest email |
| contact_phone | text | Guest phone |
| special_requests | text | Notes |
| created_at | timestamp | Booking timestamp |

**`solo_pricing_tiers`** - Tiered pricing for solo retreats
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| min_nights | int | Tier minimum (3, 7, 10) |
| max_nights | int | Tier maximum (6, 9, 14) |
| nightly_rate_usd | numeric | Per-night price |
| discount_percent | int | Display discount |

**`testimonials`** - Multi-audience social proof
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| audience | text | 'b2b', 'b2c', 'retreat' |
| quote | text | Testimonial text |
| author_name | text | Customer name |
| author_title | text | Role/location |
| condition_addressed | text | For retreats |
| results | text | Measurable outcome |
| is_featured | boolean | Homepage display |
| display_order | int | Sort order |

**`concierge_conversations`** - AI chat history
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| session_id | text | Browser session ID |
| user_id | uuid | FK to profiles (if logged in) |
| messages | jsonb | Conversation array |
| escalated | boolean | Sent to WhatsApp |
| escalation_reason | text | Trigger keyword |
| created_at | timestamp | Start time |
| updated_at | timestamp | Last activity |

---

## Phase 2: Trinity Homepage Architecture

### Component Structure

```text
src/pages/Index.tsx (NEW - replaces wholesale landing)
+-- TrinityHero.tsx (100vh gateway)
    +-- Three "door" cards with routing
    +-- Background: hero-farm.jpg with overlay
    +-- Trust bar fixed below
+-- OriginStory.tsx (asymmetric documentary section)
+-- SocialProofMatrix.tsx (3-column audience-specific)
+-- ByTheNumbers.tsx (animated counters)
+-- ReSegmentation.tsx (3 cards reinforcing paths)
+-- UnifiedFooter.tsx (audience-organized links)
```

### TrinityHero Component Specification

**Layout**: Full viewport (100vh), flexbox centered content

**Background**: Cinematic hero image with gradient overlay ensuring text contrast

**Content Hierarchy**:
1. **Headline**: "Medicine from the Volcanic Soil of St. Lucia"
2. **Subhead**: "Hand-harvested by bush medicine practitioners, naturally fermented for cellular bioavailability"
3. **Three Door Cards** (equal width, distinct visual treatment):

| Door | Icon | Title | Subtext | CTA | Route |
|------|------|-------|---------|-----|-------|
| 1 | Building2 | Supply Your Dispensary | Wildcrafted bulk herbs, graduate pricing, COA documentation | Access Wholesale | /wholesale |
| 2 | ShoppingBag | Shop The Formulations | Immune tonics, detox blends, vitality elixirs. Ships in 3 days | Browse Remedies | /shop |
| 3 | Mountain | Begin Your Transformation | 7-day cellular detox immersions. Limited availability | Check Availability | /retreats |

Door 3 includes dynamic urgency: "Next Group: [Date] - [X] Spots Left" (fetched from `retreat_dates`)

**Trust Bar** (fixed below cards):
"21+ Years Clinical Practice | FDA-Registered Facility | Featured by St. Lucia Tourism Authority | Miami Warehouse (3-Day US)"

### Subsequent Sections

**OriginStory**: Asymmetric layout with documentary images, video lightbox trigger, Priest Kailash quote

**SocialProofMatrix**: 3 columns serving each audience with testimonials from `testimonials` table

**ByTheNumbers**: Animated counters (43,000+ bottles, 21 years, 500+ herbalists trained, 3 days to US, 7 days average retreat)

**ReSegmentation**: Three cards with deeper context reinforcing the three paths

---

## Phase 3: Retreats Page (`/retreats`)

### Page Structure

```text
src/pages/Retreats.tsx
+-- RetreatsHero.tsx
    +-- Headline: "Detox at the Cellular Level..."
    +-- Dual CTAs: Check Availability / Inquire Solo
+-- RetreatPathSplit.tsx
    +-- Left: Group Bush Medicine Immersion card
    +-- Right: Solo Deep Detox card
+-- ProtocolTimeline.tsx
    +-- Horizontal 5-step: Assess, Cleanse, Nourish, Integrate, Sustain
+-- TransformationStories.tsx
    +-- Before/after with conditions and measurable results
+-- PriestKailashBio.tsx
    +-- Full bio, credentials, quote, Calendly CTA
+-- RetreatCalendar.tsx
    +-- Visual month view with availability
    +-- Date range selection
    +-- Real-time pricing calculator
+-- RetreatFAQ.tsx
    +-- Accordion with practical matters
+-- RetreatsFooter.tsx
```

### RetreatCalendar Component (Critical)

**Features**:
- Month view navigation with color-coded blocks
- Group retreats: Solid date blocks (Sat-Sat fixed)
- Solo availability: Dot indicators (green/yellow/red)
- Click-to-select date range with visual feedback
- Real-time pricing calculation using `solo_pricing_tiers`
- Dual currency display (USD/XCD)

**Booking Flow**:
1. Select retreat type (Group or Solo)
2. Choose dates (Group: select specific retreat / Solo: pick range)
3. Enter guest count
4. View calculated pricing with deposit amount
5. CTAs: "Secure with 50% Deposit" (Stripe) or "Coordinate via WhatsApp"

**Trust Elements**:
- "30-day pre-arrival protocol included"
- "Payment plans available"
- "100% refundable to 30 days (Group) / 14 days (Solo)"

---

## Phase 4: AI Concierge System

### Architecture

```text
src/components/concierge/
+-- ConciergeProvider.tsx (context for state management)
+-- ConciergeButton.tsx (floating trigger - distinct from WhatsApp)
+-- ConciergePanel.tsx (chat interface)
+-- ConciergeMessage.tsx (message bubbles with markdown)

supabase/functions/
+-- concierge-chat/ (edge function for AI processing)
```

### Edge Function: `concierge-chat`

**Responsibilities**:
1. Receive user message and conversation history
2. Query product knowledge base (from `products` table)
3. Check retreat availability (from `retreat_dates`)
4. Process through Lovable AI (google/gemini-2.5-flash)
5. Detect escalation keywords and trigger handoff
6. Return structured response

**System Prompt** (abbreviated):
```
You are the Dispensary Guide for Mount Kailash Rejuvenation Centre. 
You provide information about traditional St. Lucian bush medicine.

CRITICAL RULES:
- Never diagnose or prescribe
- Never guarantee cures
- Add disclaimer when health questions arise
- Escalate immediately on: refund, complaint, severe, chronic medication, pregnant, lawsuit

KNOWLEDGE BASE:
- Products: [injected from database]
- Retreats: Group (7-day, $2,400+) and Solo (3-14 days, $350/night)
- Wholesale: 10% off 10-24 units, scaling to 25% at 100+

When escalating, format: [AI Handoff] Customer: [Name], Interested in: [Topic], Mentioned: [Details]
```

### Trigger Logic

| Page | Trigger | Timing |
|------|---------|--------|
| Homepage | None | Blocks Trinity Gateway |
| /shop | None (WhatsApp float suffices) | - |
| /shop/:slug | Product hesitation | After 30s on page |
| /retreats | Pricing section | After 30s OR scroll to calendar |

### Interface Design

**Button**: Bottom-right, offset from WhatsApp button (left by 80px)
- Label: "Ask" with MessageSquare icon
- Distinct color (not green - use accent/gold)

**Panel**: 
- Desktop: 400px sidebar, slides from right
- Mobile: Full-screen overlay
- Persistent header with "Dispensary Guide" title
- Quick-action chips: "Find a formulation", "Retreat availability", "Wholesale inquiry"

**First Message**:
```
Welcome to Mount Kailash. I'm your Dispensary Guide.

I can help you:
- Find the right formulation for your wellness goals
- Explain our bush medicine traditions
- Check retreat availability
- Connect you with our wholesale team

Note: I provide information about traditional St. Lucian bush medicine. 
This is not medical advice. Always consult your physician.

How may I assist you?
```

---

## Phase 5: Routing & Navigation Updates

### Updated Route Structure

```text
/ → TrinityHomepage (new)
/wholesale → Current Index.tsx (moved, wholesale lead gen)
/shop → Shop.tsx (existing)
/shop/:slug → ProductDetail.tsx (existing)
/shop/category/:slug → Shop.tsx (existing)
/cart → Cart.tsx (existing)
/retreats → Retreats.tsx (new)
/account → Account.tsx (future)
```

### Navigation Patterns

**Header Updates** (StoreHeader.tsx):
- Add "Retreats" link
- Update logo to link to `/` (Trinity) not `/shop`

**Unified Footer** (UnifiedFooter.tsx):
- Three columns: Shop | Practitioners | Visit
- WhatsApp hotline prominent
- FDA disclaimer

---

## Phase 6: Styling & Performance

### New CSS Classes

```css
/* Trinity door cards */
.trinity-door {
  @apply relative overflow-hidden rounded-2xl border-2 transition-all duration-300;
  @apply hover:border-accent hover:-translate-y-1;
  box-shadow: var(--shadow-card);
}

.trinity-door:hover {
  box-shadow: var(--shadow-elevated);
}

/* Calendar availability indicators */
.calendar-available { @apply bg-success/20 text-success; }
.calendar-limited { @apply bg-warning/20 text-warning; }
.calendar-booked { @apply bg-destructive/20 text-destructive; }

/* Concierge panel */
.concierge-panel {
  @apply fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background z-50;
  box-shadow: -4px 0 24px rgba(0,0,0,0.15);
}
```

### Performance Considerations

- Lazy load RetreatCalendar component
- Prefetch retreat data on /retreats hover
- Concierge panel mounts only when triggered
- Image optimization: WebP format, lazy loading
- LCP target: Trinity doors visible within 2.5s

---

## File Creation Summary

### New Files

| Path | Purpose |
|------|---------|
| `src/pages/TrinityHomepage.tsx` | New homepage with segmentation |
| `src/pages/Retreats.tsx` | Full retreats booking hub |
| `src/pages/Wholesale.tsx` | Moved from current Index.tsx |
| `src/components/trinity/TrinityHero.tsx` | Gateway hero section |
| `src/components/trinity/OriginStory.tsx` | Documentary section |
| `src/components/trinity/SocialProofMatrix.tsx` | 3-audience testimonials |
| `src/components/trinity/ByTheNumbers.tsx` | Animated stats |
| `src/components/trinity/ReSegmentation.tsx` | Reinforcing cards |
| `src/components/trinity/UnifiedFooter.tsx` | Multi-audience footer |
| `src/components/retreats/RetreatsHero.tsx` | Retreats hero |
| `src/components/retreats/RetreatPathSplit.tsx` | Group vs Solo |
| `src/components/retreats/ProtocolTimeline.tsx` | 5-step visual |
| `src/components/retreats/TransformationStories.tsx` | Testimonials |
| `src/components/retreats/PriestKailashBio.tsx` | Bio section |
| `src/components/retreats/RetreatCalendar.tsx` | Booking calendar |
| `src/components/retreats/RetreatFAQ.tsx` | Accordion FAQ |
| `src/components/concierge/ConciergeProvider.tsx` | State context |
| `src/components/concierge/ConciergeButton.tsx` | Float trigger |
| `src/components/concierge/ConciergePanel.tsx` | Chat interface |
| `src/hooks/use-retreats.ts` | Retreat data hooks |
| `src/hooks/use-concierge.ts` | AI chat hooks |
| `supabase/functions/concierge-chat/index.ts` | AI edge function |

### Modified Files

| Path | Changes |
|------|---------|
| `src/App.tsx` | Add /retreats, /wholesale routes |
| `src/components/store/StoreHeader.tsx` | Add Retreats nav link |
| `src/index.css` | Trinity and calendar styles |

### Database Migrations

6 new tables with appropriate RLS policies:
- retreat_types (public read)
- retreat_dates (public read, admin write)
- retreat_bookings (user own data, admin all)
- solo_pricing_tiers (public read)
- testimonials (public read)
- concierge_conversations (user own data)

---

## Implementation Order

1. **Database migrations** - Create retreat and concierge tables
2. **Seed data** - Populate retreat types, pricing tiers, sample testimonials
3. **Trinity Homepage** - Build segmentation gateway
4. **Move Wholesale** - Relocate current Index.tsx to /wholesale
5. **Retreats Page** - Build full booking hub
6. **Retreat Calendar** - Interactive date selection with pricing
7. **AI Concierge** - Edge function and chat interface
8. **Route updates** - Wire new navigation
9. **Testing** - End-to-end flow verification

---

## Technical Notes

### AI Model Selection
Using `google/gemini-2.5-flash` for concierge (fast, cost-effective, good reasoning) via Lovable AI - no external API key required.

### WhatsApp Integration
All escalations route to +1(758)285-5195 with pre-filled context messages using `wa.me` deep links.

### Currency Handling
Existing dual-currency system (XCD/USD via StoreProvider) extends to retreat pricing with automatic geo-detection.

### Mobile Optimization
- Trinity doors stack vertically on mobile (3 rows)
- Calendar shows week view on small screens
- Concierge panel goes full-screen on mobile
- All touch targets minimum 44px
