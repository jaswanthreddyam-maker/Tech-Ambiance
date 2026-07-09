export interface ProcessStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery",
    subtitle: "Understanding the Core Brand Positioning",
    description: "We deep-dive into your business goals, brand identity, target demographic, and market competitors. This aligns our design strategy with your business growth parameters."
  },
  {
    number: "02",
    title: "Research",
    subtitle: "User Behavior & Navigation Auditing",
    description: "We analyze target user interactions, creating high-level navigation flows and site mapping. This ensures we eliminate friction points before designing layouts."
  },
  {
    number: "03",
    title: "Design",
    subtitle: "High-End Visual Layouts & Motion Parameters",
    description: "We craft custom, high-fidelity UI layout designs in Figma. We define the typography scale, spacing ratios, and custom animation behaviors that make your brand feel premium."
  },
  {
    number: "04",
    title: "Development",
    subtitle: "Pixel-Perfect Responsive Coding",
    description: "We translate approved mockups into clean, components-based TypeScript code. We write custom animations using Framer Motion and GSAP, ensuring silky smooth transitions."
  },
  {
    number: "05",
    title: "Launch",
    subtitle: "Lighthouse Verification & Production Deploy",
    description: "We conduct exhaustive performance audits, targeting 98+ Lighthouse scores, validating schema markup, verifying responsive scaling, and deploying to high-speed cloud networks."
  },
  {
    number: "06",
    title: "Growth",
    subtitle: "SEO Tracking & Iteration Auditing",
    description: "After launch, we monitor search crawl patterns, analyze user click journeys, track search engine rankings, and provide continuous updates to maximize conversion metrics."
  }
];
