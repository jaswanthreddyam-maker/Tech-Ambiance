import { z } from "zod";

// -- Status Enum --
export const ProjectStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// -- Portfolio Category --
export const PortfolioCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  display_order: z.number().default(0),
});

// -- Portfolio Metric --
export const PortfolioMetricSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  metric_type: z.string(),
  display_prefix: z.string().nullable().optional(),
  value: z.number(),
  suffix: z.string().nullable().optional(),
  label: z.string(),
  sort_order: z.number().default(0),
});

// -- Portfolio Media --
export const PortfolioMediaSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  path: z.string(),
  alt_text: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  media_type: z.enum(["IMAGE", "VIDEO", "MOBILE_SCREENSHOT", "DESKTOP_SCREENSHOT", "BEFORE_AFTER"]).default("IMAGE"),
  display_order: z.number().default(0),
});

// -- Portfolio Project Link --
export const PortfolioLinkSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  link_type: z.enum(["LIVE_WEBSITE", "GITHUB", "FIGMA", "CASE_STUDY_PDF", "YOUTUBE", "OTHER"]),
  url: z.string().url(),
  label: z.string().nullable().optional(),
  display_order: z.number().default(0),
});

// -- Core Portfolio Project --
export const ProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  cover_image_path: z.string().nullable().optional(),
  status: ProjectStatusEnum.default("DRAFT"),
  featured_rank: z.number().nullable().optional(),
  display_order: z.number().default(0),
  technology_stack: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),

  // Case Study Content
  overview: z.string().nullable().optional(),
  challenge: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),

  // SEO
  seo_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  og_image_path: z.string().nullable().optional(),
  canonical_url: z.string().nullable().optional(),

  created_at: z.string().optional(),
  updated_at: z.string().optional(),

  // -- Joined Relations (populated by repository) --
  categories: z.array(PortfolioCategorySchema).optional(),
  metrics: z.array(PortfolioMetricSchema).optional(),
  media: z.array(PortfolioMediaSchema).optional(),
  links: z.array(PortfolioLinkSchema).optional(),

  // -- Legacy compatibility fields (used by fallback content) --
  industry: z.string().optional(),
  businessImpact: z.array(
    z.object({
      metric: z.string(),
      value: z.string(),
      label: z.string(),
    })
  ).optional(),
  images: z.object({
    cover: z.string(),
    gallery: z.array(z.string()),
  }).optional(),
  videoUrl: z.string().optional(),
  featured: z.boolean().optional(),
  url: z.string().optional(),
});
