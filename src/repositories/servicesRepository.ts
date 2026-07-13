export interface Transformation {
  id: string;
  industry: string;
  before: string;
  after: string;
}

export interface DigitalAsset {
  id: string;
  title: string;
  description: string;
}

export interface TechItem {
  id: string;
  name: string;
}

const TRANSFORMATIONS: Transformation[] = [
  {
    id: "rest",
    industry: "Restaurants",
    before: "WhatsApp Orders",
    after: "Digital Ordering & POS"
  },
  {
    id: "cafe",
    industry: "Luxury Cafés",
    before: "No Reservations",
    after: "Booking Engine & CRM"
  },
  {
    id: "hotel",
    industry: "Hotels & Hospitality",
    before: "Fragmented Systems",
    after: "Unified Guest Experience"
  },
  {
    id: "healthcare",
    industry: "Healthcare",
    before: "Manual Paperwork",
    after: "Secure Patient Portal"
  },
  {
    id: "retail",
    industry: "Retail & E-Commerce",
    before: "Slow Website Conversions",
    after: "High-Speed Funnels"
  },
  {
    id: "pro",
    industry: "Professional Services",
    before: "No Analytics",
    after: "Business Dashboards"
  }
];

const DIGITAL_ASSETS: DigitalAsset[] = [
  {
    id: "dfw",
    title: "Digital Flagship Websites",
    description: "Immersive, high-performance web presences that command attention and elevate brand perception."
  },
  {
    id: "bos",
    title: "Business Operating Systems",
    description: "Bespoke internal software designed to streamline operations and centralize your business logic."
  },
  {
    id: "cp",
    title: "Client Portals",
    description: "Secure, intuitive dashboards that provide your customers with transparency and self-service capabilities."
  },
  {
    id: "ai",
    title: "AI Automation",
    description: "Intelligent workflows and agents that reduce manual labor and scale your output."
  },
  {
    id: "bs",
    title: "Brand Systems",
    description: "Cohesive visual identities, typography, and design tokens built for the digital age."
  }
];

const TECH_STACK: TechItem[] = [
  { id: "react", name: "React" },
  { id: "supabase", name: "Supabase" },
  { id: "typescript", name: "TypeScript" },
  { id: "framer", name: "Framer Motion" },
  { id: "gsap", name: "GSAP" },
  { id: "openai", name: "OpenAI" },
  { id: "vercel", name: "Vercel" },
  { id: "postgres", name: "PostgreSQL" }
];

export const servicesRepository = {
  async getTransformations(): Promise<Transformation[]> {
    return Promise.resolve(TRANSFORMATIONS);
  },
  
  async getDigitalAssets(): Promise<DigitalAsset[]> {
    return Promise.resolve(DIGITAL_ASSETS);
  },

  async getTechStack(): Promise<TechItem[]> {
    return Promise.resolve(TECH_STACK);
  }
};
