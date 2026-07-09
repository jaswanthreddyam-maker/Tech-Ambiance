import { z } from "zod";

export const InsightSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
  publishedAt: z.string().datetime(),
  readTimeMinutes: z.number(),
  category: z.string(),
  tags: z.array(z.string()),
  coverImage: z.string().optional(),
});
