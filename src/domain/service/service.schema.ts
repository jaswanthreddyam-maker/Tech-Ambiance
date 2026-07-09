import { z } from "zod";

export const ServiceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  icon: z.string().optional(), // Could be an icon name or path
});
