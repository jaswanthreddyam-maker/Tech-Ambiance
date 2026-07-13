import type { Project } from "../domain/project/project.types";

/**
 * Local fallback portfolio projects.
 * Used when Supabase is unavailable or returns empty results.
 * Matches the normalized schema shape for seamless compatibility.
 */
export const PORTFOLIO_PROJECTS: Project[] = [
  {
    id: "proj_1",
    slug: "cafe-vistaara",
    title: "Cafe Vistaara",
    description: "A complete digital transformation for a premium cafe chain, focusing on organic reservations and an immersive brand experience.",
    cover_image_path: "/assets/images/projects/vistaara-cover.avif",
    status: "PUBLISHED",
    featured_rank: 1,
    display_order: 1,
    technology_stack: ["React", "Next.js", "Framer Motion"],
    services: ["UI/UX Design", "Web Development", "SEO Strategy"],
    overview: "Cafe Vistaara sought to digitize their premium dining experience. We designed a web experience reflecting their organic luxury menu and fine-dining aesthetics, integrating smooth parallax sections and custom interactive booking flows.",
    challenge: "Traditional dining sites are heavily template-based and fail to evoke the sensory elegance of a physical fine-dining restaurant, leading to low reservation completion rates.",
    solution: "Using a curated warm-cream color palette, fine serif headings, and micro-interactions, we created a UI that feels luxurious and responsive on every screen.",
    categories: [
      { id: "cat_1", name: "Luxury Hospitality", slug: "luxury-hospitality", icon: "✨", color: "#D4AF37", display_order: 2 },
      { id: "cat_2", name: "Culinary & Dining", slug: "culinary-dining", icon: "🍽", color: "#C9A56A", display_order: 1 },
    ],
    metrics: [
      { id: "m_1", project_id: "proj_1", metric_type: "RESERVATIONS", display_prefix: "+", value: 180, suffix: "%", label: "Increase", sort_order: 1 },
      { id: "m_2", project_id: "proj_1", metric_type: "LOAD_TIME", display_prefix: null, value: 1.2, suffix: "s", label: "Average", sort_order: 2 },
    ],
    media: [],
    links: [],
    // Legacy compatibility
    industry: "Luxury Hospitality",
    businessImpact: [
      { metric: "Reservations", value: "+180%", label: "Increase" },
      { metric: "Load Time", value: "1.2s", label: "Average" },
    ],
    images: { cover: "/assets/images/projects/vistaara-cover.avif", gallery: [] },
    featured: true,
  },
  {
    id: "proj_2",
    slug: "restaurant",
    title: "Restaurant",
    description: "Bespoke digital reservation platform and luxury brand showcase for an acclaimed dining destination.",
    cover_image_path: "/assets/images/projects/restaurant-cover.png",
    status: "PUBLISHED",
    featured_rank: 2,
    display_order: 2,
    technology_stack: ["React", "Tailwind CSS"],
    services: ["Web Development", "Conversion Optimization"],
    overview: "Bhavanam Restaurant needed a premium digital presence that communicates their authentic South Indian culinary heritage while driving direct table bookings.",
    categories: [
      { id: "cat_2", name: "Culinary & Dining", slug: "culinary-dining", icon: "🍽", color: "#C9A56A", display_order: 1 },
    ],
    metrics: [
      { id: "m_3", project_id: "proj_2", metric_type: "BOOKINGS", display_prefix: "+", value: 65, suffix: "%", label: "Direct Reservations", sort_order: 1 },
    ],
    media: [],
    links: [
      { id: "l_1", project_id: "proj_2", link_type: "LIVE_WEBSITE", url: "https://bhavanamrestaurantdemo.netlify.app", label: "Visit Live Experience", display_order: 1 },
    ],
    // Legacy compatibility
    industry: "Culinary & Dining",
    businessImpact: [
      { metric: "Table Bookings", value: "+65%", label: "Direct Reservations" },
    ],
    images: { cover: "/assets/images/projects/restaurant-cover.png", gallery: [] },
    featured: true,
    url: "https://bhavanamrestaurantdemo.netlify.app",
  },
];

export const MOCK_PROJECTS = PORTFOLIO_PROJECTS;
