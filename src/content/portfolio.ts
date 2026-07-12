export interface ProjectDetailSection {
  title: string;
  content: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  industry: string;
  duration: string;
  technologies: string[];
  results: string;
  liveUrl?: string;
  color: string; // Theme color for mockup background
  imageUrl: string; // Placeholder or gradient
  overview: string;
  challenge: string;
  research: string;
  wireframes: string;
  ui: string;
  development: string;
  seo: string;
  performance: string;
  animations: string;
  nextProjectId: string;
}

export const portfolioData: PortfolioItem[] = [
  {
    id: "cafe-vistaara",
    title: "Cafe Vistaara Premium Experience",
    client: "Cafe Vistaara",
    industry: "Luxury Hospitality & Dining",
    duration: "4 Weeks",
    technologies: ["React", "Vite", "Framer Motion", "TailwindCSS", "Lenis Scroll"],
    results: "+180% Online Inquiries & Reservations",
    liveUrl: "https://vistaara.experience.techambiance.com",
    color: "#E6D3A3", // Champagne Gold Accent
    imageUrl: "linear-gradient(135deg, #FCFBF8 0%, #ECE7DD 100%)",
    overview: "Cafe Vistaara sought to digitize their premium dining experience. We designed a web experience reflecting their organic luxury menu and fine-dining aesthetics, integrating smooth parallax sections and custom interactive booking flows.",
    challenge: "Traditional dining sites are heavily template-based and fail to evoke the sensory elegance of a physical fine-dining restaurant, leading to low reservation completion rates.",
    research: "We analyzed competitors in high-end culinary domains. We realized visitors expect visual immersion: large high-resolution images, generous whitespace, and elegant typeface styling matching the restaurant's physical menu.",
    wireframes: "We designed a streamlined, single-column menu browsing wireframe that dynamically floats reservation prompts based on scroll-depth, minimizing cognitive friction.",
    ui: "Using a curated warm-cream color palette, fine serif headings, and micro-interactions, we created a UI that feels luxurious and responsive on every screen.",
    development: "Developed using React + Vite. We optimized image assets into WebP format and lazy loaded them. Smooth scroll was implemented via Lenis to ensure uniform frame rates.",
    seo: "Injected local business structured schema (Schema.org), verified canonical URLs, and targeted keywords like 'luxury fine-dining reservation' to boost local rankings.",
    performance: "Achieved a solid 99/100 Lighthouse Performance score. Core Web Vitals were audited to keep Largest Contentful Paint below 1.2 seconds.",
    animations: "Utilized Framer Motion for scroll-triggered fades. A custom magnetic cursor reacts when hovering over booking buttons and dish items.",
    nextProjectId: "go-chicken"
  },
  {
    id: "go-chicken",
    title: "Go Chicken High-Velocity Commerce Flagship",
    client: "Go Chicken QSR",
    industry: "High-Velocity QSR & Instant Commerce",
    duration: "5 Weeks",
    technologies: ["React", "Next.js", "Framer Motion", "TailwindCSS", "Edge Caching"],
    results: "3.4x Order Velocity & 0.6s Interactive Checkout",
    liveUrl: "https://go-chicken-rz1f.vercel.app/",
    color: "#C9A56A",
    imageUrl: "/assets/images/projects/go-chicken-landing.png",
    overview: "Go Chicken required an instantaneous mobile ordering architecture capable of handling peak lunch and dinner order surges without latency or checkout friction.",
    challenge: "Most quick-service restaurant apps suffer from multi-step checkout bloat, slow menu rendering, and sluggish payment gateway handoffs.",
    research: "We analyzed user behavior during high-urgency meal ordering. Every millisecond saved at checkout directly increased completed basket conversions by 1.8%.",
    wireframes: "Designed a thumb-friendly bottom-sheet ordering drawer with 1-click repeat orders and Apple Pay / Google Pay priority placement.",
    ui: "High-contrast emerald surfaces with appetizing warm lighting, crisp typography, and instant haptic feedback cues.",
    development: "Engineered on Next.js with optimistic UI updates and localized edge CDN menu caching for sub-second responses.",
    seo: "Optimized restaurant menu schema and hyper-local SEO parameters to capture 'instant delivery near me' search volume.",
    performance: "Lighthouse Interactive in 0.6 seconds. Zero Cumulative Layout Shift during dynamic cart price recalculations.",
    animations: "Silky micro-animations for adding items to basket, floating quantity badges, and smooth drawer dismissals.",
    nextProjectId: "brew-bakes"
  },
  {
    id: "brew-bakes",
    title: "Brew Bakes Artisanal Cafe & Franchise Portal",
    client: "Brew Bakes Chain",
    industry: "Artisanal Cafe Chain & Franchising",
    duration: "6 Weeks",
    technologies: ["React", "TypeScript", "Framer Motion", "TailwindCSS", "Interactive Maps"],
    results: "+240% Franchise Inquiries & +62% Organic Search Reach",
    liveUrl: "https://brewbakes.experience.techambiance.com",
    color: "#E6D3A3",
    imageUrl: "linear-gradient(135deg, #0F352B 0%, #08261F 100%)",
    overview: "Brew Bakes sought to elevate their artisanal cafe identity across 40+ locations while simultaneously powering a dedicated franchise acquisition engine.",
    challenge: "Existing franchise websites look like bureaucratic corporate brochures rather than celebrating the warm, inviting sensory culture of coffee and baking.",
    research: "We found that prospective franchise owners fall in love with the brand experience first and the financial unit economics second.",
    wireframes: "Architected a dual-journey experience: an atmospheric consumer menu & cafe locator paired with an interactive franchise calculator.",
    ui: "Warm ivory textures, bespoke serif editorial typography, rich espresso and champagne accents, and immersive spatial photography.",
    development: "Built with React + TypeScript, featuring dynamic location filtering and modular CMS integration for individual cafe menus.",
    seo: "Multi-location SEO structure with individual location pages scoring 99+ on local search relevance.",
    performance: "Strict 60fps scroll performance even with interactive map modules and full-bleed photography carousels.",
    animations: "Parallax coffee aroma reveal transitions and elegant scroll-triggered metric counters.",
    nextProjectId: "gym-prestige"
  },
  {
    id: "gym-prestige",
    title: "Prestige Fitness Client Dashboard",
    client: "Prestige Gyms",
    industry: "Bespoke Wellness & Athletics",
    duration: "6 Weeks",
    technologies: ["Next.js", "TypeScript", "TailwindCSS", "Supabase", "GSAP"],
    results: "95% Member Engagement & 0.05s Load Latency",
    liveUrl: "https://prestige.experience.techambiance.com",
    color: "#111111", // Sleek Dark Accent
    imageUrl: "linear-gradient(135deg, #2A2A2A 0%, #111111 100%)",
    overview: "Prestige Wellness needed an exclusive portal where premium fitness members could view customized training regimens, schedule sessions with personal coaches, and manage billing invoices.",
    challenge: "Third-party gym portals are generic, poorly branded, and slow, ruining the high-touch prestige experience expected by luxury wellness club members.",
    research: "Member interviews revealed that tracking progress metrics should be clean, visual, and highly responsive. Cluttered tables were replaced with interactive SVG graphs.",
    wireframes: "Drafted a three-panel dashboard layout displaying active goals in the center, trainer messaging on the right, and milestones on the left.",
    ui: "A dark-mode premium interface utilizing champagne gold borders, minimal high-contrast typography, and glassmorphic dashboards.",
    development: "Built with Next.js App Router. Leveraged Supabase for real-time trainer messaging. State management is optimized using React Context.",
    seo: "Protected routes are marked as non-indexable, while the marketing landing page includes highly optimized viewport and OpenGraph tags.",
    performance: "Implemented bundle-splitting and image prefetching. Page loads in under 0.8 seconds globally.",
    animations: "GSAP was leveraged for dashboard card transitions. Dynamic SVGs load metrics with elegant stroke-drawing effects.",
    nextProjectId: "clinic-aura"
  },
  {
    id: "clinic-aura",
    title: "Aura Clinical Brand Refinement",
    client: "Aura Wellness Clinic",
    industry: "Private Medical & Aesthetics",
    duration: "5 Weeks",
    technologies: ["React", "Vite", "TypeScript", "TailwindCSS", "Framer Motion"],
    results: "98% Performance Score & +40% Appointment Conversions",
    liveUrl: "https://aura.experience.techambiance.com",
    color: "#FCFBF8", // Pure Soft Accent
    imageUrl: "linear-gradient(135deg, #FFFFFF 0%, #ECE7DD 100%)",
    overview: "Aura is a luxury wellness clinic. We revamped their digital face, converting a clinical, cold website into an inviting wellness-centric portal.",
    challenge: "Balancing sterile medical credibility with luxury wellness brand vibes. Standard medical sites look dated and uninviting.",
    research: "Focus groups showed that patients select clinics based on doctor profiles and clean, calming aesthetics. We highlighted doctor credentials alongside beautiful ambient animations.",
    wireframes: "Designed a clean, multi-page layout focusing on Doctor Profiles, Service Categories, and an intuitive scheduling wizard.",
    ui: "Minimal typography, neutral earth tones, and champagne accents create a sense of trust, safety, and luxury.",
    development: "Developed using React + TypeScript. Implemented React Hook Form with Zod validation to ensure booking fields are secure and correctly typed.",
    seo: "Targeted localized medical schemas and canonical paths to ensure Aura dominates clinical search parameters in their metropolitan district.",
    performance: "98+ Lighthouse score. Used modern layout patterns to ensure zero Cumulative Layout Shift (CLS < 0.01).",
    animations: "Created smooth page-exit animations and layout transitions that mimic the relaxing atmosphere of Aura's physical wellness center.",
    nextProjectId: "zenith-watch"
  },
  {
    id: "zenith-watch",
    title: "Zenith Haute Horlogerie Portal",
    client: "Zenith Watches",
    industry: "Haute Horology & Craftsmanship",
    duration: "5 Weeks",
    technologies: ["Next.js", "Vite", "Framer Motion", "GSAP", "TailwindCSS"],
    results: "+210% Digital Engagement & 99% Score",
    liveUrl: "https://zenith.experience.techambiance.com",
    color: "#0A3D2C", // Forest Green
    imageUrl: "linear-gradient(135deg, #0A3D2C 0%, #06241B 100%)",
    overview: "A refined brand showcase and inventory system for Zenith watches. We built a luxury portal presenting custom interactive dial selectors, dynamic time mechanics, and a secure concierge booking flow.",
    challenge: "Conveying the precision and microscopic engineering of luxury watches through flat web graphics.",
    research: "Luxury watch buyers appreciate movement, texture, and mechanical complexity. We introduced micro-rotations and dial animations synced with the system clock.",
    wireframes: "Designed a clean split screen showcasing 3D models on the left and technical caliber specifications on the right.",
    ui: "Forest green background with champagne accents, thin gold dividers, and bespoke serif typography.",
    development: "Built using React + TypeScript. Caliber animations were optimized using Canvas drawing cycles to achieve 60fps.",
    seo: "Structured data matching luxury horology markets, search tags for limited collections.",
    performance: "99+ Lighthouse score. Asset caching policies configured for rapid catalog loading.",
    animations: "Dial hands rotate in real-time. Carousel items glide in with custom stagger variables.",
    nextProjectId: "solas-branding"
  },
  {
    id: "solas-branding",
    title: "Solas Brand Identity & Art Direction",
    client: "Solas Interiors",
    industry: "Luxury Interior Architecture",
    duration: "7 Weeks",
    technologies: ["React", "TypeScript", "TailwindCSS", "Framer Motion", "Lenis"],
    results: "+320% Qualified Leads & Award Nomination",
    liveUrl: "https://solas.experience.techambiance.com",
    color: "#ECE7DD",
    imageUrl: "linear-gradient(135deg, #FCFBF8 0%, #ECE7DD 100%)",
    overview: "Solas is a luxury architecture firm. We re-conceptualized their brand from the ground up, delivering a minimalist design system, custom typography, and a showcase website that acts as a virtual gallery.",
    challenge: "Architecture websites are often overcrowded with photos, lacking the breathing room and composition of high-end physical portfolios.",
    research: "Architectural layouts are defined by light, material, and structure. We designed a grid layout where every photo is framed with generous whitespace.",
    wireframes: "Designed a clean masonry layout highlighting individual spaces, materials, and floorplans.",
    ui: "Minimalist layout using muted off-white surfaces, thin dividers, and sharp layouts.",
    development: "Developed with React + Vite. Images are optimized into WebP format and lazy loaded.",
    seo: "Integrated local business structured schema and targeted keywords like 'luxury interior architecture'.",
    performance: "Lighthouse Performance score of 98. LCP is optimized below 1.1s.",
    animations: "Created smooth sliding page transitions and layout flips imitating structural plans.",
    nextProjectId: "cafe-vistaara"
  }
];
