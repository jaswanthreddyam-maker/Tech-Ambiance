import type { PortfolioCategory, PortfolioMetric, PortfolioMedia, PortfolioLink } from '../project/project.types';

export type ContributorMemberType = 'EMPLOYEE' | 'CONTRACTOR' | 'PARTNER' | 'EXTERNAL';
export type AssignmentVisibility = 'PUBLIC' | 'PRIVATE';

export interface ContributorSummaryDTO {
  craftsman_id: string;
  craftsman_slug: string;
  full_name: string;
  avatar_url?: string;
  headline_title: string;
  role_name: string;
  role_slug: string;
  role_category?: string;
  contribution_summary?: string;
  is_lead?: boolean;
}

export interface PortfolioPublicationDTO {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  cover_image_path?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publication_stage: 'DRAFT' | 'INTERNAL_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  display_order: number;
  featured_rank?: number | null;
  featured: boolean;
  technology_stack: string[];
  services: string[];
  overview?: string | null;
  challenge?: string | null;
  solution?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  og_image_path?: string | null;
  canonical_url?: string | null;
  created_at: string;

  project_lead?: ContributorSummaryDTO;
  contributors: ContributorSummaryDTO[];
  metrics: PortfolioMetric[];
  categories: PortfolioCategory[];
  links: PortfolioLink[];
  media: PortfolioMedia[];
  images: {
    cover: string;
    gallery: string[];
  };
  industry?: string;
  url?: string;
}

export interface CraftsmanSummaryDTO {
  id: string;
  slug: string;
  full_name: string;
  headline_title: string;
  biography?: string | null;
  avatar_url?: string | null;
  member_type: ContributorMemberType;
  expertise_tags: string[];
  display_order: number;
}

export interface ContributedProjectSummaryDTO {
  publication_id: string;
  title: string;
  slug: string;
  cover_image_path?: string | null;
  role_name: string;
  role_slug: string;
  contribution_summary?: string | null;
  services: string[];
  cover_url: string;
}

export interface CraftsmanProfileDetailDTO {
  id: string;
  slug: string;
  full_name: string;
  headline_title: string;
  biography?: string | null;
  philosophy_quote?: string | null;
  avatar_url?: string | null;
  member_type: ContributorMemberType;
  expertise_tags: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  display_order: number;
  current_focus?: string | null;
  contributed_projects: ContributedProjectSummaryDTO[];
}
