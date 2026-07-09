export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is your typical project timeline?",
    answer: "A standard marketing or branding website typically takes 4 to 6 weeks. More complex applications, SaaS portals, or custom platforms take between 8 to 12 weeks. We never rush. We prioritize precision and custom details."
  },
  {
    id: "faq-2",
    question: "Do you offer post-launch support and hosting?",
    answer: "Yes, we provide fully managed premium hosting, continuous performance monitoring, weekly security audits, and dedicated support hours to implement content updates and feature additions."
  },
  {
    id: "faq-3",
    question: "How does your client onboarding and design process look?",
    answer: "We start with a thorough discovery session, mapping out user journeys and wireframes. We design interactive UI layouts which you can review. Once approved, we build them using a highly optimized React stack."
  },
  {
    id: "faq-4",
    question: "How do you handle SEO and organic search rankings?",
    answer: "Every website we build is structured with microdata schemas (Schema.org), canonical links, and fast-loading WebP assets. We optimize for Core Web Vitals to guarantee search engine crawler efficiency."
  },
  {
    id: "faq-5",
    question: "What technology stack do you recommend?",
    answer: "For premium interactive marketing experiences, we recommend Vite + React + Framer Motion + GSAP. For platforms with complex data rendering, we leverage Next.js, TypeScript, and TailwindCSS."
  }
];
