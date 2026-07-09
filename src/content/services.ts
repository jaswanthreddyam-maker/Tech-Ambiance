export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  details: string[];
  duration: string;
  price: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: "web-design",
    title: "Website Design",
    description: "Premium, responsive designs that reflect your brand identity and captivate your audience.",
    details: [
      "Custom UI/UX Wireframing",
      "Interactive Prototyping",
      "Mobile-First Layouts",
      "Typography & Color Selection",
      "Design System Development",
      "Apple-Style Aesthetic Design"
    ],
    duration: "2-3 Weeks",
    price: "From $3,500"
  },
  {
    id: "web-dev",
    title: "Website Development",
    description: "High-performance, pixel-perfect development using modern tech stacks.",
    details: [
      "React / Next.js Setup",
      "Framer Motion & GSAP Details",
      "Pixel-Perfect Tailwind Implementation",
      "Responsive Layout Code",
      "Headless CMS Integration",
      "Secure Backend Scaffolding"
    ],
    duration: "3-5 Weeks",
    price: "From $5,000"
  },
  {
    id: "seo",
    title: "SEO Optimization",
    description: "Rank higher on Google, capture target leads, and scale organic brand reach.",
    details: [
      "Local & Global Keyword Research",
      "Schema.org Structured Data Setup",
      "Technical Lighthouse Audits",
      "On-Page SEO Configurations",
      "Backlink Strategy Outline",
      "Google Search Console Setup"
    ],
    duration: "2-4 Weeks",
    price: "From $1,500"
  },
  {
    id: "brand-identity",
    title: "Brand Identity",
    description: "Establish a cohesive identity with custom logos, palettes, and brand books.",
    details: [
      "Logo Mark & Typography Design",
      "Color Palette Definition",
      "Custom Brand Typography Guidelines",
      "Social Media Templates",
      "Business Stationery Layouts",
      "Brand Voice Definition"
    ],
    duration: "3 Weeks",
    price: "From $2,500"
  },
  {
    id: "ui-ux",
    title: "UI / UX Design",
    description: "In-depth user research, wireframes, and design testing for complex applications.",
    details: [
      "User Persona Modeling",
      "Detailed Navigation Mapping",
      "High-Fidelity Wireframes",
      "A/B Design Variant Testing",
      "Clickable Prototypes",
      "Interaction Design Details"
    ],
    duration: "3-4 Weeks",
    price: "From $4,000"
  },
  {
    id: "web-apps",
    title: "Web Applications",
    description: "Fully custom SaaS platforms, dashboards, and client portals tailored to scale.",
    details: [
      "Database Modeling & API Setup",
      "User Roles & Authentications",
      "SaaS Subscription Structures",
      "Dynamic Dashboard Components",
      "Real-Time WebSockets Setup",
      "Cloud Deployment & Docker"
    ],
    duration: "6-10 Weeks",
    price: "From $8,000"
  }
];
