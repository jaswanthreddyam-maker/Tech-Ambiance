import { z } from "zod";
import {
  ProjectSchema,
  ProjectStatusEnum,
  PortfolioCategorySchema,
  PortfolioMetricSchema,
  PortfolioMediaSchema,
  PortfolioLinkSchema,
} from "./project.schema";

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;
export type PortfolioCategory = z.infer<typeof PortfolioCategorySchema>;
export type PortfolioMetric = z.infer<typeof PortfolioMetricSchema>;
export type PortfolioMedia = z.infer<typeof PortfolioMediaSchema>;
export type PortfolioLink = z.infer<typeof PortfolioLinkSchema>;

/** @public */
export type ProjectImpactMetric = NonNullable<Project["businessImpact"]>[0];



