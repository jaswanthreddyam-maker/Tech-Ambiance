import { z } from "zod";
import { ProjectSchema } from "./project.schema";

export type Project = z.infer<typeof ProjectSchema>;

export type ProjectImpactMetric = Project["businessImpact"][0];
