# Tech Ambiance - Architectural Decisions

This document captures the core philosophical and engineering decisions made during the v5.0 architecture freeze. As the project scales and new developers join, refer to these principles.

## 1. The Ivory Canvas Over Dark Mode
- **Decision:** We use an ivory/off-white background instead of a pure dark mode for the primary canvas.
- **Reason:** It provides a warm, organic, premium printed-magazine feel. It sets Tech Ambiance apart from generic tech-heavy SaaS websites that default to dark themes.

## 2. Case Studies Before Services
- **Decision:** The homepage prioritizes storytelling and business outcomes (Featured Case Study, Results) before listing services.
- **Reason:** Clients buy results, not lists of technologies. Trust is established by proving what we have done before pitching what we can do.

## 3. No Public Pricing
- **Decision:** Services do not list "Starting at X" prices.
- **Reason:** Public pricing commoditizes the agency. It encourages price-shopping and sets incorrect expectations. We rely on "Custom proposals based on business goals" to attract high-ticket clients.

## 4. CMS Abstraction Layer
- **Decision:** UI components never directly import from `src/content/*.ts`. They consume data through `src/services/content.service.ts` and React hooks.
- **Reason:** This guarantees that swapping to Sanity, Contentful, or a custom Supabase CMS backend is a frictionless, one-day job.

## 5. Animation Philosophy (Motion Provider)
- **Decision:** All animations are routed through a global `<MotionProvider>` utilizing predefined Design Tokens for durations and easings.
- **Reason:** Consistency is the hallmark of luxury. Ad-hoc animation timings across different components degrade the premium feel. 

## 6. Real Metrics Over Flashy Fake Data
- **Decision:** We use authentic business impacts (e.g., "+180% Reservations") rather than animating fake Lighthouse scores (e.g., "99+ Performance").
- **Reason:** Trust converts. Flashy but fake metrics hurt credibility with discerning clients.

## 7. No Infinite Looping Portfolios
- **Decision:** The portfolio showcase uses a finite, scrolling layout with an explicit CTA at the end.
- **Reason:** Repeating the same 3-4 projects in an infinite marquee makes the portfolio feel small and artificial. Finite grids convey confidence.
