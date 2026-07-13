export type PublicationCategory = 'Engineering' | 'Design' | 'Strategy' | 'Case Studies' | 'Journal';
export type PublicationType = 'image' | 'typography' | 'quote' | 'diagram' | 'case_study';

export interface PublicationArticle {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    category: PublicationCategory;
    type: PublicationType;
    coverImage?: string;
    readingTime: number; // in minutes
    publishedAt: string;
    updatedAt: string;
    author: string;
    featured: boolean;
    tags: string[];
    relatedArticles: string[]; // slugs
    seo: { title: string; description: string };
    series?: { id: string; title: string; order: number };
    collection?: string; 
    content?: string; // HTML or Markdown for the actual detail page later
}

// ============================================================================
// COLLECTIONS
// ============================================================================
export const PUBLICATION_COLLECTIONS = [
  "Restaurant Engineering",
  "Design Systems",
  "Performance",
  "Architecture Diaries",
  "Client Transformations"
];

// ============================================================================
// ARTICLES DATABASE
// ============================================================================

export const articles: PublicationArticle[] = [
  {
    id: "pub-001",
    slug: "engineering-restaurant-website-converts-42-percent-more",
    title: "Engineering a Restaurant Website That Converts 42% More Customers",
    subtitle: "A deep dive into performance, architectural decisions, and conversion rate optimization for high-traffic hospitality.",
    excerpt: "We tore down a legacy WordPress setup and rebuilt a unified digital flagship. Here is the exact architecture that drove a 42% increase in reservations.",
    category: "Case Studies",
    type: "case_study",
    coverImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop",
    readingTime: 12,
    publishedAt: "2026-06-12T08:00:00Z",
    updatedAt: "2026-06-12T08:00:00Z",
    author: "Elena Rostova",
    featured: true,
    tags: ["Next.js", "Hospitality", "CRO", "Performance"],
    relatedArticles: ["hospitality-revenue-growth", "state-management-nextjs"],
    seo: { 
      title: "Engineering High-Converting Restaurant Websites | Tech Ambiance", 
      description: "How we engineered a modern restaurant digital flagship that increased conversion rates by 42%." 
    },
    collection: "Restaurant Engineering"
  },
  {
    id: "pub-002",
    slug: "why-most-agency-websites-fail",
    title: "Why most agency websites fail.",
    subtitle: "The trap of selling capabilities instead of business outcomes.",
    excerpt: "Most agencies build beautiful portfolios that completely ignore the business realities of their clients. It's time to shift from aesthetics to engineering.",
    category: "Strategy",
    type: "typography",
    readingTime: 6,
    publishedAt: "2026-06-20T10:30:00Z",
    updatedAt: "2026-06-21T14:00:00Z",
    author: "Julian Vance",
    featured: false,
    tags: ["Strategy", "Positioning", "B2B"],
    relatedArticles: ["scaling-design-teams", "our-manifesto-revisited"],
    seo: { 
      title: "Why Agency Websites Fail | Strategy Insights", 
      description: "Stop selling capabilities. Start engineering business outcomes." 
    }
  },
  {
    id: "pub-003",
    slug: "the-invisible-ux",
    title: "The best UX is invisible.",
    subtitle: "When design gets out of the way of the user.",
    excerpt: "A reflection on micro-interactions and why the most premium feeling interfaces are the ones that require the least cognitive load.",
    category: "Design",
    type: "quote",
    readingTime: 4,
    publishedAt: "2026-07-02T09:15:00Z",
    updatedAt: "2026-07-02T09:15:00Z",
    author: "Sarah Chen",
    featured: false,
    tags: ["UX", "Design Philosophy"],
    relatedArticles: ["typography-in-b2b", "design-systems-scale"],
    seo: { 
      title: "The Invisible UX | Design Philosophy", 
      description: "Why the best user experiences are the ones users don't even notice." 
    }
  },
  {
    id: "pub-004",
    slug: "state-management-nextjs-app-router",
    title: "State Management in the App Router Era",
    subtitle: "Architectural patterns for modern React applications.",
    excerpt: "Moving from client-heavy SPAs to Server Components requires a fundamental mental shift in how we manage and distribute state.",
    category: "Engineering",
    type: "diagram",
    readingTime: 14,
    publishedAt: "2026-05-18T11:00:00Z",
    updatedAt: "2026-06-05T16:20:00Z",
    author: "Marcus Wei",
    featured: false,
    tags: ["React", "Next.js", "Architecture", "State"],
    relatedArticles: ["architecture-diaries-part-1", "engineering-restaurant-website-converts-42-percent-more"],
    seo: { 
      title: "Next.js App Router State Management | Engineering Blueprint", 
      description: "Advanced architectural patterns for managing state in React Server Components." 
    },
    collection: "Architecture Diaries"
  },
  {
    id: "pub-005",
    slug: "design-systems-scale",
    title: "Building Design Systems That Actually Scale",
    subtitle: "Moving beyond component libraries into semantic token architectures.",
    excerpt: "A component library is not a design system. We explore how semantic tokens and strict composition rules create true scale.",
    category: "Design",
    type: "image",
    coverImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
    readingTime: 8,
    publishedAt: "2026-04-10T14:45:00Z",
    updatedAt: "2026-04-10T14:45:00Z",
    author: "Sarah Chen",
    featured: false,
    tags: ["Design Systems", "Figma", "CSS"],
    relatedArticles: ["typography-in-b2b"],
    seo: { 
      title: "Scalable Design Systems | Tech Ambiance", 
      description: "How to architect semantic token systems for enterprise UI." 
    },
    collection: "Design Systems"
  },
  {
    id: "pub-006",
    slug: "architecture-diaries-part-1",
    title: "Monolith to Micro-Frontends",
    subtitle: "When and why we split the codebase.",
    excerpt: "Our journey dissecting a massive monolithic platform into federated modules for a global fintech client.",
    category: "Engineering",
    type: "image",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    readingTime: 15,
    publishedAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
    author: "Marcus Wei",
    featured: false,
    tags: ["Architecture", "Micro-Frontends", "Webpack"],
    relatedArticles: ["architecture-diaries-part-2"],
    seo: { 
      title: "Monolith to Micro-Frontends | Architecture Diaries", 
      description: "Part 1 of our series on migrating enterprise monoliths to micro-frontends." 
    },
    series: { id: "arch-diaries", title: "Architecture Diaries", order: 1 },
    collection: "Architecture Diaries"
  },
  {
    id: "pub-007",
    slug: "hospitality-revenue-growth",
    title: "Hospitality Revenue Growth",
    subtitle: "A digital transformation case study.",
    excerpt: "How a unified digital operating system reduced friction and increased direct bookings by 312% in Q1.",
    category: "Case Studies",
    type: "case_study",
    readingTime: 7,
    publishedAt: "2026-07-10T13:20:00Z",
    updatedAt: "2026-07-11T09:00:00Z",
    author: "Elena Rostova",
    featured: false,
    tags: ["Hospitality", "Revenue", "Growth"],
    relatedArticles: ["engineering-restaurant-website-converts-42-percent-more"],
    seo: { 
      title: "Hospitality Revenue Growth Case Study | Tech Ambiance", 
      description: "Driving a 312% increase in direct bookings through digital engineering." 
    },
    collection: "Client Transformations"
  },
  {
    id: "pub-008",
    slug: "typography-in-b2b",
    title: "Typography as Interface",
    subtitle: "Why B2B software doesn't have to look boring.",
    excerpt: "The misconception that enterprise software must use sterile sans-serifs. We advocate for editorial typography in complex dashboards.",
    category: "Design",
    type: "image",
    coverImage: "https://images.unsplash.com/photo-1616091216791-a5360b5ce799?q=80&w=1000&auto=format&fit=crop",
    readingTime: 5,
    publishedAt: "2026-02-14T10:00:00Z",
    updatedAt: "2026-02-14T10:00:00Z",
    author: "Sarah Chen",
    featured: false,
    tags: ["Typography", "UI", "B2B"],
    relatedArticles: ["design-systems-scale"],
    seo: { 
      title: "Typography in B2B Software | Design Blueprint", 
      description: "Using editorial typography to elevate enterprise software interfaces." 
    }
  },
  {
    id: "pub-009",
    slug: "engineering-speed",
    title: "Speed is a feature.",
    subtitle: "Milliseconds matter in enterprise applications.",
    excerpt: "We treat performance not as an afterthought, but as a core architectural requirement from day zero.",
    category: "Engineering",
    type: "quote",
    readingTime: 3,
    publishedAt: "2026-07-05T15:30:00Z",
    updatedAt: "2026-07-05T15:30:00Z",
    author: "Marcus Wei",
    featured: false,
    tags: ["Performance", "Engineering Philosophy"],
    relatedArticles: ["engineering-restaurant-website-converts-42-percent-more"],
    seo: { 
      title: "Speed is a feature | Engineering Philosophy", 
      description: "Why performance is the most important feature of any application." 
    },
    collection: "Performance"
  },
  {
    id: "pub-010",
    slug: "architecture-diaries-part-2",
    title: "The Event-Driven Enterprise",
    subtitle: "Decoupling systems for scale.",
    excerpt: "Moving from RESTful monoliths to event-driven serverless architectures to handle unpredictable traffic spikes.",
    category: "Engineering",
    type: "image",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
    readingTime: 18,
    publishedAt: "2026-04-02T09:00:00Z",
    updatedAt: "2026-04-05T11:00:00Z",
    author: "Marcus Wei",
    featured: false,
    tags: ["Architecture", "Event-Driven", "Serverless"],
    relatedArticles: ["architecture-diaries-part-1"],
    seo: { 
      title: "The Event-Driven Enterprise | Architecture Diaries Part 2", 
      description: "Part 2 of our series on enterprise architecture. Exploring event-driven systems." 
    },
    series: { id: "arch-diaries", title: "Architecture Diaries", order: 2 },
    collection: "Architecture Diaries"
  },
  {
    id: "pub-011",
    slug: "scaling-design-teams",
    title: "Scaling creative output in remote teams",
    subtitle: "Process over proximity.",
    excerpt: "How we maintain an elite standard of design output while operating as a fully distributed global studio.",
    category: "Strategy",
    type: "image",
    coverImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop",
    readingTime: 9,
    publishedAt: "2026-01-20T08:45:00Z",
    updatedAt: "2026-01-20T08:45:00Z",
    author: "Julian Vance",
    featured: false,
    tags: ["Operations", "Remote Work", "Culture"],
    relatedArticles: ["why-most-agency-websites-fail"],
    seo: { 
      title: "Scaling Design Teams | Studio Strategy", 
      description: "Maintaining elite design standards in a distributed remote team environment." 
    }
  },
  {
    id: "pub-012",
    slug: "our-manifesto-revisited",
    title: "Our Manifesto, Revisited.",
    subtitle: "Reflecting on three years of engineering excellence.",
    excerpt: "What we got right, what we got wrong, and where the digital landscape is heading in the next decade.",
    category: "Journal",
    type: "typography",
    readingTime: 7,
    publishedAt: "2026-01-01T12:00:00Z",
    updatedAt: "2026-01-01T12:00:00Z",
    author: "Julian Vance",
    featured: false,
    tags: ["Culture", "Manifesto", "Vision"],
    relatedArticles: [],
    seo: { 
      title: "Tech Ambiance Manifesto | Journal", 
      description: "Reflecting on our engineering principles and the future of digital business." 
    }
  }
];

// Helper functions for V1 repository access
export const publicationRepository = {
  getAll: () => articles,
  getFeatured: () => articles.find(a => a.featured) || articles[0],
  getByCategory: (category: PublicationCategory | 'All') => 
    category === 'All' ? articles : articles.filter(a => a.category === category),
  getBySlug: (slug: string) => articles.find(a => a.slug === slug),
  getRelated: (slugs: string[]) => articles.filter(a => slugs.includes(a.slug)),
  getAllCollections: () => PUBLICATION_COLLECTIONS,
  getByCollection: (collection: string) => articles.filter(a => a.collection === collection),
  search: (query: string) => {
    const q = query.toLowerCase();
    return articles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q)
    );
  }
};
