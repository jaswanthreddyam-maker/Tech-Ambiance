import { z } from "zod";
import { InsightSchema } from "./insight.schema";

export type Insight = z.infer<typeof InsightSchema>;
