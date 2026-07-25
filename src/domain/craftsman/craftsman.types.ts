import type { PortfolioCategory, PortfolioMetric } from '../project/project.types';

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
  description?: string;
  cover_image_path?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publication_stage: 'DRAFT' | 'INTERNAL_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  display_order: number;
  featured_rank?: number;
  featured: boolean;
  technology_stack: string[];
  services: string[];
  overview?: string;
  challenge?: string;
  solution?: string;
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  created_at: string;

  project_lead?: ContributorSummaryDTO;
  contributors: ContributorSummaryDTO[];
  metrics: PortfolioMetric[];
  categories: PortfolioCategory[];
  links: Array<{ link_type: string; url: string; label?: string }>;
  media: Array<{ id?: string; path: string; media_type: string; alt_text?: string; caption?: string }>;
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
  biography?: string;
  avatar_url?: string;
  member_type: ContributorMemberType;
  expertise_tags: string[];
  display_order: number;
}

export interface ContributedProjectSummaryDTO {
  publication_id: string;
  title: string;
  slug: string;
  cover_image_path?: string;
  role_name: string;
  role_slug: string;
  contribution_summary?: string;
  services: string[];
  cover_url: string;
}

export interface CraftsmanProfileDetailDTO {
  id: string;
  slug: string;
  full_name: string;
  headline_title: string;
  biography?: string;
  philosophy_quote?: string;
  avatar_url?: string;
  member_type: ContributorMemberType;
  expertise_tags: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  display_order: number;
  current_focus?: string;
  contributed_projects: ContributedProjectSummaryDTO[];
}
