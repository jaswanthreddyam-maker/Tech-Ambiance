import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  industry: z.string(),
  description: z.string(),
  businessImpact: z.array(
    z.object({
      metric: z.string(),
      value: z.string(),
      label: z.string(),
    })
  ),
  services: z.array(z.string()),
  technologies: z.array(z.string()),
  images: z.object({
    cover: z.string(),
    gallery: z.array(z.string()),
  }),
  videoUrl: z.string().optional(),
  featured: z.boolean().default(false),
  url: z.string().url().optional(),
});
