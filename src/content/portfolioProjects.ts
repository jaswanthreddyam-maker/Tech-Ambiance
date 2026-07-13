import type { Project } from "../domain/project/project.types";

export const PORTFOLIO_PROJECTS: Project[] = [
  {
    id: "proj_1",
    slug: "cafe-vistaara",
    title: "Cafe Vistaara",
    industry: "Luxury Hospitality",
    description: "A complete digital transformation for a premium cafe chain, focusing on organic reservations and an immersive brand experience.",
    businessImpact: [
      { metric: "Reservations", value: "+180%", label: "Increase" },
      { metric: "Load Time", value: "1.2s", label: "Average" },
    ],
    services: ["UI/UX Design", "Web Development", "SEO Strategy"],
    technologies: ["React", "Next.js", "Framer Motion"],
    images: {
      cover: "/assets/images/projects/vistaara-cover.avif",
      gallery: [],
    },
    featured: true,
  },
  {
    id: "proj_2",
    slug: "fit-forge",
    title: "FitForge Gyms",
    industry: "Health & Fitness",
    description: "High-conversion landing pages and membership portals for a fast-growing gym franchise.",
    businessImpact: [
      { metric: "Memberships", value: "+45%", label: "Online Signups" },
    ],
    services: ["Web Development", "Conversion Optimization"],
    technologies: ["React", "Tailwind CSS"],
    images: {
      cover: "/assets/images/projects/fitforge-cover.avif",
      gallery: [],
    },
    featured: false,
  }
];

export const MOCK_PROJECTS = PORTFOLIO_PROJECTS;
