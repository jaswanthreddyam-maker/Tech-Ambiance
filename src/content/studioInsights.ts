import type { Insight } from "../domain/insight/insight.types";

export const STUDIO_INSIGHTS: Insight[] = [
  {
    id: "ins_1",
    slug: "why-design-systems-matter",
    title: "Why Design Systems Matter for Scale",
    excerpt: "A deep dive into how investing in a design system early saves engineering hours and ensures brand consistency.",
    content: "Full content here...",
    author: {
      name: "Akshay",
    },
    publishedAt: "2026-06-12T10:00:00Z",
    readTimeMinutes: 5,
    category: "Engineering",
    tags: ["Design System", "React", "Architecture"],
  },
  {
    id: "ins_2",
    slug: "seo-in-2026",
    title: "The State of SEO in 2026",
    excerpt: "How AI-generated content has changed search algorithms and what businesses need to do to stay visible.",
    content: "Full content here...",
    author: {
      name: "Tech Ambiance Team",
    },
    publishedAt: "2026-05-20T10:00:00Z",
    readTimeMinutes: 8,
    category: "Growth",
    tags: ["SEO", "AI", "Marketing"],
  },
];

export const MOCK_INSIGHTS = STUDIO_INSIGHTS;
